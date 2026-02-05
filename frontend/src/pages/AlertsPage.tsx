
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col flex-1 pb-32">
      <div className="sticky top-0 z-50 flex items-center bg-background-dark p-4 pb-2 justify-between border-b border-white/5 backdrop-blur-md">
        <button className="size-12 flex items-center justify-center" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">Activity & Alerts Center</h2>
        <button className="w-12 text-primary text-sm font-bold">Clear</button>
      </div>

      <div className="flex border-b border-white/10 px-4 gap-8">
        <button className="border-b-[3px] border-b-primary text-white pb-3 pt-4 text-sm font-bold">All</button>
        <button className="border-b-[3px] border-b-transparent text-slate-500 pb-3 pt-4 text-sm font-bold">Attacks</button>
        <button className="border-b-[3px] border-b-transparent text-slate-500 pb-3 pt-4 text-sm font-bold">Social</button>
      </div>

      <div className="flex flex-col gap-1 p-2">
        <div className="px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#baad9c]/60">Recent Activity</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 px-4 min-h-[84px] py-3 justify-between rounded-xl border border-red-500/20 mb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-full bg-red-500 size-12 shadow-lg shadow-red-500/20">
              <span className="material-symbols-outlined text-white">shield</span>
            </div>
            <div className="flex flex-col">
              <p className="text-base font-bold leading-tight line-clamp-1">Territory Under Attack!</p>
              <p className="text-[#baad9c] text-sm leading-normal">Sunset Park is being contested</p>
              <p className="text-red-500 text-[10px] font-bold mt-1">2m ago • CRITICAL</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/map')}
            className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full active:scale-95 transition-transform"
          >
            Defend
          </button>
        </div>

        <div className="flex items-center gap-4 bg-white/5 px-4 min-h-[84px] py-3 justify-between rounded-xl mb-2">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-cover border-2 border-primary" style={{ backgroundImage: 'url("https://picsum.photos/seed/sarah/100/100")' }}></div>
            <div className="flex flex-col">
              <p className="text-base font-medium leading-tight">Relay Invite from Sarah</p>
              <p className="text-[#baad9c] text-sm leading-normal">Wants to team up for 'Bridge Run'</p>
              <p className="text-[#baad9c]/60 text-[10px] font-medium mt-1">15m ago</p>
            </div>
          </div>
          <button className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full shadow-md shadow-primary/20">Accept</button>
        </div>

        <div className="flex items-center gap-4 bg-white/5 px-4 min-h-[84px] py-3 justify-between rounded-xl mb-2">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg size-12 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary fill">monetization_on</span>
            </div>
            <div className="flex flex-col">
              <p className="text-base font-medium leading-tight line-clamp-1">Daily Quest Reward</p>
              <p className="text-[#baad9c] text-sm">You earned 500 TerraCoins</p>
              <p className="text-[#baad9c]/60 text-[10px] font-medium mt-1">1h ago</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary text-lg font-black leading-none">+500</p>
            <p className="text-[10px] text-primary/70 font-bold">TC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
