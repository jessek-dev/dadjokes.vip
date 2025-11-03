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

## What It Does

1. **Fetches jokes from Firebase:**
   - `/jokes/all/jokes` - Regular dad jokes
   - `/name_jokes/ai_*` - AI-generated name jokes (excluding `templ_*`)

2. **Generates HTML pages:**
   - `/joke/{id}.html` - Individual joke pages
   - `/category/{slug}/index.html` - Category landing pages

3. **Creates staged sitemaps:**
   - `sitemap_priority.xml` - 5-star jokes (Week 1)
   - `sitemap_week1.xml` - 4-star jokes (Week 2)
   - `sitemap_week2.xml` - 3-star jokes (Week 3)
   - `sitemap_week3.xml` - Lower rated (Week 4)
   - `sitemap_week4.xml` - Remaining jokes
   - `sitemap_name_jokes.xml` - All AI name jokes
   - `sitemap_index.xml` - Master index

## Configuration

Edit `config.js` to customize:
- Batch sizes and weekly schedules
- Sitemap priorities and change frequencies
- Category descriptions and emojis
- Firebase collection paths

## Rollout Schedule

**Week 1:** Submit `sitemap_priority.xml` (~1,000 top-rated jokes)
**Week 2:** Submit `sitemap_week1.xml` (~2,000 4-star jokes)
**Week 3:** Submit `sitemap_week2.xml` (~3,000 3-star jokes)
**Week 4:** Submit remaining sitemaps

## File Structure

```
dadjokes.vip/
├── scripts/
│   ├── generate-pages.js   # Main generator
│   ├── config.js           # Configuration
│   ├── package.json        # Dependencies
│   └── README.md           # This file
├── joke/
│   ├── template.html       # Joke page template
│   └── {id}.html          # Generated pages
├── category/
│   ├── template.html       # Category template
│   └── {slug}/index.html  # Generated categories
├── generated_sitemaps/
│   ├── sitemap_priority.xml
│   ├── sitemap_week1.xml
│   └── ...
└── sitemap_index.xml       # Master sitemap

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
