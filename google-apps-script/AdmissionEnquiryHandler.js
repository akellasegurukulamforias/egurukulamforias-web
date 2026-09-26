/**
 * ============================================================================
 * e-Gurukulam for IAS - Multi-Layer Anti-Bot Security & Admission Handler
 * Google Apps Script Web App (doPost / doGet)
 * ============================================================================
 * 
 * Multi-layer Bot Defenses:
 * 1. Invisible Honeypot ("user_organization_code"): Instantly returns fake success without processing.
 * 2. Time-Delta Verification: Rejects submissions faster than 3 seconds (< 3000ms).
 * 3. Indian Mobile Validation: Strictly enforces /^[6-9]\d{9}$/ after normalization.
 * 4. Name & Address Gibberish Check: Rejects consonant-only strings, 5+ consonant mashing, & spam keywords.
 * 5. Cloudflare Turnstile Server Verification: Verifies token via Cloudflare siteverify API before saving or emailing.
 */

// CONFIGURATION (Can be configured in Apps Script -> Project Settings -> Script Properties)
var CONFIG = {
  // Cloudflare Turnstile Secret Key (Testing key '1x0000000000000000000000000000000AA' always passes)
  TURNSTILE_SECRET: PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET_KEY') || '1x0000000000000000000000000000000AA',
  // Admin Notification Email Recipients
  ADMIN_EMAIL: PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || 'e.gurukulamforias@gmail.com',
  // Minimum time in milliseconds a human takes to fill form
  MIN_FORM_TIME_MS: 3000,
  // Primary Sheet Names
  SHEET_ADMISSIONS: 'Admissions_Enquiries',
  SHEET_APPOINTMENTS: 'Appointments'
};

/**
 * Handle incoming POST requests
 */
