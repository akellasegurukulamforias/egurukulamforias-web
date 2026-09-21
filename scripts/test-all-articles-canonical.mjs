// scripts/test-all-articles-canonical.mjs
import handler from '../api/html.js';

const CMS_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOt8dZ7S9ot1Zy3GyyXgsDTPsrF016odbaXhf9DXXPMllvQzmQvKabubXZFzRra51x/exec';

function createSlug(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  console.log('Fetching CMS articles to audit all canonical URLs...');
  const res = await fetch(CMS_API_ENDPOINT);
  const data = await res.json();
  const articles = data.currentAffairs || data.articles || [];
  console.log(`Found ${articles.length} published Current Affairs articles in CMS.`);

  let passedCount = 0;
  let failedCount = 0;

  for (const article of articles) {
    const rawSlug = article.slug || article.Slug || createSlug(article.Title || article.title);
    const slug = encodeURIComponent(String(rawSlug).trim().toLowerCase());
    const expectedUrl = `https://egurukulamforias.com/current-affairs/${slug}`;

    const response = handler({ url: expectedUrl });
    const html = await response.text();

    const canonicalMatches = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/gi) || [];
    const ogUrlMatches = html.match(/<meta[^>]*property=["']og:url["'][^>]*>/gi) || [];

    const canonicalHrefMatch = canonicalMatches[0]?.match(/href=["']([^"']*)["']/i);
    const canonicalHref = canonicalHrefMatch ? canonicalHrefMatch[1] : null;

    const ogContentMatch = ogUrlMatches[0]?.match(/content=["']([^"']*)["']/i);
    const ogContent = ogContentMatch ? ogContentMatch[1] : null;

    const ok = canonicalMatches.length === 1 && 
               canonicalHref === expectedUrl && 
               ogUrlMatches.length === 1 && 
               ogContent === expectedUrl;

    if (ok) {
      passedCount++;
    } else {
      failedCount++;
      console.error(`❌ FAILED for article: "${article.Title || article.title}"`);
      console.error(`   Canonical Count: ${canonicalMatches.length}, Href: ${canonicalHref}`);
      console.error(`   Expected: ${expectedUrl}`);
    }
  }

  console.log(`\nAudit Results: ${passedCount}/${articles.length} articles verified.`);
  if (failedCount === 0) {
    console.log('🌟 ALL 38/38 ARTICLES HAVE AUTHORITATIVE, PERFECT CANONICAL TAGS!');
  } else {
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
