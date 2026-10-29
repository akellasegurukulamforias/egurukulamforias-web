// scripts/validate-all-pdfs.mjs
import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const PDF_DIR = 'public/pdfs/current-affairs';
const ARTICLES_DIR = 'public/data/articles';

async function validateAll() {
  console.log('=== Comprehensive Site-Wide PDF Validation (Reverted Original Layout) ===\n');

  const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'));
  console.log(`Found ${files.length} PDFs to validate.`);

  let totalPagesSiteWide = 0;
  let totalLinksSiteWide = 0;
  let failedChecks = 0;

  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx];
    const slug = file.replace('.pdf', '');
    const pdfPath = path.join(PDF_DIR, file);
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjsLib.getDocument({ data }).promise;

    totalPagesSiteWide += doc.numPages;

    const artFile = path.join(ARTICLES_DIR, `${slug}.json`);
    let artData = {};
    if (fs.existsSync(artFile)) {
      artData = JSON.parse(fs.readFileSync(artFile, 'utf8'));
    }

    const expectedDate = artData.Date || artData.date || '';
    const rawTitle = artData.Title || artData.title || '';
    const cleanTitle = rawTitle.replace(/\r/g, '').replace(/[\n\t]+/g, ' ').trim();

    // Check each page
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const text = content.items.map(s => s.str).join(' ');
      const annotations = await page.getAnnotations();
      const links = annotations.filter(a => a.subtype === 'Link').map(a => a.url);

      totalLinksSiteWide += links.length;

      // Check 1: No blank/footer-only pages
      if (text.length < 250) {
        console.error(`[FAIL] ${file} Page ${p}: Sparse text detected (${text.length} chars). Potential phantom page!`);
        failedChecks++;
      }

      // Check 2: Footer line 1
      if (!text.includes('Contact:') || !text.includes('+91 88978 26108') || !text.includes('egurukulamforias.com')) {
        console.error(`[FAIL] ${file} Page ${p}: Incomplete footer line 1`);
        failedChecks++;
      }

      // Check 3: Footer line 2 with Instagram
      if (!text.includes('YouTube:') || !text.includes('Telegram:') || !text.includes('Instagram:') || !text.includes('@egurukulamforias')) {
        console.error(`[FAIL] ${file} Page ${p}: Incomplete footer line 2 (Missing Instagram/YouTube/Telegram)`);
        failedChecks++;
      }

      // Check 3b: Verify removed mentorship attribution line does NOT exist
      if (text.includes('Akella Raghavendra Foundation') || text.includes('Foundation • Civil Services Mentorship')) {
        console.error(`[FAIL] ${file} Page ${p}: Contains removed attribution line ("Akella Raghavendra Foundation • Civil Services Mentorship")`);
        failedChecks++;
      }

      // Check 4: Clickable footer links
      const hasInstagramLink = links.some(l => l && l.includes('instagram.com/egurukulamforias'));
      const hasTelegramLink = links.some(l => l && l.includes('t.me/egurukulamforias'));
      const hasYouTubeLink = links.some(l => l && l.includes('youtube.com/@e-GurukulamforIAS'));
      const hasWebLink = links.some(l => l && l.includes('egurukulamforias.com'));

      if (!hasInstagramLink || !hasTelegramLink || !hasYouTubeLink || !hasWebLink) {
        console.error(`[FAIL] ${file} Page ${p}: Missing clickable annotations in footer (Instagram: ${hasInstagramLink}, Telegram: ${hasTelegramLink}, YT: ${hasYouTubeLink}, Web: ${hasWebLink})`);
        failedChecks++;
      }

      // Check 5: Page 1 must directly contain the article title, mentor branding, and begin article content (NO separate cover page)
      if (p === 1) {
        if (!text.includes("AKELLA RAGHAVENDRA'S e-GURUKULAM FOR IAS") || !text.includes('Akella Raghavendra Sir')) {
          console.error(`[FAIL] ${file} Page 1: Missing original header branding or mentor name`);
          failedChecks++;
        }
        // Verify title appears on page 1
        const shortTitle = cleanTitle.slice(0, 30);
        if (shortTitle && !text.includes(shortTitle)) {
          console.error(`[FAIL] ${file} Page 1: Missing article title "${shortTitle}" on page 1`);
          failedChecks++;
        }
      }

      // Check 6: Page 2+ Running Header with Date
      if (p > 1) {
        if (!text.includes('e-GURUKULAM FOR IAS') || !text.includes('Daily UPSC Current Affairs Analysis')) {
          console.error(`[FAIL] ${file} Page ${p}: Missing running header`);
          failedChecks++;
        }
        if (expectedDate && !text.includes(expectedDate)) {
          console.error(`[FAIL] ${file} Page ${p}: Running header missing publication date "${expectedDate}"`);
          failedChecks++;
        }
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`Validation Finished!`);
  console.log(`Total PDFs Checked: ${files.length}`);
  console.log(`Total Pages Across All PDFs: ${totalPagesSiteWide}`);
  console.log(`Total Clickable Links Across All PDFs: ${totalLinksSiteWide}`);
  console.log(`Total Failed Checks: ${failedChecks}`);
  console.log(`Status: ${failedChecks === 0 ? 'ALL CHECKS PASSED (100% HEALTHY)' : 'FAILURES DETECTED'}`);
  console.log(`==================================================\n`);

  if (failedChecks > 0) {
    process.exit(1);
  }
}

validateAll().catch(err => {
  console.error('Fatal validation error:', err);
  process.exit(1);
});
