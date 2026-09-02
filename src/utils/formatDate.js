// src/utils/formatDate.js
// Universal date formatting helper for standard Indian DD/MM/YYYY display format

/**
 * Formats date strings coming from Google Sheet CMS or ISO sources into Indian DD/MM/YYYY display format.
 * Prevents US locale interpretation issues (e.g. 01/09/2026 showing as 09/01/2026).
 *
 * @param {string|Date|number} dateStr - Raw date value from CMS
 * @returns {string} Formatted DD/MM/YYYY string
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  
  // If format is DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY
  const parts = str.split(/[\/\-\.]/);
  if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    // Return standard Indian display format: DD/MM/YYYY
    return `${day}/${month}/${year}`;
  }
  
  // Fallback for Date objects or ISO strings (e.g., 2026-09-01T00:00:00.000Z)
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return str;
}
