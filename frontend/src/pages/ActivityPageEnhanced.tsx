// frontend/src/pages/ActivityPageEnhanced.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useGPSTracking } from '../hooks/useGPSTracking';
import { useGame } from '../context/GameContext';
import { activityAPI } from '../services/api';
import Button from '../components/ui/Button';

const ActivityTracker: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useGame();
  const {
    isTracking,
    currentPosition,
    gpsTrack,
    distance,
    duration,
    avgSpeed,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    error: gpsError,
  } = useGPSTracking();

  const [mode, setMode] = useState<'running' | 'cycling'>('running');
  const [isPaused, setIsPaused] = useState(false);

  const handleStart = () => {
    startTracking();
  };

  const handlePause = () => {
    if (isPaused) {
      resumeTracking();
    } else {
      pauseTracking();
    }
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    stopTracking();
    
    // Check if we have enough data
    if (gpsTrack.length < 3) {
      showToast('Not enough GPS data to save mission.', 'error');
      return;
    }

    // Navigate to summary with data
    navigate('/activity/summary', {
      state: {
        gpsTrack,
        distance,
        duration,
        avgSpeed,
        mode,
      },
    });
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(2);
  };

  const formatPace = (kmh: number): string => {
    if (kmh === 0) return '--:--';
    const minPerKm = 60 / kmh;
    const mins = Math.floor(minPerKm);
    const secs = Math.floor((minPerKm - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col flex-1 pb-20 bg-background-dark">
      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="flex size-10 items-center justify-center rounded-full bg-card-dark border border-white/10"
          >
            <span className="material-symbols-outlined text-white text-[20px]">close</span>
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-white text-base font-bold">
              {isTracking ? 'Mission Active' : 'Initialize Mission'}
            </h2>
            <p className="text-primary text-xs uppercase font-bold tracking-wider">
              {mode === 'running' ? 'Foot Recon' : 'Rapid Expansion'}
            </p>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {!isTracking && (
        <div className="px-4 py-6">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('running')}
              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border transition-all ${
                mode === 'running'
                  ? 'bg-primary border-primary text-background-dark'
                  : 'bg-card-dark border-white/10 text-white'
              }`}
            >
              <span className="material-symbols-outlined">directions_run</span>
              <span className="font-bold">Foot</span>
            </button>
            <button
              onClick={() => setMode('cycling')}
              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border transition-all ${
                mode === 'cycling'
                  ? 'bg-primary border-primary text-background-dark'
                  : 'bg-card-dark border-white/10 text-white'
              }`}
            >
              <span className="material-symbols-outlined">directions_bike</span>
              <span className="font-bold">Bike</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 py-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="col-span-2 bg-card-dark rounded-xl border border-white/5 p-6">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Expansion Distance</p>
            <p className="text-white text-5xl font-black tracking-tight font-lexend">
              {formatDistance(distance)}
              <span className="text-2xl text-white/40 ml-2">km</span>
            </p>
          </div>

          <div className="bg-card-dark rounded-xl border border-white/5 p-5">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Duration</p>
            <p className="text-white text-3xl font-black font-lexend italic text-primary">{formatTime(duration)}</p>
          </div>

          <div className="bg-card-dark rounded-xl border border-white/5 p-5">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
              {mode === 'running' ? 'Pace' : 'Speed'}
            </p>
            <p className="text-white text-3xl font-black font-lexend">
              {mode === 'running' ? formatPace(avgSpeed) : avgSpeed.toFixed(1)}
              <span className="text-sm text-white/40 ml-1">
                {mode === 'running' ? '/km' : 'km/h'}
              </span>
            </p>
          </div>
        </div>

        {currentPosition && isTracking && (
          <div className="bg-card-dark/40 backdrop-blur-md rounded-xl border border-white/5 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="size-2 bg-primary rounded-full animate-pulse"></span>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Live Satellite Data</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest">
              <p className="text-white/70">
                <span className="text-primary">LAT:</span> {currentPosition.lat.toFixed(6)}
              </p>
              <p className="text-white/70">
                <span className="text-primary">LNG:</span> {currentPosition.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}

        {gpsError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-[10px] font-black uppercase">{gpsError}</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-12 space-y-3">
        {!isTracking ? (
          <button
            onClick={handleStart}
            className="w-full h-16 bg-primary rounded-2xl font-black text-lg text-background-dark flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl shadow-primary/20"
          >
            <span className="material-symbols-outlined text-2xl font-black">bolt</span>
            START MISSION
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handlePause}
              className={`flex-1 h-16 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all ${
                isPaused
                  ? 'bg-green-500 text-white'
                  : 'bg-card-dark border border-white/10 text-white'
              }`}
            >
              <span className="material-symbols-outlined">
                {isPaused ? 'play_circle' : 'pause_circle'}
              </span>
              {isPaused ? 'RESUME' : 'HOLD'}
            </button>
            <button
              onClick={handleStop}
              className="flex-1 h-16 bg-primary text-black rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined font-black">stop_circle</span>
              ABORT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ActivitySummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, showToast, refreshUser, addXP, updatePoints } = useGame();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const { gpsTrack, distance, duration, avgSpeed, mode } = (location.state as any) || {};

  useEffect(() => {
    if (!gpsTrack) {
      navigate('/activity');
    }
  }, [gpsTrack, navigate]);

  const handleUpload = async () => {
    if (!gpsTrack || !user) return;

    setUploading(true);
    setUploadError(null);

    try {
      const startTime = new Date(gpsTrack[0].timestamp).toISOString();
      const endTime = new Date(gpsTrack[gpsTrack.length - 1].timestamp).toISOString();

      const response = await activityAPI.upload({
        mode,
        startTime,
        endTime,
        gpsTrack,
        distance_m: Math.floor(distance),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      });

      setResult(response.data.data);
      
      // Award XP/Points
      addXP(250);
      updatePoints(150);
      
      await refreshUser();
      
      if (response.data.data.capturedTerritoryId) {
        showToast('Territory Secured!', 'success');
      }
    } catch (error: any) {
      setUploadError(error.response?.data?.error || 'Mission Data Sync Failed');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!gpsTrack) return null;

  return (
    <div className="flex flex-col flex-1 pb-40 bg-background-dark">
      <header className="sticky top-0 z-50 bg-background-dark p-4 justify-between border-b border-white/5">
        <h2 className="text-sm font-black tracking-[0.2em] text-center uppercase">Mission Debrief</h2>
      </header>

      <main className="px-6 py-8 space-y-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="size-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3">
            <span className="material-symbols-outlined text-black text-5xl font-black">check_circle</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white font-lexend uppercase">Mission Secured</h1>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1">Sector Reconnaisance Complete</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 rounded-2xl p-4 bg-card-dark border border-white/5">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Range</p>
            <p className="text-xl font-black text-white font-lexend">{(distance / 1000).toFixed(2)} <span className="text-[10px] opacity-40">KM</span></p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl p-4 bg-card-dark border border-white/5">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Active</p>
            <p className="text-xl font-black text-white font-lexend">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl p-4 bg-card-dark border border-white/5">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Pace</p>
            <p className="text-xl font-black text-white font-lexend">{avgSpeed.toFixed(1)} <span className="text-[10px] opacity-40">KM/H</span></p>
          </div>
        </div>

        {result ? (
          <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 space-y-4">
             <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary fill">verified</span>
                <p className="text-primary text-xs font-black uppercase tracking-widest">Data Synced Successfully</p>
             </div>
             {result.capturedTerritoryId && (
               <div className="p-4 bg-primary/10 rounded-xl">
                 <p className="text-[10px] font-black text-primary uppercase mb-1">New Stronghold Captured</p>
                 <p className="text-white font-black font-lexend uppercase">Territory ID: {result.capturedTerritoryId.slice(0, 8)}...</p>
               </div>
             )}
             <Button onClick={() => navigate('/home')} className="w-full" size="lg">Return To HQ</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {uploadError && <p className="text-red-500 text-xs font-bold text-center">{uploadError}</p>}
            <Button 
              onClick={handleUpload} 
              isLoading={uploading}
              className="w-full" 
              size="xl" 
              icon="cloud_upload"
            >
              FINALIZE DATA
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

const ActivityPage: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ActivityTracker />} />
      <Route path="/select" element={<ActivityTracker />} />
      <Route path="/summary" element={<ActivitySummary />} />
    </Routes>
  );
};

export default ActivityPage;
