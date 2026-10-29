// scripts/generate-pdfs.js
// Automated Professional PDF Generator for e-Gurukulam for IAS Current Affairs
// Generates clean, branded, printable study briefings with genuine clickable links.

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { parseDocument } from 'htmlparser2';
import { cleanDocHtml } from '../src/utils/cleanDocHtml.js';
import { getDirectImageUrl } from '../src/utils/urlUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_PDF_DIR = path.resolve(__dirname, '../public/pdfs/current-affairs');
const MANIFEST_PATH = path.resolve(__dirname, '.pdf-manifest.json');
const IMG_CACHE_DIR = path.resolve(__dirname, '.pdf-img-cache');
const PUBLIC_DATA_DIR = path.resolve(__dirname, '../public/data');
const ARTICLES_DIR = path.resolve(__dirname, '../public/data/articles');

// Layout Geometry (A4 Standard in Points)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 45;
const MARGIN_RIGHT = 45;
const MARGIN_TOP = 45;
const MARGIN_BOTTOM = 55;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 505.28

// All-Page Decorative Double Border Frame Geometry
const FRAME_LEFT = 24;
const FRAME_TOP = 14;
const FRAME_WIDTH = PAGE_WIDTH - 48; // 547.28
const FRAME_HEIGHT = PAGE_HEIGHT - 28; // 813.89

// Generator engine version - bumping invalidates prior cached PDFs
const ENGINE_VERSION = 'v7-no-foundation-attribution';