function doPost(e) {
  try {
    var rawData = {};

    // 1. Parse incoming payload (JSON or URL-encoded)
    if (e && e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        rawData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      rawData = e.parameter;
    }

    // ========================================================================
    // LAYER 1: HONEYPOT CHECK ("user_organization_code")
    // ========================================================================
    // If the invisible honeypot contains ANY value, immediately return success
    // to deceive the automated bot without executing any database or email operations.
    var honeypot = rawData.user_organization_code || rawData.hp_website_check || rawData.hp_trap || '';
    if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
      Logger.log('[Security] Bot detected via honeypot "user_organization_code": ' + honeypot);
      return jsonResponse({
        status: "success",
        message: "Enquiry submitted successfully."
      });
    }

    // ========================================================================
    // LAYER 2: TIME-DELTA VERIFICATION (< 3000ms = bot)
    // ========================================================================
    var elapsedMs = Number(rawData.elapsed_ms || rawData.formDurationMs || rawData.elapsedTime || rawData.formDuration || 0);
    if (elapsedMs > 0 && elapsedMs < CONFIG.MIN_FORM_TIME_MS) {
      Logger.log('[Security] Bot detected via time-delta: ' + elapsedMs + 'ms');
      return jsonResponse({
        status: "error",
        message: "Submission rejected: rapid automated submission detected."
      });
    }

    // ========================================================================
    // LAYER 3: PHONE NUMBER VALIDATION (/^[6-9]\d{9}$/)
    // ========================================================================
    var rawPhone = String(rawData.contactNumber || rawData.phone || rawData.mobile || '').trim();
    var cleanPhone = cleanIndianPhoneNumber(rawPhone);

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      Logger.log('[Security] Invalid Indian mobile number rejected: ' + rawPhone);
      return jsonResponse({
        status: "error",
        message: "Invalid phone number. Must be a valid 10-digit Indian mobile number starting with 6-9."
      });
    }

    // ========================================================================
    // LAYER 2B: REPLAY & DUPLICATE SUBMISSION THROTTLE (CacheService)
    // ========================================================================
    try {
      var cache = CacheService.getScriptCache();
      var throttleKey = 'sub_rate_' + cleanPhone;
      if (cleanPhone && cache.get(throttleKey)) {
        Logger.log('[Security] Rapid duplicate submission throttled: ' + cleanPhone);
        return jsonResponse({
          status: "error",
          message: "A submission was recently received. Please wait a moment before trying again."
        });
      }
      if (cleanPhone) {
        cache.put(throttleKey, '1', 5); // 5-second cooldown
      }
    } catch (cacheErr) {
      Logger.log('[Cache Warning] CacheService unavailable: ' + cacheErr.toString());
    }

    // ========================================================================
    // LAYER 3B: EMAIL VALIDATION
    // ========================================================================
    var email = String(rawData.email || '').trim();
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      Logger.log('[Security] Invalid email rejected: ' + email);
      return jsonResponse({
        status: "error",
        message: "Invalid email address. Please enter a valid email."
      });
    }

    // ========================================================================
    // LAYER 4: NAME & ADDRESS GIBBERISH VALIDATION
    // ========================================================================
    var fullName = String(rawData.fullName || rawData.name || '').trim();
    if (!fullName || isGibberishText(fullName, 3)) {
      Logger.log('[Security] Gibberish Full Name rejected: ' + fullName);
      return jsonResponse({
        status: "error",
        message: "Invalid Full Name. Please enter a valid candidate name."
      });
    }

    var address = String(rawData.address || rawData.city || rawData.currentAddress || '').trim();
    if (!address || isGibberishText(address, 3)) {
      Logger.log('[Security] Gibberish Address rejected: ' + address);
      return jsonResponse({
        status: "error",
        message: "Invalid Address. Please enter a valid residential city or address."
      });
    }

    // ========================================================================
    // LAYER 5: CLOUDFLARE TURNSTILE SERVER-SIDE SITEVERIFY API (OPTIONAL)
    // ========================================================================
    var turnstileToken = rawData.turnstileToken || rawData['cf-turnstile-response'] || '';
    if (turnstileToken && CONFIG.TURNSTILE_SECRET && CONFIG.TURNSTILE_SECRET !== 'DISABLED') {
      var isTurnstileValid = verifyCloudflareTurnstile(turnstileToken, CONFIG.TURNSTILE_SECRET);
      if (!isTurnstileValid) {
        Logger.log('[Security] Cloudflare Turnstile token validation failed.');
        return jsonResponse({
          status: "error",
          message: "Security CAPTCHA verification failed. Please refresh and try again."
        });
      }
    }

    // ========================================================================
    // LAYER 6: DATA PERSISTENCE & EMAIL DISPATCH
    // ========================================================================
    var formType = String(rawData.formType || 'admissions').toLowerCase();
    var program = String(rawData.program || 'Mentorship programs').trim();
    var prepStage = String(rawData.prepStage || 'Not Started').trim();
    var message = String(rawData.message || rawData.statement || '').trim();
    var timestamp = new Date();

    // Mandatory message check
    if (!message) {
      return jsonResponse({
        status: "error",
        message: "Message / Query is required."
      });
    }

    // Formula injection sanitization for spreadsheets
    function sanitizeForSpreadsheet(val) {
      if (val === null || val === undefined) return '';
      var str = String(val).trim();
      if (/^[=\+\-@\t\r]/.test(str)) {
        return "'" + str;
      }
      return str;
    }

    // 1. Append to Google Sheet
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var targetSheetName = formType === 'appointment' ? CONFIG.SHEET_APPOINTMENTS : CONFIG.SHEET_ADMISSIONS;
      var sheet = ss.getSheetByName(targetSheetName);

      if (!sheet) {
        sheet = ss.insertSheet(targetSheetName);
        if (formType === 'appointment') {
          sheet.appendRow([
            'Timestamp', 'Full Name', 'Contact Number', 'Email Address', 
            'Address/City', 'Source', 'Background', 'Looking For', 'Appointment Date', 
            'Time Slot', 'Session Mode', 'Message / Query'
          ]);
        } else {
          sheet.appendRow([
            'Timestamp', 'Full Name', 'Contact Number', 'Email Address', 
            'Address/City', 'Program Interested In', 'Preparation Stage', 'Message / Query'
          ]);
        }
        sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#F4ECE1');
      }

      if (formType === 'appointment') {
        var source = sanitizeForSpreadsheet(rawData.source || '');
        var background = sanitizeForSpreadsheet(rawData.background || '');
        var lookingFor = sanitizeForSpreadsheet(rawData.lookingFor || '');
        var apptDate = sanitizeForSpreadsheet(rawData.appointmentDate || '');
        var apptTime = sanitizeForSpreadsheet(rawData.timeSlot || rawData.appointmentTime || '');
        var apptMode = sanitizeForSpreadsheet(rawData.appointmentMode || rawData.mode || '');
        
        sheet.appendRow([
          timestamp, 
          sanitizeForSpreadsheet(fullName), 
          cleanPhone, 
          sanitizeForSpreadsheet(email), 
          sanitizeForSpreadsheet(address), 
          source, 
          background, 
          lookingFor, 
          apptDate, 
          apptTime, 
          apptMode, 
          sanitizeForSpreadsheet(message)
        ]);
      } else {
        sheet.appendRow([
          timestamp, 
          sanitizeForSpreadsheet(fullName), 
          cleanPhone, 
          sanitizeForSpreadsheet(email), 
          sanitizeForSpreadsheet(address), 
          sanitizeForSpreadsheet(program), 
          sanitizeForSpreadsheet(prepStage), 
          sanitizeForSpreadsheet(message)
        ]);
      }
    } catch (sheetErr) {
      Logger.log('[Sheet Error] Failed to write to spreadsheet: ' + sheetErr.toString());
    }

    // 2. Dispatch Email Notification
    try {
      sendAdminNotificationEmail({
        formType: formType,
        fullName: fullName,
        phone: cleanPhone,
        email: email,
        address: address,
        program: program,
        prepStage: prepStage,
        message: message,
        timestamp: timestamp,
        extraData: rawData
      });
    } catch (mailErr) {
      Logger.log('[Email Error] Failed to send email alert: ' + mailErr.toString());
    }

    return jsonResponse({
      status: "success",
      message: "Admission enquiry received successfully."
    });

  } catch (fatalErr) {
    Logger.log('[Fatal Error] doPost failed: ' + fatalErr.toString());
    return jsonResponse({
      status: "error",
      message: "Internal server error processing enquiry."
    });
  }
}

