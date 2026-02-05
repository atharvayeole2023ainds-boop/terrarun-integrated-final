
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Button from '../components/ui/Button';

const ModeSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'foot' | 'bike'>('foot');

  return (
    <div className="flex flex-col flex-1 pb-48">
      <header className="flex items-center p-4 pt-6 justify-between sticky top-0 bg-background-dark/80 backdrop-blur-md z-20">
        <button onClick={() => navigate('/home')} className="flex size-10 items-center justify-center rounded-full bg-card-dark">
          <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 uppercase tracking-widest">Select Deployment</h2>
      </header>
      <main className="flex-1 px-4 py-2 space-y-4">
        {/* Foot Recon Mode */}
        <div 
          onClick={() => setSelectedMode('foot')}
          className={`group relative flex flex-col gap-4 rounded-[1.5rem] bg-card-dark p-1 border-2 transition-all cursor-pointer ${
            selectedMode === 'foot' 
              ? 'border-primary shadow-[0_0_20px_rgba(244,157,37,0.15)]' 
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex items-stretch justify-between gap-4 p-4">
            <div className="flex flex-[2_2_0px] flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${selectedMode === 'foot' ? 'text-primary' : 'text-slate-500'}`}>directions_run</span>
                  <p className="text-white text-xl font-extrabold leading-tight uppercase tracking-tighter">Foot Recon</p>
                </div>
                <p className="text-[#baad9c] text-sm font-normal leading-normal">Optimized for high-precision territory mapping on foot.</p>
              </div>
              <div className={`flex min-w-[84px] items-center justify-center rounded-full h-8 px-4 text-[10px] font-black w-fit tracking-widest uppercase transition-colors ${
                selectedMode === 'foot' ? 'bg-primary text-black' : 'bg-white/5 text-slate-500'
              }`}>
                {selectedMode === 'foot' ? 'Selected' : 'Select'}
              </div>
            </div>
            <div className={`${selectedMode === 'foot' ? 'bg-primary/20' : 'bg-white/5'} aspect-square max-w-[100px] rounded-[1.25rem] flex-1 flex items-center justify-center transition-colors`}>
              <span className={`material-symbols-outlined text-5xl transition-colors ${selectedMode === 'foot' ? 'text-primary' : 'text-white/10'}`}>sprint</span>
            </div>
          </div>
        </div>

        {/* Rapid Expansion Mode */}
        <div 
          onClick={() => setSelectedMode('bike')}
          className={`group relative flex flex-col gap-4 rounded-[1.5rem] bg-card-dark p-1 border-2 transition-all cursor-pointer ${
            selectedMode === 'bike' 
              ? 'border-primary shadow-[0_0_20px_rgba(244,157,37,0.15)]' 
              : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex items-stretch justify-between gap-4 p-4">
            <div className="flex flex-[2_2_0px] flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${selectedMode === 'bike' ? 'text-primary' : 'text-slate-500'}`}>directions_bike</span>
                  <p className="text-white text-xl font-extrabold leading-tight uppercase tracking-tighter">Rapid Expansion</p>
                </div>
                <p className="text-[#baad9c] text-sm font-normal leading-normal">Cover vast sectors quickly using specialized vehicles.</p>
              </div>
              <div className={`flex min-w-[84px] items-center justify-center rounded-full h-8 px-4 text-[10px] font-black w-fit tracking-widest uppercase transition-colors ${
                selectedMode === 'bike' ? 'bg-primary text-black' : 'bg-white/5 text-slate-500'
              }`}>
                {selectedMode === 'bike' ? 'Selected' : 'Select'}
              </div>
            </div>
            <div className={`${selectedMode === 'bike' ? 'bg-primary/20' : 'bg-white/5'} aspect-square max-w-[100px] rounded-[1.25rem] flex-1 flex items-center justify-center transition-colors`}>
              <span className={`material-symbols-outlined text-5xl transition-colors ${selectedMode === 'bike' ? 'text-primary' : 'text-white/10'}`}>pedal_bike</span>
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-4">
          <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1">Hardware Protocols</h3>
          <div className="flex items-center gap-4 bg-card-dark px-5 py-4 rounded-[1.25rem] justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <div className="text-white flex items-center justify-center rounded-xl bg-background-dark shrink-0 size-10 border border-white/5">
                <span className="material-symbols-outlined text-primary text-xl">satellite_alt</span>
              </div>
              <div className="flex flex-col">
                <p className="text-white text-sm font-bold leading-tight">High-Res GPS</p>
                <p className="text-[#baad9c] text-[11px] font-medium opacity-60">Sub-meter tracking accuracy</p>
              </div>
            </div>
            <div className="shrink-0">
              <label className="relative flex h-7 w-12 cursor-pointer items-center rounded-full border-none bg-primary/20 p-1 has-[:checked]:justify-end has-[:checked]:bg-primary transition-all">
                <div className="h-5 w-5 rounded-full bg-white shadow-lg"></div>
                <input className="invisible absolute" type="checkbox" defaultChecked />
              </label>
            </div>
          </div>
        </div>

        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6">
          <Button 
            onClick={() => navigate('/activity/live')}
            className="w-full" 
            size="xl" 
            icon="bolt"
          >
            START MISSION
          </Button>
        </div>
      </main>
    </div>
  );
};

