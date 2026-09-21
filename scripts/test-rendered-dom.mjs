// scripts/test-rendered-dom.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import handler from '../api/html.js';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

// 1. Create local test server matching Vercel production edge routing
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');
  const pathname = url.pathname;

  // Check if it's a static file in dist
  const filePath = path.join(distDir, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Otherwise route through edge handler
  const response = handler({ url: `https://egurukulamforias.com${pathname}` });
  response.text().then(html => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
});

await new Promise(resolve => server.listen(3000, resolve));
console.log('Test server running at http://localhost:3000');

const testRoutes = [
  { path: '/', expected: 'https://egurukulamforias.com/' },
  { path: '/programs', expected: 'https://egurukulamforias.com/programs' },
  { path: '/mentorship', expected: 'https://egurukulamforias.com/mentorship' },
  { path: '/current-affairs', expected: 'https://egurukulamforias.com/current-affairs' },
  { 
    path: '/current-affairs/chronic-kidney-disease-of-unknown-origin-uddanam-nephropathy', 
    expected: 'https://egurukulamforias.com/current-affairs/chronic-kidney-disease-of-unknown-origin-uddanam-nephropathy' 
  },
  { 
    path: '/current-affairs/why-apple-faces-ccpa-probe-over-user-rights-issue', 
    expected: 'https://egurukulamforias.com/current-affairs/why-apple-faces-ccpa-probe-over-user-rights-issue' 
  },
  { path: '/resources', expected: 'https://egurukulamforias.com/resources' },
  { path: '/resources/upsc-syllabus', expected: 'https://egurukulamforias.com/resources/upsc-syllabus' },
  { path: '/resources/pyqs', expected: 'https://egurukulamforias.com/resources/pyqs' },
  { 
    path: '/resources/pyqs/2023/mains/general-studies', 
    expected: 'https://egurukulamforias.com/resources/pyqs/2023/mains/general-studies' 
  },
  { 
    path: '/current-affairs/future-article-2027-test', 
    expected: 'https://egurukulamforias.com/current-affairs/future-article-2027-test' 
  }
];

let allPassed = true;

for (const route of testRoutes) {
  const targetUrl = `http://localhost:3000${route.path}`;
  try {
    const { stdout } = await execFileAsync(EDGE_PATH, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--log-level=3',
      '--dump-dom',
      targetUrl
    ], { timeout: 30000, maxBuffer: 10 * 1024 * 1024 });

    // Extract canonical tags from rendered DOM
    const canonicalMatches = stdout.match(/<link[^>]*rel=["']canonical["'][^>]*>/gi) || [];
    const count = canonicalMatches.length;
    const hrefMatch = canonicalMatches[0]?.match(/href=["']([^"']*)["']/i);
    const href = hrefMatch ? hrefMatch[1] : null;

    const isMatch = count === 1 && href === route.expected;
    if (isMatch) {
      console.log(`✅ DOM PASS: ${route.path} -> canonical: ${href}`);
    } else {
      allPassed = false;
      console.error(`❌ DOM FAIL: ${route.path}`);
      console.error(`   Count: ${count} (expected 1)`);
      console.error(`   Found: ${href} (expected ${route.expected})`);
    }
  } catch (err) {
    allPassed = false;
    console.error(`❌ ERROR testing ${route.path}:`, err.message);
  }
}

server.close();

if (allPassed) {
  console.log('\n🌟 ALL RENDERED DOM CANONICAL TESTS PASSED PERFECTLY!');
  process.exit(0);
} else {
  process.exit(1);
}