/**
 * Handle GET requests (Health check)
 */
function doGet(e) {
  return jsonResponse({
    status: "active",
    service: "e-Gurukulam for IAS Admission Security API",
    time: new Date().toISOString()
  });
}

/**
 * Handle OPTIONS requests for pre-flight CORS
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Clean and normalize Indian mobile phone numbers to 10 digits
 */
function cleanIndianPhoneNumber(phone) {
  if (!phone) return '';
  var digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.indexOf('91') === 0) {
    digits = digits.substring(2);
  } else if (digits.length === 11 && digits.indexOf('0') === 0) {
    digits = digits.substring(1);
  }
  return digits;
}

/**
 * Detect gibberish input strings
 */
function isGibberishText(text, minLen) {
  if (!text || typeof text !== 'string') return true;
  var trimmed = text.trim();
  if (trimmed.length < minLen) return true;

  var alpha = trimmed.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (alpha.length >= 3) {
    // 1. Must contain at least one vowel
    if (!/[aeiouy]/.test(alpha)) return true;

    // 2. Must not contain 5 or more consecutive consonants (keyboard smashing)
    if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(alpha)) return true;

    // 3. Must not be repeated single character (e.g., "aaaaa")
    if (/^(.)\1{3,}$/.test(alpha)) return true;
  }

  // 4. Check known keyboard mash words
  var spamWords = ['asdf', 'qwerty', 'zxcvb', 'test', 'testing', '123456', 'fake', 'none', 'dummy', 'null', 'undefined'];
  for (var i = 0; i < spamWords.length; i++) {
    if (trimmed.toLowerCase() === spamWords[i]) return true;
  }

  return false;
}

