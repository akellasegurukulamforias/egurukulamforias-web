/**
 * Clean and optimize raw HTML for high-fidelity native editorial typography.
 * Strips script/style tags, unwraps Google redirect links, ensures responsive images,
 * demotes misplaced GS Paper headers to body text, and converts section title paragraphs into semantic <h2> tags.
 */
export function cleanDocHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  try {
    let html = rawHtml;

    // 1. Extract inner body content if a complete HTML page is provided
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      html = bodyMatch[1];
    }

    // 2. Strip <style> and <script> blocks, inline event handlers, and javascript: URIs for XSS defense
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
    html = html.replace(/(href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi, '$1="#"');

    // 3. Remove Google's redirection wrappers
    html = html.replace(/href=["']https:\/\/www\.google\.com\/url\?q=([^&"']+)[^"']*["']/gi, (match, dest) => {
      try {
        return `href="${decodeURIComponent(dest)}" target="_blank" rel="noopener noreferrer"`;
      } catch (e) {
        return `href="${dest}" target="_blank" rel="noopener noreferrer"`;
      }
    });

    // 4. Demote any <h2> (or <h1-h6>) tags containing GS Paper / GS syllabus lines to plain <p>
    html = html.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (match, inner) => {
      const plain = inner.replace(/<[^>]*>/g, '').trim();
      if (/^GS\s+(?:Paper\s+)?(?:I|II|III|IV|\d+)/i.test(plain) || /^GS\s+[I|V|X]+/i.test(plain)) {
        let textOnly = inner.replace(/<div[\s\S]*?<\/div>/gi, '').replace(/<img[\s\S]*?>/gi, '').trim();
        let extra = '';
        const divMatch = inner.match(/<div[\s\S]*?<\/div>/gi);
        if (divMatch) extra += divMatch.join('');
        const imgMatch = inner.match(/<img[^>]*>/gi);
        if (imgMatch && !divMatch) extra += imgMatch.join('');

        return `<p class="gs-paper-line">${textOnly}</p>${extra}`;
      }
      return match;
    });

    // 5. Clean existing <h2> tags: strip <strong> / <b> inside existing <h2> so font-serif and maroon color apply cleanly
    html = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs, inner) => {
      const cleanInner = inner.replace(/<\/?(?:b|strong)[^>]*>/gi, '').trim();
      return `<h2${attrs}>${cleanInner}</h2>`;
    });

    // 6. Convert section title paragraphs to unified <h2> tags:
    html = html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, inner) => {
      const plain = inner.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      if (!plain) return '';

      // NEVER convert bullet points or metadata fields
      if (/^[·•\-\*]/.test(plain)) return match;
      if (/^(?:Ministry|Nodal Institution|Introduced|Launched|Purpose|UPSC Linkage|Other Number|Area|Origin|Started):/i.test(plain)) return match;

      // NEVER convert "Also Read" blocks
      if (/^Also\s+Read/i.test(plain)) return match;

      // NEVER convert GS Paper lines
      if (/^GS\s+(?:Paper\s+)?(?:I|II|III|IV|\d+)/i.test(plain) || /^GS\s+[I|V|X]+/i.test(plain)) return match;

      // Syllabus Areas heading: always normalize to semantic <h2>
      if (/^Syllabus\s+areas?:?/i.test(plain) && plain.length < 35) {
        const colonText = plain.endsWith(':') ? plain : `${plain}:`;
        return `<h2>${colonText}</h2>`;
      }

      // Check if paragraph contains <strong> or <b>
      const hasStrong = /<(?:b|strong)[^>]*>[\s\S]*?<\/(?:b|strong)>/i.test(inner);
      if (!hasStrong) return match;

      // Numbered section heading (e.g., "1. Major National Helplines in India", "1. 1930 – National Cyber Crime Helpline", "2. 14567 – Elderline")
      const isNumberedTitle = /^\d+\.\s+[\s\S]+/i.test(plain) && plain.length < 100 && !plain.endsWith('.') && !inner.includes('<br');

      // Fully bold title paragraphs (e.g. "Important Helpline Numbers...", "1098 – CHILDLINE...", "BRICS: India's Vision")
      const unbolded = inner.replace(/<(?:b|strong)[^>]*>[\s\S]*?<\/(?:b|strong)>/gi, '')
                            .replace(/<[^>]*>/g, '')
                            .replace(/[\s\d\.\–\-\:\,\']/g, '');
      const isBoldTitle = unbolded.length === 0 && plain.length > 2 && plain.length < 100 && !plain.endsWith('.');

      if (isNumberedTitle || isBoldTitle) {
        // Strip <strong> / <b> inside newly promoted <h2> to guarantee unified font-serif and maroon styling,
        // while strictly preserving valid inline HTML, anchor tags (<a href="...">), and styling attributes.
        const cleanHeading = inner.replace(/<\/?(?:b|strong)[^>]*>/gi, '').trim();
        return `<h2>${cleanHeading}</h2>`;
      }

      return match;
    });

    // 7. Ensure all images are responsive, centered, preserve aspect ratio attributes, and load safely
    html = html.replace(/<img\s+([^>]*?)>/gi, (match, attributes) => {
      let cleanAttrs = attributes || '';
      
      if (!/referrerpolicy/i.test(cleanAttrs)) {
        cleanAttrs += ' referrerpolicy="no-referrer"';
      }
      if (!/loading/i.test(cleanAttrs)) {
        cleanAttrs += ' loading="lazy"';
      }

      return `<img ${cleanAttrs} class="max-w-full h-auto rounded-2xl shadow-md my-6 mx-auto block object-contain border border-[#D5C3B0]/40" />`;
    });

    // 8. Wrap any raw <table> elements with responsive, non-overflowing scroll container
    html = html.replace(/<table([^>]*)>([\s\S]*?)<\/table>/gi, (match, attrs, inner) => {
      return `<div class="w-full overflow-x-auto my-6 rounded-xl border border-[#D5C3B0]/40 shadow-2xs"><table${attrs} class="w-full min-w-full border-collapse">${inner}</table></div>`;
    });

    // 9. Clean empty paragraph tags
    html = html.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');

    return html;
  } catch (err) {
    console.warn("cleanDocHtml parsing encountered an error, falling back to safe content:", err);
    return String(rawHtml).replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
  }
}
