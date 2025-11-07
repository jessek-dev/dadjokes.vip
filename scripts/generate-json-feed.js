#!/usr/bin/env node

/**
 * JSON Feed Generator for AI Discovery
 *
 * Generates a JSON Feed (https://jsonfeed.org/) of dad jokes
 * for AI tools (ChatGPT, Perplexity, Claude, etc.) to easily ingest.
 *
 * Outputs:
 * - /jokes.json (100 most recent jokes)
 * - /jokes-full.json (all 19,139+ jokes - large file)
 *
 * Run: npm run generate-feed
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, '../../quotes_app/firebase-service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

// Joke URL map (loaded from generate-pages.js)
const jokeUrlMapPath = join(__dirname, '../joke-url-map.json');
let jokeUrlMap = {};
try {
  jokeUrlMap = JSON.parse(readFileSync(jokeUrlMapPath, 'utf8'));
  console.log('✅ Loaded joke URL map');
} catch (error) {
  console.log('⚠️  No joke URL map found, will use fallback URLs');
}

/**
 * Fetch all regular jokes from Firebase
 */
async function fetchJokes() {
  console.log('📥 Fetching jokes from Firebase...');

  const snapshot = await db.collection('jokes').doc('all').collection('jokes').get();
  const jokes = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    jokes.push({
      id: doc.id,
      setup: data.setup || '',
      punchline: data.punchline || '',
      text: data.text || '',
      category: data.category || 'general',
      approved: data.approved || false
    });
  });

  console.log(`  ✅ Fetched ${jokes.length} jokes`);
  return jokes;
}

/**
 * Convert joke to JSON Feed item format
 */
function jokeToFeedItem(joke) {
  const jokeUrl = jokeUrlMap[joke.id] || `/joke/${joke.id}`;
  const fullUrl = `https://dadjokes.vip${jokeUrl}`;

  // Combine setup and punchline, or use text
  const jokeText = joke.setup && joke.punchline
    ? `${joke.setup} ${joke.punchline}`
    : joke.text;

  const title = joke.setup || jokeText.substring(0, 100);

  return {
    id: fullUrl,
    url: fullUrl,
    title: title,
    content_text: jokeText,
    date_published: "2024-01-01T00:00:00Z",
    date_modified: "2025-11-07T00:00:00Z",
    tags: [joke.category, "dad jokes", "humor"],
    author: {
      name: "Dad Jokes",
      url: "https://dadjokes.vip"
    }
  };
}

/**
 * Generate JSON Feed (100 most recent)
 */
async function generateFeed(jokes, limit = 100) {
  console.log(`\n📝 Generating JSON Feed (${limit} jokes)...`);

  // Take first N jokes (could add date sorting if we had timestamps)
  const recentJokes = jokes.slice(0, limit);

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Dad Jokes",
    home_page_url: "https://dadjokes.vip",
    feed_url: "https://dadjokes.vip/jokes.json",
    description: `19,139+ dad jokes across 20+ categories. Daily featured jokes, AI-generated personalized name jokes. Free iOS & Android app available.`,
    icon: "https://dadjokes.vip/assets/android-chrome-192x192.png",
    favicon: "https://dadjokes.vip/assets/favicon-32x32.png",
    language: "en-US",
    items: recentJokes.map(jokeToFeedItem)
  };

  const outputPath = join(__dirname, '../jokes.json');
  writeFileSync(outputPath, JSON.stringify(feed, null, 2), 'utf8');

  console.log(`✅ Generated jokes.json (${recentJokes.length} jokes)`);
  return feed;
}

/**
 * Generate full JSON Feed (all jokes)
 */
async function generateFullFeed(jokes) {
  console.log(`\n📝 Generating FULL JSON Feed (${jokes.length} jokes)...`);

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Dad Jokes - Complete Collection",
    home_page_url: "https://dadjokes.vip",
    feed_url: "https://dadjokes.vip/jokes-full.json",
    description: `Complete collection of ${jokes.length} dad jokes across 20+ categories.`,
    icon: "https://dadjokes.vip/assets/android-chrome-192x192.png",
    favicon: "https://dadjokes.vip/assets/favicon-32x32.png",
    language: "en-US",
    items: jokes.map(jokeToFeedItem)
  };

  const outputPath = join(__dirname, '../jokes-full.json');
  writeFileSync(outputPath, JSON.stringify(feed, null, 2), 'utf8');

  console.log(`✅ Generated jokes-full.json (${jokes.length} jokes)`);

  // Calculate file size
  const { statSync } = await import('fs');
  const stats = statSync(outputPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   File size: ${fileSizeMB} MB`);

  return feed;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 JSON Feed Generator for AI Discovery\n');

    const jokes = await fetchJokes();

    // Generate recent feed (for regular consumption)
    await generateFeed(jokes, 100);

    // Generate full feed (for bulk ingestion)
    await generateFullFeed(jokes);

    console.log('\n✨ JSON Feed generation completed successfully!');
    console.log('\n📍 Feeds available at:');
    console.log('   - https://dadjokes.vip/jokes.json (100 jokes)');
    console.log('   - https://dadjokes.vip/jokes-full.json (all jokes)');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error generating JSON feed:', error);
    process.exit(1);
  }
}

main();
