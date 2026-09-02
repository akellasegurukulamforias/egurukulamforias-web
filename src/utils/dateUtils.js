// src/utils/dateUtils.js
// Universal date parsing and sorting utilities for CMS and frontend components

/**
 * Parses diverse date formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, textual dates, etc.) into a Unix timestamp (ms).
 * Returns 0 if unparseable.
 */
export function parseDateToTimestamp(dateVal) {
  if (!dateVal) return 0;
  if (typeof dateVal === 'number') return dateVal;
  if (dateVal instanceof Date) return dateVal.getTime();
  if (typeof dateVal !== 'string') return 0;

  const trimmed = dateVal.trim();
  if (!trimmed) return 0;

  // 1. Match DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY (e.g., "28/08/2026", "20-08-2026", "5/8/2026")
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed month
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.getTime();
    }
  }

  // 2. Match YYYY-MM-DD or YYYY/MM/DD (e.g. "2026-08-28")
  const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.getTime();
    }
  }

  // 3. Match DD/MM/YY or DD-MM-YY (e.g. "28/08/26")
  const dmyShortMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (dmyShortMatch) {
    const day = parseInt(dmyShortMatch[1], 10);
    const month = parseInt(dmyShortMatch[2], 10) - 1;
    let year = parseInt(dmyShortMatch[3], 10);
    year += year < 50 ? 2000 : 1900;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.getTime();
    }
  }

  // 4. Standard Date.parse (e.g., "28 Aug 2026", "August 28, 2026", ISO 8601 strings)
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return 0;
}

/**
 * Sorts Current Affairs or other date-based CMS arrays in descending order (latest first).
 */
export function sortCurrentAffairsByDate(items) {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    const dateA = a?.Date || a?.date || a?.Published_Date || a?.published_date || a?.Created_At || a?.created_at || '';
    const dateB = b?.Date || b?.date || b?.Published_Date || b?.published_date || b?.Created_At || b?.created_at || '';

    const timeA = parseDateToTimestamp(dateA);
    const timeB = parseDateToTimestamp(dateB);

    return timeB - timeA; // Descending order (latest timestamp first)
  });
}

export { formatDisplayDate } from './formatDate';

