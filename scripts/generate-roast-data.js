#!/usr/bin/env node

/**
 * generate-roast-data.js
 *
 * Connects to Firebase, fetches all name_jokes, groups them by name,
 * and outputs a compact JSON file at /roast/roast-data.json.
 *
 * Usage:
 *   cd scripts && node generate-roast-data.js
 *   node generate-roast-data.js --test   # limits to 10 names for testing
 */

import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isTestMode = process.argv.includes('--test');
const MAX_ROASTS_PER_NAME = 10;

// Firebase Admin initialization
let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, '../../quotes_app/firebase-service-account.json');
  serviceAccount = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('Error loading Firebase service account:', error.message);
  console.error('Please ensure firebase-service-account.json exists at:');
  console.error('  quotes_app/firebase-service-account.json');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fetchNameJokes() {
  console.log('Fetching name jokes from Firebase...');

  const snapshot = await db.collection('name_jokes')
    .where(admin.firestore.FieldPath.documentId(), '>=', 'ai_')
    .where(admin.firestore.FieldPath.documentId(), '<', 'ai_' + '\uf8ff')
    .get();

  console.log(`  Fetched ${snapshot.size} name joke documents`);
  return snapshot;
}

function groupByName(snapshot) {
  const names = {};
  let totalJokes = 0;

  snapshot.forEach(doc => {
    const docId = doc.id;
    if (docId.startsWith('templ_')) return;

    const data = doc.data();
    const name = (data.name || '').trim();
    if (!name) return;

    const normalized = name.toLowerCase();
    const jokeText = data.joke || data.text || '';
    if (!jokeText) return;

    if (!names[normalized]) {
      names[normalized] = {
        displayName: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        origin: data.origin || null,
        roasts: []
      };
    }

    // Keep the display name with proper casing from the first occurrence
    names[normalized].roasts.push(jokeText);
    totalJokes++;
  });

  console.log(`  Grouped into ${Object.keys(names).length} unique names (${totalJokes} total jokes)`);
  return names;
}

function buildOutput(names) {
  const output = {};
  const sortedKeys = Object.keys(names).sort();

  let limitedKeys = sortedKeys;
  if (isTestMode) {
    limitedKeys = sortedKeys.slice(0, 10);
    console.log(`  TEST MODE: limiting to ${limitedKeys.length} names`);
  }

  for (const key of limitedKeys) {
    const entry = names[key];
    const totalCount = entry.roasts.length;

    // Shuffle and limit roasts to keep file size manageable
    const shuffled = entry.roasts.sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, MAX_ROASTS_PER_NAME);

    output[key] = {
      displayName: entry.displayName,
      count: totalCount,
      roasts: limited
    };

    // Only include origin if available
    if (entry.origin) {
      output[key].origin = entry.origin;
    }
  }

  return output;
}

async function main() {
  const startTime = Date.now();

  const snapshot = await fetchNameJokes();
  const grouped = groupByName(snapshot);
  const output = buildOutput(grouped);

  const outputPath = path.join(__dirname, '../roast/roast-data.json');
  const jsonStr = JSON.stringify(output);
  await fs.writeFile(outputPath, jsonStr, 'utf8');

  const fileSizeMB = (Buffer.byteLength(jsonStr) / 1024 / 1024).toFixed(2);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\nDone!');
  console.log(`  Names: ${Object.keys(output).length}`);
  console.log(`  File size: ${fileSizeMB} MB`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  Time: ${duration}s`);

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
