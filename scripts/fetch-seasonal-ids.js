/**
 * Fetch seasonal joke IDs from Google Sheet V2 (ModCat tab)
 *
 * Uses the Firebase service account with google-auth-library to authenticate
 * against the Google Sheets API. Returns a Map of season -> Set of joke IDs.
 *
 * Sheet: ModCat
 *   Column A: Universal ID (e.g., MJ000004)
 *   Column K: Queue Status ("Published", "Queued", etc.)
 *   Column L: Season (e.g., "halloween", "christmas", "thanksgiving")
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleAuth } from 'google-auth-library';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SPREADSHEET_ID = '1yWeZmR-mrh9FxGaOjc92HfALYx36jXKSXTacqUbjR6E';
const SHEET_NAME = 'ModCat';
const RANGE = 'A:L'; // Columns A through L

// Queue statuses that should be excluded
const EXCLUDED_STATUSES = new Set(['Do Not Publish']);

/**
 * Fetch seasonal joke IDs from Google Sheet.
 * Returns a Map: season (lowercase) -> Set of Universal IDs
 */
export async function fetchSeasonalIds() {
  console.log('Fetching seasonal joke IDs from Google Sheet...');

  // Load service account credentials (same file used by Firebase Admin)
  const serviceAccountPath = path.join(__dirname, '../../quotes_app/firebase-service-account.json');
  const serviceAccount = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));

  // Create authenticated client using service account
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  const client = await auth.getClient();

  // Fetch sheet data via Sheets API v4
  const encodedRange = encodeURIComponent(`${SHEET_NAME}!${RANGE}`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodedRange}`;
  const response = await client.request({ url });
  const rows = response.data.values;

  if (!rows || rows.length < 2) {
    console.log('  No data found in ModCat sheet');
    return new Map();
  }

  // Skip header row (index 0)
  const dataRows = rows.slice(1);

  // Column indices (0-based)
  const COL_UNIVERSAL_ID = 0;  // A
  const COL_QUEUE_STATUS = 10; // K
  const COL_SEASON = 11;       // L

  const seasonMap = new Map();
  let taggedCount = 0;

  for (const row of dataRows) {
    const universalId = (row[COL_UNIVERSAL_ID] || '').trim();
    const queueStatus = (row[COL_QUEUE_STATUS] || '').trim();
    const season = (row[COL_SEASON] || '').trim().toLowerCase();

    // Skip rows without a season tag
    if (!season) continue;

    // Skip rows with excluded queue statuses
    if (EXCLUDED_STATUSES.has(queueStatus)) continue;

    // Skip rows without a universal ID
    if (!universalId) continue;

    // Add to the season map
    if (!seasonMap.has(season)) {
      seasonMap.set(season, new Set());
    }
    seasonMap.get(season).add(universalId);
    taggedCount++;
  }

  // Log summary
  console.log(`  Found ${taggedCount} seasonal joke tags across ${seasonMap.size} seasons:`);
  for (const [season, ids] of seasonMap) {
    console.log(`    ${season}: ${ids.size} jokes`);
  }

  return seasonMap;
}
