#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const SHEET_CONFIG = {
  SPREADSHEET_ID: '1yWeZmR-mrh9FxGaOjc92HfALYx36jXKSXTacqUbjR6E',
  SHEET_NAME: 'Failed Jokes',
  RANGE: 'A2:H', // Starting from row 2 (skip header), columns A-H

  // Column mapping (0-indexed)
  COLUMNS: {
    SOURCE_ID: 0,      // A: Source ID
    JOKE_TEXT: 1,      // B: Joke Text
    SETUP: 2,          // C: Setup
    PUNCHLINE: 3,      // D: Punchline
    SOURCE: 4,         // E: Source
    IMPORT_DATE: 5,    // F: Import Date
    TOXICITY_SCORE: 6, // G: Toxicity Score
    MODERATION_STATUS: 7 // H: Moderation Status
  }
};

// Statistics tracking
const stats = {
  totalJokes: 0,
  pagesGenerated: 0,
  startTime: Date.now()
};

// Track used slugs to handle collisions
const usedSlugs = new Set();

// Track joke ID to URL mapping for sitemap
const jokeUrlMap = {};

/**
 * Fetch jokes from Google Sheets using public API
 */
async function fetchJokesFromSheet() {
  console.log('📥 Fetching jokes from Google Sheet...');
  console.log(`   Sheet: "${SHEET_CONFIG.SHEET_NAME}"`);

  // Use public Google Sheets API (no auth required if sheet is publicly readable)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_CONFIG.SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_CONFIG.SHEET_NAME)}!${SHEET_CONFIG.RANGE}?key=${process.env.GOOGLE_SHEETS_API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    console.log(`   ✅ Fetched ${rows.length} rows from sheet\n`);

    // Parse rows into joke objects
    const jokes = rows.map((row, index) => {
      const sourceId = row[SHEET_CONFIG.COLUMNS.SOURCE_ID] || `FAI${String(index + 1).padStart(6, '0')}`;
      const jokeText = row[SHEET_CONFIG.COLUMNS.JOKE_TEXT] || '';
      const setup = row[SHEET_CONFIG.COLUMNS.SETUP] || '';
      const punchline = row[SHEET_CONFIG.COLUMNS.PUNCHLINE] || '';
      const source = row[SHEET_CONFIG.COLUMNS.SOURCE] || 'Unknown';
      const importDate = row[SHEET_CONFIG.COLUMNS.IMPORT_DATE] || '';
      const toxicityScore = row[SHEET_CONFIG.COLUMNS.TOXICITY_SCORE] || '';
      const moderationStatus = row[SHEET_CONFIG.COLUMNS.MODERATION_STATUS] || '';

      // Skip empty rows
      if (!jokeText && !setup) {
        return null;
      }

      return {
        id: sourceId,
        text: jokeText,
        setup: setup || null,
        punchline: punchline || null,
        category: 'Failed AI Jokes',
        source,
        importDate,
        toxicityScore,
        moderationStatus,
        rating: 2 // Default rating for failed jokes
      };
    }).filter(joke => joke !== null); // Remove null entries

    stats.totalJokes = jokes.length;
    console.log(`📊 Parsed ${jokes.length} valid jokes\n`);

    return jokes;
  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure the sheet is publicly readable (Share > Anyone with link can view)');
    console.error('2. Set GOOGLE_SHEETS_API_KEY environment variable');
    console.error('   Get a key from: https://console.cloud.google.com/apis/credentials');
    throw error;
  }
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
 * Generate SEO-friendly slug from joke setup
 */
