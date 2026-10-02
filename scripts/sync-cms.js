// scripts/sync-cms.js
// Static Sheet-to-CDN CMS Sync Engine for e-Gurukulam for IAS
// Fetches the production Google Apps Script CMS endpoint during Vercel build
// and generates static CDN JSON files for zero-latency visitor delivery.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sortCurrentAffairsByDate } from '../src/utils/dateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CMS_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOt8dZ7S9ot1Zy3GyyXgsDTPsrF016odbaXhf9DXXPMllvQzmQvKabubXZFzRra51x/exec';
const SNAPSHOT_PATH = path.resolve(__dirname, 'cms-snapshot.json');

const PUBLIC_DATA_DIR = path.resolve(__dirname, '../public/data');
const ARTICLES_DIR = path.resolve(PUBLIC_DATA_DIR, 'articles');
const RESOURCES_DIR = path.resolve(PUBLIC_DATA_DIR, 'resources');

function createSlug(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isItemActive(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
  if (obj.Status && obj.Status.toString().toLowerCase() === 'inactive') return false;
  if (obj.status && obj.status.toString().toLowerCase() === 'inactive') return false;
  return true;
}

function stripFullContent(item) {
  const {
    Full_Content,
    full_content,
    Article_HTML,
    article_html,
    HTML_Content,
    html_content,
    Content_HTML,
    content_html,
    HTML,
    html,
    Content,
    content,
    Article,
    article,
    ...rest
  } = item;
  return rest;
}

function sanitizeSocialPlatforms(rawSocial) {
  if (!Array.isArray(rawSocial)) return [];
  return rawSocial
    .filter(isItemActive)
    .map(item => {
      const rawChannels = Array.isArray(item.channels)
        ? item.channels
        : Array.isArray(item.branches)
          ? item.branches
          : Array.isArray(item.links)
            ? item.links
            : [];
      return {
        ...item,
        channels: rawChannels.filter(isItemActive)
      };
    });
}

const FETCH_TIMEOUT_MS = 60000; // 60s per attempt to handle Apps Script cold starts
const MAX_FETCH_ATTEMPTS = 3;   // 3 attempts total with progressive backoff
const RETRY_BACKOFF_MS = [3000, 5000]; // Delays between retries

async function attemptLiveCMSFetch(attemptNumber, totalAttempts) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Timeout of ${FETCH_TIMEOUT_MS / 1000}s exceeded while waiting for Apps Script response`));
  }, FETCH_TIMEOUT_MS);

  console.log(`[sync-cms] [Attempt ${attemptNumber}/${totalAttempts}] Fetching live CMS from Apps Script endpoint (timeout: ${FETCH_TIMEOUT_MS / 1000}s)...`);
  const startTime = Date.now();

  try {
    const response = await fetch(CMS_API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!text || !text.trim().startsWith('{')) {
      throw new Error(`Endpoint returned non-JSON payload: ${text.slice(0, 100)}...`);
    }

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.currentAffairs) || parsed.currentAffairs.length === 0) {
      throw new Error('Response JSON missing or empty currentAffairs array');
    }

    console.log(`[sync-cms] [Attempt ${attemptNumber}/${totalAttempts}] Successfully retrieved fresh live data from Apps Script in ${elapsed}s.`);
    return parsed;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchLiveCMS() {
  console.log(`[sync-cms] Target Google Apps Script CMS endpoint:`);
  console.log(`[sync-cms] ${CMS_API_ENDPOINT}`);

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    try {
      const data = await attemptLiveCMSFetch(attempt, MAX_FETCH_ATTEMPTS);
      // Save updated snapshot for offline dev reliability / reference
      try {
        fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log(`[sync-cms] Updated local snapshot at ${path.basename(SNAPSHOT_PATH)}`);
      } catch (e) {
        console.warn(`[sync-cms] Could not update local snapshot: ${e.message}`);
      }
      return data;
    } catch (err) {
      lastError = err;
      const errorMsg = err.name === 'AbortError' || err.message.includes('aborted') || err.message.includes('Timeout')
        ? `Request timed out after ${FETCH_TIMEOUT_MS / 1000}s (Google Apps Script cold start / network delay)`
        : err.message;

      console.warn(`[sync-cms] [Attempt ${attempt}/${MAX_FETCH_ATTEMPTS}] Fetch failed: ${errorMsg}`);

      if (attempt < MAX_FETCH_ATTEMPTS) {
        const delay = RETRY_BACKOFF_MS[attempt - 1] || 3000;
        console.log(`[sync-cms] Retrying in ${delay / 1000}s (Google container should now be warmed)...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  // If all attempts failed:
  // Build must NEVER silently deploy stale snapshot data during deployment.
  const isCI = Boolean(process.env.VERCEL || process.env.CI || process.env.NODE_ENV === 'production');
  const allowSnapshotExplicit = Boolean(process.env.ALLOW_CMS_SNAPSHOT === 'true');

  if (!isCI && allowSnapshotExplicit && fs.existsSync(SNAPSHOT_PATH)) {
    console.warn(`[sync-cms] WARNING: All live attempts failed. ALLOW_CMS_SNAPSHOT=true is set; falling back to local snapshot.`);
    const raw = fs.readFileSync(SNAPSHOT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    console.log(`[sync-cms] Loaded snapshot with ${parsed.currentAffairs?.length || 0} Current Affairs and ${parsed.resources?.length || 0} Resources.`);
    return parsed;
  }

  // Fail clearly with explicit instructions to prevent publishing stale content
  throw new Error(
    `[sync-cms] FATAL: Could not fetch live CMS data from Google Apps Script after ${MAX_FETCH_ATTEMPTS} attempts.\n` +
    `Last error: ${lastError ? lastError.message : 'Unknown'}\n` +
    `Build aborted to prevent silently deploying stale CMS data. Ensure the Google Sheet / Apps Script endpoint is accessible.`
  );
}

async function main() {
  console.log('=== e-Gurukulam Static Sheet-to-CDN CMS Sync ===\n');

  // 1. Fetch live CMS response (or verified snapshot)
  const rawData = await fetchLiveCMS();

  // 2. Ensure directories exist and clean obsolete generated files
  if (!fs.existsSync(PUBLIC_DATA_DIR)) {
    fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  }

  // Remove obsolete iasmentoring.com master cache if present
  const obsoleteMaster = path.join(PUBLIC_DATA_DIR, 'current-affairs-master.json');
  if (fs.existsSync(obsoleteMaster)) {
    fs.unlinkSync(obsoleteMaster);
    console.log(`[sync-cms] Removed obsolete file: ${obsoleteMaster}`);
  }

  // Clean articles directory
  if (fs.existsSync(ARTICLES_DIR)) {
    fs.rmSync(ARTICLES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });

  // Clean resources directory
  if (fs.existsSync(RESOURCES_DIR)) {
    fs.rmSync(RESOURCES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(RESOURCES_DIR, { recursive: true });

  // 3. Process Live_Ticker, Social_Platforms, Test_Series, Active_Popup (global.json)
  const rawTicker = Array.isArray(rawData.liveTicker) ? rawData.liveTicker : [];
  const rawSocial = Array.isArray(rawData.socialPlatforms)
    ? rawData.socialPlatforms
    : Array.isArray(rawData.social_platforms)
      ? rawData.social_platforms
      : [];
  const rawTestSeries = Array.isArray(rawData.testSeries)
    ? rawData.testSeries
    : Array.isArray(rawData.test_series)
      ? rawData.test_series
      : [];
  const rawPopup = rawData.activePopup && typeof rawData.activePopup === 'object' ? rawData.activePopup : null;

  const globalPayload = {
    activePopup: rawPopup && isItemActive(rawPopup) ? rawPopup : null,
    liveTicker: rawTicker.filter(isItemActive),
    socialPlatforms: sanitizeSocialPlatforms(rawSocial),
    testSeries: rawTestSeries.filter(isItemActive),
    syncedAt: new Date().toISOString()
  };

  const globalPath = path.join(PUBLIC_DATA_DIR, 'global.json');
  fs.writeFileSync(globalPath, JSON.stringify(globalPayload, null, 2), 'utf8');
  console.log(`[sync-cms] Generated: public/data/global.json`);

  // 4. Process Current Affairs (Current_Affairs tab)
  const rawAffairs = Array.isArray(rawData.currentAffairs) ? rawData.currentAffairs : [];
  const activeAffairs = rawAffairs.filter(isItemActive).map(art => {
    const rawSlug = art.slug || art.Slug || createSlug(art.Title || art.title);
    const slug = createSlug(rawSlug);
    return {
      ...art,
      slug,
      Slug: slug
    };
  });

  const sortedAffairs = sortCurrentAffairsByDate(activeAffairs);

  // Generate ca-meta.json (EXCLUDES Full_Content)
  const caMeta = sortedAffairs.map(stripFullContent);
  const caMetaPath = path.join(PUBLIC_DATA_DIR, 'ca-meta.json');
  fs.writeFileSync(caMetaPath, JSON.stringify(caMeta, null, 2), 'utf8');
  console.log(`[sync-cms] Generated: public/data/ca-meta.json (${caMeta.length} active articles, Full_Content excluded)`);

  // Generate public/data/articles/[slug].json (RETAINS Full_Content)
  for (const art of sortedAffairs) {
    const articlePath = path.join(ARTICLES_DIR, `${art.slug}.json`);
    fs.writeFileSync(articlePath, JSON.stringify(art, null, 2), 'utf8');
  }
  console.log(`[sync-cms] Generated: public/data/articles/[slug].json (${sortedAffairs.length} detail files, Full_Content retained)`);

  // 5. Process Resources (Resources tab)
  const rawResources = Array.isArray(rawData.resources) ? rawData.resources : [];
  const activeResources = rawResources.filter(isItemActive).map(res => {
    const rawSlug = res.slug || res.Slug || createSlug(res.Title || res.title);
    const slug = createSlug(rawSlug);
    return {
      ...res,
      slug,
      Slug: slug
    };
  });

  const sortedResources = sortCurrentAffairsByDate(activeResources);

  // Generate resources-meta.json (EXCLUDES Full_Content)
  const resourcesMeta = sortedResources.map(stripFullContent);
  const resourcesMetaPath = path.join(PUBLIC_DATA_DIR, 'resources-meta.json');
  fs.writeFileSync(resourcesMetaPath, JSON.stringify(resourcesMeta, null, 2), 'utf8');
  console.log(`[sync-cms] Generated: public/data/resources-meta.json (${resourcesMeta.length} active resources, Full_Content excluded)`);

  // Generate public/data/resources/[slug].json (RETAINS Full_Content)
  for (const res of sortedResources) {
    const resourcePath = path.join(RESOURCES_DIR, `${res.slug}.json`);
    fs.writeFileSync(resourcePath, JSON.stringify(res, null, 2), 'utf8');
  }
  console.log(`[sync-cms] Generated: public/data/resources/[slug].json (${sortedResources.length} detail files, Full_Content retained)`);

  console.log('\n=== Sync Complete ===');
  console.log(`Active Current Affairs: ${sortedAffairs.length}`);
  console.log(`Active Resources: ${sortedResources.length}`);
  console.log(`Active Tickers: ${globalPayload.liveTicker.length}`);
  console.log(`Active Social Platforms: ${globalPayload.socialPlatforms.length}`);
  console.log(`Active Test Series: ${globalPayload.testSeries.length}`);
}

main().catch(err => {
  console.error('[sync-cms] Error:', err);
  process.exit(1);
});
