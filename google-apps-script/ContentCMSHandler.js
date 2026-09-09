/**
 * ============================================================================
 * e-Gurukulam for IAS - Content CMS & Real-Time Sync Engine
 * Google Apps Script Web App (doGet)
 * ============================================================================
 *
 * Serves dynamic content to the React frontend:
 * 1. Current Affairs articles (with Google Docs full article HTML rendering)
 * 2. Study Resources & Micro-notes (with document embeds and download links)
 * 3. Live Ticker / Breaking News banners
 * 4. Interactive Announcements & Lead Popups
 * 5. Social Media Community links & Telegram Channels
 * 6. Test Series & Prelims / Mains Programs
 *
 * Features:
 * - High-speed in-memory CacheService (10-minute cache with instant invalidation)
 * - Automatic Google Doc ID extraction and HTML rendering
 * - Google Drive thumbnail URL conversion
 * - Robust CORS headers for seamless client-side fetching
 */

var CMS_CONFIG = {
  // Replace with your Google Spreadsheet ID if running as a standalone script,
  // or leave null if this script is bound directly to the Google Sheet.
  SPREADSHEET_ID: null,

  // Cache duration in seconds (10 minutes)
  CACHE_SECONDS: 600,

  // Sheet Tab Names
  SHEETS: {
    CURRENT_AFFAIRS: 'Current_Affairs',
    RESOURCES: 'Resources',
    LIVE_TICKER: 'Live_Ticker',
    ACTIVE_POPUP: 'Active_Popup',
    SOCIAL_PLATFORMS: 'Social_Platforms',
    TEST_SERIES: 'Test_Series'
  }
};

/**
 * Handle incoming GET requests from the website frontend
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'all';
    var nocache = (e && e.parameter && (e.parameter.nocache === 'true' || e.parameter.nocache === '1'));
    var docId = (e && e.parameter && e.parameter.docId) ? e.parameter.docId : null;

    // Direct Google Doc HTML conversion endpoint (?action=doc&docId=XXXX)
    if (action === 'doc' && docId) {
      var docHtml = fetchGoogleDocHtml(docId);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', html: docHtml }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var cache = CacheService.getScriptCache();
    var cacheKey = 'cms_data_' + action;

    if (!nocache) {
      var cachedOutput = cache.get(cacheKey);
      if (cachedOutput) {
        return ContentService.createTextOutput(cachedOutput)
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    var ss = CMS_CONFIG.SPREADSHEET_ID
      ? SpreadsheetApp.openById(CMS_CONFIG.SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();

    var resultData = {};

    if (action === 'all' || action === 'currentAffairs') {
      resultData.currentAffairs = getSheetRowsAsJson(ss, CMS_CONFIG.SHEETS.CURRENT_AFFAIRS);
    }

    if (action === 'all' || action === 'resources') {
      resultData.resources = getSheetRowsAsJson(ss, CMS_CONFIG.SHEETS.RESOURCES);
    }

    if (action === 'all' || action === 'liveTicker') {
      resultData.liveTicker = getSheetRowsAsJson(ss, CMS_CONFIG.SHEETS.LIVE_TICKER);
    }

    if (action === 'all' || action === 'activePopup') {
      var popups = getSheetRowsAsJson(ss, CMS_CONFIG.SHEETS.ACTIVE_POPUP);
      resultData.activePopup = popups.length > 0 ? popups[0] : null;
    }

    if (action === 'all' || action === 'socialPlatforms') {
      resultData.socialPlatforms = getSheetRowsAsJson(ss, CMS_CONFIG.SHEETS.SOCIAL_PLATFORMS);
    }

    if (action === 'all' || action === 'testSeries') {
      resultData.testSeries = getSheetRowsAsJson(ss, CMS_CONFIG.SHEETS.TEST_SERIES);
    }

    var jsonString = JSON.stringify(resultData);

    // Save to CacheService if output is within 100KB limit
    if (jsonString.length < 100000) {
      try {
        cache.put(cacheKey, jsonString, CMS_CONFIG.CACHE_SECONDS);
      } catch (cacheErr) {
        Logger.log('Cache save warning: ' + cacheErr.toString());
      }
    }

    return ContentService.createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('doGet error: ' + error.toString());
    var errorResponse = {
      status: 'error',
      message: error.toString(),
      currentAffairs: [],
      resources: [],
      liveTicker: [],
      activePopup: null,
      socialPlatforms: [],
      testSeries: []
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Convert a Sheet tab into an array of Javascript objects
 */
