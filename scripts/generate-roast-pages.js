#!/usr/bin/env node

import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROAST_CONFIG } from './roast-config.js';

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

// Statistics
const stats = {
  totalNameJokes: 0,
  totalNames: 0,
  uniqueNames: 0,
  namesWithEnoughRoasts: 0,
  pagesGenerated: 0,
  namesSkipped: 0,
  startTime: Date.now()
};

/**
 * Fetch all AI name jokes from Firebase (docId starts with "ai_")
 */
async function fetchNameJokes() {
  console.log('Fetching AI name jokes from Firebase...');

  const snapshot = await db.collection(ROAST_CONFIG.NAME_JOKES_COLLECTION)
    .where(admin.firestore.FieldPath.documentId(), '>=', 'ai_')
    .where(admin.firestore.FieldPath.documentId(), '<', 'ai_' + '\uf8ff')
    .get();

  const jokes = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    jokes.push({
      id: doc.id,
      text: data.joke || data.text || '',
      name: (data.name || 'Unknown').trim(),
      roastType: data.roast_type || data.joke_type || data.category || 'general',
      setup: data.setup || null,
      punchline: data.punchline || null
    });
  });

  stats.totalNameJokes = jokes.length;
  console.log(`  Fetched ${jokes.length} AI name jokes`);

  return jokes;
}

/**
 * Fetch all names documents (for origin data)
 */
async function fetchNames() {
  console.log('Fetching names data from Firebase...');

  const snapshot = await db.collection(ROAST_CONFIG.NAMES_COLLECTION).get();
  const names = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    const name = (data.name || doc.id).trim().toLowerCase();
    names[name] = {
      origin: data.origin || data.name_origin || null,
      originCount: data.origin_count || data.culture_count || null,
      meaning: data.meaning || null
    };
  });

  stats.totalNames = Object.keys(names).length;
  console.log(`  Fetched ${stats.totalNames} name records`);

  return names;
}

/**
 * Group jokes by name (normalized to lowercase)
 */
function groupByName(jokes) {
  const grouped = {};

  for (const joke of jokes) {
    const name = joke.name.trim().toLowerCase();
    if (!name || name === 'unknown') continue;

    if (!grouped[name]) {
      grouped[name] = {
        displayName: joke.name.trim(), // Preserve original casing from first occurrence
        jokes: []
      };
    }
    grouped[name].jokes.push(joke);
  }

  // Use Title Case for display name
  for (const key of Object.keys(grouped)) {
    grouped[key].displayName = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  }

  stats.uniqueNames = Object.keys(grouped).length;
  return grouped;
}

/**
 * Escape HTML entities in text
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
 * Escape text for use in JavaScript string literals (inside onclick attributes)
 */
function escapeJsString(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Generate HTML for a single roast card
 */
function generateRoastCard(joke, index, displayName) {
  const badgeLabel = ROAST_CONFIG.ROAST_TYPE_LABELS[joke.roastType] || ROAST_CONFIG.DEFAULT_ROAST_BADGE;
  const roastText = escapeHtml(joke.text);
  const roastTextJs = escapeJsString(joke.text);
  const nameJs = escapeJsString(displayName);

  return `
            <div class="roast-card">
                <span class="roast-badge">${badgeLabel}</span>
                <div class="roast-text">${roastText}</div>
                <div class="roast-actions">
                    <button class="roast-btn" onclick="copyRoast('${roastTextJs}', this)">&#128203; Copy</button>
                    <button class="roast-btn roast-btn-send" onclick="shareRoast('${roastTextJs}', '${nameJs}')">&#128640; Send to a ${escapeHtml(displayName)}</button>
                </div>
            </div>`;
}

/**
 * Generate HTML for related name links
 */
function generateRelatedNamesHtml(currentName, allNames) {
  const otherNames = allNames.filter(n => n !== currentName);

  // Shuffle and pick RELATED_NAMES_COUNT
  const shuffled = otherNames.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, ROAST_CONFIG.RELATED_NAMES_COUNT);

  return selected.map((name, i) => {
    const display = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const emoji = ROAST_CONFIG.NAME_LINK_EMOJIS[i % ROAST_CONFIG.NAME_LINK_EMOJIS.length];
    return `                <a href="/roast/${encodeURIComponent(name)}/" class="name-link">
                    <span class="name-link-icon">${emoji}</span>
                    <span>Roast ${display}</span>
                </a>`;
  }).join('\n');
}

