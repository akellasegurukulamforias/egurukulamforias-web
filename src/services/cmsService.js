// src/services/cmsService.js
// Centralized Service & Hook for Google Sheet Content CMS Integration

const CMS_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOt8dZ7S9ot1Zy3GyyXgsDTPsrF016odbaXhf9DXXPMllvQzmQvKabubXZFzRra51x/exec';

let cachedCMSData = null;
let fetchPromise = null;

export async function fetchCMSData() {
  if (cachedCMSData) {
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
      
      // Standardize & fallback defaults
      cachedCMSData = {
        activePopup: rawData.activePopup && typeof rawData.activePopup === 'object' ? rawData.activePopup : null,
        liveTicker: Array.isArray(rawData.liveTicker) ? rawData.liveTicker : [],
        currentAffairs: Array.isArray(rawData.currentAffairs) ? rawData.currentAffairs : [],
        resources: Array.isArray(rawData.resources) ? rawData.resources : []
      };

      return cachedCMSData;
    } catch (error) {
      console.warn('Google Sheet CMS fetch error, returning fallback structure:', error);
      return {
        activePopup: null,
        liveTicker: [],
        currentAffairs: [],
        resources: []
      };
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function clearCMSCache() {
  cachedCMSData = null;
}
