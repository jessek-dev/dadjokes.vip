#!/usr/bin/env node

/**
 * Update Joke Count in app/index.html
 *
 * This script:
 * 1. Fetches total joke count from Firebase (jokes + name_jokes)
 * 2. Updates the static HTML fallback value in app/index.html
 * 3. Formats the count nicely (e.g., "20,247 jokes")
 *
 * Run: npm run update-count
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

/**
 * Format number with commas (e.g., 20247 -> "20,247")
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get total joke count from Firebase
 */
async function getTotalJokeCount() {
  try {
    console.log('Fetching joke counts from Firebase...');

    // Get regular jokes count from jokes/all/jokes subcollection
    const jokesSnapshot = await db.collection('jokes').doc('all').collection('jokes').get();
    const jokesCount = jokesSnapshot.size;
    console.log(`Regular jokes: ${formatNumber(jokesCount)}`);

    // Get name jokes count
    let nameJokesCount = 0;
    try {
      const nameJokesSnapshot = await db.collection('name_jokes').get();
      nameJokesCount = nameJokesSnapshot.size;
      console.log(`Name jokes: ${formatNumber(nameJokesCount)}`);
    } catch (error) {
      console.log('Note: Could not fetch name_jokes collection (may not exist)');
    }

    const totalCount = jokesCount + nameJokesCount;
    console.log(`Total jokes: ${formatNumber(totalCount)}`);

    return totalCount;
  } catch (error) {
    console.error('Error fetching joke count:', error);
    throw error;
  }
}

/**
 * Update joke count in app/index.html
 */
async function updateAppIndexHtml(count) {
  const appIndexPath = join(__dirname, '../app/index.html');

  try {
    console.log(`\nUpdating ${appIndexPath}...`);

    let html = readFileSync(appIndexPath, 'utf8');

    // Format the count nicely
    const formattedCount = formatNumber(count);

    // Replace the joke count in the h3 tag
    // Match: <span id="joke-count">20,000+</span>
    const oldPattern = /<span id="joke-count">[^<]+<\/span>/;
    const newValue = `<span id="joke-count">${formattedCount}</span>`;

    if (!oldPattern.test(html)) {
      console.error('Could not find joke-count span in app/index.html');
      return false;
    }

    html = html.replace(oldPattern, newValue);

    // Also update meta description if it contains a joke count
    const descPattern = /Over \d{1,3}(,\d{3})* jokes/;
    if (descPattern.test(html)) {
      html = html.replace(descPattern, `Over ${formattedCount} jokes`);
    }

    writeFileSync(appIndexPath, html, 'utf8');
    console.log(`✅ Updated joke count to: ${formattedCount}`);

    return true;
  } catch (error) {
    console.error('Error updating app/index.html:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🎯 Updating joke count...\n');

    const totalCount = await getTotalJokeCount();
    await updateAppIndexHtml(totalCount);

    console.log('\n✨ Joke count update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating joke count:', error);
    process.exit(1);
  }
}

main();
