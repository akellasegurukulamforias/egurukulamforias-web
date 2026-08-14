const https = require('https');
const fs = require('fs');
const path = require('path');

const STORE_HASH = "eyJ0dXRvcklkIjpudWxsLCJvcmdJZCI6ODg1NCwiY2F0ZWdvcnlJZCI6bnVsbH0=";
const OUTPUT_FILE = path.join(__dirname, '../src/data/free_tests.json');
const FOLDERS_OUTPUT_FILE = path.join(__dirname, '../src/data/free_tests_folders.json');

function httpGet(url, token, hash) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-access-token': token,
        'hashkey': hash,
        'api-version': '39',
        'device-id': 'web',
        'region': 'IN',
        'accept': 'application/json, text/plain, */*'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

function fetchHTML(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function categorizeFolder(name) {
  const text = name.toUpperCase();
  if (text.includes('VEEKSHANAM') || text.includes('WEEKLY') || text.includes('CURRENT')) {
    return 'CURRENT AFFAIRS & VEEKSHANAM';
  }
  if (text.includes('CSAT')) {
    return 'CSAT MASTERY';
  }
  if (text.includes('MAGAZINE') || text.includes('SPECIAL')) {
    return 'SPECIAL & MAGAZINE';
  }
  if (text.includes('GS') || text.includes('QUIZ') || text.includes('GENERAL STUDIES')) {
    return 'GENERAL STUDIES & QUIZ';
  }
  return 'PRELIMS & MAINS MOCK';
}

function extractDateOrNumber(title) {
  const dateMatch = title.match(/(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+'?(?:\d{2,4})?)/i);
  if (dateMatch) return dateMatch[1];

  const numMatch = title.match(/Test[- ]*(\d+)/i);
  if (numMatch) return `Test #${numMatch[1]}`;

  return 'Latest Edition';
}

async function syncFreeTests() {
  console.log('🔄 Executing Folder-Based Free Test Series Sync from smpqz.courses.store...');

  try {
    // 1. Get Timed Token
    const html = await fetchHTML('https://smpqz.courses.store/freetest');
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) {
      console.log('⚠️ Failed to extract NEXT_DATA token for Free Tests.');
      return;
    }
    const json = JSON.parse(match[1]);
    const token = json.props.pageProps._infoData.success.data.timedToken;

    // 2. Fetch Root Test Listing
    const rootUrl = `https://cms-gcp.classplusapp.com/student/api/v2/diy/listwithfolder?limit=100&offset=0&search=`;
    const rootRes = await httpGet(rootUrl, token, STORE_HASH);

    if (!rootRes || !rootRes.data || !rootRes.data.testFolderList) {
      console.log('⚠️ Failed to fetch root test list from cms-gcp API.');
      return;
    }

    const items = rootRes.data.testFolderList;
    console.log(`📌 Found ${items.length} root items/folders on smpqz.courses.store/freetest.`);

    const foldersMap = new Map();
    const standaloneTests = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type === 'folder' || item.isFolder) {
        const folderName = item.name || item.folderName || 'General Mock Tests';
        const folderId = item._id || `folder_${i}`;
        
        try {
          const folderUrl = `https://cms-gcp.classplusapp.com/student/api/v2/diy/listwithfolder/${item._id}?limit=200&offset=0&search=`;
          const subRes = await httpGet(folderUrl, token, STORE_HASH);
          
          if (subRes && subRes.data && subRes.data.testFolderList) {
            const subTests = subRes.data.testFolderList.map(sub => ({
              id: sub._id || sub.sharedTestid,
              title: sub.name || sub.folderName,
              dateLabel: extractDateOrNumber(sub.name || sub.folderName || ''),
              series: folderName,
              category: categorizeFolder(folderName),
              status: sub.testCategory || 'Ongoing',
              testUrl: sub.testUrl || `https://smpqz.courses.store/freetest`,
              webUrl: sub.webUrl || null,
              startTime: sub.startTime || sub.epochStartTime || 0,
              isFree: true,
              description: `Official free mock test under the ${folderName} series by Akella Raghavendra's e-Gurukulam for IAS.`
            }));

            // Sort tests by startTime or date reverse chronological
            subTests.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

            foldersMap.set(folderId, {
              folderId,
              folderName,
              category: categorizeFolder(folderName),
              testCount: subTests.length,
              latestDate: subTests[0] ? subTests[0].dateLabel : 'Active',
              description: `Complete collection of ${subTests.length} free mock tests under ${folderName} for IAS & State Group preparation.`,
              tests: subTests
            });
          }
        } catch (e) {
          console.error(`Error fetching folder ${folderName}:`, e.message);
        }
      } else {
        // Direct Standalone Test (e.g. Weekly Veekshanam Test-7, Test-6...)
        const standaloneSeriesName = 'Weekly Veekshanam & Special Tests';
        standaloneTests.push({
          id: item._id || item.sharedTestid,
          title: item.name || item.folderName,
          dateLabel: extractDateOrNumber(item.name || item.folderName || ''),
          series: standaloneSeriesName,
          category: categorizeFolder('Veekshanam'),
          status: item.testCategory || 'Ongoing',
          testUrl: item.testUrl || `https://smpqz.courses.store/freetest`,
          webUrl: item.webUrl || null,
          startTime: item.startTime || item.epochStartTime || 0,
          isFree: true,
          description: `Official free mock test by Akella Raghavendra's e-Gurukulam for IAS.`
        });
      }
    }

    // Group standalone tests into a dedicated folder if present
    if (standaloneTests.length > 0) {
      standaloneTests.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
      foldersMap.set('weekly_veekshanam_folder', {
        folderId: 'weekly_veekshanam_folder',
        folderName: 'Weekly Veekshanam Test Series',
        category: 'CURRENT AFFAIRS & VEEKSHANAM',
        testCount: standaloneTests.length,
        latestDate: standaloneTests[0] ? standaloneTests[0].dateLabel : 'Active',
        description: `Weekly current affairs and newspaper analysis test series by Akella Raghavendra sir.`,
        tests: standaloneTests
      });
    }

    const foldersArray = Array.from(foldersMap.values());
    // Sort folders by test count & activity
    foldersArray.sort((a, b) => b.testCount - a.testCount);

    // Flatten all tests for fallback
    const allFlatTests = [];
    foldersArray.forEach(f => allFlatTests.push(...f.tests));

    console.log(`✅ Organized ${foldersArray.length} test folders containing total ${allFlatTests.length} tests!`);

    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(FOLDERS_OUTPUT_FILE, JSON.stringify(foldersArray, null, 2));
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allFlatTests, null, 2));

    console.log(`✅ Saved src/data/free_tests_folders.json and src/data/free_tests.json!`);

  } catch (error) {
    console.error('❌ Error during free test series sync:', error.message);
  }
}

syncFreeTests();
