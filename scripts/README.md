# Dad Jokes Page Generator

Generates ~16,000 static HTML pages from Firebase and creates staged sitemaps for SEO rollout.

## Setup

```bash
cd scripts
npm install
```

## Usage

### Test Mode (10 pages only)
```bash
npm run test
```

### Production (All ~16,000 pages)
```bash
npm run generate
```

### Incremental Update (New jokes only)
```bash
npm run update
```
Checks for new jokes added to Firebase since last run and generates only new pages. Creates monthly incremental sitemaps.

## What It Does

### Initial Generation (`npm run generate`)

1. **Fetches jokes from Firebase:**
   - `/jokes/all/jokes` - Regular dad jokes
   - `/name_jokes/ai_*` - AI-generated name jokes (excluding `templ_*`)

2. **Generates HTML pages:**
   - `/joke/{id}.html` - Individual joke pages
   - `/category/{slug}/index.html` - Category landing pages

3. **Creates base sitemaps:**
   - `sitemap_regular_jokes.xml` - All regular jokes (2,396 URLs)
   - `sitemap_name_jokes_1.xml` - Name jokes batch 1 (4,000 URLs)
   - `sitemap_name_jokes_2.xml` - Name jokes batch 2 (3,851 URLs)
   - `sitemap_index.xml` - Master index

### Incremental Updates (`npm run update`)

1. **Detects new jokes** added to Firebase since last run
2. **Generates only new pages** (no regeneration of existing pages)
3. **Creates monthly sitemaps** (e.g., `sitemap_updates_2025_11.xml`)
4. **Updates sitemap index** automatically
5. **Preserves lastmod dates** for unchanged pages (no wasted crawl budget)

## Configuration

Edit `config.js` to customize:
- Batch sizes and weekly schedules
- Sitemap priorities and change frequencies
- Category descriptions and emojis
- Firebase collection paths

## Automated Monthly Updates

The site automatically checks for new jokes **monthly on the 1st** via GitHub Actions:

1. **Checks Firebase** for new jokes added since last run
2. **Generates new pages** if jokes are found
3. **Creates monthly sitemap** (e.g., `sitemap_updates_2025_11.xml`)
4. **Commits and pushes** changes to GitHub Pages
5. **Creates a GitHub Issue** with notification to submit the new sitemap

### Manual Trigger

You can trigger the update manually at any time:
- Go to **Actions** tab in GitHub
- Select **Monthly Joke Updates** workflow
- Click **Run workflow**

### GitHub Secrets Setup

For automation to work, add this secret to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `FIREBASE_SERVICE_ACCOUNT`
4. Value: Contents of `firebase-service-account.json`

## Initial Rollout Schedule

**Week 1:** Submit `sitemap_regular_jokes.xml` (2,396 jokes)
**Week 2:** Submit `sitemap_name_jokes_1.xml` (4,000 jokes)
**Week 3:** Submit `sitemap_name_jokes_2.xml` (3,851 jokes)

## File Structure

```
dadjokes.vip/
├── .github/
│   └── workflows/
│       └── monthly-joke-updates.yml  # Automated monthly updates
├── scripts/
│   ├── generate-pages.js       # Initial full generation
│   ├── update-new-jokes.js     # Incremental updates
│   ├── config.js               # Configuration
│   ├── last-generated.json     # State tracking
│   ├── package.json            # Dependencies
│   └── README.md               # This file
├── joke/
│   ├── template.html           # Joke page template
│   └── {id}.html              # Generated pages
├── category/
│   ├── template.html           # Category template
│   └── {slug}/index.html      # Generated categories
├── generated_sitemaps/
│   ├── sitemap_regular_jokes.xml
│   ├── sitemap_name_jokes_1.xml
│   ├── sitemap_name_jokes_2.xml
│   └── sitemap_updates_YYYY_MM.xml  # Monthly incremental sitemaps
└── sitemap_index.xml           # Master sitemap (auto-updated)

```

## Requirements

- Node.js 18+
- Firebase service account JSON at:
  `../../quotes_app/firebase-service-account.json`

## Notes

- **Test first:** Always run `npm run test` before production
- **Review output:** Check generated pages before deploying
- **Commit all pages:** Push everything to GitHub at once
- **Stage sitemaps:** Only submit sitemaps weekly to Google
- **Monitor Search Console:** Track indexing progress

## Troubleshooting

**"Service account not found"**
- Ensure `firebase-service-account.json` exists in `quotes_app/` directory

**"Permission denied"**
- Run: `chmod +x generate-pages.js`

**"Out of memory"**
- Node may need more memory for large batches
- Run: `NODE_OPTIONS="--max-old-space-size=4096" npm run generate`
