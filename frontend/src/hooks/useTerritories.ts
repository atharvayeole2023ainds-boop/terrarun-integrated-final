import { useState, useEffect } from 'react';
import { territoryAPI } from '../services/api';

export interface Territory {
  id: string;
  ownerId: string;
  username: string;
  avatarUrl: string;
  geometry: any;
  areaKm2: number;
  shieldHp: number;
  maxShieldHp: number;
  mode: 'running' | 'cycling';
  capturedAt: string;
  expiresAt: string;
  name: string;
}

export const useTerritories = (bounds?: { minLat: number; minLng: number; maxLat: number; maxLng: number }) => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTerritories = async () => {
    if (!bounds) return;
    
    setIsLoading(true);
    try {
      const response = await territoryAPI.list(bounds);
      if (response.data.success) {
        setTerritories(response.data.data.territories);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch territories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bounds) {
      fetchTerritories();
    }
  }, [bounds]);

  return { territories, isLoading, error, refresh: fetchTerritories };
};