const LiveActivity: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col flex-1 pb-32">
      <header className="flex items-center bg-background-dark p-4 pb-2 justify-between sticky top-0 z-50">
        <div className="flex size-12 shrink-0 items-center justify-start text-primary">
          <span className="material-symbols-outlined text-3xl fill animate-pulse">radio_button_checked</span>
        </div>
        <h2 className="text-sm font-black leading-tight tracking-[0.2em] flex-1 text-center pr-12 uppercase">Sector Capture Active</h2>
      </header>

      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex min-w-[120px] flex-1 flex-col gap-1 rounded-[1.25rem] p-5 bg-card-accent border border-primary/10 shadow-xl">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest font-lexend">Duration</p>
          <p className="text-primary tracking-tighter text-3xl font-black leading-tight font-lexend italic">00:18:42</p>
        </div>
        <div className="flex min-w-[120px] flex-1 flex-col gap-1 rounded-[1.25rem] p-5 bg-card-accent border border-primary/10 shadow-xl">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest font-lexend">Expansion</p>
          <p className="text-primary tracking-tighter text-3xl font-black leading-tight font-lexend italic">3.24 KM</p>
        </div>
      </div>

      <div className="flex px-4 py-2 flex-1 min-h-[350px]">
        <div className="relative w-full h-full bg-center bg-cover rounded-[2rem] border-2 border-primary/20 shadow-2xl overflow-hidden" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDJmksNDbWds5i432jZUCMt-sSkY4DdOvCJeILgT5kbIGMGwA8R4YRrEu3fJvCGrOD8DE3unQXmUe0RqE-F-FoR65YS4IdB3OkUzQVV6GONE9Xi4pzj6h3Y7MQLvADlJMXPypRuyFiWSzlNFVQcBdPxqfBCCh607XOZnQJLo2_9RmxNpZU5ZXn64MAxZlb1-r2LUg2pgN0IwMedncMG4qSo5MPNfiw3qnsNJhxoIZjbta0jErFvMG6OSzulrQjvRjxDkb_E8phRvQ")' }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            <path className="drop-shadow-[0_0_8px_rgba(244,157,37,0.8)]" d="M 15 85 L 35 65 L 45 70 L 75 35 L 85 40" fill="none" stroke="#f49d25" strokeLinecap="round" strokeWidth="3"></path>
            <circle cx="85" cy="40" fill="#f49d25" r="5" className="animate-ping opacity-75"></circle>
            <circle cx="85" cy="40" fill="#f49d25" r="3"></circle>
          </svg>
          <div className="absolute top-4 left-4 bg-background-dark/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="size-2 bg-primary rounded-full animate-pulse"></span>
            <p className="text-[10px] font-black uppercase tracking-widest">Locked onto Satellite</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-auto p-6">
        <div className="flex w-full gap-4 max-w-[480px]">
          <button className="flex-1 h-16 rounded-[1.5rem] bg-card-dark border border-white/10 flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest active:scale-95 transition-all">
            <span className="material-symbols-outlined fill">pause_circle</span>
            <span>Hold</span>
          </button>
          <button 
            onClick={() => navigate('/activity/summary')}
            className="flex-1 h-16 rounded-[1.5rem] bg-primary text-black flex items-center justify-center gap-2 font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <span className="material-symbols-outlined fill">stop_circle</span>
            <span>Abort</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivitySummary: React.FC = () => {
  const navigate = useNavigate();
  const { addXP, updatePoints } = useGame();

  const handleFinish = () => {
    addXP(250);
    updatePoints(150);
    navigate('/home');
  };

  return (
    <div className="flex flex-col flex-1 pb-52 bg-background-dark">
      <header className="flex items-center bg-background-dark p-4 justify-between sticky top-0 z-50">
        <button className="flex size-12 shrink-0 items-center justify-start text-white/40" onClick={() => navigate('/home')}>
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <h2 className="text-sm font-black tracking-[0.2em] flex-1 text-center pr-12 uppercase">Mission Debrief</h2>
      </header>

      <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-6">
        <div className="flex flex-col items-center justify-center pt-8 gap-4 text-center">
          <div className="size-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3">
            <span className="material-symbols-outlined text-black text-6xl font-black">check_circle</span>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white font-lexend">MISSION SECURED</h1>
            <p className="text-primary text-sm font-black uppercase tracking-[0.2em] mt-1">Sector 7-B Reconnaisance</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 rounded-[1.25rem] p-4 bg-card-dark border border-white/5 shadow-lg">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Range</p>
            <p className="text-xl font-black text-white font-lexend">5.42 <span className="text-[10px] opacity-40">KM</span></p>
          </div>
          <div className="flex flex-col gap-1 rounded-[1.25rem] p-4 bg-card-dark border border-white/5 shadow-lg">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Active</p>
            <p className="text-xl font-black text-white font-lexend">28:15</p>
          </div>
          <div className="flex flex-col gap-1 rounded-[1.25rem] p-4 bg-card-dark border border-white/5 shadow-lg">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Pace</p>
            <p className="text-xl font-black text-white font-lexend">5'12"</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black font-lexend uppercase">Territory Secured</h2>
            <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-primary text-[10px] font-black uppercase tracking-widest">+250 XP • +150 PTS</span>
            </div>
          </div>
          <div className="relative w-full aspect-[16/10] bg-center bg-cover rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl group" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAMk8GIA9vZPLb_SeTV-EO4FdMaXmbzHzRc7Cacx-rUfmJ7cAClkPGLSBNm3DdL8hc0MBOW1-4UBc3E90T8f_IyPetxUv0qHtuhb5nTmngXExFsVoPiWFz6n8hVhTSAel9KVOCrxOFtIkHH1dBrxEhDtkDmK_UYEnb3uNH73KgtBhdIl67V7aOrUq7PfsYXDAPG27NmnMQ3zMfF477Mi2ihvuzo0H_lKGywCPoiOy0_IAplhyw2nIeDSnTDBsSf53ttpu3Plzj6Ew")' }}>
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
             <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
               <div className="size-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                 <span className="material-symbols-outlined text-black text-3xl font-black">landscape</span>
               </div>
               <div>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">New Stronghold</p>
                 <p className="text-white text-lg font-black font-lexend tracking-tight">Pike Place Sector</p>
               </div>
             </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6">
        <Button 
          className="w-full" 
          size="xl" 
          icon="save"
          onClick={handleFinish}
        >
          FINALIZE DATA
        </Button>
      </div>
    </div>
  );
};

const ActivityPage: React.FC = () => {
  return (
    <Routes>
      <Route path="select" element={<ModeSelection />} />
      <Route path="live" element={<LiveActivity />} />
      <Route path="summary" element={<ActivitySummary />} />
      <Route path="*" element={<ModeSelection />} />
    </Routes>
  );
};

export default ActivityPage;
