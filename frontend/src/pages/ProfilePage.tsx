
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Button from '../components/ui/Button';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, stats, logout } = useGame();

  if (!user) return null;

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      navigate('/auth');
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-32">
      <nav className="sticky top-0 z-50 flex items-center bg-background-dark/80 backdrop-blur-md px-4 py-3 justify-between border-b border-white/5">
        <button onClick={() => navigate('/design')} className="size-10 flex items-center justify-start active:scale-90 transition-transform text-slate-400">
          <span className="material-symbols-outlined text-2xl">settings</span>
        </button>
        <h2 className="text-sm font-black tracking-[0.2em] flex-1 text-center uppercase text-white/80">Operator Profile</h2>
        <button onClick={handleLogout} className="size-10 flex items-center justify-end active:scale-90 transition-transform text-red-500/80">
          <span className="material-symbols-outlined text-2xl">logout</span>
        </button>
      </nav>

      <header className="flex px-6 pt-8 pb-6 flex-col items-center">
        <div className="relative mb-6">
          <div className="size-32 rounded-full border-4 border-primary shadow-2xl shadow-primary/20 overflow-hidden bg-card-dark">
            <img className="w-full h-full object-cover" src={user.avatar} alt={user.username} />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black px-3 py-1 rounded-full border-2 border-background-dark shadow-lg">
            LVL {stats.level}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-black tracking-tighter text-white font-lexend">{user.username}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-primary text-xs font-black uppercase tracking-widest">{user.rank}</span>
            <span className="size-1 bg-white/20 rounded-full"></span>
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Sector 7 Elite</span>
          </div>
        </div>
      </header>

      <section className="px-6 mb-8">
        <div className="bg-card-dark p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="flex justify-between items-end mb-4 relative z-10">
            <div className="flex flex-col">
              <p className="text-[10px] uppercase tracking-widest font-black text-white/40 mb-1">XP Progression</p>
              <p className="text-xl font-black text-white">Tier {stats.level}</p>
            </div>
            <p className="text-xs font-black text-primary font-lexend">
              {stats.xp.toLocaleString()} <span className="text-white/30">/</span> {stats.xpToNext.toLocaleString()} XP
            </p>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden relative z-10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-1000 ease-out" 
              style={{ width: `${(stats.xp / stats.xpToNext) * 100}%` }}
            ></div>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
             <span className="material-symbols-outlined text-primary text-sm fill">info</span>
             <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
               {(stats.xpToNext - stats.xp).toLocaleString()} XP until next deployment unlock
             </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 px-6 mb-8">
        <div onClick={() => navigate('/activity/summary')} className="cursor-pointer col-span-2 flex flex-col gap-1 rounded-[1.5rem] p-6 bg-primary/5 border border-primary/20 active:scale-[0.98] transition-all group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Total Conquest Distance</p>
            <span className="material-symbols-outlined text-primary fill group-hover:scale-110 transition-transform">route</span>
          </div>
          <p className="tracking-tighter text-4xl font-black text-white font-lexend">
            {stats.totalDistance.toLocaleString()} <span className="text-lg font-bold text-white/30 uppercase">KM</span>
          </p>
        </div>
        
        <div onClick={() => navigate('/map')} className="cursor-pointer flex flex-col gap-1 rounded-[1.5rem] p-5 bg-card-dark border border-white/5 shadow-lg active:scale-95 transition-all">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Territories</p>
            <span className="material-symbols-outlined text-primary text-xl">map</span>
          </div>
          <p className="tracking-tighter text-3xl font-black text-white font-lexend">{stats.territories}</p>
        </div>

        <div onClick={() => navigate('/activity/select')} className="cursor-pointer flex flex-col gap-1 rounded-[1.5rem] p-5 bg-card-dark border border-white/5 shadow-lg active:scale-95 transition-all">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Streak</p>
            <span className="material-symbols-outlined text-orange-500 text-xl fill">local_fire_department</span>
          </div>
          <p className="tracking-tighter text-3xl font-black text-white font-lexend">{stats.streak} <span className="text-xs font-bold text-white/30 uppercase">DAYS</span></p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between px-6 mb-5">
          <h2 className="text-lg font-black tracking-tight font-lexend uppercase">Medals Of Honor</h2>
          <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">View Ledger</button>
        </div>
        <div className="flex gap-6 overflow-x-auto px-6 no-scrollbar pb-4">
          <Link to="/achievement/district-lord" className="flex flex-col items-center gap-3 min-w-[90px] group active:scale-90 transition-transform">
            <div className="size-20 rounded-[2rem] bg-gradient-to-br from-yellow-400 to-primary flex items-center justify-center shadow-xl shadow-primary/20 group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-black text-4xl font-black">castle</span>
            </div>
            <p className="text-[10px] font-black text-center text-white/80 uppercase tracking-widest">District Lord</p>
          </Link>
          <Link to="/achievement/early-bird" className="flex flex-col items-center gap-3 min-w-[90px] group active:scale-90 transition-transform">
            <div className="size-20 rounded-[2rem] bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/10 group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-white text-4xl font-black">wb_sunny</span>
            </div>
            <p className="text-[10px] font-black text-center text-white/80 uppercase tracking-widest">Early Bird</p>
          </Link>
          <Link to="/achievement/hill-crusher" className="flex flex-col items-center gap-3 min-w-[90px] group active:scale-90 transition-transform">
            <div className="size-20 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-xl shadow-emerald-500/10 group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-white text-4xl font-black">landscape</span>
            </div>
            <p className="text-[10px] font-black text-center text-white/80 uppercase tracking-widest">Hill Crusher</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