function generateJokeSlug(text) {
  // Clean the text
  let slug = text
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

  // Handle collisions with numeric suffix
  let finalSlug = slug;
  let counter = 2;
  while (usedSlugs.has(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  usedSlugs.add(finalSlug);
  return finalSlug;
}

/**
 * Get rating stars HTML
 */
function getRatingStars(rating) {
  return '⭐'.repeat(Math.min(5, Math.max(1, rating)));
}

/**
 * Get 3 random related jokes from same batch
 */
function getRelatedJokes(joke, allJokes) {
  const otherJokes = allJokes
    .filter(j => j.id !== joke.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return otherJokes;
}

/**
 * Generate single failed joke page with SEO-friendly URL
 */
async function generateFailedJokePage(joke, template, allJokes) {
  const relatedJokes = getRelatedJokes(joke, allJokes);
  const categorySlug = 'failed-ai-jokes';
  const categoryDescription = 'Pretty terrible attempts by AI to be funny. These jokes are so bad, they\'re almost good... almost.';

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
  const jokeSlug = generateJokeSlug(jokeSetup);

  // Store URL mapping for sitemap
  const jokeUrl = `/joke/${categorySlug}/${jokeSlug}`;
  jokeUrlMap[joke.id] = jokeUrl;

  // Get related joke URLs (may be empty if not yet generated)
  const related1Url = jokeUrlMap[relatedJokes[0]?.id] || '';
  const related2Url = jokeUrlMap[relatedJokes[1]?.id] || '';
  const related3Url = jokeUrlMap[relatedJokes[2]?.id] || '';

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
    KEYWORD_1: 'failed AI jokes',
    KEYWORD_2: 'bad jokes',
    RELATED_1_ID: relatedJokes[0]?.id || '',
    RELATED_1_URL: related1Url,
    RELATED_1_TEXT: relatedJokes[0]?.text || '',
    RELATED_2_ID: relatedJokes[1]?.id || '',
    RELATED_2_URL: related2Url,
    RELATED_2_TEXT: relatedJokes[1]?.text || '',
    RELATED_3_ID: relatedJokes[2]?.id || '',
    RELATED_3_URL: related3Url,
    RELATED_3_TEXT: relatedJokes[2]?.text || ''
  };

  const html = replacePlaceholders(template, replacements);

  // Create category subdirectory
  const categoryDir = path.join(__dirname, CONFIG.JOKE_OUTPUT_DIR, categorySlug);
  await fs.mkdir(categoryDir, { recursive: true });

  // Write to SEO-friendly path
  const outputPath = path.join(categoryDir, `${jokeSlug}.html`);
  await fs.writeFile(outputPath, html, 'utf8');

  stats.pagesGenerated++;
}

/**
 * Generate sitemap for failed AI jokes
 */
async function generateFailedJokesSitemap(jokes) {
  console.log('\n📝 Generating sitemap for failed AI jokes...');

  const urlElements = jokes.map(joke => {
    const jokeUrl = jokeUrlMap[joke.id];
    return `  <url>
    <loc>${CONFIG.BASE_URL}${jokeUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  const outputPath = path.join(__dirname, CONFIG.SITEMAP_OUTPUT_DIR, 'sitemap_failed_ai_jokes.xml');
  await fs.writeFile(outputPath, sitemap, 'utf8');

  console.log(`  ✅ Generated sitemap_failed_ai_jokes.xml (${jokes.length} URLs)`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Failed AI Jokes Importer\n');
  console.log('=' .repeat(60));

  // Check for API key
  if (!process.env.GOOGLE_SHEETS_API_KEY) {
    console.error('❌ Error: GOOGLE_SHEETS_API_KEY environment variable not set\n');
    console.error('To fix this:');
    console.error('1. Go to https://console.cloud.google.com/apis/credentials');
    console.error('2. Create an API key (or use existing one)');
    console.error('3. Enable Google Sheets API for your project');
    console.error('4. Set the environment variable:');
    console.error('   export GOOGLE_SHEETS_API_KEY="your-api-key-here"\n');
    process.exit(1);
  }

  // Create output directories
  await fs.mkdir(path.join(__dirname, CONFIG.JOKE_OUTPUT_DIR), { recursive: true });
  await fs.mkdir(path.join(__dirname, CONFIG.SITEMAP_OUTPUT_DIR), { recursive: true });

  // Load template
  console.log('📄 Loading template...');
  const jokeTemplate = await loadTemplate(CONFIG.JOKE_TEMPLATE);
  console.log('  ✅ Template loaded\n');

  // Fetch jokes from Google Sheets
  const jokes = await fetchJokesFromSheet();

  if (jokes.length === 0) {
    console.error('❌ No jokes found in sheet. Check your sheet configuration.');
    process.exit(1);
  }

  // Generate joke pages
  console.log('📝 Generating failed joke pages...');
  for (let i = 0; i < jokes.length; i++) {
    await generateFailedJokePage(jokes[i], jokeTemplate, jokes);

    if ((i + 1) % 100 === 0) {
      console.log(`  Generated ${i + 1}/${jokes.length} pages...`);
    }
  }
  console.log(`  ✅ Generated ${stats.pagesGenerated} pages\n`);

  // Generate sitemap
  await generateFailedJokesSitemap(jokes);

  // Print statistics
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total jokes imported:     ${stats.totalJokes}`);
  console.log(`Pages generated:          ${stats.pagesGenerated}`);
  console.log(`Time taken:               ${duration}s`);
  console.log('='.repeat(60));

  console.log('\nNext steps:');
  console.log('1. Review generated pages in /joke/failed-ai-jokes/ directory');
  console.log('2. Test a few pages locally');
  console.log('3. Commit and push to GitHub');
  console.log('4. Submit sitemap_failed_ai_jokes.xml to Google Search Console');

  process.exit(0);
}

// Run
main().catch(error => {
  console.error('\n❌ ERROR:', error);
  process.exit(1);
});
