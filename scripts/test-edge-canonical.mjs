// test-edge-canonical.mjs
import handler from '../api/html.js';

const testCases = [
  { url: 'https://egurukulamforias.com/', expected: 'https://egurukulamforias.com/' },
  { url: 'https://egurukulamforias.com/programs', expected: 'https://egurukulamforias.com/programs' },
  { url: 'https://egurukulamforias.com/mentorship', expected: 'https://egurukulamforias.com/mentorship' },
  { url: 'https://egurukulamforias.com/current-affairs', expected: 'https://egurukulamforias.com/current-affairs' },
  { 
    url: 'https://egurukulamforias.com/current-affairs/chronic-kidney-disease-of-unknown-origin-uddanam-nephropathy', 
    expected: 'https://egurukulamforias.com/current-affairs/chronic-kidney-disease-of-unknown-origin-uddanam-nephropathy' 
  },
  { 
    url: 'https://egurukulamforias.com/current-affairs/why-apple-faces-ccpa-probe-over-user-rights-issue', 
    expected: 'https://egurukulamforias.com/current-affairs/why-apple-faces-ccpa-probe-over-user-rights-issue' 
  },
  { url: 'https://egurukulamforias.com/resources', expected: 'https://egurukulamforias.com/resources' },
  { url: 'https://egurukulamforias.com/resources/upsc-syllabus', expected: 'https://egurukulamforias.com/resources/upsc-syllabus' },
  { url: 'https://egurukulamforias.com/resources/pyqs', expected: 'https://egurukulamforias.com/resources/pyqs' },
  { 
    url: 'https://egurukulamforias.com/resources/pyqs/2023/mains/general-studies', 
    expected: 'https://egurukulamforias.com/resources/pyqs/2023/mains/general-studies' 
  },
  { 
    url: 'https://egurukulamforias.com/current-affairs/future-article-2027-test', 
    expected: 'https://egurukulamforias.com/current-affairs/future-article-2027-test' 
  },
  // Redirect consolidated routes
  { url: 'https://egurukulamforias.com/home', expected: 'https://egurukulamforias.com/' },
  { url: 'https://egurukulamforias.com/blog', expected: 'https://egurukulamforias.com/current-affairs' },
  { url: 'https://egurukulamforias.com/blog/sample-post', expected: 'https://egurukulamforias.com/current-affairs/sample-post' },
  { url: 'https://egurukulamforias.com/connect', expected: 'https://egurukulamforias.com/contact' },
  { url: 'https://egurukulamforias.com/courses', expected: 'https://egurukulamforias.com/programs' }
];

let allPassed = true;

for (const tc of testCases) {
  const req = { url: tc.url };
  const res = handler(req);
  const text = await res.text();

  // Extract all canonical tags
  const canonicalMatches = text.match(/<link[^>]*rel=["']canonical["'][^>]*>/gi) || [];
  const ogUrlMatches = text.match(/<meta[^>]*property=["']og:url["'][^>]*>/gi) || [];

  const canonicalCount = canonicalMatches.length;
  const ogUrlCount = ogUrlMatches.length;

  const canonicalHrefMatch = canonicalMatches[0]?.match(/href=["']([^"']*)["']/i);
  const canonicalHref = canonicalHrefMatch ? canonicalHrefMatch[1] : null;

  const ogContentMatch = ogUrlMatches[0]?.match(/content=["']([^"']*)["']/i);
  const ogContent = ogContentMatch ? ogContentMatch[1] : null;

  const passedCanonical = canonicalCount === 1 && canonicalHref === tc.expected;
  const passedOg = ogUrlCount === 1 && ogContent === tc.expected;

  if (passedCanonical && passedOg) {
    console.log(`✅ PASS: ${new URL(tc.url).pathname} -> canonical: ${canonicalHref}`);
  } else {
    allPassed = false;
    console.error(`❌ FAIL: ${tc.url}`);
    console.error(`   Canonical Count: ${canonicalCount} (expected 1)`);
    console.error(`   Canonical Href:  ${canonicalHref} (expected ${tc.expected})`);
    console.error(`   OG URL Count:    ${ogUrlCount} (expected 1)`);
    console.error(`   OG Content:      ${ogContent} (expected ${tc.expected})`);
  }
}

if (allPassed) {
  console.log('\n🌟 ALL EDGE CANONICAL TESTS PASSED PERFECTLY!');
} else {
  process.exit(1);
}
