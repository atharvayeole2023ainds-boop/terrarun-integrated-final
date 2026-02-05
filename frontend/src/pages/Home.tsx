
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useGame } from '../context/GameContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, stats } = useGame();

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 pb-40">
      <header className="sticky top-0 z-50 bg-background-dark/85 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/profile" className="size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 active:scale-90 transition-transform">
              <img alt={`${user.username}'s avatar`} className="w-full h-full object-cover" src={user.avatar} />
            </Link>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold leading-tight">TerraRun</h2>
              <span className="text-[10px] uppercase tracking-widest text-primary font-extrabold">{user.rank}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/alerts" className="relative text-white/60 hover:text-white transition-colors" aria-label="Notifications">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-0 right-0 size-2 bg-primary rounded-full ring-2 ring-[#1a1a1a]"></span>
            </Link>
            <Link to="/marketplace" className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 active:scale-95 transition-transform" aria-label="Marketplace balance">
              <span className="material-symbols-outlined text-primary text-sm fill">stars</span>
              <p className="text-white text-sm font-bold tracking-tight">{stats.points.toLocaleString()} <span className="text-primary/70 text-[10px]">PTS</span></p>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 pt-6 space-y-6">
        <section onClick={() => navigate('/profile')} className="flex items-center gap-5 cursor-pointer group active:scale-95 transition-transform">
          <div className="relative">
            <div className="bg-gradient-to-tr from-primary to-orange-300 p-1 rounded-full shadow-lg shadow-primary/10">
              <div className="bg-card-dark rounded-full p-1">
                <img alt="User profile icon" className="size-20 rounded-full" src={user.avatar} />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-background-dark text-[10px] font-black px-2 py-0.5 rounded-full ring-4 ring-background-dark">
              LVL {stats.level}
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-white text-2xl font-extrabold tracking-tight group-hover:text-primary transition-colors">{user.username}</p>
            <p className="text-white/50 text-sm font-medium">Ranked #24 in Sector 7</p>
          </div>
        </section>

        <section onClick={() => navigate('/marketplace')} className="cursor-pointer active:scale-95 transition-transform" aria-label="Level progress">
          <div className="rounded-xl border border-white/5 bg-card-dark shadow-lg p-4">
            <div className="flex items-end justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Current Progress</span>
                <p className="text-white text-sm font-bold">To Level {stats.level + 1}</p>
              </div>
              <p className="text-white text-xs font-medium">
                <span className="text-primary font-bold">{stats.xp.toLocaleString()}</span> / {stats.xpToNext.toLocaleString()} <span className="text-white/30 ml-1">xp</span>
              </p>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-700" style={{ width: `${(stats.xp / stats.xpToNext) * 100}%` }}></div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-extrabold tracking-tight">Today's Territory</h2>
            <button onClick={() => navigate('/activity/summary')} className="text-primary text-xs font-bold uppercase tracking-widest">History</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card onClick={() => navigate('/map')} interactive className="col-span-2 p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 size-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Distance Covered</p>
                  <p className="text-white tracking-tight text-4xl font-black">5.2 <span className="text-lg text-white/40">KM</span></p>
                </div>
                <div className="bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                  <p className="text-green-400 text-[10px] font-bold">+0.5 km Today</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 relative z-10">
                <span className="material-symbols-outlined text-primary fill">location_on</span>
                <p className="text-white/60 text-xs font-medium">Currently in Sector 7-B</p>
              </div>
            </Card>

            <Card onClick={() => navigate('/map')} interactive className="p-5">
              <div className="flex justify-between items-center mb-1">
                <span className="material-symbols-outlined text-primary/80 fill">grid_view</span>
                <div className="bg-green-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-green-400">+2</div>
              </div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Territories</p>
              <p className="text-white tracking-tight text-2xl font-black">{stats.territories}</p>
            </Card>

            <Card onClick={() => navigate('/activity/select')} interactive className="p-5">
              <div className="flex justify-between items-center mb-1">
                <span className="material-symbols-outlined text-orange-500 fill">local_fire_department</span>
                <div className="bg-primary/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-primary">🔥</div>
              </div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Streak</p>
              <p className="text-white tracking-tight text-2xl font-black">{stats.streak} <span className="text-xs text-white/40 font-bold">DAYS</span></p>
            </Card>
          </div>
        </section>

        <section>
          <Card variant="accent" className="p-0 overflow-hidden relative" onClick={() => navigate('/marketplace')}>
            <div className="flex items-center gap-4 p-5">
              <div className="size-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 shrink-0">
                <span className="material-symbols-outlined text-black text-3xl font-black">storefront</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black font-lexend text-white leading-tight">THE MARKETPLACE</h3>
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Spend your earned points</p>
              </div>
              <span className="material-symbols-outlined text-primary text-2xl">arrow_forward</span>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Home;