/**
 * Generate name origin HTML section (or empty string if no data)
 */
function generateNameOriginHtml(displayName, nameData) {
  if (!nameData || !nameData.origin) return '';

  let html = `        <div class="name-origin">`;
  html += `\n            <strong>About the name ${escapeHtml(displayName)}:</strong> `;

  html += `The name ${escapeHtml(displayName)} comes from ${escapeHtml(nameData.origin)}.`;

  if (nameData.originCount) {
    html += ` ${nameData.originCount} cultures use this name — and we've got burns for all of them.`;
  }

  if (nameData.meaning) {
    html += ` It means "${escapeHtml(nameData.meaning)}."`;
  }

  html += `\n        </div>\n`;
  return html;
}

/**
 * Generate ItemList schema JSON for structured data
 */
function generateItemListSchema(jokes, nameLower) {
  return jokes.map((joke, index) => {
    return `{
          "@type": "ListItem",
          "position": ${index + 1},
          "name": ${JSON.stringify(joke.text.substring(0, 120))},
          "url": "https://dadjokes.vip/roast/${encodeURIComponent(nameLower)}/"
        }`;
  }).join(',\n        ');
}

/**
 * Replace all placeholders in template
 */
function replacePlaceholders(template, replacements) {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, String(value ?? ''));
  }
  return result;
}

/**
 * Generate a single roast name page
 */
async function generateRoastPage(nameLower, nameGroup, namesData, template, allNameKeys) {
  const { displayName, jokes } = nameGroup;
  const nameData = namesData[nameLower] || null;
  const dateModified = new Date().toISOString().split('T')[0];

  // Generate all roast card HTML
  const roastsHtml = jokes.map((joke, i) => generateRoastCard(joke, i, displayName)).join('\n');

  // Generate related names
  const relatedNamesHtml = generateRelatedNamesHtml(nameLower, allNameKeys);

  // Generate name origin section
  const nameOriginHtml = generateNameOriginHtml(displayName, nameData);

  // Generate schema
  const itemListSchema = generateItemListSchema(jokes, nameLower);

  const replacements = {
    NAME: displayName,
    NAME_LOWER: nameLower,
    ROAST_COUNT: jokes.length,
    ROASTS_HTML: roastsHtml,
    RELATED_NAMES_HTML: relatedNamesHtml,
    NAME_ORIGIN_HTML: nameOriginHtml,
    ROAST_ITEM_LIST_SCHEMA: itemListSchema,
    DATE_MODIFIED: dateModified
  };

  const html = replacePlaceholders(template, replacements);

  // Write to /roast/{name}/index.html
  const outputDir = path.join(__dirname, ROAST_CONFIG.OUTPUT_DIR, encodeURIComponent(nameLower));
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8');

  stats.pagesGenerated++;
}

/**
 * Generate sitemap_roasts.xml
 */
