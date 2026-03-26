#!/usr/bin/env node

import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLLECTIONS_CONFIG } from './collections-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isTestMode = process.argv.includes('--test');

// Firebase Admin initialization
let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, '../../quotes_app/firebase-service-account.json');
  serviceAccount = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('Error loading Firebase service account:', error.message);
  console.error('Please ensure firebase-service-account.json exists at:');
  console.error('  DadJokesQuotesApp/quotes_app/firebase-service-account.json');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Statistics tracking
const stats = {
  totalJokes: 0,
  collectionsGenerated: 0,
  startTime: Date.now()
};

/**
 * Fetch all regular jokes from Firebase
 */
async function fetchJokes() {
  console.log('Fetching jokes from Firebase...');

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
  console.log(`  Fetched ${jokes.length} jokes`);

  return jokes;
}

/**
 * Load HTML template
 */
async function loadTemplate() {
  const fullPath = path.join(__dirname, COLLECTIONS_CONFIG.COLLECTION_TEMPLATE);
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
 * Filter jokes for a given collection based on its filter criteria
 */
function filterJokesForCollection(allJokes, jokeFilter) {
  return allJokes.filter(joke => {
    // maxLength filter: total joke text must be under the limit
    if (jokeFilter.maxLength) {
      const fullText = joke.text || ((joke.setup || '') + ' ' + (joke.punchline || ''));
      if (fullText.length > jokeFilter.maxLength) {
        return false;
      }
    }

    // Category filter
    const matchesCategory = !jokeFilter.categories ||
      jokeFilter.categories.includes(joke.category);

    // Keyword filter: joke text must contain at least one keyword
    let matchesKeyword = true;
    if (jokeFilter.keywords && jokeFilter.keywords.length > 0) {
      const jokeText = (joke.text || '' + ' ' + (joke.setup || '') + ' ' + (joke.punchline || '') + ' ' + (joke.keywords || '')).toLowerCase();
      matchesKeyword = jokeFilter.keywords.some(kw => jokeText.includes(kw.toLowerCase()));
    }

    // For keyword+category filters, require both
    if (jokeFilter.categories && jokeFilter.keywords) {
      return matchesCategory && matchesKeyword;
    }

    // For maxLength-only filters, just use maxLength (already filtered above)
    if (jokeFilter.maxLength && !jokeFilter.categories && !jokeFilter.keywords) {
      return true;
    }

    return matchesCategory && matchesKeyword;
  });
}

/**
 * Escape HTML special characters
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
 * Escape string for use in JavaScript string literals
 */
function escapeJs(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

/**
 * Generate joke HTML for the numbered list format
 */
function generateJokeListHtml(jokes) {
  return jokes.map((joke, index) => {
    let setup, punchline;

    if (joke.setup && joke.setup.trim()) {
      setup = joke.setup;
      punchline = joke.punchline || '';
    } else if (joke.text.includes('?')) {
      const parts = joke.text.split('?');
      setup = parts[0] + '?';
      punchline = parts.slice(1).join('?').trim();
    } else {
      // One-liner: use the full text as the setup, no punchline
      setup = joke.text;
      punchline = '';
    }

    const escapedSetup = escapeHtml(setup);
    const escapedPunchline = escapeHtml(punchline);
    const jsSetup = escapeJs(setup);
    const jsPunchline = escapeJs(punchline);
    const num = index + 1;

    let punchlineHtml = '';
    if (punchline) {
      punchlineHtml = `
                <div class="joke-punchline-wrapper">
                    <button class="reveal-btn" id="reveal-btn-${num}" onclick="revealPunchline(${num})">Tap to reveal punchline</button>
                    <div class="joke-punchline" id="punchline-${num}">${escapedPunchline}</div>
                </div>`;
    }

    return `
            <div class="joke-item">
                <div class="joke-number">${num}</div>
                <div class="joke-setup">${escapedSetup}</div>${punchlineHtml}
                <div class="joke-actions">
                    <button class="action-btn" onclick="shareJoke('${jsSetup}', '${jsPunchline}')">&#x1F4E4; Share</button>
                    <button class="action-btn" onclick="copyJoke('${jsSetup}', '${jsPunchline}', this)">&#x1F4CB; Copy</button>
                </div>
            </div>`;
  }).join('\n');
}

/**
 * Generate ItemList schema entries for structured data
 */
function generateItemListSchema(jokes) {
  return jokes.map((joke, index) => {
    const text = joke.setup || joke.text;
    const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
    return `{
          "@type": "ListItem",
          "position": ${index + 1},
          "name": "${escapedText}"
        }`;
  }).join(',\n        ');
}

/**
 * Generate FAQ schema JSON for structured data
 */
function generateFaqSchema(faqs) {
  return faqs.map(faq => {
    const q = faq.question.replace(/"/g, '\\"');
    const a = faq.answer.replace(/"/g, '\\"');
    return `{
          "@type": "Question",
          "name": "${q}",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "${a}"
          }
        }`;
  }).join(',\n        ');
}

/**
 * Generate FAQ HTML for display on page
 */
function generateFaqHtml(faqs) {
  return faqs.map(faq => {
    return `
            <div class="faq-item">
                <div class="faq-question">${escapeHtml(faq.question)}</div>
                <div class="faq-answer">${escapeHtml(faq.answer)}</div>
            </div>`;
  }).join('\n');
}

/**
 * Generate related collections HTML
 */
function generateRelatedCollectionsHtml(currentSlug) {
  const otherCollections = COLLECTIONS_CONFIG.collections
    .filter(c => c.slug !== currentSlug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  return otherCollections.map(collection => {
    return `                <a href="/collection/${collection.slug}" class="collection-link">
                    <span>${collection.title}</span>
                </a>`;
  }).join('\n');
}

/**
 * Generate a single collection page
 */
async function generateCollectionPage(collection, matchedJokes, template) {
  const today = new Date().toISOString().split('T')[0];

  // Sort by rating (best first) and limit to a reasonable number
  const sortedJokes = matchedJokes
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 50);

  const jokeCount = sortedJokes.length;

  if (jokeCount === 0) {
    console.log(`  Skipping ${collection.slug}: no matching jokes found`);
    return;
  }

  const replacements = {
    COLLECTION_TITLE: collection.title,
    COLLECTION_SLUG: collection.slug,
    COLLECTION_DESCRIPTION: collection.description,
    COLLECTION_CONTEXT: collection.context,
    COLLECTION_COUNT: jokeCount.toString(),
    COLLECTION_KEYWORDS: collection.keywords.join(', '),
    COLLECTION_JOKES: generateJokeListHtml(sortedJokes),
    COLLECTION_ITEM_LIST_SCHEMA: generateItemListSchema(sortedJokes),
    COLLECTION_FAQS: generateFaqSchema(collection.faqs),
    COLLECTION_FAQS_HTML: generateFaqHtml(collection.faqs),
    RELATED_COLLECTIONS: generateRelatedCollectionsHtml(collection.slug),
    DATE_PUBLISHED: today,
    DATE_MODIFIED: today
  };

  const html = replacePlaceholders(template, replacements);

  // Write to collection/<slug>/index.html
  const outputDir = path.join(__dirname, COLLECTIONS_CONFIG.COLLECTION_OUTPUT_DIR, collection.slug);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8');

  console.log(`  Generated: /collection/${collection.slug}/ (${jokeCount} jokes)`);
  stats.collectionsGenerated++;
}

/**
 * Generate sitemap for collections
 */
async function generateCollectionsSitemap() {
  const urls = COLLECTIONS_CONFIG.collections.map(collection => {
    return `  <url>
    <loc>${COLLECTIONS_CONFIG.BASE_URL}/collection/${collection.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const outputPath = path.join(__dirname, '../generated_sitemaps/sitemap_collections.xml');
  await fs.writeFile(outputPath, sitemap, 'utf8');
  console.log(`  Generated sitemap_collections.xml (${COLLECTIONS_CONFIG.collections.length} URLs)`);
}

/**
 * Main generation function
 */
async function main() {
  console.log('Dad Jokes Collection Page Generator\n');
  console.log(`Mode: ${isTestMode ? 'TEST (first 2 collections only)' : 'PRODUCTION (all collections)'}\n`);

  // Create output directories
  await fs.mkdir(path.join(__dirname, COLLECTIONS_CONFIG.COLLECTION_OUTPUT_DIR), { recursive: true });
  await fs.mkdir(path.join(__dirname, '../generated_sitemaps'), { recursive: true });

  // Load template
  console.log('Loading template...');
  const template = await loadTemplate();
  console.log('  Template loaded\n');

  // Fetch jokes
  const allJokes = await fetchJokes();

  // Determine which collections to generate
  let collectionsToGenerate = COLLECTIONS_CONFIG.collections;
  if (isTestMode) {
    collectionsToGenerate = collectionsToGenerate.slice(0, 2);
    console.log(`\nTEST MODE: Generating first ${collectionsToGenerate.length} collections only\n`);
  }

  // Generate collection pages
  console.log('\nGenerating collection pages...');
  for (const collection of collectionsToGenerate) {
    const matchedJokes = filterJokesForCollection(allJokes, collection.jokeFilter);
    await generateCollectionPage(collection, matchedJokes, template);
  }

  // Generate sitemap
  console.log('\nGenerating sitemap...');
  await generateCollectionsSitemap();

  // Print statistics
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  console.log('\n' + '='.repeat(60));
  console.log('COLLECTION GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total jokes in database:   ${stats.totalJokes}`);
  console.log(`Collections generated:     ${stats.collectionsGenerated}`);
  console.log(`Time taken:                ${duration}s`);
  console.log('='.repeat(60));

  if (!isTestMode) {
    console.log('\nNext steps:');
    console.log('1. Review generated pages in /collection/ directory');
    console.log('2. Test pages locally');
    console.log('3. Add sitemap_collections.xml to sitemap index');
    console.log('4. Commit and push to GitHub');
    console.log('5. Submit updated sitemap to Google Search Console');
  }

  process.exit(0);
}

// Run
main().catch(error => {
  console.error('\nERROR:', error);
  process.exit(1);
});
