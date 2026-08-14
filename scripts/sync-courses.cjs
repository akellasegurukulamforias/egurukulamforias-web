const https = require('https');
const fs = require('fs');
const path = require('path');

const STORE_HASH = "eyJ0dXRvcklkIjpudWxsLCJvcmdJZCI6ODg1NCwiY2F0ZWdvcnlJZCI6bnVsbH0=";
const OUTPUT_FILE = path.join(__dirname, '../src/data/courses.json');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept': 'application/json, text/plain, */*',
        'api-version': '39',
        'device-id': 'web',
        'region': 'IN'
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function categorizeCourse(name, desc) {
  const text = (name + ' ' + desc).toUpperCase();
  if (text.includes('FOUNDATION') || text.includes('NCERT') || text.includes('BEGINNER')) {
    return 'FOUNDATION';
  }
  if (text.includes('WORK SHOP') || text.includes('WORKSHOP') || text.includes('ORIENTATION')) {
    return 'WORKSHOPS';
  }
  if (text.includes('GROUP') || text.includes('APPSC') || text.includes('TGPSC') || text.includes('TSPSC') || text.includes('ENDOWMENT')) {
    return 'GROUPS & STATE';
  }
  if (text.includes('ANTHROPOLOGY') || text.includes('TELUGU') || text.includes('OPTIONAL')) {
    return 'OPTIONAL';
  }
  if (text.includes('IAS') || text.includes('UPSC') || text.includes('MAINS') || text.includes('PRELIMS')) {
    return 'UPSC CIVIL SERVICES';
  }
  return 'SPECIALIST & PERSPECTIVE';
}

async function syncCourses() {
  console.log('🔄 Executing Automated Course Catalog Sync from smpqz.courses.store...');

  try {
    const listUrl = `https://api.classplusapp.com/v2/course/preview/similar/${STORE_HASH}?limit=100&offset=0`;
    const apiRes = await httpGet(listUrl);
    
    if (!apiRes || !apiRes.data || !apiRes.data.coursesData) {
      console.log('⚠️ Failed to fetch live course catalog from Classplus API.');
      return;
    }

    const rawCourses = apiRes.data.coursesData;
    console.log(`📌 Found ${rawCourses.length} live courses on smpqz.courses.store.`);

    const formattedCourses = [];

    for (let i = 0; i < rawCourses.length; i++) {
      const c = rawCourses[i];
      const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const detailUrl = `https://smpqz.courses.store/courses/${c.id}-${slug}`;

      let fullDescription = c.description || c.courseDescription || '';
      let durationText = 'Lifetime Validity';
      let videoCount = 0;
      let pdfCount = 0;
      let testCount = 0;

      // Deep scrape course page for rich materials breakdown
      try {
        const pageHtml = await fetchHTML(detailUrl);
        const match = pageHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (match) {
          const pageJson = JSON.parse(match[1]);
          const d = pageJson.props?.pageProps?._courseData?.success?.data;
          if (d) {
            if (d.details?.description) fullDescription = d.details.description;
            if (d.courseDuration?.text) durationText = d.courseDuration.text;
            if (d.resources) {
              videoCount = d.resources.videos || 0;
              pdfCount = d.resources.files || 0;
              testCount = d.resources.tests || 0;
            }
          }
        }
      } catch (err) {
        // Fallback to basic info
      }

      formattedCourses.push({
        id: c.id,
        title: c.name,
        category: categorizeCourse(c.name, fullDescription),
        price: c.price || c.finalAmount || 0,
        originalPrice: c.rawPrice || c.originalPrice || null,
        imageUrl: c.imageUrl || 'https://ali-cdn-cp-assets-public.classplus.co/daman-bot/XmceKP96T9Hg.png',
        description: fullDescription,
        subscribers: c.totalSubscriberCount || 0,
        duration: durationText,
        materials: {
          videos: videoCount,
          files: pdfCount,
          tests: testCount
        },
        storeUrl: `https://smpqz.courses.store/${c.id}`,
        lastSynced: new Date().toISOString()
      });
    }

    // Ensure output directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(formattedCourses, null, 2));
    console.log(`✅ Successfully synced ${formattedCourses.length} courses to src/data/courses.json!`);

  } catch (error) {
    console.error('❌ Error during course catalog sync:', error.message);
  }
}

syncCourses();