async function generateSitemap(nameKeys) {
  const dateModified = new Date().toISOString().split('T')[0];

  const urlElements = nameKeys.map(name => {
    return `  <url>
    <loc>${ROAST_CONFIG.BASE_URL}/roast/${encodeURIComponent(name)}/</loc>
    <lastmod>${dateModified}</lastmod>
    <priority>${ROAST_CONFIG.SITEMAP_PRIORITY}</priority>
    <changefreq>${ROAST_CONFIG.SITEMAP_CHANGEFREQ}</changefreq>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  const outputPath = path.join(__dirname, ROAST_CONFIG.SITEMAP_OUTPUT_DIR, 'sitemap_roasts.xml');
  await fs.writeFile(outputPath, sitemap, 'utf8');

  console.log(`  Generated sitemap_roasts.xml (${nameKeys.length} URLs)`);
}

/**
 * Main
 */
async function main() {
  console.log('=== Roast Name Page Generator ===\n');
  console.log(`Mode: ${isTestMode ? 'TEST (10 names max)' : 'PRODUCTION (all names)'}\n`);

  // Ensure output directories exist
  await fs.mkdir(path.join(__dirname, ROAST_CONFIG.OUTPUT_DIR), { recursive: true });
  await fs.mkdir(path.join(__dirname, ROAST_CONFIG.SITEMAP_OUTPUT_DIR), { recursive: true });

  // Load template
  console.log('Loading template...');
  const templatePath = path.join(__dirname, ROAST_CONFIG.TEMPLATE_PATH);
  const template = await fs.readFile(templatePath, 'utf8');
  console.log('  Template loaded\n');

  // Fetch data from Firebase
  const nameJokes = await fetchNameJokes();
  const namesData = await fetchNames();

  // Group jokes by name
  console.log('\nGrouping jokes by name...');
  const grouped = groupByName(nameJokes);
  console.log(`  Found ${stats.uniqueNames} unique names\n`);

  // Filter to names with enough roasts
  const qualifiedNames = {};
  for (const [name, group] of Object.entries(grouped)) {
    if (group.jokes.length >= ROAST_CONFIG.MIN_ROASTS_PER_NAME) {
      qualifiedNames[name] = group;
    } else {
      stats.namesSkipped++;
    }
  }

  stats.namesWithEnoughRoasts = Object.keys(qualifiedNames).length;
  console.log(`Names with ${ROAST_CONFIG.MIN_ROASTS_PER_NAME}+ roasts: ${stats.namesWithEnoughRoasts}`);
  console.log(`Names skipped (too few roasts): ${stats.namesSkipped}\n`);

  // Get sorted list of all qualified name keys (for related names linking)
  let allNameKeys = Object.keys(qualifiedNames).sort();

  if (isTestMode) {
    console.log('TEST MODE: Limiting to 10 names\n');
    allNameKeys = allNameKeys.slice(0, 10);
  }

  // Generate pages
  console.log('Generating roast pages...');
  for (let i = 0; i < allNameKeys.length; i++) {
    const name = allNameKeys[i];
    await generateRoastPage(name, qualifiedNames[name], namesData, template, allNameKeys);

    if ((i + 1) % 50 === 0) {
      console.log(`  Generated ${i + 1}/${allNameKeys.length} pages...`);
    }
  }
  console.log(`  Generated ${stats.pagesGenerated} roast pages\n`);

  // Generate sitemap
  console.log('Generating sitemap...');
  await generateSitemap(allNameKeys);

  // Summary
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  console.log('\n' + '='.repeat(60));
  console.log('ROAST PAGE GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total AI name jokes:       ${stats.totalNameJokes}`);
  console.log(`Names in DB:               ${stats.totalNames}`);
  console.log(`Unique names with jokes:   ${stats.uniqueNames}`);
  console.log(`Names with ${ROAST_CONFIG.MIN_ROASTS_PER_NAME}+ roasts:     ${stats.namesWithEnoughRoasts}`);
  console.log(`Names skipped:             ${stats.namesSkipped}`);
  console.log(`Pages generated:           ${stats.pagesGenerated}`);
  console.log(`Time taken:                ${duration}s`);
  console.log('='.repeat(60));

  if (!isTestMode) {
    console.log('\nNext steps:');
    console.log('1. Review generated pages in /roast/ directory');
    console.log('2. Test a few pages locally (e.g., /roast/jessica/index.html)');
    console.log('3. Commit and push to GitHub');
    console.log('4. Add sitemap_roasts.xml to your sitemap index');
    console.log('5. Submit to Google Search Console');
  }

  process.exit(0);
}

// Run
main().catch(error => {
  console.error('\nERROR:', error);
  process.exit(1);
});
