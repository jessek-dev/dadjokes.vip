#!/usr/bin/env node

/**
 * Update Daily Joke of the Day
 *
 * This script:
 * 1. Connects to Firebase and fetches featured jokes with 4+ star rating
 * 2. Picks a deterministic joke based on the date (same date = same joke)
 * 3. Also picks the previous 7 days' jokes the same way
 * 4. Reads the daily/index.html template, replaces placeholders, writes output
 * 5. Updates sitemap.xml lastmod for /daily/
 *
 * Run: node update-daily-joke.js
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
 * Simple deterministic hash from a string to a number.
 * Used to pick a consistent joke for a given date.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a date string in YYYY-MM-DD format for a given offset from today.
 * offset=0 is today, offset=-1 is yesterday, etc.
 */
function getDateString(offset = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().split('T')[0];
}

/**
 * Format a date string like "March 26, 2026"
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Format a short date like "Mar 25"
 */
function formatDateShort(dateStr) {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Pick a deterministic joke for a given date from the joke pool.
 */
function pickJokeForDate(jokes, dateStr) {
  const hash = hashString('daily-joke-' + dateStr);
  const index = hash % jokes.length;
  return jokes[index];
}

/**
 * Fetch featured jokes with 4+ star rating from Firebase
 */
async function fetchFeaturedJokes() {
  console.log('Fetching featured jokes from Firebase...');

  const snapshot = await db.collection('jokes').doc('all').collection('jokes')
    .where('featured', '==', true)
    .get();

  const jokes = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const rating = data.rating || data.stars || 0;
    if (rating >= 4 && data.setup && data.punchline) {
      jokes.push({
        id: doc.id,
        setup: data.setup,
        punchline: data.punchline,
        category: data.category || 'general',
        rating: rating
      });
    }
  });

  // If not enough featured jokes, fall back to all jokes with good ratings
  if (jokes.length < 10) {
    console.log(`Only ${jokes.length} featured jokes with 4+ rating. Falling back to all high-rated jokes...`);

    const allSnapshot = await db.collection('jokes').doc('all').collection('jokes').get();

    allSnapshot.forEach(doc => {
      const data = doc.data();
      const rating = data.rating || data.stars || 0;
      if (rating >= 4 && data.setup && data.punchline) {
        // Avoid duplicates
        if (!jokes.find(j => j.id === doc.id)) {
          jokes.push({
            id: doc.id,
            setup: data.setup,
            punchline: data.punchline,
            category: data.category || 'general',
            rating: rating
          });
        }
      }
    });
  }

  // Sort by ID for consistent ordering across runs
  jokes.sort((a, b) => a.id.localeCompare(b.id));

  console.log(`Found ${jokes.length} eligible jokes for daily rotation`);
  return jokes;
}

/**
 * Generate the HTML for previous days' joke cards
 */
