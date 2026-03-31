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
async function selectJoke() {
  const dateStr = getDateString();
  const posted = getPostedJokes();
  const postedIds = new Set(posted.map(p => p.jokeId));

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
    console.log('All jokes have been posted! Resetting history.');
    writeFileSync(POSTED_FILE, '[]');
    return selectJoke(); // Recurse with fresh history
  }

  // Sort for deterministic order, then pick based on date hash
  // Use "social-" prefix to get different joke than daily page
  jokes.sort((a, b) => a.id.localeCompare(b.id));
  const hash = hashString('social-post-' + dateStr);
  const index = hash % jokes.length;

  return jokes[index];
}

// ---- Platform: Twitter/X ----
async function postToTwitter(joke) {
  if (process.env.TWITTER_ENABLED !== 'true') {
    console.log('Twitter: SKIPPED (not enabled)');
    return false;
  }

  try {
    const { TwitterApi } = await import('twitter-api-v2');
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    let text = `${joke.setup}\n\n${joke.punchline}`;

    // Add hashtags if they fit
    if (text.length + HASHTAGS.length + 2 <= 280) {
      text += `\n\n${HASHTAGS}`;
    }

    // Truncate if still too long
    if (text.length > 280) {
      text = `${joke.setup}\n\n${joke.punchline}`;
      if (text.length > 280) {
        text = text.substring(0, 277) + '...';
      }
    }

    const result = await client.v2.tweet(text);
    console.log(`Twitter: POSTED (id: ${result.data.id})`);
    return true;
  } catch (error) {
    console.error(`Twitter: FAILED — ${error.message}`);
    return false;
  }
}

// ---- Platform: Reddit ----
async function postToReddit(joke) {
  if (process.env.REDDIT_ENABLED !== 'true') {
    console.log('Reddit: SKIPPED (not enabled)');
    return false;
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

  const joke = await selectJoke();
  console.log(`\nSelected joke (${joke.id}):`);
  console.log(`  Setup: ${joke.setup}`);
  console.log(`  Punchline: ${joke.punchline}\n`);

  const results = {
    twitter: await postToTwitter(joke),
    reddit: await postToReddit(joke),
    bluesky: await postToBluesky(joke),
  };

  const platforms = Object.entries(results)
    .filter(([, success]) => success)
    .map(([name]) => name);

  savePostedJoke({
    jokeId: joke.id,
    date: getDateString(),
    platforms,
    setup: joke.setup,
    punchline: joke.punchline,
  });

  console.log(`\nDone. Posted to: ${platforms.length > 0 ? platforms.join(', ') : 'none (all skipped/failed)'}`);
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
