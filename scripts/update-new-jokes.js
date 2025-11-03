#!/usr/bin/env node

import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Firebase Admin initialization
let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, '../../quotes_app/firebase-service-account.json');
  serviceAccount = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Error loading Firebase service account:', error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// State tracking
const STATE_FILE = path.join(__dirname, 'last-generated.json');

/**
 * Load last generation state
 */
async function loadState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // First run - return initial state
    return {
      lastGeneratedDate: new Date().toISOString(),
      lastRegularJokeId: null,
      lastNameJokeId: null,
      totalJokesGenerated: 10247,
      monthlySitemaps: []
    };
  }
}

/**
 * Save generation state
 */
async function saveState(state) {
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Fetch new regular jokes added since last run
 */
async function fetchNewJokes(lastJokeId) {
  console.log('📥 Checking for new regular jokes...');

  const snapshot = await db.collection('jokes').doc('all').collection('jokes').get();
  const allJokes = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    allJokes.push({
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

  // Filter for new jokes only
  if (lastJokeId) {
    const lastIndex = allJokes.findIndex(j => j.id === lastJokeId);
    if (lastIndex !== -1) {
      const newJokes = allJokes.slice(lastIndex + 1);
      console.log(`  ✅ Found ${newJokes.length} new regular jokes`);
      return newJokes;
    }
  }

  console.log(`  ✅ No previous state - all ${allJokes.length} jokes will be counted as existing`);
  return [];
}

/**
 * Fetch new AI name jokes added since last run
 */
async function fetchNewNameJokes(lastJokeId) {
  console.log('📥 Checking for new AI name jokes...');

  const snapshot = await db.collection('name_jokes')
    .where(admin.firestore.FieldPath.documentId(), '>=', 'ai_')
    .where(admin.firestore.FieldPath.documentId(), '<', 'ai_' + '\uf8ff')
    .get();

  const allNameJokes = [];

  snapshot.forEach(doc => {
    const docId = doc.id;
    if (docId.startsWith('templ_')) return;

    const data = doc.data();
    allNameJokes.push({
      id: docId,
      text: data.joke || data.text || '',
      setup: data.setup || null,
      punchline: data.punchline || null,
      name: data.name || 'Unknown',
      category: 'Name Jokes',
      rating: 3
    });
  });

  // Filter for new jokes only
  if (lastJokeId) {
    const lastIndex = allNameJokes.findIndex(j => j.id === lastJokeId);
    if (lastIndex !== -1) {
      const newJokes = allNameJokes.slice(lastIndex + 1);
      console.log(`  ✅ Found ${newJokes.length} new AI name jokes`);
      return newJokes;
    }
  }

  console.log(`  ✅ No previous state - all ${allNameJokes.length} name jokes will be counted as existing`);
  return [];
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
 * Generate slug from text
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
 * Get rating stars HTML
 */
function getRatingStars(rating) {
  return '⭐'.repeat(Math.min(5, Math.max(1, rating)));
}

/**
 * Get 3 related jokes from same category
 */
function getRelatedJokes(joke, allJokes) {
  const sameCategory = allJokes
    .filter(j => j.category === joke.category && j.id !== joke.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return sameCategory.length === 3 ? sameCategory : allJokes
    .filter(j => j.id !== joke.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
}

/**
 * Generate single joke page
 */
async function generateJokePage(joke, template, allJokes) {
  const relatedJokes = getRelatedJokes(joke, allJokes);
  const categorySlug = slugify(joke.category);
  const categoryDescription = CONFIG.CATEGORY_DESCRIPTIONS[joke.category] ||
    `Funny ${joke.category.toLowerCase()} jokes that will make you laugh!`;

  let jokeSetup = joke.setup || joke.text;
  let jokePunchline = joke.punchline || '';

  if (!joke.setup && joke.text.includes('?')) {
    const parts = joke.text.split('?');
    jokeSetup = parts[0] + '?';
    jokePunchline = parts.slice(1).join('?').trim();
  }

  const replacements = {
    JOKE_ID: joke.id,
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
    RELATED_1_TEXT: relatedJokes[0]?.text || '',
    RELATED_2_ID: relatedJokes[1]?.id || '',
    RELATED_2_TEXT: relatedJokes[1]?.text || '',
    RELATED_3_ID: relatedJokes[2]?.id || '',
    RELATED_3_TEXT: relatedJokes[2]?.text || ''
  };

  const html = replacePlaceholders(template, replacements);
  const outputPath = path.join(__dirname, CONFIG.JOKE_OUTPUT_DIR, `${joke.id}.html`);

  await fs.writeFile(outputPath, html, 'utf8');
}

/**
 * Generate monthly incremental sitemap
 */
async function generateMonthlySitemap(jokes, yearMonth) {
  const sitemapName = `sitemap_updates_${yearMonth}`;

  const urlElements = jokes.map(joke => `  <url>
    <loc>${CONFIG.BASE_URL}/joke/${joke.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  const outputPath = path.join(__dirname, CONFIG.SITEMAP_OUTPUT_DIR, `${sitemapName}.xml`);
  await fs.writeFile(outputPath, sitemap, 'utf8');

  console.log(`  ✅ Generated ${sitemapName}.xml (${jokes.length} URLs)`);

  return { name: sitemapName, count: jokes.length };
}

/**
 * Update sitemap index to include new monthly sitemap
 */
async function updateSitemapIndex(newSitemap) {
  const indexPath = path.join(__dirname, CONFIG.OUTPUT_DIR, 'sitemap_index.xml');

  // Read current index
  let indexContent = await fs.readFile(indexPath, 'utf8');

  // Check if this sitemap is already in the index
  if (indexContent.includes(`${newSitemap.name}.xml`)) {
    console.log('  ℹ️  Sitemap already in index, skipping update');
    return;
  }

  // Add new sitemap entry before closing tag
  const newEntry = `  <sitemap>
    <loc>${CONFIG.BASE_URL}/generated_sitemaps/${newSitemap.name}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

  indexContent = indexContent.replace('</sitemapindex>', newEntry);

  await fs.writeFile(indexPath, indexContent, 'utf8');
  console.log('  ✅ Updated sitemap_index.xml with new monthly sitemap');
}

/**
 * Main incremental update function
 */
async function main() {
  console.log('🔄 Dad Jokes Incremental Update\n');
  console.log(`Run date: ${new Date().toISOString()}\n`);

  // Load previous state
  const state = await loadState();
  console.log('📊 Previous State:');
  console.log(`  Last run: ${state.lastGeneratedDate}`);
  console.log(`  Total jokes: ${state.totalJokesGenerated}`);
  console.log(`  Monthly sitemaps: ${state.monthlySitemaps.length}\n`);

  // Fetch new jokes
  const newRegularJokes = await fetchNewJokes(state.lastRegularJokeId);
  const newNameJokes = await fetchNewNameJokes(state.lastNameJokeId);
  const allNewJokes = [...newRegularJokes, ...newNameJokes];

  if (allNewJokes.length === 0) {
    console.log('\n✅ No new jokes found. Nothing to do!');

    // Still update state with current timestamp
    state.lastGeneratedDate = new Date().toISOString();
    await saveState(state);
    process.exit(0);
  }

  console.log(`\n📝 Found ${allNewJokes.length} new jokes to process\n`);

  // Load template
  console.log('📄 Loading joke template...');
  const jokeTemplate = await loadTemplate(CONFIG.JOKE_TEMPLATE);

  // Generate new joke pages
  console.log('📝 Generating new joke pages...');
  for (const joke of allNewJokes) {
    await generateJokePage(joke, jokeTemplate, allNewJokes);
  }
  console.log(`  ✅ Generated ${allNewJokes.length} new joke pages\n`);

  // Generate monthly sitemap
  const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '_');
  console.log(`📝 Generating monthly sitemap for ${yearMonth}...`);
  const newSitemap = await generateMonthlySitemap(allNewJokes, yearMonth);

  // Update sitemap index
  console.log('📝 Updating sitemap index...');
  await updateSitemapIndex(newSitemap);

  // Update state
  state.lastGeneratedDate = new Date().toISOString();
  state.lastRegularJokeId = newRegularJokes.length > 0 ? newRegularJokes[newRegularJokes.length - 1].id : state.lastRegularJokeId;
  state.lastNameJokeId = newNameJokes.length > 0 ? newNameJokes[newNameJokes.length - 1].id : state.lastNameJokeId;
  state.totalJokesGenerated += allNewJokes.length;
  state.monthlySitemaps.push({
    name: newSitemap.name,
    count: newSitemap.count,
    date: new Date().toISOString(),
    yearMonth: yearMonth
  });

  await saveState(state);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ INCREMENTAL UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`New jokes added:          ${allNewJokes.length}`);
  console.log(`  - Regular jokes:        ${newRegularJokes.length}`);
  console.log(`  - Name jokes:           ${newNameJokes.length}`);
  console.log(`Total jokes now:          ${state.totalJokesGenerated}`);
  console.log(`New sitemap:              ${newSitemap.name}.xml`);
  console.log('='.repeat(60));
  console.log('\n📢 NEXT STEPS:');
  console.log('1. Review generated pages');
  console.log('2. Commit and push changes to GitHub');
  console.log('3. Submit new sitemap to Google Search Console:');
  console.log(`   ${CONFIG.BASE_URL}/generated_sitemaps/${newSitemap.name}.xml`);
  console.log('='.repeat(60));

  process.exit(0);
}

// Run
main().catch(error => {
  console.error('\n❌ ERROR:', error);
  process.exit(1);
});
