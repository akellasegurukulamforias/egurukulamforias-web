# Google Apps Script Backend Handlers

This directory contains the serverless backend handlers powering the **e-Gurukulam for IAS** website.

---

## Handlers Overview

### 1. `AdmissionEnquiryHandler.js` (Admissions & Appointments)
- **Endpoint URL**: `https://script.google.com/macros/s/AKfycbxbjFRyxiRgeNtUoivxdhxRqxlTlZiES5hhrkgaXkWUz_JfOIwO6fxHj2zsP6jK_ic1/exec`
- **Method**: `POST`
- **Actions Handled**:
  - Admission Enquiries (`Admissions_Enquiries` tab)
  - Student Mentorship Appointments (`Appointments` tab)
- **Multi-Layer Bot Defenses**:
  - **Honeypot Trap**: Invisible field `user_organization_code`. Submissions with this field populated receive a silent 200 OK without database writes or notifications.
  - **3-Second Timing Threshold**: Rejects submissions faster than 3 seconds (`elapsed_ms < 3000`).
  - **Strict Phone Regex**: Requires 10-digit Indian numbers matching `/^[6-9]\d{9}$/`.
  - **Gibberish & Spam Filter**: Detects unnatural vowel-less text and repetitive characters.
  - **Cloudflare Turnstile Verification**: Optional server-side verification using Turnstile secret key.
  - **Instant Email Alerts**: Sends HTML notification email to `e.gurukulamforias@gmail.com`.

### 2. `ContentCMSHandler.js` (Dynamic Sheets CMS & Google Docs Reader)
- **Endpoint URL**: `https://script.google.com/macros/s/AKfycbyOt8dZ7S9ot1Zy3GyyXgsDTPsrF016odbaXhf9DXXPMllvQzmQvKabubXZFzRra51x/exec`
- **Method**: `GET`
- **Data Served**:
  - `currentAffairs`: Daily editorial articles, syllabi tags, and full HTML extracted from Google Docs.
  - `resources`: Downloads, strategy guides, syllabus micro-notes.
  - `liveTicker`: Urgent notifications and announcement banners.
  - `activePopup`: Lead-generation and announcement modal data.
  - `socialPlatforms`: Telegram channels and community links.
  - `testSeries`: Prelims & Mains test programs.
- **Performance**:
  - Google Apps Script `CacheService` caches output for 10 minutes to deliver fast responses.
  - Pass `?nocache=true` to force a real-time revalidation from the spreadsheet.

---

## How to Deploy to Google Apps Script

1. Open your target Google Sheet or go to [script.google.com](https://script.google.com).
2. Create a new Apps Script project (e.g. `e-Gurukulam Backend`).
3. Paste the contents of `AdmissionEnquiryHandler.js` into `Code.gs` (or a file of your choice).
4. For CMS functionality, paste `ContentCMSHandler.js` into another file or dedicated project.
5. Click **Deploy** > **New deployment**.
6. Select type: **Web app**.
7. Settings:
   - **Execute as**: `Me (your Google account)`
   - **Who has access**: `Anyone` (essential for web forms & frontend fetching)
8. Click **Deploy** and copy the Web App URL into your frontend configuration.
