#!/usr/bin/env node

import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isTestMode = process.argv.includes('--test');

// Firebase Admin initialization
let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, '../../quotes_app/firebase-service-account.json');
  serviceAccount = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Error loading Firebase service account:', error.message);
  console.error('Please ensure firebase-service-account.json exists at:');
  console.error('  /Users/jesse/Dropbox/development/DadJokesQuotesApp/quotes_app/firebase-service-account.json');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Statistics tracking
const stats = {
  totalJokes: 0,
  totalNameJokes: 0,
  totalCategories: 0,
  jokesGenerated: 0,
  nameJokesGenerated: 0,
  categoriesGenerated: 0,
  sitemapsGenerated: 0,
  startTime: Date.now()
};

// Track used slugs per category to handle collisions
const usedSlugs = {};

// Track joke ID to URL mapping for internal links
const jokeUrlMap = {};

/**
 * Fetch all regular jokes from Firebase
 */
async function fetchJokes() {
  console.log('📥 Fetching regular jokes from Firebase...');

  const snapshot = await db.collection('jokes').doc('all').collection('jokes').get();
  const jokes = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    jokes.push({
      id: doc.id,
      text: data.text || data.quote || '',
      setup: data.setup || null,
      punchline: data.punchline || null,
      hasSetupPunchline: data.hasSetupPunchline || false,
      category: data.category || data.primary_category || 'General',
      rating: data.rating || data.starRating || 3,
      keywords: data.keywords || ''
    });
  });

  stats.totalJokes = jokes.length;
  console.log(`  ✅ Fetched ${jokes.length} regular jokes`);

  return jokes;
}

/**
 * Fetch AI name jokes from Firebase (ai_* only, excluding templ_*)
 */
async function fetchNameJokes() {
  console.log('📥 Fetching AI name jokes from Firebase...');

  const snapshot = await db.collection('name_jokes')
    .where(admin.firestore.FieldPath.documentId(), '>=', 'ai_')
    .where(admin.firestore.FieldPath.documentId(), '<', 'ai_' + '\uf8ff')
    .get();

  const nameJokes = [];

  snapshot.forEach(doc => {
    const docId = doc.id;
    // Exclude template jokes
    if (docId.startsWith('templ_')) return;

    const data = doc.data();
    nameJokes.push({
      id: docId,
      text: data.joke || data.text || '',
      setup: data.setup || null,
      punchline: data.punchline || null,
      name: data.name || 'Unknown',
      category: 'Name Jokes',
      rating: 3 // Default rating for AI jokes
    });
  });

  stats.totalNameJokes = nameJokes.length;
  console.log(`  ✅ Fetched ${nameJokes.length} AI name jokes`);

  return nameJokes;
}

/**
 * Load HTML template
 */
async function loadTemplate(templatePath) {
  const fullPath = path.join(__dirname, templatePath);
  return await fs.readFile(fullPath, 'utf8');
}

/**
 * Replace placeholders in template
 */
function replacePlaceholders(template, replacements) {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, value || '');
  }
  return result;
}

/**
 * Generate slug from text (for categories)
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

/**
 * Generate SEO-friendly slug from joke setup
 * Handles collisions by adding numeric suffix
 */
