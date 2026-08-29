import { sortCurrentAffairsByDate } from '../utils/dateUtils';

export const CMS_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOt8dZ7S9ot1Zy3GyyXgsDTPsrF016odbaXhf9DXXPMllvQzmQvKabubXZFzRra51x/exec';
export const LOCAL_STORAGE_KEY = 'egk_cms_data_v6'; // Bumped to v6 for sorted current affairs order (latest first)

// Robust Google Drive & Web Image URL Formatter
export function formatCMSImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes("drive.google.com")) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }
  }
  return trimmed;
}

// Fallback secondary image URL if primary thumbnail is blocked
export function getSecondaryCMSImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes("drive.google.com") || url.includes("id=")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return url;
}

// Safely extract poster/banner image link supporting all key variations
export function getCMSImageLink(item) {
  if (!item || typeof item !== 'object') return null;
  const rawUrl =
    item.Poster_Image_Link ||
    item.poster_image_link ||
    item.Banner_Image ||
    item.banner_image ||
    item.Poster_Image ||
    item.poster_image ||
    item.Poster_Link ||
    item.poster_link ||
    item.Image_Link ||
    item.image_link ||
    item.Poster ||
    item.poster ||
    item.Image ||
    item.image ||
    item.Banner ||
    item.banner ||
    item.Thumbnail ||
    item.thumbnail;

  return formatCMSImageUrl(rawUrl);
}

// Synchronously read cached data from localStorage for instant 0ms initial render
export function getCachedCMSData() {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.currentAffairs)) {
          parsed.currentAffairs = sortCurrentAffairsByDate(parsed.currentAffairs);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read CMS data from localStorage:', err);
  }
  return null;
}

let cachedCMSData = getCachedCMSData();
let fetchPromise = null;

export async function fetchCMSData(forceRevalidate = false) {
  if (cachedCMSData && !forceRevalidate) {
    return cachedCMSData;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch(CMS_API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`CMS HTTP Error: ${response.status}`);
      }

      const rawData = await response.json();

      // Helper to check active status
      const isItemActive = (obj) => {
        if (!obj || typeof obj !== 'object') return false;
        if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
        if (obj.Status && obj.Status.toString().toLowerCase() === 'inactive') return false;
        if (obj.status && obj.status.toString().toLowerCase() === 'inactive') return false;
        return true;
      };

      const rawSocial = Array.isArray(rawData.socialPlatforms)
        ? rawData.socialPlatforms
        : Array.isArray(rawData.social_platforms)
          ? rawData.social_platforms
          : Array.isArray(rawData.social)
            ? rawData.social
            : [];

      // Filter and sanitize active platforms and active sub-channels
      const socialPlatforms = rawSocial
        .filter(isItemActive)
        .map(item => {
          const rawChannels = Array.isArray(item.channels) 
            ? item.channels 
            : Array.isArray(item.branches) 
              ? item.branches 
              : Array.isArray(item.links) 
                ? item.links 
                : [];

          const activeChannels = rawChannels.filter(isItemActive);

          return {
            ...item,
            channels: activeChannels
          };
        });
      
      // Standardize & fallback defaults
      const freshData = {
        activePopup: rawData.activePopup && typeof rawData.activePopup === 'object' ? rawData.activePopup : null,
        liveTicker: Array.isArray(rawData.liveTicker) ? rawData.liveTicker : [],
        currentAffairs: sortCurrentAffairsByDate(Array.isArray(rawData.currentAffairs) ? rawData.currentAffairs : []),
        resources: Array.isArray(rawData.resources) ? rawData.resources : [],
        socialPlatforms,
        testSeries: Array.isArray(rawData.testSeries) 
          ? rawData.testSeries 
          : Array.isArray(rawData.test_series) 
            ? rawData.test_series 
            : Array.isArray(rawData.testseries)
              ? rawData.testseries
              : []
      };

      cachedCMSData = freshData;

      // Save to localStorage for 0ms instant renders on future visits
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshData));
      } catch (err) {
        console.warn('Failed to save CMS data to localStorage:', err);
      }

      return freshData;
    } catch (error) {
      console.warn('Google Sheet CMS revalidation error, returning cached/fallback structure:', error);
      const staleData = getCachedCMSData();
      if (staleData) return staleData;

      return {
        activePopup: null,
        liveTicker: [],
        currentAffairs: [],
        resources: [],
        socialPlatforms: [],
        testSeries: []
      };
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function clearCMSCache() {
  cachedCMSData = null;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}
