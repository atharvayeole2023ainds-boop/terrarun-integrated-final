import { useState, useEffect, useCallback, useRef } from 'react';

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  speed: number;
  altitude?: number;
}

interface UseGPSTrackingReturn {
  isTracking: boolean;
  currentPosition: GPSPoint | null;
  gpsTrack: GPSPoint[];
  distance: number;
  duration: number;
  avgSpeed: number;
  startTracking: () => void;
  stopTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  clearTrack: () => void;
  error: string | null;
}

export const useGPSTracking = (): UseGPSTrackingReturn => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GPSPoint | null>(null);
  const [gpsTrack, setGpsTrack] = useState<GPSPoint[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastPauseTimeRef = useRef<number | null>(null);

  // Calculate distance between two GPS points (Haversine formula)
  const calculateDistance = useCallback((p1: GPSPoint, p2: GPSPoint): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (p1.lat * Math.PI) / 180;
    const φ2 = (p2.lat * Math.PI) / 180;
    const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
    const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }, []);

  // Calculate total distance of track
  const distance = useCallback(() => {
    if (gpsTrack.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < gpsTrack.length; i++) {
      total += calculateDistance(gpsTrack[i - 1], gpsTrack[i]);
    }
    return total;
  }, [gpsTrack, calculateDistance]);

  // Calculate duration
  const duration = useCallback(() => {
    if (!startTime) return 0;
    const now = Date.now();
    return Math.floor((now - startTime - pausedTime) / 1000);
  }, [startTime, pausedTime]);

  // Calculate average speed
  const avgSpeed = useCallback(() => {
    const dist = distance();
    const dur = duration();
    if (dur === 0) return 0;
    return (dist / dur) * 3.6; // Convert m/s to km/h
  }, [distance, duration]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null);
    setIsTracking(true);
    setIsPaused(false);
    setStartTime(Date.now());
    setGpsTrack([]);
    setPausedTime(0);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: GPSPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          altitude: position.coords.altitude || undefined,
        };

        setCurrentPosition(point);
        
        if (!isPaused) {
          setGpsTrack((prev) => [...prev, point]);
        }
      },
      (err) => {
        console.error('GPS Error:', err);
        setError(`GPS Error: ${err.message}`);
      },
      options
    );
  }, [isPaused]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setIsPaused(false);
  }, []);

  const pauseTracking = useCallback(() => {
    setIsPaused(true);
    lastPauseTimeRef.current = Date.now();
  }, []);

  const resumeTracking = useCallback(() => {
    if (lastPauseTimeRef.current) {
      const pauseDuration = Date.now() - lastPauseTimeRef.current;
      setPausedTime((prev) => prev + pauseDuration);
      lastPauseTimeRef.current = null;
    }
    setIsPaused(false);
  }, []);

  const clearTrack = useCallback(() => {
    setGpsTrack([]);
    setCurrentPosition(null);
    setStartTime(null);
    setPausedTime(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    currentPosition,
    gpsTrack,
    distance: distance(),
    duration: duration(),
    avgSpeed: avgSpeed(),
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    clearTrack,
    error,
  };
};
