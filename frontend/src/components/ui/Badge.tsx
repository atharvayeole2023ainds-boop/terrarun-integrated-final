
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'slate' | 'outline';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: "bg-primary text-black",
    success: "bg-green-500/20 text-green-400 border border-green-500/20",
    danger: "bg-red-500/20 text-red-400 border border-red-500/20",
    slate: "bg-white/5 text-slate-400",
    outline: "bg-transparent border border-white/10 text-white/60"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest font-lexend ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
