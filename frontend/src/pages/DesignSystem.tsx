
import React from 'react';
import Shell from '../components/layout/Shell';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const DesignSystem: React.FC = () => {
  return (
    <Shell 
      title="Design Framework" 
      showBack 
      headerRight={
        <Button variant="icon" className="bg-primary/10 text-primary p-2">
          <span className="material-symbols-outlined">settings</span>
        </Button>
      }
    >
      <div className="p-6 space-y-10 pb-40">
        
        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Buttons</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger Zone</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
          <Button variant="primary" size="xl" className="w-full" icon="bolt">START CAPTURE</Button>
        </section>

        {/* Badges Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Badges & Status</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Level 12</Badge>
            <Badge variant="success">Active Run</Badge>
            <Badge variant="danger">Under Attack</Badge>
            <Badge variant="outline">District Scout</Badge>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Cards</h2>
          
          <Card className="p-5" interactive>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Standard Card</p>
                <h3 className="text-xl font-extrabold font-lexend">Downtown Sector</h3>
              </div>
              <Badge variant="success">Safe</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-400">Interactive card with consistent borders and shadows.</p>
          </Card>

          <Card variant="accent" className="p-5">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">military_tech</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Accent Variant</h3>
                <p className="text-xs text-primary font-bold">Recommended for active states</p>
              </div>
            </div>
          </Card>

          <Card variant="outline" className="p-8 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl text-white/20">add_circle</span>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Add New Relay</p>
          </Card>
        </section>

        {/* Data Display */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Stats & Data</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'KM', val: '12.4' },
              { label: 'PTS', val: '850' },
              { label: 'RANK', val: '#24' }
            ].map(stat => (
              <div key={stat.label} className="bg-card-dark p-4 rounded-xl border border-white/5 text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black font-lexend text-primary">{stat.val}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </Shell>
  );
};

export default DesignSystem;
