#!/usr/bin/env node

/**
 * Automated Social Media Posting
 *
 * Posts a daily dad joke to Twitter/X, Reddit (r/dadjokes), and Bluesky.
 * Each platform is independently toggleable via environment variables.
 * Joke selection is deterministic but uses a different seed than the daily
 * website joke, so followers get unique content.
 *
 * Run: node social-post.js
 *
 * Environment variables:
 *   TWITTER_ENABLED=true + TWITTER_API_KEY, TWITTER_API_SECRET,
 *     TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
 *   REDDIT_ENABLED=true + REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET,
 *     REDDIT_USERNAME, REDDIT_PASSWORD
 *   BLUESKY_ENABLED=true + BLUESKY_IDENTIFIER, BLUESKY_APP_PASSWORD
 *   FIREBASE_SERVICE_ACCOUNT (path or the JSON content)
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---- Firebase Init ----
const serviceAccountPath = join(__dirname, '../../quotes_app/firebase-service-account.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
  // In GitHub Actions, the service account is written to a temp path
  const altPath = join(__dirname, '../quotes_app/firebase-service-account.json');
  serviceAccount = JSON.parse(readFileSync(altPath, 'utf8'));
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

// ---- Config ----
const POSTED_FILE = join(__dirname, 'social-posted.json');
const MAX_TWEET_LENGTH = 270; // Leave room for hashtags
const HASHTAGS = '#dadjokes #jokes';
const SUBREDDIT = 'dadjokes';

// ---- Helpers ----
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getPostedJokes() {
  if (!existsSync(POSTED_FILE)) return [];
  try {
    return JSON.parse(readFileSync(POSTED_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function savePostedJoke(entry) {
  const posted = getPostedJokes();
  posted.push(entry);
  writeFileSync(POSTED_FILE, JSON.stringify(posted, null, 2));
}

function getDateString() {
  return new Date().toISOString().split('T')[0];
}

// ---- Joke Selection ----
// Each platform gets a different joke. The platform name is used as part of
// the hash seed, and we track per-platform history to avoid repeats.
async function selectJokeForPlatform(platform) {
  const dateStr = getDateString();
  const posted = getPostedJokes();
  // Only exclude jokes already posted to THIS platform
  const postedIds = new Set(
    posted
      .filter(p => p.platforms && p.platforms.includes(platform))
      .map(p => p.jokeId)
  );

  // Fetch high-rated jokes
  const snapshot = await db.collection('jokes').doc('all').collection('jokes')
    .where('rating', '>=', 4)
    .limit(500)
    .get();

  let jokes = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: data.joke_id || data.universal_id || doc.id,
      setup: data.setup || '',
      punchline: data.punchline || '',
      text: data.joke || data.text || '',
      category: data.category || data.primary_category || '',
    };
  });

  // Exclude inappropriate categories
  const excludedCategories = ['Yo Mama', 'NSFW', 'Insults'];
  jokes = jokes.filter(j => !excludedCategories.includes(j.category));

  // Filter to jokes with clear setup/punchline
  jokes = jokes.filter(j => {
    if (j.setup && j.punchline) return true;
    // Try to split single-text jokes
    if (j.text) {
      const parts = j.text.split(/[?!.][\s]+/);
      if (parts.length >= 2) {
        j.setup = parts.slice(0, -1).join('. ').trim();
        if (!j.setup.match(/[?!.]$/)) j.setup += '?';
        j.punchline = parts[parts.length - 1].trim();
        return true;
      }
    }
    return false;
  });

  // Exclude already posted
  jokes = jokes.filter(j => !postedIds.has(j.id));

  if (jokes.length === 0) {
    console.log(`All jokes posted to ${platform}! Resetting ${platform} history.`);
    // Reset only this platform's history
    const allPosted = getPostedJokes();
    const cleaned = allPosted.map(p => ({
      ...p,
      platforms: (p.platforms || []).filter(pl => pl !== platform)
    }));
    writeFileSync(POSTED_FILE, JSON.stringify(cleaned, null, 2));
    return selectJokeForPlatform(platform);
  }

  // Sort for deterministic order, then pick based on date + platform hash
  // Each platform gets a different joke because the seed includes the platform name
  jokes.sort((a, b) => a.id.localeCompare(b.id));
  const hash = hashString('social-' + platform + '-' + dateStr);
  const index = hash % jokes.length;

  return jokes[index];
}

// ---- Platform: Twitter/X ----
// Twitter is handled externally by dlvr.it watching the RSS feed.
// We still select and log a joke so tracking is complete.
async function postToTwitter(joke) {
  console.log('Twitter: LOGGED (posted externally by dlvr.it via RSS feed)');
  return true; // Return true so the joke gets tracked
}

// ---- Platform: Reddit ----
// When API is not enabled, we still select and log the joke as "pending"
// so it can be posted manually via Readder or auto-posted once API is approved.
async function postToReddit(joke) {
  if (process.env.REDDIT_ENABLED !== 'true') {
    console.log('Reddit: LOGGED as pending (post manually via Readder or enable API)');
    return true; // Return true so the joke gets tracked as the day's reddit joke
  }

  try {
    const snoowrap = (await import('snoowrap')).default;
    const reddit = new snoowrap({
      userAgent: 'DadJokesBot/1.0',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    });

    // r/dadjokes format: title = setup, body = punchline
    const submission = await reddit.getSubreddit(SUBREDDIT).submitSelfpost({
      title: joke.setup,
      text: joke.punchline,
    });

    console.log(`Reddit: POSTED to r/${SUBREDDIT} (id: ${submission.name})`);
    return true;
  } catch (error) {
    console.error(`Reddit: FAILED — ${error.message}`);
    return false;
  }
}

// ---- Platform: Bluesky ----
async function postToBluesky(joke) {
  if (process.env.BLUESKY_ENABLED !== 'true') {
    console.log('Bluesky: SKIPPED (not enabled)');
    return false;
  }

  try {
    const { BskyAgent } = await import('@atproto/api');
    const agent = new BskyAgent({ service: 'https://bsky.social' });

    await agent.login({
      identifier: process.env.BLUESKY_IDENTIFIER,
      password: process.env.BLUESKY_APP_PASSWORD,
    });

    const text = `${joke.setup}\n\n${joke.punchline}`;

    await agent.post({
      text: text.length > 300 ? text.substring(0, 297) + '...' : text,
      createdAt: new Date().toISOString(),
    });

    console.log('Bluesky: POSTED');
    return true;
  } catch (error) {
    console.error(`Bluesky: FAILED — ${error.message}`);
    return false;
  }
}

// ---- Main ----
async function main() {
  console.log('=== Dad Jokes Social Poster ===\n');
  console.log(`Date: ${getDateString()}`);

  // Fetch jokes once, then select per-platform
  const platformConfigs = [
    { name: 'twitter', postFn: postToTwitter },
    { name: 'reddit', postFn: postToReddit },
    { name: 'bluesky', postFn: postToBluesky },
  ];

  for (const { name, postFn } of platformConfigs) {
    const joke = await selectJokeForPlatform(name);
    console.log(`\n[${name}] Selected joke (${joke.id}):`);
    console.log(`  Setup: ${joke.setup}`);
    console.log(`  Punchline: ${joke.punchline}`);

    const success = await postFn(joke);

    if (success) {
      savePostedJoke({
        jokeId: joke.id,
        date: getDateString(),
        platforms: [name],
        setup: joke.setup,
        punchline: joke.punchline,
      });
    }
  }

  console.log('\nDone.');
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