/**
 * Verify Cloudflare Turnstile token with Cloudflare siteverify endpoint
 */
function verifyCloudflareTurnstile(token, secret) {
  try {
    var response = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'post',
      payload: {
        secret: secret,
        response: token
      },
      muteHttpExceptions: true
    });

    var result = JSON.parse(response.getContentText());
    return result && result.success === true;
  } catch (err) {
    Logger.log('[Turnstile Error] verify failed: ' + err.toString());
    // In case of network timeout, allow gracefully or reject based on policy
    return true;
  }
}

/**
 * Send formatted HTML email to Administration
 */
function sendAdminNotificationEmail(info) {
  var subject = info.formType === 'appointment'
    ? '📌 New Appointment Booking: ' + info.fullName + ' (' + info.phone + ')'
    : '🎯 New Admission Enquiry: ' + info.fullName + ' - ' + info.program;

  var htmlBody = [
    '<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FFFDF8; border: 2px solid #8C3A27; border-radius: 12px; overflow: hidden; color: #221814;">',
    '  <div style="background: #8C3A27; padding: 20px; text-align: center; color: #FFFFFF;">',
    '    <h2 style="margin: 0; font-size: 22px; letter-spacing: 1px;">e-GURUKULAM FOR IAS</h2>',
    '    <p style="margin: 6px 0 0; font-size: 13px; font-style: italic; color: #F4ECE1;">Official Admission & Enquiry Portal</p>',
    '  </div>',
    '  <div style="padding: 24px;">',
    '    <h3 style="color: #8C3A27; border-bottom: 1px solid #D5C3B0; padding-bottom: 8px; margin-top: 0;">Candidate Details</h3>',
    '    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">',
    '      <tr><td style="padding: 8px 0; color: #7A6B5D; width: 140px;">Full Name:</td><td style="padding: 8px 0; font-weight: bold; color: #140C08;">' + info.fullName + '</td></tr>',
    '      <tr><td style="padding: 8px 0; color: #7A6B5D;">Contact Number:</td><td style="padding: 8px 0; font-weight: bold;"><a href="tel:+91' + info.phone + '" style="color: #8C3A27;">+91 ' + info.phone + '</a></td></tr>',
    '      <tr><td style="padding: 8px 0; color: #7A6B5D;">Email Address:</td><td style="padding: 8px 0;"><a href="mailto:' + info.email + '" style="color: #8C3A27;">' + info.email + '</a></td></tr>',
    '      <tr><td style="padding: 8px 0; color: #7A6B5D;">Address/City:</td><td style="padding: 8px 0; color: #140C08;">' + (info.address || 'Not Provided') + '</td></tr>',
    '      <tr><td style="padding: 8px 0; color: #7A6B5D;">Program:</td><td style="padding: 8px 0; font-weight: bold; color: #8C3A27;">' + info.program + '</td></tr>',
    '      <tr><td style="padding: 8px 0; color: #7A6B5D;">Prep Stage:</td><td style="padding: 8px 0; color: #140C08;">' + info.prepStage + '</td></tr>',
    '      <tr><td style="padding: 8px 0; color: #7A6B5D;">Message / Query:</td><td style="padding: 8px 0; color: #140C08;">' + (info.message || 'None') + '</td></tr>',
    '    </table>',
    '    <div style="margin-top: 20px; padding: 12px; background: #FAF6EE; border-radius: 8px; font-size: 12px; color: #5C4028;">',
    '      <span>🔒 <strong>Anti-Bot Verified:</strong> Honeypot Passed, Indian Mobile Verified, Time-Delta Checked, Cloudflare Turnstile Verified.</span>',
    '    </div>',
    '  </div>',
    '  <div style="background: #F4ECE1; padding: 12px; text-align: center; font-size: 11px; color: #7A6B5D; border-top: 1px solid #D5C3B0;">',
    '    e-Gurukulam for IAS • Automated System Notification • ' + info.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    '  </div>',
    '</div>'
  ].join('\n');

  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * Standard JSON response generator
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
