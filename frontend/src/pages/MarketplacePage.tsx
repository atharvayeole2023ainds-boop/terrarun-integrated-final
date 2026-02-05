
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Reward } from '../types';

const REWARDS_DATA: Reward[] = [
  { id: '1', name: 'Nike $20 Card', points: 2500, tag: 'Hot', category: 'Fashion', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDux9zCcdxlnU4Cdl883v4KXd9QOdMOqqDYXLN0oTG7nbvrrYdJGsDEz6IKg258q_eg1pLk-XfK7PfgddwdUN_39wNmsx4p3T7mL-xuOAoqNRBRsLNqes9FmozvocrAM7K8_fnKPTqAiW3EjCRvQoRwvIwY34h3HcqOSlkacUCziO52hsmYLR0FUJqvbXm_PVqP_hupvPwvIYbBeH8ljQG9gQQNkkOXsEqFXq7aMmvv3wmjc86jqi7kdVNG_-JfRkaKOYSRVEllQg' },
  { id: '2', name: 'Starbucks Coffee', points: 500, category: 'Food', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCusbWrH51EaNv02F26z58O3GAVlEQhfc2b8C0tQ5X9-ChlZHII_RZzYNinjfVW2LUdi1fBFfCJS43hpav27Bh_MioYrpXr9uv3A63IdPjm64B6Y-K69qOA2g-aSJdysQHf35xryPqK8EO32pmL_PrlvSaM_QS3mcmam1FnHMYXqwloOOnsM4IhGxKQZhhT5LgGJjLeT7Bdv8U-7ysA6tmjDSb6QBCGMS5UUfu93DPg1nUfHBXXFnwSUh9hbQ6YuRlyxp7j5dp2Wg' },
  { id: '3', name: 'Adidas 15% Off', points: 800, tag: '-15%', category: 'Fashion', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJD56nTdoAUzXXlJqUOD6HW7kBK9USh9ZLGWoFWXjYC1MF4Hpcgs9dnl3IJkZBle7OJMWRl7nXcJtc63mMnn9CHriXynn3UmhlQ_vrXld2pU2Ke5Sxjd4MyyLFvgoIknt8MkJHZD0D7oKx3IzI4x1am8lbLukVI__Xymb0Rm8KJXGsWO1kByQu8vr0QAGmtaD6VPyVigS75xCa2XGiDptnQRNl3GcFGfm6ubqN0RN4nX2dTFODsUEoPq0F8xPRMlPfxPak39pSsw' },
  { id: '4', name: 'Amazon $5 Card', points: 1000, category: 'All', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHBHm7BXzo8KXRwfz7XwXg5J0vjKJVw1QQzr1bOMYRWtlalT94xi5c7DRGNOtBMpz37-HQLq7XiSUtR2oGYYEMhQNse06rxBHv6VwAsx_Hseuz2GQCU121fU-cNc9DwINX8Za8Wr-KnyXmkFeS-qWTJSZLSTmVnHFISb-nWRFMGWq5NdyyPW3M3KlMtGp2tf_1ume09c-78jvgCYBo459jQtkxSCQucKmLH1A7INh_2fSiwy9XstH_jUxwrsCrim8NyXdvlFQFIw' },
];

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, updatePoints } = useGame();
  const [activeCategory, setActiveCategory] = useState<'All' | 'Food' | 'Fitness' | 'Fashion'>('All');

  const handleRedeem = (reward: Reward) => {
    if (stats.points < reward.points) {
      alert("Insufficient Points! Complete more runs to earn rewards.");
      return;
    }
    
    if (confirm(`Redeem ${reward.name} for ${reward.points} points?`)) {
      updatePoints(-reward.points);
      alert("Reward Redeemed! Check your email for the voucher code.");
    }
  };

  const filteredRewards = activeCategory === 'All' 
    ? REWARDS_DATA 
    : REWARDS_DATA.filter(r => r.category === activeCategory);

  return (
    <div className="flex flex-col flex-1">
      {/* Custom Header to ensure Home navigation */}
      <header className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between bg-background-dark/90 backdrop-blur-md border-b border-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/home')}
            className="size-10 flex items-center justify-center rounded-full bg-white/5 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-base font-bold leading-tight tracking-tight uppercase tracking-widest">Marketplace</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col flex-1 pb-40">
        <div className="p-4">
          <Card variant="accent" className="p-6 bg-primary shadow-2xl shadow-primary/20">
            <div className="flex items-center justify-between text-black">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Available Balance</p>
              <span className="material-symbols-outlined font-black">wallet</span>
            </div>
            <p className="text-black tracking-tighter text-4xl font-black font-lexend mt-2">
              {stats.points.toLocaleString()} <span className="text-lg opacity-60">PTS</span>
            </p>
          </Card>
        </div>

        <div className="flex gap-3 px-4 py-2 overflow-x-auto no-scrollbar">
          {['All', 'Food', 'Fitness', 'Fashion'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat as any)}
              className={`flex h-10 shrink-0 items-center justify-center rounded-xl px-6 transition-all border ${
                activeCategory === cat 
                  ? 'bg-primary border-primary text-black font-black' 
                  : 'bg-white/5 border-white/10 text-slate-400 font-bold hover:bg-white/10'
              }`}
            >
              <p className="text-xs uppercase tracking-widest">{cat}</p>
            </button>
          ))}
        </div>

        <div className="px-4 py-8">
          <div className="grid grid-cols-2 gap-4">
            {filteredRewards.map((reward) => (
              <Card key={reward.id} className="p-3 flex flex-col gap-3 group">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/5">
                  <img src={reward.image} alt={reward.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {reward.tag && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[9px] font-black bg-primary text-black uppercase tracking-widest">
                      {reward.tag}
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <h3 className="text-sm font-bold truncate text-white">{reward.name}</h3>
                  <p className="text-primary text-xs font-black mt-1">{reward.points.toLocaleString()} PTS</p>
                </div>
                <Button 
                  onClick={() => handleRedeem(reward)}
                  disabled={stats.points < reward.points}
                  size="sm" 
                  className="w-full"
                  variant={stats.points < reward.points ? 'secondary' : 'primary'}
                >
                  {stats.points < reward.points ? 'LOCKED' : 'REDEEM'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
