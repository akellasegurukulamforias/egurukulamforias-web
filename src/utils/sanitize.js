/**
 * Frontend Input Sanitization & Anti-Spam Security Utility
 * e-Gurukulam for IAS Production Security Suite
 */

/**
 * Sanitizes input string by stripping raw HTML tags, script vectors, and zero-width characters.
 * @param {string|any} input 
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    // Remove raw HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Escape quotes and dangerous characters
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/\0/g, '')
    .trim();
}

/**
 * Recursively sanitizes all string properties in a payload object.
 * @param {Object} payload 
 * @returns {Object} Payload with all string fields sanitized
 */
export function sanitizePayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  const sanitized = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => typeof item === 'string' ? sanitizeInput(item) : item);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Checks if honeypot trap field was filled by a spam bot.
 * @param {string} honeypotValue 
 * @returns {boolean} True if spam detected
 */
export function isSpamBot(honeypotValue) {
  return typeof honeypotValue === 'string' && honeypotValue.trim().length > 0;
}

/**
 * Simple client-side submission timestamp rate limiter (3 second minimum delay between submissions)
 */
const submissionTimestamps = new Map();

export function isRateLimited(formId = 'default', cooldownMs = 3000) {
  const now = Date.now();
  const lastSubmit = submissionTimestamps.get(formId) || 0;
  
  if (now - lastSubmit < cooldownMs) {
    return true; // Rate limited!
  }
  
  submissionTimestamps.set(formId, now);
  return false; // Clear to submit
}