function calculateArticleHash(art) {
  const payload = JSON.stringify({
    version: ENGINE_VERSION,
    title: art.Title || art.title || '',
    date: art.Date || art.date || '',
    category: art.Category || art.category || '',
    summary: art.Short_Summary || art.short_summary || '',
    banner: art.Banner_Image || art.banner_image || art.Banner || art.banner || art.Image || art.image || '',
    content: art.Full_Content || art.full_content || art.Article_HTML || '',
    slug: art.Slug || art.slug || ''
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveManifest(manifest) {
  try {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  } catch (e) {
    console.warn('[generate-pdfs] Could not save manifest:', e.message);
  }
}

// Fetch image buffer with timeout and disk caching
async function getCachedImageBuffer(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return null;

  if (!fs.existsSync(IMG_CACHE_DIR)) {
    fs.mkdirSync(IMG_CACHE_DIR, { recursive: true });
  }

  const hash = crypto.createHash('md5').update(url).digest('hex');
  const cachePath = path.join(IMG_CACHE_DIR, `${hash}.bin`);

  if (fs.existsSync(cachePath)) {
    try {
      return fs.readFileSync(cachePath);
    } catch (e) {}
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    clearTimeout(timeout);

    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      const rawBuf = Buffer.from(arrayBuf);
      const optimizedBuf = await sharp(rawBuf)
        .resize({ width: 900, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      fs.writeFileSync(cachePath, optimizedBuf);
      return optimizedBuf;
    }
  } catch (e) {
    // Gracefully handle image fetch issues
  }
  return null;
}

/**
 * Generate a single Current Affairs article PDF in original single-flow layout
 */
export async function generateSingleArticlePdf(art, outputPath, brandingAssets) {
  const { logoBuf, portraitBuf } = brandingAssets;
  const slug = art.slug || art.Slug || 'article';

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT },
    bufferPages: true,
    autoFirstPage: true
  });

  const tempPath = `${outputPath}.tmp.${Date.now()}`;
  const writeStream = fs.createWriteStream(tempPath);
  doc.pipe(writeStream);

  function ensureSpace(neededHeight) {
    if (doc.y + neededHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      doc.y = MARGIN_TOP;
      doc.x = MARGIN_LEFT;
    }
  }

  // ==========================================
  // PAGE 1: ORIGINAL INTEGRATED ARTICLE HEADER
  // ==========================================

  // Top Brand Accent Bar
  doc.rect(MARGIN_LEFT, 20, CONTENT_WIDTH, 3.5).fill('#6C1D18');

  // Logo on Left
  if (logoBuf) {
    doc.image(logoBuf, MARGIN_LEFT, 28, { width: 120 });
  }

  // Akella Raghavendra Sir Portrait & Caption on Right
  if (portraitBuf) {
    doc.image(portraitBuf, PAGE_WIDTH - MARGIN_RIGHT - 44, 26, { width: 44, height: 44 });
    doc.rect(PAGE_WIDTH - MARGIN_RIGHT - 44, 26, 44, 44).lineWidth(0.5).strokeColor('#8C3A27').stroke();
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#6C1D18')
       .text('Akella Raghavendra Sir', PAGE_WIDTH - MARGIN_RIGHT - 130, 72, { width: 130, align: 'right' });
    doc.fontSize(6).font('Helvetica-Oblique').fillColor('#7A6B5D')
       .text('Founder & Chief Mentor', PAGE_WIDTH - MARGIN_RIGHT - 130, 81, { width: 130, align: 'right' });
  }

  // Center Academy Title & Clickable Web Link
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#6C1D18')
     .text("AKELLA RAGHAVENDRA'S e-GURUKULAM FOR IAS", 168, 36, { width: 255, align: 'center' });
  doc.fontSize(7).font('Helvetica-Oblique').fillColor('#7A6B5D')
     .text('Daily UPSC Current Affairs & In-Depth Editorial Analysis', 168, 48, { width: 255, align: 'center' });
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#8C3A27')
     .text('www.egurukulamforias.com • Mentorship for Civil Services', 168, 59, {
       width: 255,
       align: 'center',
       link: 'https://egurukulamforias.com/'
     });

  // Divider line
  doc.moveTo(MARGIN_LEFT, 94).lineTo(PAGE_WIDTH - MARGIN_RIGHT, 94).lineWidth(0.75).strokeColor('#D5C3B0').stroke();

  doc.y = 104;
  doc.x = MARGIN_LEFT;

  // Metadata badges: UPSC GS Category & Publication Date
  const rawCat = art.Category || art.category || 'General Studies';
  const category = rawCat.replace(/\r/g, '').replace(/[\n\t]+/g, ' • ').replace(/\s+/g, ' ').replace(/( •\s*)+$/, '').trim();
  const date = (art.Date || art.date || '').replace(/\r/g, '').trim();

  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#8C3A27');
  if (category.length > 80) {
    doc.text(`[ ${category.toUpperCase()} ]`, MARGIN_LEFT, doc.y, { width: CONTENT_WIDTH });
    if (date) {
      doc.moveDown(0.2);
      doc.font('Helvetica-Bold').fillColor('#3D3028').text(`Publication Date: ${date}`, { width: CONTENT_WIDTH });
    }
  } else {
    doc.text(`[ ${category.toUpperCase()} ]`, MARGIN_LEFT, doc.y, { continued: Boolean(date) });
    if (date) {
      doc.font('Helvetica-Bold').fillColor('#3D3028').text(`   |   Publication Date: ${date}`);
    }
  }

  doc.moveDown(0.4);
  doc.x = MARGIN_LEFT;

  // Article Title
  const rawTitle = art.Title || art.title || 'Current Affairs Editorial';
  const title = rawTitle.replace(/\r/g, '').replace(/[\n\t]+/g, ' ').trim();
  doc.fontSize(16).font('Times-Bold').fillColor('#6C1D18')
     .text(title, { lineGap: 3 });

  doc.moveDown(0.4);
  doc.x = MARGIN_LEFT;

  // --- HERO BANNER IMAGE (IF PRESENT) ---
  const rawBanner = art.Banner_Image || art.banner_image || art.Banner || art.banner || art.Image || art.image;
  const directBannerUrl = getDirectImageUrl(rawBanner);
  if (directBannerUrl) {
    const bannerBuf = await getCachedImageBuffer(directBannerUrl);
    if (bannerBuf) {
      try {
        const metadata = await sharp(bannerBuf).metadata();
        const imgAspect = (metadata.width && metadata.height) ? (metadata.width / metadata.height) : 2;
        const bannerWidth = CONTENT_WIDTH;
        const bannerHeight = Math.min(160, Math.round(bannerWidth / imgAspect));

        ensureSpace(bannerHeight + 15);
        const startY = doc.y;

        // Draw image
        doc.image(bannerBuf, MARGIN_LEFT, startY, { width: bannerWidth, height: bannerHeight });
        // Border outline
        doc.rect(MARGIN_LEFT, startY, bannerWidth, bannerHeight).lineWidth(0.5).strokeColor('#D5C3B0').stroke();

        doc.y = startY + bannerHeight + 10;
        doc.x = MARGIN_LEFT;
      } catch (e) {
        // Fallback without banner if corrupt
      }
    }
  }

  // Executive Summary Box
  const rawSummary = art.Short_Summary || art.short_summary || '';
  const summary = rawSummary.replace(/\r/g, '').replace(/[\n\t]+/g, ' ').trim();
  if (summary) {
    ensureSpace(60);
    const startY = doc.y;
    doc.fontSize(8.5).font('Times-Italic');
    const textHeight = doc.heightOfString(summary, { width: CONTENT_WIDTH - 24, lineGap: 2.5 });
    const boxHeight = textHeight + 16;

    doc.rect(MARGIN_LEFT, startY, CONTENT_WIDTH, boxHeight).fill('#FAF6EE');
    doc.rect(MARGIN_LEFT, startY, 3.5, boxHeight).fill('#8C3A27');
    doc.rect(MARGIN_LEFT, startY, CONTENT_WIDTH, boxHeight).lineWidth(0.5).strokeColor('#D5C3B0').stroke();

    doc.fillColor('#3D3028').text(summary, MARGIN_LEFT + 12, startY + 8, { width: CONTENT_WIDTH - 24, lineGap: 2.5 });
    doc.y = startY + boxHeight + 12;
    doc.x = MARGIN_LEFT;
  }

  // --- 2. ARTICLE CONTENT PARSER (Begins directly on Page 1) ---
  const rawHtml = art.Full_Content || art.full_content || art.Article_HTML || '';
  const processedHtml = cleanDocHtml(rawHtml);
  const parsedDom = parseDocument(processedHtml);

  // Helper to extract inline tokens (plain text, bold, italic, links)
  function extractInlineTokens(node, inherited = {}) {
    let tokens = [];

    if (node.type === 'text') {
      let text = node.data;
      if (text) {
        // Normalize Unicode punctuation, Rupee symbol, and known non-Latin terms for PDF WinAnsi standard font compatibility
        text = text
          .replace(/शिल्पी/g, 'Shilpi')  // Devanagari transliteration
          .replace(/\u20B9/g, 'Rs. ')    // Indian Rupee Symbol
          .replace(/\u00A0/g, ' ')       // Non-breaking space
          .replace(/\u200B/g, '')        // Zero-width space
          .replace(/\r/g, '')            // Carriage returns
          .replace(/[\n\t]+/g, ' ');     // Collapse newlines inside inline text
        tokens.push({
          text,
          ...inherited
        });
      }
      return tokens;
    }

    if (node.type === 'tag') {
      const name = node.name.toLowerCase();
      let currentStyle = { ...inherited };

      if (name === 'strong' || name === 'b') currentStyle.bold = true;
      if (name === 'em' || name === 'i') currentStyle.italic = true;
      if (name === 'a') {
        let href = (node.attribs && node.attribs.href) || '';
        if (href.startsWith('/')) href = 'https://egurukulamforias.com' + href;
        currentStyle.link = href;
        currentStyle.underline = true;
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          tokens = tokens.concat(extractInlineTokens(child, currentStyle));
        }
      }
    }

    return tokens;
  }

  // Render inline tokens into a paragraph or heading with strict horizontal anchor protection
  function renderInlineTokens(tokens, options = {}) {
    if (!tokens || tokens.length === 0) return;

    const validTokens = [];
    for (const t of tokens) {
      if (t.text) validTokens.push(t);
    }
    if (validTokens.length === 0) return;

    const baseFont = options.font || 'Helvetica';
    const boldFont = options.boldFont || 'Helvetica-Bold';
    const italicFont = options.italicFont || 'Helvetica-Oblique';
    const boldItalicFont = options.boldItalicFont || 'Helvetica-BoldOblique';
    const defaultColor = options.color || '#2C221E';
    const linkColor = '#8C3A27';
    const fontSize = options.fontSize || 10;
    const lineGap = options.lineGap !== undefined ? options.lineGap : 2.5;
    const width = options.width || CONTENT_WIDTH;
    const startX = options.x !== undefined ? options.x : MARGIN_LEFT;

    doc.fontSize(fontSize);
    doc.x = startX;

    for (let i = 0; i < validTokens.length; i++) {
      const t = validTokens[i];
      const isLast = i === validTokens.length - 1;

      let chosenFont = baseFont;
      if (t.bold && t.italic) chosenFont = boldItalicFont;
      else if (t.bold) chosenFont = boldFont;
      else if (t.italic) chosenFont = italicFont;

      doc.font(chosenFont);

      if (t.link) {
        doc.fillColor(linkColor);
      } else {
        doc.fillColor(t.color || defaultColor);
      }

      if (i === 0) {
        doc.text(t.text, startX, doc.y, {
          continued: !isLast,
          link: t.link || undefined,
          underline: Boolean(t.underline),
          lineGap: lineGap,
          width: width
        });
      } else {
        doc.text(t.text, {
          continued: !isLast,
          link: t.link || undefined,
          underline: Boolean(t.underline),
          lineGap: lineGap,
          width: width
        });
      }
    }

    // Always reset doc.x to MARGIN_LEFT after rendering inline tokens
    doc.x = MARGIN_LEFT;

    if (options.moveDown !== undefined) {
      doc.moveDown(options.moveDown);
    } else {
      doc.moveDown(0.35);
    }
    doc.x = MARGIN_LEFT;
  }

  // Render multi-page table with header repetition and strict margin reset
  function renderTable(tableNode) {
    const rows = [];
    function findRows(n) {
      if (!n) return;
      if (n.type === 'tag' && n.name === 'tr') {
        const cells = [];
        if (Array.isArray(n.children)) {
          for (const c of n.children) {
            if (c.type === 'tag' && (c.name === 'td' || c.name === 'th')) {
              cells.push({
                isHeader: c.name === 'th',
                tokens: extractInlineTokens(c)
              });
            }
          }
        }
        if (cells.length > 0) rows.push(cells);
        return;
      }
      if (Array.isArray(n.children)) n.children.forEach(findRows);
    }
    findRows(tableNode);

    if (rows.length === 0) return;

    const colCount = Math.max(...rows.map(r => r.length));
    if (colCount === 0) return;

    // Header row identification
    const headerRow = rows[0].some(c => c.isHeader) ? rows[0] : null;

    // Proportional column width calculation based on maximum text length
    const colLengths = new Array(colCount).fill(0);
    for (const r of rows) {
      for (let c = 0; c < r.length; c++) {
        const len = r[c].tokens.map(t => t.text).join('').trim().length;
        if (len > colLengths[c]) colLengths[c] = len;
      }
    }

    const colWeights = colLengths.map(l => Math.max(12, Math.sqrt(Math.max(1, l))));
    const totalWeight = colWeights.reduce((a, b) => a + b, 0);
    let colWidths = colWeights.map(w => (w / totalWeight) * CONTENT_WIDTH);

    const minColWidth = Math.min(65, CONTENT_WIDTH / colCount);
    colWidths = colWidths.map(w => Math.max(minColWidth, w));
    const normalizedTotal = colWidths.reduce((a, b) => a + b, 0);
    colWidths = colWidths.map(w => (w / normalizedTotal) * CONTENT_WIDTH);

    function drawSingleRow(row, isHeader, bgCol) {
      let maxCellHeight = 16;
      doc.fontSize(isHeader ? 8 : 7.5).font(isHeader ? 'Helvetica-Bold' : 'Helvetica');

      for (let c = 0; c < row.length; c++) {
        const cellText = row[c].tokens.map(t => t.text).join('');
        const h = doc.heightOfString(cellText, { width: colWidths[c] - 8, lineGap: 1.5 });
        if (h + 8 > maxCellHeight) maxCellHeight = h + 8;
      }

      const startY = doc.y;
      doc.rect(MARGIN_LEFT, startY, CONTENT_WIDTH, maxCellHeight).fill(bgCol);
      doc.rect(MARGIN_LEFT, startY, CONTENT_WIDTH, maxCellHeight).lineWidth(0.5).strokeColor('#D5C3B0').stroke();

      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        const cellX = MARGIN_LEFT + colWidths.slice(0, c).reduce((a, b) => a + b, 0);

        if (c > 0) {
          doc.moveTo(cellX, startY).lineTo(cellX, startY + maxCellHeight).lineWidth(0.5).strokeColor('#E0D5C7').stroke();
        }

        doc.y = startY + 4;
        doc.x = cellX + 4;
        renderInlineTokens(cell.tokens, {
          x: cellX + 4,
          fontSize: isHeader ? 8 : 7.5,
          font: isHeader ? 'Helvetica-Bold' : 'Helvetica',
          boldFont: 'Helvetica-Bold',
          color: isHeader ? '#6C1D18' : '#2C221E',
          width: colWidths[c] - 8,
          lineGap: 1.5,
          moveDown: 0
        });
      }

      doc.y = startY + maxCellHeight;
      doc.x = MARGIN_LEFT;
      return maxCellHeight;
    }

    doc.moveDown(0.35);

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      const isHeader = rIdx === 0 && row.some(c => c.isHeader);

      let rowH = 16;
      doc.fontSize(isHeader ? 8 : 7.5).font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
      for (let c = 0; c < row.length; c++) {
        const cellText = row[c].tokens.map(t => t.text).join('');
        const h = doc.heightOfString(cellText, { width: colWidths[c] - 8, lineGap: 1.5 });
        if (h + 8 > rowH) rowH = h + 8;
      }

      // Check page break and repeat header on new page
      if (doc.y + rowH > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        doc.y = MARGIN_TOP;
        doc.x = MARGIN_LEFT;
        if (headerRow && rIdx > 0) {
          drawSingleRow(headerRow, true, '#FAF6EE');
        }
      }

      const bgCol = isHeader ? '#FAF6EE' : (rIdx % 2 === 0 ? '#FFFFFF' : '#FAF8F5');
      drawSingleRow(row, isHeader, bgCol);
    }

    doc.moveDown(0.45);
    doc.x = MARGIN_LEFT;
  }

  // Recursive DOM Node Processor
  async function processNode(node) {
    if (!node) return;

    if (node.type === 'tag') {
      const name = node.name.toLowerCase();

      // Major Section Headings: h1, h2
      if (name === 'h1' || name === 'h2') {
        ensureSpace(45);
        const tokens = extractInlineTokens(node);
        doc.moveDown(0.45);
        doc.x = MARGIN_LEFT;
        renderInlineTokens(tokens, {
          x: MARGIN_LEFT,
          fontSize: 13,
          font: 'Times-Bold',
          boldFont: 'Times-Bold',
          color: '#6C1D18',
          lineGap: 2.5,
          moveDown: 0.2
        });
        doc.moveTo(MARGIN_LEFT, doc.y).lineTo(MARGIN_LEFT + 180, doc.y).lineWidth(0.75).strokeColor('#D5C3B0').stroke();
        doc.moveDown(0.3);
        doc.x = MARGIN_LEFT;
        return;
      }

      // Sub-headings: h3, h4, h5, h6
      if (name === 'h3' || name === 'h4' || name === 'h5' || name === 'h6') {
        ensureSpace(35);
        const tokens = extractInlineTokens(node);
        doc.moveDown(0.4);
        doc.x = MARGIN_LEFT;
        renderInlineTokens(tokens, {
          x: MARGIN_LEFT,
          fontSize: name === 'h3' ? 11.5 : 10.5,
          font: 'Times-Bold',
          boldFont: 'Times-Bold',
          color: '#8B261E',
          lineGap: 2,
          moveDown: 0.25
        });
        doc.x = MARGIN_LEFT;
        return;
      }

      // Paragraphs
      if (name === 'p') {
        const isGsPaper = node.attribs && node.attribs.class && node.attribs.class.includes('gs-paper-line');
        const tokens = extractInlineTokens(node);
        if (tokens.length > 0) {
          ensureSpace(22);
          doc.x = MARGIN_LEFT;
          renderInlineTokens(tokens, {
            x: MARGIN_LEFT,
            fontSize: isGsPaper ? 9 : 9.5,
            font: isGsPaper ? 'Helvetica-Bold' : 'Helvetica',
            boldFont: 'Helvetica-Bold',
            italicFont: 'Helvetica-Oblique',
            color: isGsPaper ? '#8C3A27' : '#2C221E',
            lineGap: 2.5,
            moveDown: 0.35
          });
          doc.x = MARGIN_LEFT;
        }
        return;
      }

      // List Items (Both standalone <li> and list children)
      if (name === 'li') {
        const tokens = extractInlineTokens(node);
        if (tokens.length > 0) {
          ensureSpace(20);
          const startY = doc.y;

          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#8C3A27');
          doc.text('•', MARGIN_LEFT + 6, startY);

          doc.y = startY;
          doc.x = MARGIN_LEFT + 20;
          renderInlineTokens(tokens, {
            x: MARGIN_LEFT + 20,
            fontSize: 9.5,
            font: 'Helvetica',
            boldFont: 'Helvetica-Bold',
            italicFont: 'Helvetica-Oblique',
            color: '#2C221E',
            lineGap: 2,
            moveDown: 0.22,
            width: CONTENT_WIDTH - 20
          });
          doc.x = MARGIN_LEFT;
        }
        return;
      }

      // Ordered and Unordered List wrappers
      if (name === 'ul' || name === 'ol') {
        if (Array.isArray(node.children)) {
          let itemIdx = 1;
          for (const item of node.children) {
            if (item.type === 'tag' && item.name === 'li') {
              ensureSpace(20);
              const prefix = name === 'ol' ? `${itemIdx++}.` : '•';
              const tokens = extractInlineTokens(item);

              const startY = doc.y;
              doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#8C3A27');
              doc.text(prefix, MARGIN_LEFT + 6, startY);

              doc.y = startY;
              doc.x = MARGIN_LEFT + 20;
              renderInlineTokens(tokens, {
                x: MARGIN_LEFT + 20,
                fontSize: 9.5,
                font: 'Helvetica',
                boldFont: 'Helvetica-Bold',
                italicFont: 'Helvetica-Oblique',
                color: '#2C221E',
                lineGap: 2,
                moveDown: 0.22,
                width: CONTENT_WIDTH - 20
              });
              doc.x = MARGIN_LEFT;
            } else {
              await processNode(item);
            }
          }
          doc.moveDown(0.25);
          doc.x = MARGIN_LEFT;
        }
        return;
      }

      // Tables
      if (name === 'table') {
        renderTable(node);
        return;
      }

      // Blockquotes
      if (name === 'blockquote') {
        ensureSpace(35);
        const tokens = extractInlineTokens(node);
        const startY = doc.y;
        doc.rect(MARGIN_LEFT + 5, startY, CONTENT_WIDTH - 10, 30).fill('#FAF6EE');
        doc.rect(MARGIN_LEFT + 5, startY, 3, 30).fill('#8C3A27');
        doc.y = startY + 6;
        renderInlineTokens(tokens, {
          x: MARGIN_LEFT + 12,
          fontSize: 9,
          font: 'Times-Italic',
          color: '#5C4028',
          lineGap: 2,
          moveDown: 0.4,
          width: CONTENT_WIDTH - 24
        });
        doc.x = MARGIN_LEFT;
        return;
      }

      // Horizontal Rules
      if (name === 'hr') {
        ensureSpace(15);
        doc.moveTo(MARGIN_LEFT, doc.y).lineTo(PAGE_WIDTH - MARGIN_RIGHT, doc.y).lineWidth(0.5).strokeColor('#D5C3B0').stroke();
        doc.moveDown(0.3);
        doc.x = MARGIN_LEFT;
        return;
      }

      // Embedded Images (Strict Proportional Aspect Ratio Scaling)
      if (name === 'img') {
        const src = node.attribs && node.attribs.src;
        if (src) {
          const directSrc = getDirectImageUrl(src) || src;
          const imgBuf = await getCachedImageBuffer(directSrc);
          if (imgBuf) {
            try {
              const meta = await sharp(imgBuf).metadata();
              const aspect = (meta.width && meta.height) ? (meta.width / meta.height) : (4 / 3);
              const maxW = Math.min(CONTENT_WIDTH - 40, 420);
              const maxH = 200;
              let fitW = maxW;
              let fitH = Math.round(fitW / aspect);
              if (fitH > maxH) {
                fitH = maxH;
                fitW = Math.round(fitH * aspect);
              }

              ensureSpace(fitH + 20);
              doc.moveDown(0.3);
              const startX = MARGIN_LEFT + (CONTENT_WIDTH - fitW) / 2;
              doc.image(imgBuf, startX, doc.y, { width: fitW, height: fitH });
              doc.rect(startX, doc.y, fitW, fitH).lineWidth(0.5).strokeColor('#D5C3B0').stroke();
              doc.y += fitH + 10;
              doc.x = MARGIN_LEFT;
            } catch (e) {}
          }
        }
        return;
      }

      // Standard Container Elements (div, section, article, etc.)
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          await processNode(child);
        }
      }
    }
  }

  if (Array.isArray(parsedDom.children)) {
    for (const topNode of parsedDom.children) {
      await processNode(topNode);
    }
  }

  // --- 3. TWO-PASS RUNNING HEADERS, FOOTERS & BORDERS (PAGES 1 to N) ---
  const range = doc.bufferedPageRange();
  const totalPages = range.count;

  for (let i = range.start; i < range.start + totalPages; i++) {
    doc.switchToPage(i);

    // CRITICAL: Temporarily set margins to 0 during fixed header/footer drawing
    // to strictly prevent PDFKit from triggering phantom page breaks.
    const oldBottom = doc.page.margins.bottom;
    const oldTop = doc.page.margins.top;
    doc.page.margins.bottom = 0;
    doc.page.margins.top = 0;

    // A. DOUBLE FRAME BORDER ON EVERY PAGE (Consistent cover styling)
    doc.rect(FRAME_LEFT, FRAME_TOP, FRAME_WIDTH, FRAME_HEIGHT).lineWidth(1).strokeColor('#D5C3B0').stroke();
    doc.rect(FRAME_LEFT + 3, FRAME_TOP + 3, FRAME_WIDTH - 6, FRAME_HEIGHT - 6).lineWidth(0.5).strokeColor('#E8DED1').stroke();

    // B. Running Header on Pages 2+ (Article Body Pages)
    if (i > range.start) {
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#6C1D18')
         .text('e-GURUKULAM FOR IAS', MARGIN_LEFT, 20, { continued: true });
      doc.font('Helvetica-Oblique').fillColor('#7A6B5D')
         .text('   •   Daily UPSC Current Affairs Analysis');

      const maxTitleLen = date ? 38 : 50;
      const truncatedTitle = title.length > maxTitleLen ? title.slice(0, maxTitleLen - 2) + '...' : title;
      const headerRight = date ? `${date}   |   ${truncatedTitle}` : truncatedTitle;

      doc.fontSize(7).font('Helvetica-Oblique').fillColor('#8C3A27')
         .text(headerRight, MARGIN_LEFT, 20, { align: 'right', width: CONTENT_WIDTH });

      doc.moveTo(MARGIN_LEFT, 32).lineTo(PAGE_WIDTH - MARGIN_RIGHT, 32).lineWidth(0.5).strokeColor('#D5C3B0').stroke();
    }

    // C. Running Footer on ALL Pages (Fixed Y: Rule at 788, Line 1 at 794, Line 2 at 807)
    // FOOTER LINKS HAVE NO VISIBLE UNDERLINE (underline: false) BUT REMAIN 100% CLICKABLE
    const footerRuleY = 788;
    const footerLine1Y = 794;
    const footerLine2Y = 807;

    // Footer divider line
    doc.moveTo(MARGIN_LEFT, footerRuleY).lineTo(PAGE_WIDTH - MARGIN_RIGHT, footerRuleY).lineWidth(0.5).strokeColor('#D5C3B0').stroke();

    // Footer Line 1 Left: Contact Numbers & Website (Clickable links, NO UNDERLINE)
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#8C3A27')
       .text('Contact: ', MARGIN_LEFT, footerLine1Y, { continued: true });
    doc.font('Helvetica').fillColor('#2C221E')
       .text('+91 88978 26108', { continued: true, link: 'tel:+918897826108', underline: false });
    doc.text(', ', { continued: true });
    doc.text('+91 99122 11109', { continued: true, link: 'tel:+919912211109', underline: false });
    doc.text('   |   ', { continued: true });
    doc.font('Helvetica-Bold').fillColor('#8C3A27')
       .text('egurukulamforias.com', {
         link: 'https://egurukulamforias.com/',
         underline: false,
         continued: false
       });

    // Footer Line 1 Right: Page X of Y
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#7A6B5D')
       .text(`Page ${i + 1} of ${totalPages}`, MARGIN_LEFT, footerLine1Y, {
         align: 'right',
         width: CONTENT_WIDTH
       });

    // Footer Line 2 Left: YouTube, Telegram & Instagram (Clickable links, NO UNDERLINE)
    doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#8C3A27')
       .text('YouTube: ', MARGIN_LEFT, footerLine2Y, { continued: true });
    doc.font('Helvetica').fillColor('#2C221E')
       .text('@e-GurukulamforIAS', { continued: true, link: 'https://www.youtube.com/@e-GurukulamforIAS', underline: false });
    doc.text('   |   ', { continued: true });
    doc.font('Helvetica-Bold').fillColor('#8C3A27')
       .text('Telegram: ', { continued: true });
    doc.font('Helvetica').fillColor('#2C221E')
       .text('@egurukulamforias', { continued: true, link: 'https://t.me/egurukulamforias', underline: false });
    doc.text('   |   ', { continued: true });
    doc.font('Helvetica-Bold').fillColor('#8C3A27')
       .text('Instagram: ', { continued: true });
    doc.font('Helvetica').fillColor('#2C221E')
       .text('@egurukulamforias', {
         link: 'https://www.instagram.com/egurukulamforias/',
         underline: false,
         continued: false
       });

    // Restore margins
    doc.page.margins.bottom = oldBottom;
    doc.page.margins.top = oldTop;
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      try {
        if (!fs.existsSync(tempPath)) {
          throw new Error('Temporary PDF file was not created');
        }
        const stat = fs.statSync(tempPath);
        if (stat.size < 1024) {
          throw new Error(`Generated PDF file is suspiciously small (${stat.size} bytes)`);
        }
        // Basic PDF validation: verify standard %PDF- header magic bytes
        const fd = fs.openSync(tempPath, 'r');
        const headerBuf = Buffer.alloc(5);
        fs.readSync(fd, headerBuf, 0, 5, 0);
        fs.closeSync(fd);
        if (headerBuf.toString('ascii') !== '%PDF-') {
          throw new Error('Generated file lacks valid %PDF- magic header');
        }

        // Atomic replacement: remove previous file and rename temp file into place
        if (fs.existsSync(outputPath)) {
          try { fs.unlinkSync(outputPath); } catch (e) {}
        }
        fs.renameSync(tempPath, outputPath);
        resolve(fs.statSync(outputPath));
      } catch (valErr) {
        if (fs.existsSync(tempPath)) {
          try { fs.unlinkSync(tempPath); } catch (e) {}
        }
        reject(valErr);
      }
    });

    writeStream.on('error', (err) => {
      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (e) {}
      }
      reject(err);
    });

    doc.on('error', (err) => {
      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (e) {}
      }
      reject(err);
    });
  });
}