function generateJokeSlug(setup, category) {
  // Clean the setup text
  let slug = setup
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove punctuation
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Remove duplicate hyphens
    .trim();

  // Truncate at word boundary around 50 chars
  if (slug.length > 50) {
    slug = slug.substring(0, 50);
    const lastHyphen = slug.lastIndexOf('-');
    if (lastHyphen > 30) {
      slug = slug.substring(0, lastHyphen);
    }
  }

  // Initialize category tracking if needed
  if (!usedSlugs[category]) {
    usedSlugs[category] = new Set();
  }

  // Handle collisions with numeric suffix
  let finalSlug = slug;
  let counter = 2;
  while (usedSlugs[category].has(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  usedSlugs[category].add(finalSlug);
  return finalSlug;
}

/**
 * Get rating stars HTML (removed from template)
 */
function getRatingStars(rating) {
  return '⭐'.repeat(Math.min(5, Math.max(1, rating)));
}

/**
 * Get 5 related jokes from same category
 */
function getRelatedJokes(joke, allJokes) {
  const sameCategory = allJokes
    .filter(j => j.category === joke.category && j.id !== joke.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  return sameCategory.length === 5 ? sameCategory : allJokes
    .filter(j => j.id !== joke.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
}

/**
 * Extract setup from joke for display (used in related jokes)
 */
function extractSetup(joke) {
  // If joke has explicit setup, use it
  if (joke.setup && joke.setup.trim()) {
    return joke.setup;
  }

  // For one-liners, extract setup portion
  const text = joke.text || '';

  // Try to cut at first question mark + space (common setup pattern)
  const questionMarkIndex = text.indexOf('? ');
  if (questionMarkIndex > 0 && questionMarkIndex < 120) {
    return text.substring(0, questionMarkIndex + 1) + '..';
  }

  // Otherwise, cut at 60 characters to avoid showing full punchline
  if (text.length > 60) {
    return text.substring(0, 60) + '...';
  }

  // If joke is very short (<=60 chars), show first 40 chars to create intrigue
  if (text.length > 40) {
    return text.substring(0, 40) + '...';
  }

  // Very short jokes - show first 30 chars
  return text.substring(0, Math.min(30, text.length)) + '...';
}

/**
 * Generate single joke page with SEO-friendly URL
 */
async function generateJokePage(joke, template, allJokes) {
  const relatedJokes = getRelatedJokes(joke, allJokes);
  const categorySlug = slugify(joke.category);
  const categoryDescription = CONFIG.CATEGORY_DESCRIPTIONS[joke.category] ||
    `Funny ${joke.category.toLowerCase()} jokes that will make you laugh!`;

  // Determine joke text
  let jokeSetup = joke.setup || joke.text;
  let jokePunchline = joke.punchline || '';

  // If no setup/punchline, try to split on question mark
  if (!joke.setup && joke.text.includes('?')) {
    const parts = joke.text.split('?');
    jokeSetup = parts[0] + '?';
    jokePunchline = parts.slice(1).join('?').trim();
  }

  // Generate SEO-friendly slug from setup
  const jokeSlug = generateJokeSlug(jokeSetup, joke.category);

  // Store URL mapping for internal links
  const jokeUrl = `/jokes/${categorySlug}/${jokeSlug}`;
  jokeUrlMap[joke.id] = jokeUrl;

  // Get related joke URLs (may be empty if not yet generated)
  const related1Url = jokeUrlMap[relatedJokes[0]?.id] || '';
  const related2Url = jokeUrlMap[relatedJokes[1]?.id] || '';
  const related3Url = jokeUrlMap[relatedJokes[2]?.id] || '';
  const related4Url = jokeUrlMap[relatedJokes[3]?.id] || '';
  const related5Url = jokeUrlMap[relatedJokes[4]?.id] || '';

  // Get related categories for cross-linking
  const relatedCategories = CONFIG.RELATED_CATEGORIES[joke.category] || ['General', 'Family', 'Animals'];

  const replacements = {
    JOKE_ID: joke.id,
    JOKE_SLUG: jokeSlug,
    JOKE_URL: jokeUrl,
    JOKE_SETUP: jokeSetup,
    JOKE_PUNCHLINE: jokePunchline,
    CATEGORY: joke.category,
    CATEGORY_SLUG: categorySlug,
    CATEGORY_DESCRIPTION: categoryDescription,
    CATEGORY_LOWER: joke.category.toLowerCase(),
    RATING: joke.rating,
    RATING_STARS: getRatingStars(joke.rating),
    KEYWORD_1: joke.keywords ? joke.keywords.split(',')[0] : joke.category.toLowerCase(),
    KEYWORD_2: joke.keywords ? joke.keywords.split(',')[1] || 'humor' : 'dad jokes',
    RELATED_1_ID: relatedJokes[0]?.id || '',
    RELATED_1_URL: related1Url,
    RELATED_1_SETUP: relatedJokes[0] ? extractSetup(relatedJokes[0]) : '',
    RELATED_2_ID: relatedJokes[1]?.id || '',
    RELATED_2_URL: related2Url,
    RELATED_2_SETUP: relatedJokes[1] ? extractSetup(relatedJokes[1]) : '',
    RELATED_3_ID: relatedJokes[2]?.id || '',
    RELATED_3_URL: related3Url,
    RELATED_3_SETUP: relatedJokes[2] ? extractSetup(relatedJokes[2]) : '',
    RELATED_4_ID: relatedJokes[3]?.id || '',
    RELATED_4_URL: related4Url,
    RELATED_4_SETUP: relatedJokes[3] ? extractSetup(relatedJokes[3]) : '',
    RELATED_5_ID: relatedJokes[4]?.id || '',
    RELATED_5_URL: related5Url,
    RELATED_5_SETUP: relatedJokes[4] ? extractSetup(relatedJokes[4]) : '',
    RELATED_CAT_1: relatedCategories[0],
    RELATED_CAT_1_SLUG: slugify(relatedCategories[0]),
    RELATED_CAT_2: relatedCategories[1],
    RELATED_CAT_2_SLUG: slugify(relatedCategories[1]),
    RELATED_CAT_3: relatedCategories[2],
    RELATED_CAT_3_SLUG: slugify(relatedCategories[2])
  };

  const html = replacePlaceholders(template, replacements);

  // Create category subdirectory
  const categoryDir = path.join(__dirname, CONFIG.JOKE_OUTPUT_DIR, categorySlug);
  await fs.mkdir(categoryDir, { recursive: true });

  // Write to new SEO-friendly path
  const outputPath = path.join(categoryDir, `${jokeSlug}.html`);
  await fs.writeFile(outputPath, html, 'utf8');

  stats.jokesGenerated++;
}

/**
 * Escape HTML entities in joke text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Split a joke into setup and punchline
 */
function splitJoke(joke) {
  if (joke.setup && joke.setup.trim()) {
    return { setup: joke.setup, punchline: joke.punchline || '' };
  }

  const text = joke.text || '';

  // Try splitting on question mark
  if (text.includes('?')) {
    const qIdx = text.indexOf('?');
    return {
      setup: text.substring(0, qIdx + 1),
      punchline: text.substring(qIdx + 1).trim()
    };
  }

  // Try splitting on common delimiters
  for (const delim of ['. ', '... ', '— ', '- ']) {
    const idx = text.indexOf(delim);
    if (idx > 10 && idx < text.length - 10) {
      return {
        setup: text.substring(0, idx + (delim.startsWith('.') ? 1 : 0)),
        punchline: text.substring(idx + delim.length).trim()
      };
    }
  }

  // Fallback: first 60% is setup, rest is punchline
  const mid = Math.floor(text.length * 0.6);
  const spaceIdx = text.indexOf(' ', mid);
  if (spaceIdx > 0) {
    return {
      setup: text.substring(0, spaceIdx) + '...',
      punchline: text.substring(spaceIdx + 1)
    };
  }

  return { setup: text, punchline: '' };
}

/**
 * Generate static joke HTML cards for category pages
 */
function generateStaticJokesHtml(categoryJokes, category) {
  return categoryJokes.map((joke, index) => {
    const { setup, punchline } = splitJoke(joke);
    const jokeUrl = jokeUrlMap[joke.id] || `/joke/${joke.id}`;
    const escapedSetup = escapeHtml(setup);
    const escapedPunchline = escapeHtml(punchline);

    if (punchline) {
      return `
            <div class="static-joke-card">
                <div class="joke-setup">${escapedSetup}</div>
                <button class="reveal-btn" onclick="revealPunchline(this)">Reveal Punchline</button>
                <div class="joke-punchline">${escapedPunchline}</div>
                <a href="${jokeUrl}" class="joke-link">Read full joke &rarr;</a>
            </div>`;
    } else {
      return `
            <div class="static-joke-card">
                <div class="joke-setup">${escapedSetup}</div>
                <a href="${jokeUrl}" class="joke-link">Read full joke &rarr;</a>
            </div>`;
    }
  }).join('\n');
}

/**
 * Generate FAQ HTML for a category
 */
function generateFaqHtml(category, jokeCount) {
  const categoryLower = category.toLowerCase();
  const faqs = [
    {
      q: `How many ${categoryLower} dad jokes do you have?`,
      a: `We currently have ${jokeCount}+ ${categoryLower} dad jokes in our collection, and we add new ones regularly. Download the app to access the complete library!`
    },
    {
      q: `Are these ${categoryLower} jokes appropriate for kids?`,
      a: category === 'NSFW' || category === 'Yo Mama'
        ? `These jokes are intended for mature audiences. Check out our Family or Animals categories for kid-friendly options.`
        : `Yes! Our ${categoryLower} dad jokes are family-friendly and safe to share with kids of all ages. Dad jokes are all about clean, groan-worthy humor.`
    },
    {
      q: `Can I share these ${categoryLower} dad jokes?`,
      a: `Absolutely! Feel free to share these jokes with friends, family, and on social media. You can also save your favorites in our free app.`
    },
    {
      q: `Where can I find more dad jokes?`,
      a: `Download the Dad Jokes app for access to our entire collection of 20,000+ jokes across ${Object.keys(CONFIG.CATEGORY_DESCRIPTIONS).length}+ categories, with new jokes added every day.`
    }
  ];

  const html = faqs.map(faq => `
            <div class="faq-item">
                <h3>${escapeHtml(faq.q)}</h3>
                <p>${escapeHtml(faq.a)}</p>
            </div>`).join('\n');

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return { html, schema };
}

/**
 * Generate category page
 */
async function generateCategoryPage(category, jokes, template, totalCategories) {
  const categorySlug = slugify(category);
  const allCategoryJokes = jokes.filter(j => j.category === category);
  const totalCategoryJokeCount = allCategoryJokes.length;
  const staticJokes = allCategoryJokes.slice(0, 30); // 30 jokes for static content
  const categoryDescription = CONFIG.CATEGORY_DESCRIPTIONS[category] ||
    `Funny ${category.toLowerCase()} jokes that will make you laugh!`;
  const categoryEmoji = CONFIG.CATEGORY_EMOJIS[category] || '😄';
  const categoryIntro = CONFIG.CATEGORY_INTROS?.[category] ||
    `Looking for the best ${category.toLowerCase()} dad jokes? You've come to the right place. We've collected over ${totalCategoryJokeCount} hand-picked ${category.toLowerCase()} jokes that are perfect for sharing with friends, family, or anyone who appreciates a good groan. Tap "Reveal Punchline" on each joke below to see the answer!`;

  // Generate static joke cards HTML
  const staticJokesHtml = generateStaticJokesHtml(staticJokes, category);

  // Generate related categories (5 random other categories)
  const allCategories = Object.keys(CONFIG.CATEGORY_DESCRIPTIONS);
  const otherCategories = allCategories.filter(cat => cat !== category);

  // Shuffle and take 5
  const shuffled = otherCategories.sort(() => 0.5 - Math.random());
  const relatedCategories = shuffled.slice(0, 5);

  // Generate HTML for related categories
  const relatedCategoriesHtml = relatedCategories.map(cat => {
    const slug = slugify(cat);
    const emoji = CONFIG.CATEGORY_EMOJIS[cat] || '😄';
    return `                <a href="/jokes/${slug}" class="category-link">
                    <span class="category-emoji">${emoji}</span>
                    <span>${cat}</span>
                </a>`;
  }).join('\n');

  // Generate ItemList JSON for structured data (include all 30 static jokes)
  const jokeItemListJson = JSON.stringify(staticJokes.map((joke, index) => {
    const jokeUrl = jokeUrlMap[joke.id] || `/joke/${joke.id}`;
    const setupText = joke.setup || joke.text.split('?')[0] + (joke.text.includes('?') ? '?' : '');
    return {
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://dadjokes.vip${jokeUrl}`,
      "name": setupText.substring(0, 100)
    };
  }), null, 6);

  // Generate FAQ
  const faq = generateFaqHtml(category, totalCategoryJokeCount);
  const faqSchemaJson = JSON.stringify(faq.schema, null, 6);

  // Check for matching collection page
  const collectionMap = CONFIG.CATEGORY_COLLECTION_MAP || {};
  const collectionSlug = collectionMap[category] || null;
  const collectionLinkHtml = collectionSlug
    ? `<a href="/collection/${collectionSlug}/" class="collection-link">Browse our curated ${category.toLowerCase()} collection &rarr;</a>`
    : '';

  const replacements = {
    CATEGORY: category,
    CATEGORY_SLUG: categorySlug,
    CATEGORY_EMOJI: categoryEmoji,
    CATEGORY_DESCRIPTION: categoryDescription,
    CATEGORY_INTRO: categoryIntro,
    CATEGORY_LOWER: category.toLowerCase(),
    JOKE_COUNT: totalCategoryJokeCount,
    TOTAL_CATEGORIES: totalCategories,
    STATIC_JOKES_HTML: staticJokesHtml,
    JOKE_ITEM_LIST_JSON: jokeItemListJson,
    FAQ_HTML: faq.html,
    FAQ_SCHEMA_JSON: faqSchemaJson,
    COLLECTION_LINK: collectionLinkHtml,
    RELATED_CATEGORIES: relatedCategoriesHtml
  };

  const html = replacePlaceholders(template, replacements);
  const categoryDir = path.join(__dirname, CONFIG.CATEGORY_OUTPUT_DIR, categorySlug);

  await fs.mkdir(categoryDir, { recursive: true });
  await fs.writeFile(path.join(categoryDir, 'index.html'), html, 'utf8');

  stats.categoriesGenerated++;
}

/**
 * Generate sitemap for a batch
 */
async function generateSitemap(batchName, urls, priority, changefreq) {
  const urlElements = urls.map(url => {
    // Use SEO-friendly URL from jokeUrlMap
    const jokeUrl = jokeUrlMap[url.id] || `/joke/${url.id}`;
    return `  <url>
    <loc>${CONFIG.BASE_URL}${jokeUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  const outputPath = path.join(__dirname, CONFIG.SITEMAP_OUTPUT_DIR, `sitemap_${batchName}.xml`);
  await fs.writeFile(outputPath, sitemap, 'utf8');

  console.log(`  ✅ Generated sitemap_${batchName}.xml (${urls.length} URLs)`);
  stats.sitemapsGenerated++;

  return { name: batchName, count: urls.length };
}

/**
 * Generate sitemap index
 */
async function generateSitemapIndex(sitemaps) {
  const sitemapElements = sitemaps.map(sm => `  <sitemap>
    <loc>${CONFIG.BASE_URL}/generated_sitemaps/sitemap_${sm.name}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n');

  const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;

  const outputPath = path.join(__dirname, CONFIG.OUTPUT_DIR, 'sitemap_index.xml');
  await fs.writeFile(outputPath, index, 'utf8');

  console.log(`\n✅ Generated sitemap_index.xml with ${sitemaps.length} sitemaps`);
}

/**
 * Main generation function
 */
async function main() {
  console.log('🚀 Dad Jokes Page Generator\n');
  console.log(`Mode: ${isTestMode ? '🧪 TEST (10 pages only)' : '🌐 PRODUCTION (all pages)'}\n`);

  // Create output directories
  await fs.mkdir(path.join(__dirname, CONFIG.JOKE_OUTPUT_DIR), { recursive: true });
  await fs.mkdir(path.join(__dirname, CONFIG.CATEGORY_OUTPUT_DIR), { recursive: true });
  await fs.mkdir(path.join(__dirname, CONFIG.SITEMAP_OUTPUT_DIR), { recursive: true });

  // Load templates
  console.log('📄 Loading templates...');
  const jokeTemplate = await loadTemplate(CONFIG.JOKE_TEMPLATE);
  const categoryTemplate = await loadTemplate(CONFIG.CATEGORY_TEMPLATE);
  console.log('  ✅ Templates loaded\n');

  // Fetch all jokes
  const jokes = await fetchJokes();
  const nameJokes = await fetchNameJokes();
  const allJokes = [...jokes, ...nameJokes];

  if (isTestMode) {
    console.log('\n🧪 TEST MODE: Limiting to 10 pages\n');
    allJokes.splice(10);
  }

  // Sort jokes by rating for batching
  jokes.sort((a, b) => b.rating - a.rating);

  // Generate joke pages
  console.log('\n📝 Generating joke pages...');
  for (let i = 0; i < jokes.length; i++) {
    await generateJokePage(jokes[i], jokeTemplate, allJokes);

    if ((i + 1) % 100 === 0) {
      console.log(`  Generated ${i + 1}/${jokes.length} jokes...`);
    }
  }

  // Generate name joke pages
  console.log('\n📝 Generating name joke pages...');
  for (let i = 0; i < nameJokes.length; i++) {
    await generateJokePage(nameJokes[i], jokeTemplate, allJokes);
    stats.nameJokesGenerated++;

    if ((i + 1) % 100 === 0) {
      console.log(`  Generated ${i + 1}/${nameJokes.length} name jokes...`);
    }
  }

  // Generate category pages
  console.log('\n📝 Generating category pages...');
  const categories = [...new Set(jokes.map(j => j.category))];
  stats.totalCategories = categories.length;

  for (const category of categories) {
    await generateCategoryPage(category, jokes, categoryTemplate, categories.length);
  }
  console.log(`  ✅ Generated ${categories.length} category pages`);

  // Generate sitemaps (batched by rating/priority)
  console.log('\n📝 Generating sitemaps...');
  const generatedSitemaps = [];

  if (!isTestMode) {
    // Generate regular jokes sitemap (all of them in one sitemap)
    for (const week of CONFIG.WEEKS) {
      const batchJokes = jokes.slice(0, week.maxPages);

      if (batchJokes.length > 0) {
        const sitemapInfo = await generateSitemap(
          week.name,
          batchJokes,
          week.priority,
          week.changefreq
        );
        generatedSitemaps.push(sitemapInfo);
      }
    }

    // Name jokes in multiple batches
    if (nameJokes.length > 0) {
      let remainingNameJokes = [...nameJokes];

      for (const batch of CONFIG.NAME_JOKES_BATCHES) {
        const batchJokes = remainingNameJokes.slice(0, batch.maxPages);

        if (batchJokes.length > 0) {
          const sitemapInfo = await generateSitemap(
            batch.name,
            batchJokes,
            batch.priority,
            batch.changefreq
          );
          generatedSitemaps.push(sitemapInfo);

          // Remove used jokes
          remainingNameJokes = remainingNameJokes.slice(batch.maxPages);
        }
      }
    }

    // Generate sitemap index
    await generateSitemapIndex(generatedSitemaps);
  } else {
    console.log('  ⏭️  Skipping sitemaps in test mode');
  }

  // Print statistics
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total regular jokes:      ${stats.totalJokes}`);
  console.log(`Total name jokes:         ${stats.totalNameJokes}`);
  console.log(`Total categories:         ${stats.totalCategories}`);
  console.log(`\nPages generated:          ${stats.jokesGenerated + stats.nameJokesGenerated + stats.categoriesGenerated}`);
  console.log(`  - Joke pages:           ${stats.jokesGenerated}`);
  console.log(`  - Name joke pages:      ${stats.nameJokesGenerated}`);
  console.log(`  - Category pages:       ${stats.categoriesGenerated}`);
  console.log(`Sitemaps generated:       ${stats.sitemapsGenerated}`);
  console.log(`\nTime taken:               ${duration}s`);
  console.log('='.repeat(60));

  if (!isTestMode) {
    console.log('\n📅 ROLLOUT SCHEDULE:');
    console.log('='.repeat(60));
    generatedSitemaps.forEach((sm, i) => {
      console.log(`Week ${i + 1}: Add sitemap_${sm.name}.xml (${sm.count} pages)`);
    });
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Review generated pages in /joke/ directory');
    console.log('2. Test a few pages locally');
    console.log('3. Commit and push all pages to GitHub');
    console.log('4. Submit sitemap_priority.xml to Google Search Console');
    console.log('5. Wait 1 week, then submit sitemap_week1.xml');
    console.log('6. Continue weekly until all sitemaps are submitted');
  }

  process.exit(0);
}

// Run
main().catch(error => {
  console.error('\n❌ ERROR:', error);
  process.exit(1);
});
