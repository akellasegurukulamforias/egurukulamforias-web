// src/hooks/useCMSData.js
// Custom Hook with Stale-While-Revalidate Strategy for 0ms Instant Page Renders
import { useState, useEffect } from 'react';
import { fetchCMSData, getCachedCMSData } from '../services/cmsService';

export function useCMSData() {
  // Step 1: Synchronous 0ms Cache Load from LocalStorage
  const initialCache = getCachedCMSData();

  const [data, setData] = useState(
    initialCache || {
      activePopup: null,
      liveTicker: [],
      currentAffairs: [],
      resources: [],
      socialPlatforms: [],
      testSeries: []
    }
  );
  
  // If cached data is present, loading is false immediately (0ms skeleton delay)
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function revalidateCMSData() {
      try {
        // Step 2: Background Network Sync
        const freshData = await fetchCMSData(true);
        if (isMounted) {
          setData(freshData);
          setError(null);
        }
      } catch (err) {
        if (isMounted && !initialCache) {
          setError(err.message || 'Failed to fetch CMS data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    revalidateCMSData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