/**
 * Main batch generator for Current Affairs articles
 */
export async function generateCurrentAffairsPdfs(articles) {
  console.log('\n=== Automated Current Affairs PDF Generation Engine ===');

  if (!fs.existsSync(PUBLIC_PDF_DIR)) {
    fs.mkdirSync(PUBLIC_PDF_DIR, { recursive: true });
  }

  // Pre-optimize branding assets once
  let logoBuf = null;
  let portraitBuf = null;
  const logoPath = path.resolve(__dirname, '../public/images/Logo.png');
  const portraitPath = path.resolve(__dirname, '../public/images/akella_raghavendra.png');

  if (fs.existsSync(logoPath)) {
    logoBuf = await sharp(logoPath).resize({ width: 350 }).png({ compressionLevel: 9 }).toBuffer();
  }
  if (fs.existsSync(portraitPath)) {
    portraitBuf = await sharp(portraitPath).resize({ width: 200 }).png({ compressionLevel: 9 }).toBuffer();
  }

  const brandingAssets = { logoBuf, portraitBuf };
  const manifest = loadManifest();

  const validSlugs = new Set();
  const failedSlugs = [];

  let generatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const art of articles) {
    const slug = art?.slug || art?.Slug;
    if (!slug) continue;

    const outPath = path.join(PUBLIC_PDF_DIR, `${slug}.pdf`);

    try {
      const currentHash = calculateArticleHash(art);

      // Skip if unchanged, file exists, and passes minimal size validation
      if (manifest[slug] && manifest[slug].hash === currentHash && fs.existsSync(outPath) && fs.statSync(outPath).size >= 1024) {
        skippedCount++;
        validSlugs.add(slug);
        continue;
      }

      const stat = await generateSingleArticlePdf(art, outPath, brandingAssets);
      manifest[slug] = {
        hash: currentHash,
        updatedAt: new Date().toISOString(),
        sizeBytes: stat.size
      };
      generatedCount++;
      validSlugs.add(slug);
      process.stdout.write(`\r[PDF Engine] Processed: ${generatedCount} generated, ${skippedCount} skipped`);
    } catch (err) {
      failedCount++;
      let artTitle = slug;
      try { artTitle = art?.Title || art?.title || slug; } catch (e) {}
      failedSlugs.push({ slug, title: artTitle, error: err.message });
      console.error(`\n[PDF Engine] ⚠️ Error generating PDF for "${slug}": ${err.message}`);

      // Ensure stale or corrupted PDF is removed so visitors never receive outdated content
      if (fs.existsSync(outPath)) {
        try {
          fs.unlinkSync(outPath);
          console.warn(`[PDF Engine] Removed stale PDF for "${slug}"`);
        } catch (e) {}
      }
      delete manifest[slug];
    }
  }

  saveManifest(manifest);

  // Mark PDF availability in articles/*.json detail files and ca-meta.json
  for (const art of articles) {
    const slug = art.slug || art.Slug;
    if (!slug) continue;
    const isReady = validSlugs.has(slug);
    art.hasPdf = isReady;

    const artFile = path.join(ARTICLES_DIR, `${slug}.json`);
    if (fs.existsSync(artFile)) {
      try {
        const artContent = JSON.parse(fs.readFileSync(artFile, 'utf8'));
        artContent.hasPdf = isReady;
        fs.writeFileSync(artFile, JSON.stringify(artContent, null, 2), 'utf8');
      } catch (e) {}
    }
  }

  const caMetaPath = path.join(PUBLIC_DATA_DIR, 'ca-meta.json');
  if (fs.existsSync(caMetaPath)) {
    try {
      const caMetaContent = JSON.parse(fs.readFileSync(caMetaPath, 'utf8'));
      for (const item of caMetaContent) {
        const s = item.slug || item.Slug;
        if (s) {
          item.hasPdf = validSlugs.has(s);
        }
      }
      fs.writeFileSync(caMetaPath, JSON.stringify(caMetaContent, null, 2), 'utf8');
    } catch (e) {}
  }

  // Final Validation Step: Identify active articles with missing or invalid PDFs
  const missingOrInvalidList = [];
  for (const art of articles) {
    const slug = art.slug || art.Slug;
    if (!slug) continue;
    const targetPdf = path.join(PUBLIC_PDF_DIR, `${slug}.pdf`);
    const fileExists = fs.existsSync(targetPdf);
    const validSize = fileExists && fs.statSync(targetPdf).size >= 1024;
    if (!validSize) {
      if (!failedSlugs.some(f => f.slug === slug)) {
        missingOrInvalidList.push({
          slug,
          error: fileExists ? 'Corrupt or incomplete file (<1024 bytes)' : 'PDF file missing'
        });
      }
    }
  }

  const allFailures = [...failedSlugs, ...missingOrInvalidList];

  console.log('\n=========================================================');
  console.log('              [PDF Engine Validation Report]             ');
  console.log('=========================================================');
  console.log(`Total Active Articles : ${articles.length}`);
  console.log(`Valid PDFs Ready      : ${validSlugs.size}`);
  console.log(`Failed / Missing PDFs : ${allFailures.length}`);
  if (allFailures.length > 0) {
    console.log('---------------------------------------------------------');
    console.log('⚠️ The following active article(s) do not have a valid PDF:');
    for (const f of allFailures) {
      console.log(`   • ${f.slug}: ${f.error}`);
    }
    console.log('Notice: These articles remain active on the site, but their PDF download links are disabled.');
  }
  console.log('=========================================================\n');

  return {
    total: articles.length,
    valid: validSlugs.size,
    generated: generatedCount,
    skipped: skippedCount,
    failed: allFailures.length,
    failures: allFailures
  };
}

// Support running directly from CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  async function run() {
    let articles = [];
    if (fs.existsSync(ARTICLES_DIR)) {
      const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));
      articles = files.map(f => JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8')));
    }
    await generateCurrentAffairsPdfs(articles);
  }
  run().catch(err => {
    console.error('[generate-pdfs] Fatal error:', err);
    process.exit(1);
  });
}