function generatePreviousJokesHtml(jokes, days = 7) {
  let html = '';

  for (let i = 1; i <= days; i++) {
    const dateStr = getDateString(-i);
    const joke = pickJokeForDate(jokes, dateStr);
    const dateFormatted = formatDateShort(dateStr);

    const escapedSetup = escapeHtml(joke.setup);
    const escapedPunchline = escapeHtml(joke.punchline);

    html += `
            <div class="prev-joke-card">
                <div class="prev-joke-date">${dateFormatted}</div>
                <p class="prev-joke-setup">${escapedSetup}</p>
                <div class="prev-joke-punchline-wrapper">
                    <p class="prev-joke-punchline" id="prev-punchline-${i}">${escapedPunchline}</p>
                    <button class="reveal-btn" id="prev-reveal-btn-${i}" onclick="revealPrevious(${i})">Show Punchline</button>
                </div>
            </div>`;
  }

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Update sitemap.xml with today's date for /daily/
 */
function updateSitemap(todayStr) {
  const sitemapPath = join(__dirname, '../sitemap.xml');

  try {
    let sitemap = readFileSync(sitemapPath, 'utf8');

    // Check if /daily/ already exists in sitemap
    if (sitemap.includes('dadjokes.vip/daily/')) {
      // Update the lastmod date
      const dailyPattern = /(<url>\s*<loc>https:\/\/dadjokes\.vip\/daily\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/;
      sitemap = sitemap.replace(dailyPattern, `$1${todayStr}$2`);
      console.log('Updated /daily/ lastmod in sitemap.xml');
    } else {
      // Add /daily/ entry before closing </urlset>
      const newEntry = `  <url>
    <loc>https://dadjokes.vip/daily/</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
      sitemap = sitemap.replace('</urlset>', newEntry + '</urlset>');
      console.log('Added /daily/ entry to sitemap.xml');
    }

    writeFileSync(sitemapPath, sitemap, 'utf8');
  } catch (error) {
    console.error('Error updating sitemap:', error);
  }
}

/**
 * Update RSS feed with recent jokes.
 * IFTTT and other services can watch this feed to auto-post to Twitter/social.
 */
function updateRssFeed(jokes, todayStr) {
  const feedPath = join(__dirname, '../feed.xml');
  const days = 10;

  let items = '';
  for (let i = 0; i < days; i++) {
    const dateStr = getDateString(-i);
    const joke = pickJokeForDate(jokes, dateStr);
    const date = new Date(dateStr + 'T12:00:00Z');
    const pubDate = date.toUTCString();

    // Title = setup only
    // Description = setup + line break + punchline (full joke for Twitter/social)
    const title = escapeHtml(joke.setup);
    const punchline = escapeHtml(joke.punchline);

    items += `
    <item>
      <title>${title}</title>
      <description>${title}\n\n${punchline}</description>
      <link>https://dadjokes.vip/daily/#${dateStr}</link>
      <guid isPermaLink="false">dadjokes-${dateStr}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }

  const buildDate = new Date().toUTCString();
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dad Joke of the Day</title>
    <link>https://dadjokes.vip/daily/</link>
    <description>A fresh dad joke every day. Get the app at dadjokes.vip</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="https://dadjokes.vip/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://dadjokes.vip/assets/android-chrome-192x192.png</url>
      <title>Dad Joke of the Day</title>
      <link>https://dadjokes.vip/daily/</link>
    </image>
${items}
  </channel>
</rss>`;

  writeFileSync(feedPath, feed);
  console.log('Wrote feed.xml');
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Updating Dad Joke of the Day...\n');

    // Get today's date info
    const todayStr = getDateString(0);
    const todayFormatted = formatDate(todayStr);

    console.log(`Date: ${todayFormatted} (${todayStr})`);

    // Fetch jokes from Firebase
    const jokes = await fetchFeaturedJokes();

    if (jokes.length === 0) {
      console.error('No eligible jokes found! Aborting.');
      process.exit(1);
    }

    // Pick today's joke deterministically
    const todayJoke = pickJokeForDate(jokes, todayStr);
    console.log(`\nToday's joke: "${todayJoke.setup}" -> "${todayJoke.punchline}"`);
    console.log(`Category: ${todayJoke.category}, ID: ${todayJoke.id}`);

    // Generate previous jokes HTML
    const previousJokesHtml = generatePreviousJokesHtml(jokes, 7);

    // Read the template (template.html has placeholders, index.html is the output)
    const templatePath = join(__dirname, '../daily/template.html');
    const outputPath = join(__dirname, '../daily/index.html');
    let html = readFileSync(templatePath, 'utf8');

    // Replace placeholders
    html = html.replace(/\{\{DATE_FORMATTED\}\}/g, todayFormatted);
    html = html.replace(/\{\{DATE_ISO\}\}/g, todayStr);
    html = html.replace(/\{\{JOKE_SETUP\}\}/g, escapeHtml(todayJoke.setup));
    html = html.replace(/\{\{JOKE_PUNCHLINE\}\}/g, escapeHtml(todayJoke.punchline));
    html = html.replace(/\{\{JOKE_ID\}\}/g, todayJoke.id);
    html = html.replace(/\{\{JOKE_CATEGORY\}\}/g, escapeHtml(todayJoke.category));
    html = html.replace(/\{\{PREVIOUS_JOKES_HTML\}\}/g, previousJokesHtml);

    // Write the output (overwrites index.html each run, template.html stays intact)
    writeFileSync(outputPath, html, 'utf8');
    console.log('\nWrote updated daily/index.html (from template.html)');

    // Update sitemap
    updateSitemap(todayStr);

    // Write embed JSON for the widget
    const embedPath = join(__dirname, '../embed/daily.json');
    const embedData = {
      date: todayStr,
      setup: todayJoke.setup,
      punchline: todayJoke.punchline,
      category: todayJoke.category,
      url: 'https://dadjokes.vip/daily/'
    };
    writeFileSync(embedPath, JSON.stringify(embedData, null, 2));
    console.log('Wrote embed/daily.json');

    // Update RSS feed with last 10 days of jokes
    updateRssFeed(jokes, todayStr);

    console.log('\nDaily joke update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nError updating daily joke:', error);
    process.exit(1);
  }
}

main();
