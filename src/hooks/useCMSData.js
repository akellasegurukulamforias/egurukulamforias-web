// src/hooks/useCMSData.js
import { useState, useEffect } from 'react';
import { fetchCMSData } from '../services/cmsService';

export function useCMSData() {
  const [data, setData] = useState({
    activePopup: null,
    liveTicker: [],
    currentAffairs: [],
    resources: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchCMSData();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch CMS data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
