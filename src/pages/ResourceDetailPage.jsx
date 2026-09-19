import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  Loader2,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  CheckCircle,
  FolderOpen,
  Layers,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCMSData } from '../hooks/useCMSData';
import { 
  isSyllabusResource, 
  isPYQResource, 
  extractPYQYear, 
  extractPYQPaperName,
  extractPYQStage,
  extractPYQCategory,
  extractPYQPaperLabel,
  getPYQPaperUrl,
  sortPYQPapers,
  getCachedCMSData,
  isCMSNetworkFetched
} from '../services/cmsService';
import { sortCurrentAffairsByDate, formatDisplayDate, parseDateToTimestamp } from '../utils/dateUtils';
import { createSlug, getDirectImageUrl, getSecondaryImageUrl } from '../utils/urlUtils';

/**
 * Clean and optimize raw HTML for high-fidelity native editorial typography
 */
function cleanDocHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  try {
    let html = rawHtml;

    // 1. Extract inner body content if a complete HTML page is provided
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      html = bodyMatch[1];
    }

    // 2. Strip <style> and <script> blocks to preserve our master typography
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // 3. Remove Google's redirection wrappers
    html = html.replace(/href=["']https:\/\/www\.google\.com\/url\?q=([^&"']+)[^"']*["']/gi, (match, dest) => {
      try {
        return `href="${decodeURIComponent(dest)}" target="_blank" rel="noopener noreferrer"`;
      } catch (e) {
        return `href="${dest}" target="_blank" rel="noopener noreferrer"`;
      }
    });

    // 4. Convert Google Docs title/subtitle paragraphs or centered headers (including text-center classes) into consistent editorial headings
    html = html.replace(/<p[^>]*class=["'][^"']*\b(?:title|subtitle|header|headline)\b[^"']*["'][^>]*>\s*(?:<b>|<strong>)?([\s\S]*?)(?:<\/b>|<\/strong>)?\s*<\/p>/gi, '<h2 class="editorial-heading-divider text-center">$1</h2>');
    html = html.replace(/<p[^>]*(?:text-align:\s*center|align=["']center["']|\btext-center\b)[^>]*>\s*(?:<b>|<strong>)?([\s\S]*?)(?:<\/b>|<\/strong>)?\s*<\/p>/gi, '<h2 class="editorial-heading-divider text-center">$1</h2>');

    // 5. Convert standalone bold/strong heading questions or section labels into styled subheadings with divider lines
    html = html.replace(/<p[^>]*>\s*(?:<b>|<strong>|<span[^>]*font-weight[^>]*>)\s*([^<]{3,140}?(?:\?|:)?)\s*(?:<\/b>|<\/strong>|<\/span>)\s*<\/p>/gi, '<h3 class="editorial-subheading">$1</h3>');

    // 6. Ensure all images are responsive, centered, have shadow, and load with referrerPolicy="no-referrer"
    html = html.replace(/<img\s+([^>]*?)>/gi, (match, attributes) => {
      let cleanAttrs = attributes || '';
      cleanAttrs = cleanAttrs.replace(/\b(width|height)=["'][^"']*["']/gi, '');
      
      if (!/referrerpolicy/i.test(cleanAttrs)) {
        cleanAttrs += ' referrerpolicy="no-referrer"';
      }
      if (!/loading/i.test(cleanAttrs)) {
        cleanAttrs += ' loading="lazy"';
      }

      return `<img ${cleanAttrs} class="max-w-full rounded-2xl shadow-md my-6 mx-auto block object-contain border border-[#D5C3B0]/40" />`;
    });

    // 7. Clean empty paragraph tags
    html = html.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');

    return html;
  } catch (err) {
    console.warn("cleanDocHtml parsing encountered an error in ResourceDetailPage, falling back to safe content:", err);
    return String(rawHtml).replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  }
}

/**
 * Estimate reading time in minutes based on word count
 */
function estimateReadingTime(content) {
  if (!content || typeof content !== 'string') return '3 min read';
  const cleanText = content.replace(/<[^>]*>/g, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// Convert date string to ISO YYYY-MM-DD
function formatToYMD(dateVal) {
  if (!dateVal) return new Date().toISOString().split('T')[0];
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${String(dmyMatch[2]).padStart(2, '0')}-${String(dmyMatch[1]).padStart(2, '0')}`;
    }
    const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (ymdMatch) {
      return `${ymdMatch[1]}-${String(ymdMatch[2]).padStart(2, '0')}-${String(ymdMatch[3]).padStart(2, '0')}`;
    }
  }
  const timestamp = parseDateToTimestamp(dateVal);
  if (timestamp > 0) {
    const d = new Date(timestamp);
    return d.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Converts Google Drive view/preview links into direct instant-download links:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing -> https://drive.google.com/uc?export=download&id=FILE_ID
 * - https://drive.google.com/open?id=FILE_ID -> https://drive.google.com/uc?export=download&id=FILE_ID
 * - Google Docs -> https://docs.google.com/document/d/DOC_ID/export?format=pdf
 */
function getDirectDownloadUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.replace(/&amp;/g, '&').trim();

  // 1. Google Drive File URLs
  if (/drive\.google\.com/i.test(cleanUrl)) {
    const fileIdMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
                        cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i) ||
                        cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/i);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
  }

  // 2. Google Docs Document URLs
  if (/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i.test(cleanUrl)) {
    const docIdMatch = cleanUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/i);
    if (docIdMatch && docIdMatch[1]) {
      return `https://docs.google.com/document/d/${docIdMatch[1]}/export?format=pdf`;
    }
  }

  return cleanUrl;
}

/**
 * Format model answer content with clean structure, subheadings (Approach, Introduction, Body, Conclusion),
 * and clean typography
 */
function formatAnswerContent(rawAnswer) {
  if (!rawAnswer || typeof rawAnswer !== 'string') return '';
  let formatted = rawAnswer.trim();

  // If plain text without HTML tags, convert newlines to paragraphs
  if (!/<[a-z][\s\S]*>/i.test(formatted)) {
    formatted = formatted
      .split(/\n\s*\n/)
      .map(p => `<p>${p.trim()}</p>`)
      .join('');
  }

  // Clean google redirect links
  formatted = formatted.replace(/href=["']https:\/\/www\.google\.com\/url\?q=([^&"']+)[^"']*["']/gi, (match, dest) => {
    try {
      return `href="${decodeURIComponent(dest)}" target="_blank" rel="noopener noreferrer"`;
    } catch (e) {
      return `href="${dest}" target="_blank" rel="noopener noreferrer"`;
    }
  });

  // Strip leading 'Answer:' label if left over
  formatted = formatted.replace(/^\s*(?:<p[^>]*>)?\s*(?:<strong>|<b>)?\s*(?:Answer|Model Answer|Solution|Explanation)\s*:\s*(?:<\/strong>|<\/b>)?(?:\s*<\/p>)?/i, '');

  // Format section headings: Approach, Introduction, Body, Critical Dimension, Key Points, Conclusion, etc.
  formatted = formatted.replace(
    /<p[^>]*>\s*(?:<strong>|<b>|<span[^>]*font-weight[^>]*>)\s*(Approach|Introduction|Body|Critical\s+Dimension|Key\s+Points|Key\s+Arguments|Analysis|Challenges|Way\s+Forward|Conclusion|Dimensions|Critical\s+Analysis)\s*:?\s*(?:<\/strong>|<\/b>|<\/span>)\s*<\/p>/gi,
    '<div class="pyq-answer-section-head font-serif font-bold text-[#6C1D18] text-base sm:text-lg border-b border-[#D5C3B0]/50 pb-1 mt-5 mb-2.5 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#8C3A27]"></span><span>$1:</span></div>'
  );

  // Clean trailing divider dashes and empty spacing divs
  formatted = formatted.replace(/<p[^>]*>\s*(?:---|–—|—)\s*<\/p>/gi, '');
  formatted = formatted.replace(/<div[^>]*style=["'][^"']*height[^"']*["'][^>]*>\s*<\/div>/gi, '');

  return formatted;
}

/**
 * Robust parser for UPSC Previous Year Question Papers
 * Extracts structured questions, mark limits, word limits, model answers, and original PDF download links.
 * Accommodates GS Papers 1-4 & Essay Papers (Section dividers, 4-digit word counts, 3-digit marks, sub-questions, and Case Studies).
 */
function parsePYQQuestions(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return { questions: [], downloadLink: null };

  // 1. Extract PDF download link if present
  let downloadLink = null;
  const linkMatch = rawHtml.match(/href=["']([^"']*(?:drive\.google|pdf|\/d\/)[^"']*)["']/i);
  if (linkMatch) {
    downloadLink = linkMatch[1];
  }

  // 2. Question identifier regex supporting sub-letters: e.g. Q1 (a), Q1. (a), Q8 (c), Q5 (e), Q7, 12.
  const qHeaderRegex = /(?:<p[^>]*>|<div[^>]*>|<li[^>]*>|^)\s*(?:<strong>|<b>|<span[^>]*>)?\s*Q?(\d+)(?:(?:\s*\.|\.)?\s*\(([a-zA-Z])\)|[\.:\)])\s*[\.:\)]?/im;
  const globalQHeaderRegex = /<(?:p|div|li)[^>]*>\s*(?:<strong>|<b>|<span[^>]*>)?\s*Q?(\d+)(?:(?:\s*\.|\.)?\s*\(([a-zA-Z])\)|[\.:\)])\s*[\.:\)]?/gi;

  // Section divider regex: e.g. "SECTION - A", "SECTION - B", "SECTION A", "SECTION B"
  const sectionHeaderRegex = /(?:<(?:p|div|h\d)[^>]*>|^)\s*(?:<strong>|<b>|<span[^>]*>)?\s*(SECTION\s*[-–—:]?\s*[A-Z](?:\s*[-–—:]\s*[^<\n]+)?)\s*(?:<\/strong>|<\/b>|<\/span>)?(?:\s*<\/(?:p|div|h\d)>|$)/im;

  const extractSection = (textBlock) => {
    if (!textBlock) return null;
    const sMatch = textBlock.match(sectionHeaderRegex);
    if (!sMatch) return null;
    const header = sMatch[1].trim();
    const withoutHeader = textBlock.replace(sMatch[0], '');
    const cleanInstructions = withoutHeader
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[\s\-_•|~]+$/, '')
      .trim();
    return {
      sectionHeader: header,
      sectionInstructions: cleanInstructions.length > 5 ? cleanInstructions : null
    };
  };

  // Universal Question Delimiter: Horizontal Rule (---, ***, ___ or <hr>)
  const hrDelimiterRegex = /(?:<p[^>]*>\s*(?:---|–—|—|\*\*\*|___)\s*<\/p>|<hr[^>]*>)/i;
  const hrChunks = rawHtml.split(hrDelimiterRegex).map(c => c.trim()).filter(c => c.length > 10);

  let rawQuestionChunks = [];
  let pendingSection = null;

  if (hrChunks.length >= 2) {
    // Delimited by universal horizontal rule (---)
    for (let i = 0; i < hrChunks.length; i++) {
      const chunk = hrChunks[i];
      const match = chunk.match(qHeaderRegex);

      if (match) {
        const qIndex = match.index || 0;
        const preQuestionBlock = chunk.substring(0, qIndex);
        const embeddedSection = extractSection(preQuestionBlock);
        const sectionToUse = embeddedSection || pendingSection;
        pendingSection = null;

        rawQuestionChunks.push({
          qNum: parseInt(match[1], 10),
          subLetter: match[2] ? match[2].toLowerCase() : null,
          sectionHeader: sectionToUse ? sectionToUse.sectionHeader : null,
          sectionInstructions: sectionToUse ? sectionToUse.sectionInstructions : null,
          rawChunk: chunk.substring(qIndex)
        });
      } else {
        // Non-question chunk: could be standalone section divider or download footer
        const sec = extractSection(chunk);
        if (sec) {
          pendingSection = sec;
        } else if (!downloadLink) {
          const dlMatch = chunk.match(/href=["']([^"']*(?:drive\.google|pdf|\/d\/)[^"']*)["']/i);
          if (dlMatch) downloadLink = dlMatch[1];
        }
      }
    }
  }

  // Fallback: If no horizontal rules found, split using global question boundary regex
  if (rawQuestionChunks.length === 0) {
    const pMatches = [...rawHtml.matchAll(globalQHeaderRegex)];
    if (pMatches.length >= 2) {
      for (let i = 0; i < pMatches.length; i++) {
        const start = pMatches[i].index;
        const end = (i + 1 < pMatches.length) ? pMatches[i + 1].index : rawHtml.length;
        const rawChunkSlice = rawHtml.substring(start, end);
        const qNum = parseInt(pMatches[i][1], 10) || (i + 1);
        const subLetter = pMatches[i][2] ? pMatches[i][2].toLowerCase() : null;

        const preamble = i === 0 ? rawHtml.substring(0, start) : '';
        const sec = extractSection(preamble) || extractSection(rawChunkSlice);

        rawQuestionChunks.push({
          qNum,
          subLetter,
          sectionHeader: sec ? sec.sectionHeader : null,
          sectionInstructions: sec ? sec.sectionInstructions : null,
          rawChunk: rawChunkSlice
        });
      }
    } else {
      const liMatches = [...rawHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
      if (liMatches.length > 0) {
        rawQuestionChunks = liMatches.map((m, idx) => ({
          qNum: idx + 1,
          subLetter: null,
          sectionHeader: null,
          sectionInstructions: null,
          rawChunk: m[1]
        }));
      }
    }
  }

  // Helper to parse individual question chunk
  const parseChunk = ({ qNum, subLetter, sectionHeader, sectionInstructions, rawChunk }, index) => {
    let questionPrompt = '';
    let promptHtml = '';
    let modelAnswer = null;

    // 1. Dynamic Number token: e.g. "Q1 (a)", "Q1 (b)", "Q7", "Q12"
    const displayNum = subLetter ? `Q${qNum} (${subLetter})` : `Q${qNum}`;
    const idKey = subLetter ? `${qNum}${subLetter}` : `${qNum}`;

    // 2. Dynamic Word limit: support up to 4 digits & ranges (e.g. 1000-1200 words, 150 words)
    let words = null;
    const wordsMatch = rawChunk.match(/\(?\s*(?:Answer in\s+)?(\d{2,4}(?:\s*[-–—to]\s*\d{2,4})?)\s*words?\)?/i);
    if (wordsMatch) {
      words = wordsMatch[1].replace(/\s+/g, '');
    }

    // 3. Dynamic Marks: support up to 3 digits (e.g. 125 Marks, 30 Marks, 20 Marks, 15 Marks, 10 Marks)
    // Check for explicit overall question marks line first (e.g. "(Answer in 450 words) | 30 Marks" or "| 30 Marks")
    const overallMarksMatch = rawChunk.match(/(?:\||\bAnswer\s+in[^\)]*\)\s*\|?)\s*(\d{1,3})\s*Marks\b/i);
    let marks = null;
    if (overallMarksMatch) {
      marks = overallMarksMatch[1];
    } else {
      const marksMatch = rawChunk.match(/\b(\d{1,3})\s*Marks\b/i);
      if (marksMatch) {
        marks = marksMatch[1];
      } else {
        const numInParensMatch = rawChunk.match(/(?:[\(\[]\s*(\d{1,2})\s*[\)\]])\s*(?:<\/p>|<\/div>|<br\s*\/?>|$)/i);
        if (numInParensMatch) {
          marks = numInParensMatch[1];
        } else {
          marks = qNum <= 10 ? '10' : '15';
        }
      }
    }

    // Delimiter for Answer / Model Answer / Solution / Approach / blockquote
    const answerDelimiterRegex = /(?:<(?:p|div)[^>]*>\s*(?:<strong>|<b>|<span[^>]*>)?\s*(?:Model\s+Answer|Answer|Solution|Explanation|Approach|Synopsis)\s*(?::|-|—)?\s*(?:<\/strong>|<\/b>|<\/span>)?\s*<\/(?:p|div)>|<blockquote[^>]*>)/i;
    const ansMatch = rawChunk.match(answerDelimiterRegex);

    let promptPartRaw = rawChunk;
    let answerPartRaw = null;

    if (ansMatch) {
      promptPartRaw = rawChunk.substring(0, ansMatch.index);
      answerPartRaw = rawChunk.substring(ansMatch.index + ansMatch[0].length);
      if (/blockquote/i.test(ansMatch[0])) {
        answerPartRaw = answerPartRaw.replace(/<\/blockquote>/i, '');
      }
    }

    // Sanitize Prompt: Multi-paragraph scenario & case study support
    const cleanPrompt = (rawPrompt) => {
      let cleaned = rawPrompt;

      // Cut off footer boilerplate / CTA / download notices
      const footerCtaRegex = /(?:👉|📌|\b(?:Click\s+(?:the\s+)?(?:link\s+)?(?:below|here)|Download\s+(?:the\s+)?(?:complete\s+)?(?:Question\s+Paper|PDF)|General\s+Studies\s*[-–—]?\s*Paper|GS\s*[-–—]?\s*Paper)\b|<a\s+[^>]*href)/i;
      const ctaMatch = cleaned.search(footerCtaRegex);
      if (ctaMatch !== -1) {
        cleaned = cleaned.substring(0, ctaMatch);
      }

      // Remove embedded section header line if present in promptPartRaw
      cleaned = cleaned.replace(/(?:<(?:p|div|h\d)[^>]*>|^)\s*(?:<strong>|<b>|<span[^>]*>)?\s*SECTION\s*[-–—:]?\s*[A-Z][^<]*(?:<\/strong>|<\/b>|<\/span>)?(?:\s*<\/(?:p|div|h\d)>|$)\s*/gi, '');

      // Remove leading question identifier prefix from start of prompt
      cleaned = cleaned.replace(/<(?:p|div|li)[^>]*>\s*(?:<strong>|<b>|<span[^>]*>)?\s*Q?(\d+)(?:(?:\s*\.|\.)?\s*\(([a-zA-Z])\)|[\.:\)])\s*[\.:\)]?\s*(?:Case\s+Study\s*:?\s*)?/i, (match) => {
        if (/case\s+study/i.test(match)) {
          return '<p class="font-bold text-[#6C1D18] mb-1 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#8C3A27]"></span><span>Case Study Scenario:</span></p><p>';
        }
        return '<p>';
      });

      // Strip word and marks instructions from prompt body (support 4-digit word limits and 3-digit marks)
      cleaned = cleaned.replace(/\(?\s*(?:Answer in\s+)?\d{2,4}(?:\s*[-–—to]\s*\d{2,4})?\s*words?\)?\s*(?:\||,|-)?\s*(?:\d{1,3}\s*marks?)?/gi, '');
      cleaned = cleaned.replace(/\(?\s*\d{1,3}\s*Marks\s*\)?/gi, '');
      cleaned = cleaned.replace(/(?:[\(\[]\s*(?:10|15|20|25|30|125)\s*[\)\]])\s*(?=<\/p>|<\/div>|<br\s*\/?>|$)/gi, '');

      // Clean empty spacing divs and empty paragraph tags
      cleaned = cleaned.replace(/<div[^>]*style=["'][^"']*height[^"']*["'][^>]*>\s*<\/div>/gi, '');
      cleaned = cleaned.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');

      // Format sub-questions (a), (b), (c), (d), (e) cleanly with indentations if present
      cleaned = cleaned.replace(/<p[^>]*>\s*(?:\((?:[a-eA-E])\)|\b[a-eA-E]\.)\s*([\s\S]*?)<\/p>/gi, (m) => {
        return `<p class="pl-3 sm:pl-4 border-l-2 border-[#8C3A27]/30 py-0.5 my-1 text-[#221814] font-medium">${m.replace(/<\/?p[^>]*>/gi, '')}</p>`;
      });

      // Extract pure plain-text version for fallback and reading time
      let plainText = cleaned
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s+([\.\?\,!])/g, '$1')
        .replace(/[\s\-_•|~]+$/, '')
        .trim();

      if (plainText && !/[\.\?\!"”’]$/.test(plainText)) {
        plainText += '.';
      }

      return {
        promptHtml: cleaned.trim(),
        text: plainText
      };
    };

    const promptResult = cleanPrompt(promptPartRaw);
    questionPrompt = promptResult.text;
    promptHtml = promptResult.promptHtml;

    // Process model answer if present (Empty Answer Rule: hidden unless substantive content exists)
    if (answerPartRaw) {
      const footerCtaRegex = /(?:👉|📌|\b(?:Click\s+(?:the\s+)?(?:link\s+)?(?:below|here)|Download\s+(?:the\s+)?(?:complete\s+)?(?:Question\s+Paper|PDF)|General\s+Studies\s*[-–—]?\s*Paper|GS\s*[-–—]?\s*Paper)\b|<a\s+[^>]*href)/i;
      const ctaMatch = answerPartRaw.search(footerCtaRegex);
      if (ctaMatch !== -1) {
        answerPartRaw = answerPartRaw.substring(0, ctaMatch);
      }

      const cleanAnswerText = answerPartRaw
        .replace(/<[^>]*>/g, '')
        .replace(/[\s\n\r\-•_]/g, '')
        .trim();

      const isPlaceholder = /^(?:comingsoon|tbd|tobereleased|tobeupdated|na|n\/a|modelanswerawaited|modelanswerwillbeupdatedsoon)$/i.test(cleanAnswerText);

      if (cleanAnswerText.length > 30 && !isPlaceholder) {
        modelAnswer = formatAnswerContent(answerPartRaw);
      }
    }

    return {
      qNum,
      subLetter,
      displayNum,
      idKey,
      sectionHeader,
      sectionInstructions,
      index: index + 1,
      text: questionPrompt,
      promptHtml,
      modelAnswer,
      marks,
      words
    };
  };

  const parsed = rawQuestionChunks.map(parseChunk);
  return { questions: parsed, downloadLink };
}

// Helper to normalize string keys by stripping non-alphanumeric characters
const normalizeKey = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function ResourceDetailPage({ slug, folder, year, stage, stream, navigate }) {
  const { data, loading: cmsLoading, isFetched: cmsFetched } = useCMSData();

  // Helper to check active status
  const isItemActive = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
    if (obj.Status && String(obj.Status).toLowerCase() === 'inactive') return false;
    if (obj.status && String(obj.status).toLowerCase() === 'inactive') return false;
    return true;
  };

  const targetSlug = slug || '';
  const targetNorm = normalizeKey(targetSlug);

  // Synchronous resolution of initial resource from router state or cache for 0ms render
  const initialResource = useMemo(() => {
    // 1. Navigation / router history state
    if (typeof window !== 'undefined') {
      const historyArt = 
        window.history?.state?.usr?.article || 
        window.history?.state?.article || 
        window.history?.state?.usr?.item || 
        window.history?.state?.item;
      if (historyArt && typeof historyArt === 'object') {
        const artSlug = historyArt.slug || historyArt.Slug || createSlug(historyArt.Title || historyArt.title || '');
        const docId = historyArt.docId || historyArt.Doc_ID || historyArt.id || '';
        if (
          artSlug === targetSlug ||
          normalizeKey(artSlug) === targetNorm ||
          normalizeKey(historyArt.Title || historyArt.title || '') === targetNorm ||
          (docId && normalizeKey(docId) === targetNorm)
        ) {
          return historyArt;
        }
      }
    }

    // 2. Synchronous cached CMS data from localStorage
    const cached = getCachedCMSData();
    const cachedResources = Array.isArray(cached?.resources) ? cached.resources.filter(isItemActive) : [];
    if (cachedResources.length > 0 && targetSlug) {
      const found = cachedResources.find(art => {
        const artTitle = art.Title || art.title || '';
        const artSlug = art.slug || art.Slug || createSlug(artTitle);
        const docId = art.docId || art.Doc_ID || art.id || '';
        return (
          artSlug === targetSlug ||
          normalizeKey(artSlug) === targetNorm ||
          normalizeKey(artTitle) === targetNorm ||
          (docId && normalizeKey(docId) === targetNorm)
        );
      });
      if (found) return found;
    }
    return null;
  }, [targetSlug, targetNorm]);

  // 1. Explicit Loading & Fetched States (0ms if initialResource found)
  const [isLoading, setIsLoading] = useState(!initialResource);
  const [isFetched, setIsFetched] = useState(Boolean(initialResource || isCMSNetworkFetched()));

  // Sorted list of active resources (latest first)
  const sortedResources = useMemo(() => {
    const list = Array.isArray(data?.resources) && data.resources.length > 0
      ? data.resources.filter(isItemActive)
      : (Array.isArray(getCachedCMSData()?.resources) ? getCachedCMSData().resources.filter(isItemActive) : []);
    return sortCurrentAffairsByDate(list);
  }, [data?.resources]);

  // Resilient article matching: direct slug, normalized slug, normalized title, or docId
  const currentIndex = useMemo(() => {
    if (!sortedResources || sortedResources.length === 0) return -1;
    return sortedResources.findIndex(art => {
      const artTitle = art.Title || art.title || '';
      const artSlug = art.slug || art.Slug || createSlug(artTitle);
      const docId = art.docId || art.Doc_ID || art.id || '';

      return (
        artSlug === targetSlug ||
        normalizeKey(artSlug) === targetNorm ||
        normalizeKey(artTitle) === targetNorm ||
        (docId && normalizeKey(docId) === targetNorm)
      );
    });
  }, [sortedResources, targetSlug, targetNorm]);

  const article = currentIndex !== -1 ? sortedResources[currentIndex] : initialResource;
  const resource = article;

  // 1. State Initialization: Reset isLoading and isFetched when route parameters change
  useEffect(() => {
    if (initialResource) {
      setIsLoading(false);
      setIsFetched(true);
    } else if (!isCMSNetworkFetched()) {
      setIsLoading(true);
      setIsFetched(false);
    }
  }, [slug, folder, year, stage, stream, initialResource]);

  // 2. Explicit Route Resolution Guard & Catching Route Hydration Delays
  useEffect(() => {
    // If router is hydrating or slug is not ready yet, keep displaying the loader
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      setIsLoading(true);
      setIsFetched(false);
      return;
    }

    if (resource) {
      // Resource matched successfully (from cache or fresh network response)
      setIsLoading(false);
      setIsFetched(true);
    } else if (isCMSNetworkFetched()) {
      // Live network fetch has completely settled and resource is verified absent
      setIsLoading(false);
      setIsFetched(true);
    } else {
      // Live network fetch actively pending
      setIsLoading(true);
      setIsFetched(false);
    }
  }, [resource, cmsLoading, cmsFetched, slug]);

  // Determine if this resource is in the syllabus context
  const isSyllabus = useMemo(() => {
    if (folder === 'upsc-syllabus') return true;
    if (article && isSyllabusResource(article)) return true;
    return false;
  }, [folder, article]);

  // Determine if this resource is in the PYQ context
  const isPYQ = useMemo(() => {
    if (folder === 'pyqs') return true;
    if (article && isPYQResource(article)) return true;
    return false;
  }, [folder, article]);

  // Detected examination year for PYQ
  const detectedYear = useMemo(() => {
    if (year) return year;
    if (article) return extractPYQYear(article);
    return 'General';
  }, [year, article]);

  // Detected examination stage for PYQ (Prelims vs Mains)
  const detectedStage = useMemo(() => {
    if (stage) {
      if (/prelims|preliminary/i.test(stage)) return 'Prelims';
      if (/mains|main\b/i.test(stage)) return 'Mains';
    }
    if (article) return extractPYQStage(article);
    return 'Mains';
  }, [stage, article]);

  // Detected category/stream for PYQ (General Studies, CSAT, Essay, Optional)
  const detectedCategory = useMemo(() => {
    if (stream) {
      const s = stream.toLowerCase();
      if (s === 'general-studies' || s === 'gs') return 'General Studies';
      if (s === 'csat') return 'CSAT';
      if (s === 'essay') return 'Essay';
      if (s === 'optional') return 'Optional';
    }
    if (article) return extractPYQCategory(article);
    return 'General Studies';
  }, [stream, article]);

  const paperName = useMemo(() => {
    if (!article) return 'Question Paper';
    return extractPYQPaperLabel(article) || extractPYQPaperName(article);
  }, [article]);

  // Context-aware resource list for previous/next navigation
  const contextResources = useMemo(() => {
    if (isPYQ) {
      let pyqList = sortedResources.filter(isPYQResource);
      if (detectedYear && detectedYear !== 'General') {
        pyqList = pyqList.filter(p => String(extractPYQYear(p)) === String(detectedYear));
      }
      if (detectedStage) {
        pyqList = pyqList.filter(p => extractPYQStage(p) === detectedStage);
      }
      return pyqList.length > 0 ? sortPYQPapers(pyqList) : sortedResources;
    }
    if (isSyllabus) {
      const syllabusList = sortedResources.filter(isSyllabusResource);
      return syllabusList.length > 0 ? syllabusList : sortedResources;
    }
    const nonSyllabusList = sortedResources.filter(a => !isSyllabusResource(a) && !isPYQResource(a));
    return nonSyllabusList.length > 0 ? nonSyllabusList : sortedResources;
  }, [sortedResources, isPYQ, isSyllabus, detectedYear, detectedStage]);

  const contextIndex = useMemo(() => {
    if (!article || !contextResources || contextResources.length === 0) return -1;
    return contextResources.findIndex(art => {
      const artTitle = art.Title || art.title || '';
      const artSlug = art.slug || art.Slug || createSlug(artTitle);
      const docId = art.docId || art.Doc_ID || art.id || '';

      return (
        artSlug === targetSlug ||
        normalizeKey(artSlug) === targetNorm ||
        normalizeKey(artTitle) === targetNorm ||
        (docId && normalizeKey(docId) === targetNorm)
      );
    });
  }, [contextResources, article, targetSlug, targetNorm]);

  const prevArticle = contextIndex > 0 ? contextResources[contextIndex - 1] : null;
  const nextArticle = contextIndex >= 0 && contextIndex < contextResources.length - 1 ? contextResources[contextIndex + 1] : null;

  // Extract article fields
  const title = article?.Title || article?.title || 'Study Resource';
  const date = formatDisplayDate(article?.Date || article?.date) || 'Recent';
  const category = article?.Category || article?.category || 'Study Material';
  const rawBanner = article?.Banner_Image || article?.banner_image || article?.Banner || article?.banner || article?.Image || article?.image;
  const bannerImage = getDirectImageUrl(rawBanner);
  const shortSummary = article?.Short_Summary || article?.short_summary || article?.Summary || article?.summary || article?.Description || article?.description || '';

  // Extract static Full_Content payload
  const rawFullContent = 
    article?.Full_Content || 
    article?.full_content || 
    article?.Article_HTML || 
    article?.article_html || 
    article?.HTML_Content || 
    article?.html_content || 
    article?.Content_HTML || 
    article?.content_html || 
    article?.HTML || 
    article?.html || 
    article?.Content || 
    article?.content || 
    article?.Article || 
    article?.article || 
    '';

  const fullContentHtml = rawFullContent ? cleanDocHtml(rawFullContent) : '';
  const readingTime = estimateReadingTime(fullContentHtml || shortSummary);

  // Parse structured questions for PYQ layout
  const { questions: pyqQuestions, downloadLink: pyqDownloadLink } = useMemo(() => {
    if (!isPYQ || !rawFullContent) return { questions: [], downloadLink: null };
    return parsePYQQuestions(rawFullContent);
  }, [isPYQ, rawFullContent]);

  // Dynamic Question Count and Maximum Marks Calculation
  const totalQuestions = pyqQuestions.length;

  const maximumMarks = useMemo(() => {
    if (!pyqQuestions || pyqQuestions.length === 0) return null;

    const isOptional = 
      /optional/i.test(title) || 
      /optional/i.test(paperName) || 
      /optional/i.test(category) ||
      (
        pyqQuestions.some(q => q.qNum === 8) && 
        pyqQuestions.some(q => q.sectionHeader && /SECTION\s*[-–—]?\s*B/i.test(q.sectionHeader)) && 
        !/essay/i.test(title) &&
        pyqQuestions.length <= 25
      );

    const isEssay = 
      /essay/i.test(title) || 
      /essay/i.test(paperName) || 
      /essay/i.test(category) || 
      (pyqQuestions.length === 8 && pyqQuestions.every(q => {
        const m = parseInt(String(q.marks).replace(/[^\d]/g, ''), 10);
        return m === 125;
      }));

    if (isEssay) {
      // UPSC Essay paper: candidates choose two 125-mark topics (1 from Section A, 1 from Section B)
      // Cap/evaluate to intended 250 marks (125 * 2)
      const firstQMarks = parseInt(String(pyqQuestions[0]?.marks).replace(/[^\d]/g, ''), 10) || 125;
      return firstQMarks * 2;
    }

    if (isOptional) {
      // UPSC Optional paper: candidates attempt 5 out of 8 questions (Total = 250 Marks)
      return 250;
    }

    // For all other papers (GS 1, 2, 3, 4):
    // Sum numeric marks parsed from each individual question
    const sum = pyqQuestions.reduce((acc, q) => {
      const m = parseInt(String(q.marks).replace(/[^\d]/g, ''), 10) || 0;
      return acc + m;
    }, 0);

    return sum > 0 ? sum : 250;
  }, [pyqQuestions, title, paperName, category]);

  // Direct PDF Download Link: converts Google Drive previews into automatic direct downloads
  const rawDownloadLink = pyqDownloadLink || article?.PDF_Link || article?.pdf_link || article?.Download_Link || article?.download_link || null;
  const directDownloadUrl = useMemo(() => getDirectDownloadUrl(rawDownloadLink), [rawDownloadLink]);

  // Interactive collapsible answer state for PYQ question cards
  const [expandedAnswers, setExpandedAnswers] = useState(new Set());

  const toggleAnswer = (key) => {
    setExpandedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const jumpToQuestion = (id) => {
    const el = document.getElementById(`q-${id}`);
    if (el) {
      const headerEl = document.getElementById('site-main-header');
      const headerHeight = headerEl ? headerEl.offsetHeight : 146;
      const jumpBarEl = document.getElementById('pyq-jump-bar');
      const jumpBarHeight = jumpBarEl ? jumpBarEl.offsetHeight : 54;
      const totalOffset = -(headerHeight + jumpBarHeight + 20);
      const y = el.getBoundingClientRect().top + window.pageYOffset + totalOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navigateToResource = (art) => {
    if (!art) return;
    const artTitle = art.Title || art.title || '';
    const artSlug = art.slug || art.Slug || art.id || art.ID || createSlug(artTitle);
    if (isPYQ || isPYQResource(art)) {
      navigate(getPYQPaperUrl(art));
    } else if (isSyllabus) {
      navigate(`/resources/upsc-syllabus/${artSlug}`);
    } else {
      navigate(`/resources/${artSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SEO & Dynamic Metadata: Document Title, Meta Description, Canonical Link, and JSON-LD Schema
  useEffect(() => {
    if (article && title) {
      const articleSlug = article.slug || article.Slug || createSlug(title);
      const isoDate = formatToYMD(article.Date || article.date);

      // 1. Set document title
      let pageTitle = `${title} | e-Gurukulam for IAS`;
      if (isPYQ) {
        pageTitle = `${paperName} (${detectedYear}) - UPSC ${detectedStage} PYQs | e-Gurukulam for IAS`;
      } else if (isSyllabus) {
        pageTitle = `${title} - UPSC Civil Services Syllabus | e-Gurukulam for IAS`;
      }
      document.title = pageTitle;

      // 2. Set / update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      const descContent = shortSummary || `${title} - In-depth study resource and analytical notes by e-Gurukulam for IAS.`;
      metaDesc.setAttribute('content', descContent);

      // 3. Set / update canonical link (Specific syllabus and PYQ canonical paths take strict priority)
      let canonicalUrl = '';
      if (isPYQ) {
        const stageStr = detectedStage ? detectedStage.toLowerCase() : 'mains';
        if (detectedYear && detectedYear !== 'General') {
          canonicalUrl = `https://egurukulamforias.com/resources/pyqs/${detectedYear}/${stageStr}/${articleSlug}`;
        } else {
          canonicalUrl = `https://egurukulamforias.com/resources/pyqs/${stageStr}/${articleSlug}`;
        }
      } else if (isSyllabus || folder === 'upsc-syllabus') {
        canonicalUrl = `https://egurukulamforias.com/resources/upsc-syllabus/${articleSlug}`;
      } else if (folder === 'pyqs') {
        const stageStr = stage ? stage.toLowerCase() : (detectedStage ? detectedStage.toLowerCase() : 'mains');
        if (year) {
          canonicalUrl = `https://egurukulamforias.com/resources/pyqs/${year}/${stageStr}/${articleSlug}`;
        } else {
          canonicalUrl = `https://egurukulamforias.com/resources/pyqs/${stageStr}/${articleSlug}`;
        }
      } else {
        canonicalUrl = `https://egurukulamforias.com/resources/${articleSlug}`;
      }

      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);

      // 4. Set / update meta keywords for Google AI indexing
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      const keywordsList = [
        'UPSC', 'IAS', 'Civil Services Examination',
        title,
        paperName,
        category,
        detectedYear !== 'General' ? `UPSC ${detectedYear}` : null,
        detectedStage ? `UPSC ${detectedStage}` : null,
        isPYQ ? 'Previous Year Questions' : null,
        isPYQ ? 'PYQ' : null,
        isSyllabus ? 'UPSC Syllabus' : null,
        'Akella Raghavendra', 'e-Gurukulam for IAS'
      ].filter(Boolean).join(', ');
      metaKeywords.setAttribute('content', keywordsList);

      // 5. Open Graph & Twitter Social Metadata
      const updateMetaTag = (attr, key, val) => {
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, key);
          document.head.appendChild(el);
        }
        el.setAttribute('content', val);
      };

      const posterImg = bannerImage
        ? (bannerImage.startsWith('http') ? bannerImage : `https://egurukulamforias.com${bannerImage}`)
        : 'https://egurukulamforias.com/images/egurukulam_logo.png';

      updateMetaTag('property', 'og:type', 'article');
      updateMetaTag('property', 'og:title', pageTitle);
      updateMetaTag('property', 'og:description', descContent);
      updateMetaTag('property', 'og:url', canonicalUrl);
      updateMetaTag('property', 'og:image', posterImg);
      updateMetaTag('name', 'twitter:card', 'summary_large_image');
      updateMetaTag('name', 'twitter:title', pageTitle);
      updateMetaTag('name', 'twitter:description', descContent);
      updateMetaTag('name', 'twitter:image', posterImg);

      // 6. Inject semantic Schema.org JSON-LD in head
      const schemaId = 'resource-schema-jsonld';
      let schemaScript = document.getElementById(schemaId);
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = schemaId;
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }

      const authorObj = [{
        '@type': 'Person',
        'name': 'Akella Raghavendra',
        'url': 'https://egurukulamforias.com/about'
      }];

      const publisherObj = {
        '@type': 'Organization',
        'name': 'e-Gurukulam for IAS',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://egurukulamforias.com/favicon-192x192.png'
        }
      };

      let schemaData = null;

      if (isPYQ) {
        const questionItems = (pyqQuestions || []).slice(0, 30).map((q, idx) => {
          const qText = q.text || `Question ${q.displayNum || (idx + 1)}`;
          const qItem = {
            '@type': 'Question',
            'name': `Question ${q.displayNum || q.qNum || (idx + 1)}`,
            'text': qText
          };
          if (q.modelAnswer) {
            const cleanAns = cleanDocHtml(q.modelAnswer).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1000);
            if (cleanAns) {
              qItem.acceptedAnswer = {
                '@type': 'Answer',
                'text': cleanAns
              };
            }
          }
          return qItem;
        });

        schemaData = {
          '@context': 'https://schema.org',
          '@type': 'Quiz',
          'name': `${title} | UPSC Civil Services Examination`,
          'headline': title,
          'description': descContent,
          'educationalAlignment': {
            '@type': 'AlignmentObject',
            'alignmentType': 'educationalSubject',
            'educationalFramework': 'UPSC Civil Services Examination',
            'targetName': `${detectedStage} Examination - ${paperName || 'General Studies'}`
          },
          'about': [
            { '@type': 'Thing', 'name': 'UPSC Civil Services Examination' },
            { '@type': 'Thing', 'name': `UPSC ${detectedStage}` },
            { '@type': 'Thing', 'name': paperName || 'General Studies' },
            ...(detectedYear && detectedYear !== 'General' ? [{ '@type': 'Thing', 'name': `UPSC ${detectedYear}` }] : [])
          ],
          ...(questionItems.length > 0 ? { 'hasPart': questionItems } : {}),
          'datePublished': isoDate,
          'dateModified': isoDate,
          'author': authorObj,
          'publisher': publisherObj,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': canonicalUrl
          }
        };
      } else if (isSyllabus) {
        schemaData = {
          '@context': 'https://schema.org',
          '@type': 'Course',
          'name': `${title} - UPSC Civil Services Syllabus`,
          'description': descContent,
          'provider': {
            '@type': 'Organization',
            'name': 'e-Gurukulam for IAS',
            'url': 'https://egurukulamforias.com'
          },
          'educationalAlignment': {
            '@type': 'AlignmentObject',
            'alignmentType': 'educationalSubject',
            'educationalFramework': 'UPSC Civil Services Examination',
            'targetName': title
          },
          'about': [
            { '@type': 'Thing', 'name': 'UPSC Civil Services Examination' },
            { '@type': 'Thing', 'name': 'UPSC Syllabus' },
            { '@type': 'Thing', 'name': title }
          ],
          'hasCourseInstance': {
            '@type': 'CourseInstance',
            'courseMode': 'blended',
            'courseWorkload': 'Self-paced comprehensive syllabus analysis'
          },
          'datePublished': isoDate,
          'dateModified': isoDate,
          'author': authorObj,
          'publisher': publisherObj,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': canonicalUrl
          }
        };
      } else {
        schemaData = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': title,
          'description': descContent,
          'image': posterImg ? [posterImg] : [],
          'educationalAlignment': {
            '@type': 'AlignmentObject',
            'alignmentType': 'educationalSubject',
            'educationalFramework': 'UPSC Civil Services Examination',
            'targetName': category || 'General Studies'
          },
          'datePublished': isoDate,
          'dateModified': isoDate,
          'author': authorObj,
          'publisher': publisherObj,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': canonicalUrl
          }
        };
      }

      schemaScript.textContent = JSON.stringify(schemaData);

      // 7. Inject BreadcrumbList JSON-LD
      const breadcrumbScriptId = 'resource-breadcrumbs-jsonld';
      let breadcrumbScript = document.getElementById(breadcrumbScriptId);
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script');
        breadcrumbScript.id = breadcrumbScriptId;
        breadcrumbScript.type = 'application/ld+json';
        document.head.appendChild(breadcrumbScript);
      }

      const breadcrumbsItems = [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://egurukulamforias.com/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': isPYQ ? 'Previous Year Questions' : (isSyllabus ? 'Syllabus' : 'Resources'),
          'item': isPYQ ? 'https://egurukulamforias.com/resources/pyqs' : (isSyllabus ? 'https://egurukulamforias.com/resources/upsc-syllabus' : 'https://egurukulamforias.com/resources')
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': title,
          'item': canonicalUrl
        }
      ];

      breadcrumbScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbsItems
      });
    }

    return () => {
      // Clean up JSON-LD on unmount
      const schemaScript = document.getElementById('resource-schema-jsonld');
      if (schemaScript) {
        schemaScript.remove();
      }
      const bcScript = document.getElementById('resource-breadcrumbs-jsonld');
      if (bcScript) {
        bcScript.remove();
      }
      // Reset og:type to website
      const ogType = document.querySelector('meta[property="og:type"]');
      if (ogType) ogType.setAttribute('content', 'website');
    };
  }, [article, title, shortSummary, bannerImage, isPYQ, isSyllabus, detectedYear, detectedStage, paperName, pyqQuestions, category]);

  // Intercept clicks on internal links within article HTML to prevent full page reloads
  const handleContentClick = (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    try {
      const url = new URL(href, window.location.origin);
      const isInternal = 
        url.origin === window.location.origin || 
        url.hostname.includes('egurukulamforias') ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1';

      if (isInternal) {
        e.preventDefault();
        const targetPath = url.pathname + url.search + url.hash;
        navigate(targetPath);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      if (href.startsWith('/')) {
        e.preventDefault();
        navigate(href);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // 3. Catching Route Hydration Delays
  const isRouterReady = Boolean(slug && typeof slug === 'string' && slug.trim().length > 0);

  // 1. INLINE LIGHTWEIGHT SKELETON PLACEHOLDER WHILE ROUTE/DATA IS SYNCING
  // Keeps header, navigation, and page framework mounted immediately
  if (!isRouterReady || isLoading || !isFetched) {
    const backLink = folder === 'upsc-syllabus' 
      ? '/resources/upsc-syllabus' 
      : folder === 'pyqs' 
        ? (year ? `/resources/pyqs/${year}` : '/resources/pyqs') 
        : '/resources';
    const backLabel = folder === 'upsc-syllabus' 
      ? 'Back to UPSC Syllabus' 
      : folder === 'pyqs' 
        ? (year ? `Back to ${year} PYQs` : 'Back to All PYQs') 
        : 'Back to Resources';

    return (
      <main className="min-h-screen bg-[#FFFDF8] text-[#221814] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div 
            className="sticky z-20 bg-[#FAF6EE] p-4 sm:p-5 rounded-3xl border border-[#D5C3B0] shadow-sm flex items-center justify-between" 
            style={{ top: 'var(--site-header-height, 134px)' }}
          >
            <button
              type="button"
              onClick={() => navigate(backLink)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </button>
            <div className="h-4 w-28 bg-[#D5C3B0]/30 rounded-full"></div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-[#D5C3B0]/30 rounded-md"></div>
              <div className="h-6 w-32 bg-[#D5C3B0]/20 rounded-md"></div>
            </div>
            <div className="h-10 sm:h-14 w-4/5 bg-[#D5C3B0]/30 rounded-2xl"></div>
            <div className="h-4 w-48 bg-[#D5C3B0]/20 rounded-md"></div>
            <div className="h-72 w-full bg-[#D5C3B0]/15 rounded-3xl mt-6"></div>
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-[#D5C3B0]/20 rounded"></div>
              <div className="h-4 w-11/12 bg-[#D5C3B0]/20 rounded"></div>
              <div className="h-4 w-4/5 bg-[#D5C3B0]/20 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. RESOURCE NOT FOUND STATE (ONLY AFTER LIVE CMS QUERY IS CONFIRMED COMPLETE)
  if (isFetched && !isLoading && !resource) {
    const backLink = folder === 'upsc-syllabus' 
      ? '/resources/upsc-syllabus' 
      : folder === 'pyqs' 
        ? (year ? `/resources/pyqs/${year}` : '/resources/pyqs') 
        : '/resources';
    const backLabel = folder === 'upsc-syllabus' 
      ? 'Back to UPSC Syllabus' 
      : folder === 'pyqs' 
        ? (year ? `Back to ${year} PYQs` : 'Back to All PYQs') 
        : 'Back to Resources';

    const recentResources = sortedResources.slice(0, 3);

    return (
      <main className="min-h-screen bg-[#FFFDF8] text-[#221814] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Top Sub-bar with header height offset */}
          <div 
            className="sticky z-20 bg-[#FAF6EE] p-4 sm:p-5 rounded-3xl border border-[#D5C3B0] shadow-sm flex items-center justify-between" 
            style={{ top: 'var(--site-header-height, 134px)' }}
          >
            <button
              type="button"
              onClick={() => navigate(backLink)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </button>
            <span className="text-xs font-mono font-bold text-[#7A6B5D] uppercase tracking-wider">
              Knowledge Repository
            </span>
          </div>

          {/* Clean Editorial Notice Card */}
          <div className="bg-[#FAF6EE] p-8 sm:p-10 rounded-3xl border border-[#D5C3B0] shadow-sm text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#8C3A27]/10 text-[#8C3A27] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814]">
              Resource Archived or Moved
            </h1>
            <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-semibold leading-relaxed max-w-lg mx-auto">
              The requested study resource or paper could not be located in our active index. Explore our latest available materials below, or browse the repository.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate(backLink)}
                className="btn-terracotta-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer inline-flex items-center gap-2"
              >
                <span>{backLabel}</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>

          {/* Latest Available Resources Grid */}
          {recentResources.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-[#D5C3B0]/60 pb-3">
                <h2 className="font-serif-header text-xl sm:text-2xl font-bold text-[#221814]">
                  Latest Available Resources
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/resources')}
                  className="text-xs font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentResources.map((item, idx) => {
                  const itemTitle = item.Title || item.title || 'Study Resource';
                  const itemDate = formatDisplayDate(item.Date || item.date) || 'Recent';
                  const itemCategory = item.Category || item.category || 'Study Material';
                  const itemSlug = item.slug || item.Slug || createSlug(itemTitle);
                  const itemSummary = item.Short_Summary || item.short_summary || item.Summary || item.summary || item.Description || item.description || '';

                  let targetUrl = `/resources/${encodeURIComponent(itemSlug)}`;
                  if (isSyllabusResource(item)) {
                    targetUrl = `/resources/upsc-syllabus/${encodeURIComponent(itemSlug)}`;
                  } else if (isPYQResource(item)) {
                    targetUrl = `/resources/pyqs/${encodeURIComponent(itemSlug)}`;
                  }

                  return (
                    <div
                      key={idx}
                      className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] overflow-hidden flex flex-col justify-between hover:border-[#8C3A27] transition-all shadow-sm group text-left cursor-pointer p-6 space-y-4"
                      onClick={() => navigate(targetUrl, { state: { resource: item } })}
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-2.5 py-1 rounded-md border border-[#8C3A27]/20">
                            <Tag className="w-3 h-3" />
                            <span>{itemCategory}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 font-serif text-[#7A6B5D] italic font-semibold">
                            <Calendar className="w-3 h-3" />
                            <span>{itemDate}</span>
                          </span>
                        </div>

                        <h3 className="font-serif-header text-base font-bold text-[#221814] leading-snug group-hover:text-[#8C3A27] transition-colors line-clamp-2">
                          {itemTitle}
                        </h3>

                        {itemSummary && (
                          <p className="text-xs text-[#3D3028] font-sans font-medium leading-relaxed line-clamp-3">
                            {itemSummary}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(targetUrl, { state: { resource: item } });
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-outline-pill text-xs py-2 px-4 font-serif font-bold transition-all cursor-pointer group/btn hover:bg-[#8C3A27] hover:text-white"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>OPEN RESOURCE &rarr;</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ==========================================================================
  // LEVEL 3: DEDICATED UPSC QUESTION PAPER LAYOUT (isPYQ === true)
  // ==========================================================================
  if (isPYQ) {
    const stageSlug = detectedStage.toLowerCase();
    const backToStageUrl = detectedYear && detectedYear !== 'General' 
      ? `/resources/pyqs/${detectedYear}/${stageSlug}` 
      : `/resources/pyqs/${stageSlug}`;
    const backToStageLabel = detectedYear && detectedYear !== 'General' 
      ? `Back to ${detectedYear} ${detectedStage} Papers` 
      : `Back to All ${detectedStage} Papers`;

    return (
      <div className="min-h-screen bg-[#FFFDF8] text-[#221814] py-12 px-4 sm:px-6 lg:px-8 select-text">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-left">
          
          {/* 1. TOP BREADCRUMB NAVIGATION */}
          <div className="bg-[#FAF6EE] p-4 sm:p-5 rounded-3xl border border-[#D5C3B0] shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(backToStageUrl)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>{backToStageLabel}</span>
              </button>

              <div className="hidden md:flex items-center gap-1.5 text-xs font-serif font-medium text-[#7A6B5D] pl-3 border-l border-[#D5C3B0]/60">
                <span onClick={() => navigate('/resources')} className="hover:text-[#8C3A27] cursor-pointer">Resources</span>
                <span>/</span>
                <span onClick={() => navigate('/resources/pyqs')} className="hover:text-[#8C3A27] cursor-pointer">PYQs</span>
                {detectedYear && detectedYear !== 'General' && (
                  <>
                    <span>/</span>
                    <span onClick={() => navigate(`/resources/pyqs/${detectedYear}`)} className="hover:text-[#8C3A27] cursor-pointer font-bold text-[#8C3A27]">{detectedYear}</span>
                  </>
                )}
                <span>/</span>
                <span onClick={() => navigate(`/resources/pyqs/${detectedYear}/${stageSlug}`)} className="hover:text-[#8C3A27] cursor-pointer font-bold text-[#8C3A27]">{detectedStage}</span>
                <span>/</span>
                <span className="text-[#5C4028] font-bold">{detectedCategory}</span>
              </div>
            </div>

            {/* Right Badges */}
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-3 py-1 rounded-md border border-[#8C3A27]/20">
                <Tag className="w-3.5 h-3.5" />
                <span>{detectedCategory}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[#5C4028] font-bold bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#D5C3B0]">
                <FileText className="w-3.5 h-3.5 text-[#8C3A27]" />
                <span>{totalQuestions} Questions</span>
              </span>
              {maximumMarks && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[#5C4028] font-bold bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#D5C3B0]">
                  <Award className="w-3.5 h-3.5 text-[#8C3A27]" />
                  <span>{maximumMarks} Marks</span>
                </span>
              )}
              {directDownloadUrl && (
                <a
                  href={directDownloadUrl}
                  download={`${createSlug(title || 'official-question-paper')}.pdf`}
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-[#8C3A27] text-white px-2.5 py-1 rounded-md hover:bg-[#732415] transition-colors shadow-2xs cursor-pointer"
                  title="Download Official Question Paper (PDF)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </a>
              )}
            </div>
          </div>

          {/* 2. STICKY QUESTION JUMP INDEX (Q1 TO Q20) */}
          {pyqQuestions.length > 0 && (
            <div 
              id="pyq-jump-bar"
              className="sticky z-20 bg-[#FAF6EE] p-3 rounded-2xl border border-[#D5C3B0] shadow-md flex items-center gap-2 overflow-x-auto scrollbar-thin transition-all"
              style={{ top: 'var(--site-header-height, 134px)' }}
            >
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7A6B5D] shrink-0 pl-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#8C3A27]" />
                <span>Questions:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {pyqQuestions.map((q) => {
                  const qKey = q.idKey || q.qNum;
                  return (
                    <button
                      key={qKey}
                      type="button"
                      onClick={() => jumpToQuestion(qKey)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#FFFDF8] hover:bg-[#8C3A27] text-[#221814] hover:text-white border border-[#D5C3B0] hover:border-[#8C3A27] transition-all shrink-0 cursor-pointer shadow-2xs whitespace-nowrap"
                    >
                      {q.displayNum || `Q${q.qNum}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. UNIFIED "QUESTION PAPER" BOOKLET CONTAINER */}
          <div className="card-parchment-3d rounded-3xl bg-[#FFFDF8] border-2 border-[#8C3A27]/30 shadow-md relative overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-b from-[#FFFDF8] via-[#FAF6EE] to-[#F5ECE0] p-6 sm:p-10 text-center space-y-6 border-b border-[#D5C3B0]">
              {/* National Emblem & Crest Motif */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FAF6EE] via-[#F4ECE1] to-[#EAE0D5] border-2 border-[#8C3A27]/40 mx-auto flex items-center justify-center shadow-inner relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-dashed border-[#8C3A27]/60 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[#8C3A27]" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-serif font-bold text-[#7A6B5D] tracking-widest uppercase">
                  संघ लोक सेवा आयोग
                </p>
                <h2 className="font-serif-header text-xl sm:text-2xl md:text-3xl font-extrabold text-[#221814] tracking-wider uppercase">
                  UNION PUBLIC SERVICE COMMISSION
                </h2>
                <p className="text-xs sm:text-sm font-mono font-bold text-[#8C3A27] uppercase tracking-wider pt-1">
                  CIVIL SERVICES ({detectedStage === 'Prelims' ? 'PRELIMINARY' : 'MAIN'}) EXAMINATION, {detectedYear}
                </p>
              </div>

              <div className="py-2.5 border-t-2 border-b-2 border-[#8C3A27]/30 max-w-2xl mx-auto">
                <h1 className="font-serif-header text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#6C1D18] tracking-tight uppercase">
                  {paperName}
                </h1>
              </div>

              {/* Exam Metadata Stats */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-serif font-bold text-[#3D3028]">
                <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-3.5 py-1.5 rounded-xl border border-[#D5C3B0] shadow-2xs">
                  <Clock className="w-4 h-4 text-[#8C3A27]" />
                  <span>Duration: 3 Hours</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-3.5 py-1.5 rounded-xl border border-[#D5C3B0] shadow-2xs">
                  <Award className="w-4 h-4 text-[#8C3A27]" />
                  <span>Maximum Marks: {maximumMarks !== null ? maximumMarks : (isPYQ ? 250 : '—')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-3.5 py-1.5 rounded-xl border border-[#D5C3B0] shadow-2xs">
                  <FileText className="w-4 h-4 text-[#8C3A27]" />
                  <span>Total Questions: {totalQuestions}</span>
                </div>
              </div>
            </div>

            {/* Inline Question List with Subtle Dividers */}
            <div className="divide-y divide-stone-200/80">
              {pyqQuestions.length > 0 ? (
                pyqQuestions.map((q, index) => {
                  const qKey = q.idKey || q.qNum;
                  const isAnswerExpanded = expandedAnswers.has(qKey);

                  return (
                    <React.Fragment key={qKey}>
                      {/* Section Divider Banner (e.g. SECTION - A, SECTION - B) */}
                      {q.sectionHeader && (
                        <div className="py-7 sm:py-9 px-4 text-center bg-gradient-to-r from-[#FAF6EE]/20 via-[#8C3A27]/8 to-[#FAF6EE]/20 border-y-2 border-[#8C3A27]/25 my-2 space-y-2">
                          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/30 text-[#6C1D18] font-serif-header font-extrabold text-sm sm:text-base tracking-widest uppercase shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{q.sectionHeader}</span>
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                          </div>
                          {q.sectionInstructions && (
                            <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-medium max-w-2xl mx-auto pt-1 leading-relaxed">
                              {q.sectionInstructions}
                            </p>
                          )}
                        </div>
                      )}

                      <div
                        id={`q-${qKey}`}
                        className="p-6 sm:p-10 space-y-4 transition-colors relative hover:bg-[#FAF6EE]/25"
                        style={{ scrollMarginTop: 'calc(var(--site-header-height, 146px) + 70px)' }}
                      >
                        {/* Question Top Bar */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="min-w-8 h-8 px-2.5 sm:h-9 sm:min-w-9 sm:px-3 rounded-xl bg-[#6C1D18] text-white font-mono font-bold text-xs sm:text-sm flex items-center justify-center shadow-2xs shrink-0 whitespace-nowrap">
                              {q.displayNum || `Q${q.qNum}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-1 rounded-lg bg-[#8C3A27]/10 text-[#8C3A27] font-mono font-bold text-xs border border-[#8C3A27]/20 shadow-2xs">
                              {q.marks} Marks
                            </span>
                            {q.words && (
                              <span className="px-2.5 py-1 rounded-lg bg-[#FAF6EE] text-[#5C4028] font-mono font-semibold text-xs border border-[#D5C3B0] shadow-2xs">
                                {q.words} Words
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Prompt Body - Multi-paragraph & Case Study scenario support */}
                        {q.promptHtml ? (
                          <div 
                            className="doc-article-content text-[#1C1613] font-serif text-base sm:text-lg leading-relaxed pt-1 select-text space-y-3 [&_p]:mb-3 [&_p]:leading-relaxed [&_strong]:font-bold [&_strong]:text-[#140C08]"
                            dangerouslySetInnerHTML={{ __html: q.promptHtml }}
                            onClick={handleContentClick}
                          />
                        ) : (
                          <p className="text-[#1C1613] font-serif text-base sm:text-lg leading-relaxed pt-1 select-text">
                            {q.text}
                          </p>
                        )}

                        {/* COLLAPSIBLE MODEL ANSWER ACCORDION */}
                        {q.modelAnswer && (
                          <div className="pt-2">
                            {/* Toggle Button */}
                            <button
                              type="button"
                              onClick={() => toggleAnswer(qKey)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-2xs ${
                                isAnswerExpanded
                                  ? 'bg-[#6C1D18] text-white border border-[#6C1D18] hover:bg-[#8C3A27]'
                                  : 'bg-[#8C3A27]/8 text-[#8C3A27] border border-[#8C3A27]/25 hover:bg-[#8C3A27]/15 hover:border-[#8C3A27]/40'
                              }`}
                              aria-expanded={isAnswerExpanded}
                              aria-controls={`answer-${qKey}`}
                            >
                              <span>{isAnswerExpanded ? 'Hide Model Answer' : 'View Model Answer'}</span>
                              {isAnswerExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Smooth Expanding Container */}
                            <div
                              id={`answer-${qKey}`}
                              className={`grid transition-all duration-300 ease-in-out ${
                                isAnswerExpanded
                                  ? 'grid-rows-[1fr] opacity-100 mt-3.5'
                                  : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                              }`}
                            >
                              <div className="overflow-hidden">
                                <div className="rounded-2xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF6EE] to-[#F5ECE0] border-l-4 border-[#6C1D18] border-r border-t border-b border-[#D5C3B0]/60 p-5 sm:p-6 shadow-2xs space-y-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5C3B0]/40 pb-2.5">
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#6C1D18] bg-[#6C1D18]/10 px-2.5 py-0.5 rounded-md border border-[#6C1D18]/20">
                                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                                      <span>Model Answer &amp; Faculty Synopsis</span>
                                    </span>
                                    {q.words && (
                                      <span className="text-[11px] font-mono text-[#7A6B5D] font-medium">
                                        Target: ~{q.words} Words
                                      </span>
                                    )}
                                  </div>

                                  <div
                                    className="doc-article-content text-stone-800 text-sm sm:text-base leading-relaxed font-sans [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_li]:leading-relaxed [&_strong]:font-bold [&_strong]:text-[#140C08] [&_blockquote]:border-l-2 [&_blockquote]:border-[#8C3A27] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#5C4028]"
                                    dangerouslySetInnerHTML={{ __html: q.modelAnswer }}
                                    onClick={handleContentClick}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Question Footer Bar */}
                        <div className="pt-2 flex items-center text-xs text-[#7A6B5D] font-mono border-t border-[#D5C3B0]/30">
                          <span>UPSC CSE {detectedYear} &bull; {detectedStage} &bull; {paperName || 'Question Paper'}</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              ) : (
                <div 
                  className="p-6 sm:p-10 doc-article-content editorial-article-body prose prose-stone max-w-none text-stone-800 text-base md:text-lg leading-relaxed font-sans select-text my-4"
                  dangerouslySetInnerHTML={{ __html: fullContentHtml }} 
                  onClick={handleContentClick}
                />
              )}
            </div>

            {/* End of All Questions - Official PDF Download Section */}
            {directDownloadUrl && (
              <div className="p-6 sm:p-8 bg-[#FAF6EE] border-t border-[#D5C3B0] text-center">
                <a
                  href={directDownloadUrl}
                  download={`${createSlug(title || 'official-question-paper')}.pdf`}
                  className="inline-flex items-center justify-center gap-2 btn-terracotta-pill text-xs sm:text-sm py-3 px-6 font-serif font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official Question Paper (PDF)</span>
                </a>
              </div>
            )}
          </div>

          {/* 5. BOTTOM NAVIGATION (RETURN TO PAPERS + NEXT QUESTION PAPER) */}
          <div className="bg-[#FAF6EE] p-5 sm:p-6 rounded-3xl border border-[#D5C3B0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate(backToStageUrl)}
                className="btn-terracotta-outline-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer shrink-0 w-full sm:w-auto"
              >
                <span>&larr; {backToStageLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/resources/pyqs')}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all cursor-pointer text-xs font-serif font-bold text-[#7A6B5D] hover:text-[#8C3A27]"
              >
                <span>All PYQ Years</span>
              </button>

              {prevArticle && (
                <button
                  type="button"
                  onClick={() => navigateToResource(prevArticle)}
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all group cursor-pointer text-xs font-serif font-bold text-[#221814] hover:text-[#8C3A27]"
                  title={prevArticle.Title || prevArticle.title}
                >
                  <ChevronLeft className="w-4 h-4 text-[#8C3A27] group-hover:-translate-x-0.5 transition-transform" />
                  <span>Previous Paper</span>
                </button>
              )}
            </div>

            {nextArticle && (
              <button
                type="button"
                onClick={() => navigateToResource(nextArticle)}
                className="flex items-center justify-end text-right gap-3 p-3 sm:p-3.5 px-5 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all group cursor-pointer w-full sm:w-auto max-w-md shadow-2xs hover:shadow-xs sm:ml-auto"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8C3A27] tracking-wider block">
                    NEXT QUESTION PAPER
                  </span>
                  <p className="text-xs sm:text-sm font-serif font-bold text-[#221814] line-clamp-1 group-hover:text-[#8C3A27] transition-colors">
                    {nextArticle.Title || nextArticle.title}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8C3A27] shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // 3. FULL EDITORIAL RESOURCE VIEW
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#221814] py-12 px-4 sm:px-6 lg:px-8 select-text">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-left">
        
        {/* 1. STICKY BACK NAVIGATION BAR */}
        <div className="sticky z-20 bg-[#FAF6EE] p-4 sm:p-5 rounded-3xl border border-[#D5C3B0] shadow-sm flex flex-wrap items-center justify-between gap-4" style={{ top: 'var(--site-header-height, 134px)' }}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(isSyllabus ? '/resources/upsc-syllabus' : '/resources')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{isSyllabus ? 'Back to UPSC Syllabus' : 'Back to Resources'}</span>
            </button>

            {isSyllabus && (
              <div className="hidden md:flex items-center gap-1.5 text-xs font-serif font-medium text-[#7A6B5D] pl-3 border-l border-[#D5C3B0]/60">
                <span onClick={() => navigate('/resources')} className="hover:text-[#8C3A27] cursor-pointer">Resources</span>
                <span>/</span>
                <span onClick={() => navigate('/resources/upsc-syllabus')} className="hover:text-[#8C3A27] cursor-pointer text-[#8C3A27] font-bold">UPSC Syllabus</span>
              </div>
            )}
          </div>

          {/* Badges: Category tags & Date */}
          <div className="flex items-center gap-2 text-xs">
            {category && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-3 py-1 rounded-md border border-[#8C3A27]/20">
                <Tag className="w-3.5 h-3.5" />
                <span>{category}</span>
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1.5 font-serif text-[#7A6B5D] italic font-semibold">
                <Calendar className="w-3.5 h-3.5 text-[#8C3A27]" />
                <span>{date}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-mono text-[#7A6B5D] font-medium bg-[#140C08]/5 px-2.5 py-0.5 rounded-md hidden sm:inline-flex">
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{readingTime}</span>
            </span>
          </div>
        </div>

        {/* 2. TITLE: BOLD BURGUNDY (#6C1D18) SERIF HEADLINE */}
        <h1 className="text-[#6C1D18] font-serif text-3xl md:text-5xl font-bold mb-6 pb-6 border-b border-[#D5C3B0]/60 leading-tight tracking-tight">
          {title}
        </h1>

        {/* 3. HERO BANNER IMAGE */}
        {bannerImage && (
          <div className="w-full overflow-hidden rounded-3xl border border-[#D5C3B0] shadow-xl max-h-[480px] bg-black/5">
            <img 
              src={bannerImage} 
              alt={title} 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[480px] mx-auto block"
              onError={(e) => {
                const secondary = getSecondaryImageUrl(rawBanner);
                if (secondary && e.target.src !== secondary) {
                  e.target.src = secondary;
                } else {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }
              }}
            />
          </div>
        )}

        {/* 4. SUMMARY HIGHLIGHT CONTAINER */}
        {shortSummary && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F4ECE1] border-l-4 border-[#8C3A27] text-[#3D3028] font-serif italic text-base sm:text-lg leading-relaxed shadow-2xs">
            {shortSummary}
          </div>
        )}

        {/* 5. FULL ARTICLE CONTENT CONTAINER WITH PROSE & UNCONSTRAINED SPACING */}
        {fullContentHtml ? (
          <div 
            className="doc-article-content editorial-article-body prose prose-stone max-w-none text-stone-800 text-base md:text-lg leading-relaxed font-sans select-text my-8 [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:font-serif [&_h1]:text-[#6C1D18] [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-[#D5C3B0]/60 [&_h1]:pb-2 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:font-serif [&_h2]:text-[#6C1D18] [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-[#D5C3B0]/40 [&_h2]:pb-1.5 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:font-serif [&_h3]:text-[#8B261E] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_p]:leading-relaxed [&_p]:text-[#2C221E] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-5 [&_ul]:text-[#3D3028] [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-5 [&_ol]:text-[#3D3028] [&_li]:leading-relaxed [&_strong]:font-bold [&_strong]:text-[#140C08] [&_b]:font-bold [&_b]:text-[#140C08] [&_blockquote]:border-l-4 [&_blockquote]:border-[#8C3A27] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#5C4028] [&_blockquote]:my-6 [&_blockquote]:bg-[#8C3A27]/5 [&_blockquote]:py-3 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-xl [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:mx-auto [&_img]:my-6 [&_img]:max-h-[500px] [&_img]:object-contain [&_img]:block [&_img]:border [&_img]:border-[#D5C3B0]/40 [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:rounded-xl [&_table]:overflow-hidden [&_td]:border [&_td]:border-[#D5C3B0] [&_td]:p-3 [&_td]:text-sm [&_th]:border [&_th]:border-[#D5C3B0] [&_th]:p-3 [&_th]:bg-[#FAF6EE] [&_th]:font-bold [&_th]:text-[#6C1D18] [&_th]:text-sm [&_a]:text-[#8C3A27] hover:[&_a]:text-[#6C1D18] [&_a]:underline [&_a]:underline-offset-2"
            dangerouslySetInnerHTML={{ __html: fullContentHtml }} 
            onClick={handleContentClick}
          />
        ) : (
          <div className="py-12 text-center space-y-3 bg-[#FAF6EE] p-8 rounded-3xl border border-[#D5C3B0]">
            <ShieldAlert className="w-10 h-10 text-[#8C3A27] mx-auto opacity-80" />
            <h3 className="font-serif-header text-xl font-bold text-[#221814]">
              Resource Content Briefing Finalizing
            </h3>
            <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-semibold">
              The full analytical briefing for this study resource is being finalized by our faculty.
            </p>
          </div>
        )}

        {/* 6. BOTTOM NAVIGATION (ALL RESOURCES + READ NEXT) */}
        <div className="bg-[#FAF6EE] p-5 sm:p-6 rounded-3xl border border-[#D5C3B0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left: Return Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(isSyllabus ? '/resources/upsc-syllabus' : '/resources')}
              className="btn-terracotta-outline-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <span>{isSyllabus ? '← UPSC Syllabus Directory' : '← All Study Resources'}</span>
            </button>

            {isSyllabus && (
              <button
                type="button"
                onClick={() => navigate('/resources')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all cursor-pointer text-xs font-serif font-bold text-[#7A6B5D] hover:text-[#8C3A27]"
              >
                <span>All Resources</span>
              </button>
            )}

            {prevArticle && (
              <button
                type="button"
                onClick={() => navigateToResource(prevArticle)}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all group cursor-pointer text-xs font-serif font-bold text-[#221814] hover:text-[#8C3A27]"
                title={prevArticle?.Title || prevArticle?.title || 'Previous Resource'}
              >
                <ChevronLeft className="w-4 h-4 text-[#8C3A27] group-hover:-translate-x-0.5 transition-transform" />
                <span>Previous</span>
              </button>
            )}
          </div>

          {/* Right: READ NEXT Card */}
          {nextArticle && (
            <button
              type="button"
              onClick={() => navigateToResource(nextArticle)}
              className="flex items-center justify-end text-right gap-3 p-3 sm:p-3.5 px-5 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0]/60 hover:border-[#8C3A27] transition-all group cursor-pointer w-full sm:w-auto max-w-md shadow-2xs hover:shadow-xs sm:ml-auto"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C3A27] tracking-wider block">
                  READ NEXT
                </span>
                <p className="text-xs sm:text-sm font-serif font-bold text-[#221814] line-clamp-1 group-hover:text-[#8C3A27] transition-colors">
                  {nextArticle?.Title || nextArticle?.title || 'Next Resource'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8C3A27] shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
