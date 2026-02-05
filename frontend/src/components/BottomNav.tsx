
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Hide BottomNav on Auth screen
  if (currentPath === '/auth') return null;

  const isActive = (path: string) => currentPath === path || (path !== '/' && currentPath.startsWith(path));

  const navItems = [
    { label: 'Map', path: '/map', icon: 'explore' },
    { label: 'Clan', path: '/clans', icon: 'groups' },
    { label: 'Action', path: '/activity/select', icon: 'bolt', center: true },
    { label: 'Market', path: '/marketplace', icon: 'shopping_cart' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] border-t border-white/10 bg-background-dark/95 backdrop-blur-xl px-2 pb-8 pt-3 z-[100]">
      <div className="flex justify-around items-end">
        {navItems.map((item) => {
          if (item.center) {
            return (
              <div key={item.label} className="flex flex-col items-center justify-center -mt-6">
                <Link to={item.path} className="flex items-center justify-center size-14 rounded-full bg-primary text-black shadow-lg shadow-primary/30 border-4 border-background-dark active:scale-90 transition-transform">
                  <span className="material-symbols-outlined text-3xl font-black">{item.icon}</span>
                </Link>
                <p className="text-[9px] font-black uppercase tracking-[0.05em] mt-1 text-primary">{item.label}</p>
              </div>
            );
          }
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${
                isActive(item.path) ? 'text-primary' : 'text-slate-500'
              }`}
            >
              <span className={`material-symbols-outlined text-[26px] ${isActive(item.path) ? 'fill' : ''}`}>
                {item.icon}
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.05em]">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
