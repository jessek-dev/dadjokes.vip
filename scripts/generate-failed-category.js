#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get 5 random failed jokes for the category page
async function getRandomFailedJokes() {
  const failedJokesDir = path.join(__dirname, '../jokes/failed-ai-jokes');
  const files = await fs.readdir(failedJokesDir);

  // Filter only HTML files, shuffle, take 5
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  const shuffled = htmlFiles.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  // Read each file to get joke content
  const jokes = [];
  for (const file of selected) {
    const content = await fs.readFile(path.join(failedJokesDir, file), 'utf8');

    // Extract setup from the HTML
    const setupMatch = content.match(/<div class="joke-setup">(.*?)<\/div>/);
    const setup = setupMatch ? setupMatch[1] : '';

    const url = `/jokes/failed-ai-jokes/${file.replace('.html', '')}`;

    jokes.push({ setup, url });
  }

  return jokes;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

async function generateFailedAICategoryPage() {
  console.log('🤖 Generating Failed AI Jokes category page...\n');

  // Load template
  const templatePath = path.join(__dirname, '../category/template.html');
  const template = await fs.readFile(templatePath, 'utf8');

  // Get random jokes
  const jokes = await getRandomFailedJokes();

  // Generate joke list HTML
  const jokeListHtml = jokes.map(joke => {
    const displayText = joke.setup.length > 60 ? joke.setup.substring(0, 60) + '...' : joke.setup;
    return `
            <a href="${joke.url}" class="joke-card">
                <div class="category-badge">Failed AI Jokes</div>
                <div class="joke-text">${displayText}</div>
            </a>`;
  }).join('\n');

  // Get 5 random related categories
  const allCategories = Object.keys(CONFIG.CATEGORY_DESCRIPTIONS).filter(c => c !== 'Failed AI Jokes');
  const shuffled = allCategories.sort(() => 0.5 - Math.random());
  const relatedCategories = shuffled.slice(0, 5);

  const relatedCategoriesHtml = relatedCategories.map(cat => {
    const slug = slugify(cat);
    const emoji = CONFIG.CATEGORY_EMOJIS[cat] || '😄';
    return `                <a href="/jokes/${slug}" class="category-link">
                    <span class="category-emoji">${emoji}</span>
                    <span>${cat}</span>
                </a>`;
  }).join('\n');

  // Replace placeholders
  const replacements = {
    CATEGORY: 'Failed AI Jokes',
    CATEGORY_SLUG: 'failed-ai-jokes',
    CATEGORY_EMOJI: '🤖',
    CATEGORY_DESCRIPTION: CONFIG.CATEGORY_DESCRIPTIONS['Failed AI Jokes'],
    CATEGORY_LOWER: 'failed ai jokes',
    JOKE_COUNT: jokes.length,
    JOKE_LIST: jokeListHtml,
    RELATED_CATEGORIES: relatedCategoriesHtml
  };

  let html = template;
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${key}}}`, value || '');
  }

  // Write to file
  const outputDir = path.join(__dirname, '../jokes/failed-ai-jokes');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8');

  console.log('✅ Generated /jokes/failed-ai-jokes/index.html');
  console.log(`   Featured ${jokes.length} sample jokes`);
  console.log(`   Related categories: ${relatedCategories.join(', ')}`);
}

generateFailedAICategoryPage().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
