
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  icon?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  isLoading,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-black shadow-lg shadow-primary/20 hover:brightness-110",
    secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
    ghost: "bg-transparent text-slate-400 hover:text-white",
    danger: "bg-red-500 text-white shadow-lg shadow-red-500/20",
    icon: "rounded-full aspect-square p-0 shrink-0"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px] rounded-lg tracking-widest uppercase",
    md: "px-5 py-2.5 text-xs rounded-xl uppercase tracking-wider",
    lg: "px-8 py-4 text-sm rounded-2xl uppercase tracking-widest",
    xl: "px-10 py-5 text-lg rounded-full font-black uppercase tracking-widest"
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={combinedClassName} {...props}>
      {isLoading ? (
        <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
      ) : (
        <>
          {icon && <span className={`material-symbols-outlined ${children ? 'mr-2' : ''} text-[20px]`}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
