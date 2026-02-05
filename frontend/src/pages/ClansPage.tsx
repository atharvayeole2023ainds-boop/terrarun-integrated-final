
import React from 'react';
import { useGame } from '../context/GameContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const ClansPage: React.FC = () => {
  const { user, stats, showToast } = useGame();

  const members = [
    { name: user?.username || 'Current Agent', role: 'Elite', status: 'Standby', img: user?.avatar || 'https://picsum.photos/seed/user/100/100', online: true, inRun: false, self: true },
    { name: 'Alex R.', role: 'Leader', status: 'In-Run (4.2km)', img: 'https://picsum.photos/seed/alex/100/100', online: true, inRun: true },
    { name: 'Sarah J.', role: 'Officer', status: 'Online • Idle', img: 'https://picsum.photos/seed/sarah/100/100', online: true, inRun: false },
    { name: 'Mike Chen', role: 'Scout', status: 'Away (2h)', img: 'https://picsum.photos/seed/mike/100/100', online: false, inRun: false },
  ];

  return (
    <div className="flex flex-col flex-1 pb-40">
      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md px-4 pt-8 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="size-12 shrink-0 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
              <span className="material-symbols-outlined text-black text-3xl font-black">groups</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white font-lexend uppercase">Clan Nexus</h1>
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Sector 7 Dominance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
          </div>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
          <button className="flex-1 py-2.5 text-center rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 transition-all">Warriors</button>
          <button className="flex-1 py-2.5 text-center rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Mercenaries</button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-8">
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-card-dark border border-white/10 shadow-2xl">
            <div className="aspect-[16/8] w-full bg-cover relative grayscale brightness-50 contrast-125" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB7jdzgYzsUflfPzEtD8YQtgL3f7P1rmpB_Gp2MCgONJQApOJnxzpeHGEOKLrQlgxwxoymaNlbpr2jOj7GPNbWIoe9t30iJY0v3DmNwRKSZr7lhSn6HW-BhV_iwD5-184V9qMPAuvlfc8e8GSK2nA5n3zc525SFoOO3_wNbIAzUbIk9sVTmSEPTaGyGYjaw7PnLDuhWOr7XzY6Qdpw20uNqvF9mHijeQhlKYSy3QaS8ykFnp2eHW6tSyqtwRXAZchvRtqltxOsVHw")' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent"></div>
              <div className="absolute top-4 right-4">
                <Badge variant="primary" className="shadow-lg shadow-primary/20">RANK #14</Badge>
              </div>
            </div>
            <div className="p-6 relative -mt-10 bg-background-dark rounded-t-[2.5rem] border-t border-primary/20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black font-lexend text-white tracking-tighter">THE ROAD WARRIORS</h2>
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1">Founding Legion of Sector 7</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-white/5 border-white/5">
                  <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Team Capacity</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary shadow-[0_0_10px_rgba(244,157,37,0.5)]" style={{ width: '83%' }}></div>
                    </div>
                    <span className="text-xs font-black text-white">5/6</span>
                  </div>
                </Card>
                <Card className="p-4 bg-white/5 border-white/5">
                  <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Total Control</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-primary font-lexend">24.8</span>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">KM²</span>
                  </div>
                </Card>
              </div>
              <button className="w-full mt-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl transition-all active:scale-95">
                ACCESS CLAN COMMMS
              </button>
            </div>
          </div>
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between px-2 mb-5">
            <h3 className="text-lg font-black tracking-tighter uppercase font-lexend">Active Deployment Roster</h3>
            <button 
              onClick={() => showToast('Recruitment link copied to clipboard!', 'info')}
              className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">person_add</span> RECRUIT
            </button>
          </div>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.name} className={`flex items-center gap-4 bg-card-dark p-4 rounded-3xl border ${member.self ? 'border-primary/30 bg-primary/5' : 'border-white/5'} shadow-xl transition-all active:scale-[0.98]`}>
                <div className="relative shrink-0">
                  <div 
                    className={`size-14 rounded-2xl bg-cover bg-center border-2 ${member.inRun ? 'border-primary shadow-[0_0_10px_rgba(244,157,37,0.4)]' : 'border-white/10'} ${!member.online ? 'grayscale' : ''}`}
                    style={{ backgroundImage: `url(${member.img})` }}
                  ></div>
                  {member.online && (
                    <div className={`absolute -bottom-1 -right-1 size-4 border-4 border-card-dark rounded-full ${member.inRun ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></div>
                  )}
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-black text-white truncate">{member.name}</p>
                    {member.self && <span className="text-[8px] px-1.5 py-0.5 bg-primary text-black font-black rounded uppercase tracking-tighter">YOU</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-primary/80 uppercase tracking-widest">{member.role}</p>
                    <span className="size-1 bg-white/10 rounded-full"></span>
                    <p className={`${member.inRun ? 'text-primary' : 'text-white/40'} text-[10px] font-bold uppercase tracking-widest truncate`}>{member.status}</p>
                  </div>
                </div>
                <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">forum</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClansPage;
