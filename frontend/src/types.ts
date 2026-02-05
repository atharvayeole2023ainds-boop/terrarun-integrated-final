
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  rank?: string;
  isPremium?: boolean;
  stats?: Partial<UserStats>;
}

export interface UserStats {
  points: number;
  level: number;
  xp: number;
  xpToNext: number;
  totalDistance: number;
  territories: number;
  streak: number;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  unlockedAt?: string;
}

export interface Reward {
  id: string;
  name: string;
  points: number;
  category: string;
  image: string;
  tag?: string;
}

export interface GameState {
  user: UserProfile | null;
  stats: UserStats;
  isLoading: boolean;
  login: (userData: UserProfile) => void;
  logout: () => void;
  updatePoints: (delta: number) => void;
  addXP: (amount: number) => void;
  achievements: Achievement[];
  refreshUser: () => Promise<UserProfile | null>;
}