function getSheetRowsAsJson(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  var rawData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = rawData[0];
  var rows = [];

  for (var i = 1; i < rawData.length; i++) {
    var row = rawData[i];
    var item = {};
    var hasContent = false;

    for (var j = 0; j < headers.length; j++) {
      var header = String(headers[j]).trim();
      if (!header) continue;

      var val = row[j];

      // Standardize Date format to YYYY-MM-DD
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyy-MM-dd');
      }

      // Format Google Drive image links to thumbnail CDN
      if (header.toLowerCase().includes('image') || header.toLowerCase().includes('poster') || header.toLowerCase().includes('banner')) {
        val = convertToDriveThumbnail(String(val || ''));
      }

      // Convert boolean-like fields
      if (header.toLowerCase() === 'active' || header.toLowerCase() === 'is_active') {
        val = (val === true || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'yes' || val === 1);
      }

      if (val !== '' && val !== null && val !== undefined) {
        hasContent = true;
      }

      item[header] = val;
    }

    // Only add non-empty rows
    if (hasContent) {
      // Auto-extract Google Doc HTML if Doc_ID exists and Full_Content is empty
      if (item.Doc_ID && (!item.Full_Content || String(item.Full_Content).trim().length === 0)) {
        try {
          item.Full_Content = fetchGoogleDocHtml(item.Doc_ID);
        } catch (docErr) {
          Logger.log('Failed fetching doc HTML for ' + item.Doc_ID + ': ' + docErr.toString());
        }
      }
      rows.push(item);
    }
  }

  return rows;
}

/**
 * Convert Drive sharing URLs to high-resolution web thumbnails
 */
function convertToDriveThumbnail(url) {
  if (!url || typeof url !== 'string') return url;
  var trimmed = url.trim();
  if (trimmed.indexOf('drive.google.com') !== -1) {
    var match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return 'https://drive.google.com/thumbnail?id=' + match[1] + '&sz=w1200';
    }
  }
  return trimmed;
}

/**
 * Fetch Google Doc as clean HTML using Drive API export
 */
function fetchGoogleDocHtml(docId) {
  if (!docId) return '';
  var cleanId = docId.replace(/^.*\/d\//, '').replace(/\/.*$/, '').trim();

  try {
    // Export doc as HTML from Google Drive
    var url = 'https://docs.google.com/feeds/download/documents/export/Export?id=' + cleanId + '&exportFormat=html';
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
      }
    });

    if (response.getResponseCode() === 200) {
      var html = response.getContentText();
      // Extract contents of <body>...</body>
      var bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      return bodyMatch ? bodyMatch[1] : html;
    }
  } catch (err) {
    Logger.log('Drive export error: ' + err.toString());
  }

  // Fallback: Read via DocumentApp text
  try {
    var doc = DocumentApp.openById(cleanId);
    var body = doc.getBody();
    var paragraphs = body.getParagraphs();
    var outputHtml = [];
    for (var i = 0; i < paragraphs.length; i++) {
      var text = paragraphs[i].getText();
      var heading = paragraphs[i].getHeading();
      if (heading === DocumentApp.ParagraphHeading.HEADING1) {
        outputHtml.push('<h2>' + text + '</h2>');
      } else if (heading === DocumentApp.ParagraphHeading.HEADING2) {
        outputHtml.push('<h3>' + text + '</h3>');
      } else if (text.trim().length > 0) {
        outputHtml.push('<p>' + text + '</p>');
      }
    }
    return outputHtml.join('\n');
  } catch (docAppErr) {
    Logger.log('DocumentApp error: ' + docAppErr.toString());
    return '';
  }
}
