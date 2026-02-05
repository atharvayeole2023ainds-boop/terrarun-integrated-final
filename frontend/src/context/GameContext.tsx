
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, UserProfile, UserStats, Achievement } from '../types';

const INITIAL_STATS: UserStats = {
  points: 4200,
  level: 12,
  xp: 1250,
  xpToNext: 1500,
  totalDistance: 450,
  territories: 85,
  streak: 12,
};

interface ExtendedGameState extends GameState {
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
}

const GameContext = createContext<ExtendedGameState | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    const init = async () => {
      const savedSession = localStorage.getItem('terra_session');
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
      const savedStats = localStorage.getItem('terra_stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      // If an auth token exists, try to fetch the latest profile from server
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            const payload = await resp.json();
            if (payload?.data?.user) {
              const u = payload.data.user;
              const normalizedUser = {
                ...u,
                avatar: u.avatar || u.avatarUrl || 'https://picsum.photos/seed/runner/200/200',
                rank: u.rank || 'Novice Scout'
              };
              setUser(normalizedUser);
              // update stats if provided
              if (u.stats) {
                // Map backend stats to frontend stats
                setStats((s) => ({ 
                  ...s, 
                  points: u.stats.terracoinBalance ?? s.points,
                  totalDistance: (u.stats.totalDistance / 1000) || s.totalDistance, // backend sends meters
                  territories: u.stats.territoriesHeld ?? s.territories,
                  streak: u.stats.streakDays ?? s.streak,
                }));
              }
              localStorage.setItem('terra_session', JSON.stringify(normalizedUser));
            }
          } else {
            // If token invalid, remove it
            localStorage.removeItem('authToken');
          }
        } catch (err) {
          // ignore network errors — keep local session
        }
      }

      setIsLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('terra_stats', JSON.stringify(stats));
  }, [stats, user]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hideToast = () => setToast(null);

  const login = (userData: UserProfile) => {
    const normalizedUser = {
      ...userData,
      avatar: userData.avatar || userData.avatarUrl || 'https://picsum.photos/seed/runner/200/200',
      rank: userData.rank || 'Novice Scout'
    };
    setUser(normalizedUser);
    localStorage.setItem('terra_session', JSON.stringify(normalizedUser));
    showToast(`Welcome back, Agent ${normalizedUser.username}`, 'info');
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) return null;
      const payload = await resp.json();
      if (payload?.data?.user) {
        const u = payload.data.user;
        const normalizedUser = {
          ...u,
          avatar: u.avatar || u.avatarUrl || 'https://picsum.photos/seed/runner/200/200',
          rank: u.rank || 'Novice Scout'
        };
        setUser(normalizedUser);
        if (u.stats) {
          setStats((s) => ({ 
            ...s, 
            points: u.stats.terracoinBalance ?? s.points,
            totalDistance: (u.stats.totalDistance / 1000) || s.totalDistance,
            territories: u.stats.territoriesHeld ?? s.territories,
            streak: u.stats.streakDays ?? s.streak,
          }));
        }
        localStorage.setItem('terra_session', JSON.stringify(normalizedUser));
        return normalizedUser;
      }
    } catch (err) {
      return null;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('terra_session');
    localStorage.removeItem('terra_stats');
    localStorage.removeItem('authToken');
    showToast('Session Terminated', 'info');
  };

  const updatePoints = (delta: number) => {
    setStats(prev => {
      const newPoints = Math.max(0, prev.points + delta);
      if (delta > 0) showToast(`+${delta} TerraPoints Earned!`);
      return { ...prev, points: newPoints };
    });
  };

  const addXP = (amount: number) => {
    setStats(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNext;

      if (newXP >= prev.xpToNext) {
        newLevel += 1;
        newXP -= prev.xpToNext;
        newXPToNext = Math.floor(prev.xpToNext * 1.2);
        showToast(`LEVEL UP! You are now Level ${newLevel}`, 'success');
      } else {
        showToast(`+${amount} XP Gained`, 'info');
      }
      
      return { ...prev, level: newLevel, xp: newXP, xpToNext: newXPToNext };
    });
  };

  return (
    <GameContext.Provider value={{ 
      user, 
      stats, 
      isLoading, 
      login, 
      logout, 
      updatePoints, 
      addXP,
      achievements: [],
      toast,
      showToast,
      hideToast,
      refreshUser
    }}>
      {children}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-[380px] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
            toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
            toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
            'bg-primary/10 border-primary/20 text-primary'
          }`}>
            <span className="material-symbols-outlined text-lg fill">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <p className="text-xs font-black uppercase tracking-wider">{toast.message}</p>
          </div>
        </div>
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
