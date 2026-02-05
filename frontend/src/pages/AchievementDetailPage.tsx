
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Shell from '../components/layout/Shell';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const ACHIEVEMENTS_DATA: Record<string, any> = {
  'district-lord': {
    title: 'District Lord',
    icon: 'castle',
    gradient: 'from-yellow-400 to-primary',
    description: 'You have captured and held more than 10 territories simultaneously in the Downtown Sector.',
    rarity: 'Legendary',
    dateEarned: 'Oct 12, 2023',
    points: 500,
    stats: [
      { label: 'Territories', val: '12' },
      { label: 'Defense Wins', val: '45' }
    ]
  },
  'early-bird': {
    title: 'Early Bird',
    icon: 'wb_sunny',
    gradient: 'from-blue-400 to-indigo-600',
    description: 'The sun hasn\'t even risen, but you have. Completed 5 runs before 6:00 AM.',
    rarity: 'Rare',
    dateEarned: 'Nov 05, 2023',
    points: 250,
    stats: [
      { label: 'Early Starts', val: '5/5' },
      { label: 'Avg Time', val: '5:45 AM' }
    ]
  },
  'hill-crusher': {
    title: 'Hill Crusher',
    icon: 'landscape',
    gradient: 'from-emerald-400 to-emerald-700',
    description: 'Gravity is just a suggestion. You climbed over 1,000 meters in a single week.',
    rarity: 'Epic',
    dateEarned: 'Jan 20, 2024',
    points: 350,
    stats: [
      { label: 'Elevation', val: '1,240m' },
      { label: 'Vertical Pace', val: '240m/h' }
    ]
  }
};

const AchievementDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = ACHIEVEMENTS_DATA[id || ''] || ACHIEVEMENTS_DATA['district-lord'];

  return (
    <Shell transparentHeader showBack title="Achievement Detail">
      <div className="flex flex-col items-center px-6 pt-10 pb-40">
        <div className={`size-32 rounded-[2.5rem] bg-gradient-to-br ${data.gradient} flex items-center justify-center shadow-2xl shadow-primary/20 mb-8 animate-in zoom-in duration-500`}>
          <span className="material-symbols-outlined text-white text-6xl font-bold">{data.icon}</span>
        </div>
        
        <Badge variant="primary" className="mb-4">{data.rarity}</Badge>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-center">{data.title}</h1>
        <p className="text-slate-400 text-center px-4 leading-relaxed mb-10">
          {data.description}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mb-10">
          {data.stats.map((s: any) => (
            <div key={s.label} className="bg-card-dark border border-white/5 p-4 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-xl font-black font-lexend text-primary">{s.val}</p>
            </div>
          ))}
        </div>

        <div className="w-full bg-card-dark border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Date Earned</span>
            <span className="text-white font-bold">{data.dateEarned}</span>
          </div>
          <div className="h-[1px] bg-white/5"></div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Points Bonus</span>
            <span className="text-primary font-black">+{data.points} PTS</span>
          </div>
        </div>

        <Button 
          variant="secondary" 
          size="lg" 
          className="w-full mt-10" 
          icon="share"
          onClick={() => alert("Shared to community feed!")}
        >
          Share Achievement
        </Button>
      </div>
    </Shell>
  );
};

export default AchievementDetailPage;
