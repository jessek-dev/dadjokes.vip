# Failed AI Jokes Import Setup

This document explains how to import Failed AI Jokes from Google Sheets.

## Google Sheets Setup

### 1. Create/Configure Your Sheet

Create a sheet tab named **"Failed Jokes"** with the following columns:

| Column | Name | Description | Required |
|--------|------|-------------|----------|
| A | Source ID | Unique identifier (e.g., FAI000001) | Yes |
| B | Joke Text | Full joke text | Yes (if no setup) |
| C | Setup | Joke setup/question | No |
| D | Punchline | Joke punchline/answer | No |
| E | Source | Origin (e.g., "GPT-4", "Claude") | No |
| F | Import Date | When joke was added | No |
| G | Toxicity Score | Content moderation score | No |
| H | Moderation Status | Status (e.g., "Approved", "Flagged") | No |

**Row 1 should contain headers.** Data starts from row 2.

### 2. Make Sheet Publicly Readable

1. Open your Google Sheet
2. Click **Share** in the top right
3. Click **Change to anyone with the link**
4. Set permission to **Viewer**
5. Click **Done**

This allows the script to read the sheet without authentication.

### 3. Get Sheet ID

The sheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/1yWeZmR-mrh9FxGaOjc92HfALYx36jXKSXTacqUbjR6E/edit
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                    This is the Sheet ID
```

The script is already configured with your sheet ID: `1yWeZmR-mrh9FxGaOjc92HfALYx36jXKSXTacqUbjR6E`

## Google Sheets API Setup

### 1. Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services** > **Library**
4. Search for "Google Sheets API"
5. Click **Enable**

### 2. Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Optional but recommended) Click **Restrict Key**:
   - Set application restrictions to "HTTP referrers" or "None"
   - Under "API restrictions", select "Restrict key" and choose "Google Sheets API"
   - Click **Save**

### 3. Set Environment Variable

**macOS/Linux:**
```bash
export GOOGLE_SHEETS_API_KEY="your-api-key-here"
```

To make it permanent, add to `~/.zshrc` or `~/.bashrc`:
```bash
echo 'export GOOGLE_SHEETS_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (PowerShell):**
```powershell
$env:GOOGLE_SHEETS_API_KEY="your-api-key-here"
```

**Verify it's set:**
```bash
echo $GOOGLE_SHEETS_API_KEY
```

## Running the Import

### Import Failed Jokes from Google Sheets

```bash
cd scripts
npm run import:failed
```

This will:
1. Fetch all jokes from the "Failed Jokes" sheet
2. Generate individual HTML pages with SEO-friendly URLs
3. Create pages in `/joke/failed-ai-jokes/` directory
4. Generate `sitemap_failed_ai_jokes.xml`
5. No paywall/gating (all jokes fully visible)

### Example URLs Generated

- `/joke/failed-ai-jokes/why-did-the-chicken-cross-the-road`
- `/joke/failed-ai-jokes/what-do-you-call-a-fish-with-no-eyes`
- `/joke/failed-ai-jokes/knock-knock-whos-there-banana`

## Deployment

After generating pages:

```bash
# Review generated pages
ls -la ../joke/failed-ai-jokes/ | head

# Commit and push
git add .
git commit -m "Add Failed AI Jokes category (990 jokes)"
git push origin main
```

## Submit to Google Search Console

1. Wait for GitHub Pages deployment (~2 minutes)
2. Go to Google Search Console
3. Navigate to **Sitemaps**
4. Add sitemap: `https://dadjokes.vip/generated_sitemaps/sitemap_failed_ai_jokes.xml`

## Updating Jokes

To add more jokes or update existing ones:

1. Edit the "Failed Jokes" sheet in Google Sheets
2. Run `npm run import:failed` again
3. The script will regenerate all pages
4. Commit and push changes

## Troubleshooting

### "GOOGLE_SHEETS_API_KEY environment variable not set"
- Make sure you've set the environment variable (see step 3 above)
- Verify with: `echo $GOOGLE_SHEETS_API_KEY`

### "Google Sheets API error: 403"
- API key might not be valid
- Make sure Google Sheets API is enabled in your project
- Check API key restrictions

### "Google Sheets API error: 400"
- Sheet name might be incorrect (must be exactly "Failed Jokes")
- Sheet ID might be wrong
- Make sure the sheet is publicly readable

### No jokes imported
- Check that row 1 has headers
- Check that data starts from row 2
- Verify column mapping in `import-failed-jokes.js`
