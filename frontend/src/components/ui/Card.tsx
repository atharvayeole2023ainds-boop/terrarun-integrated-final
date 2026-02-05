
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  variant?: 'default' | 'accent' | 'outline';
  // Added optional onClick prop to handle click events on the card container
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Card: React.FC<CardProps> = ({ children, className = '', interactive = false, variant = 'default', onClick }) => {
  const baseStyles = "rounded-2xl transition-all duration-300 overflow-hidden";
  
  const variants = {
    default: "bg-card-dark border border-white/5 shadow-lg",
    accent: "bg-card-accent border border-primary/20 shadow-xl",
    outline: "bg-transparent border-2 border-dashed border-white/10"
  };

  const interactiveStyles = interactive ? "hover:border-primary/40 hover:translate-y-[-2px] cursor-pointer" : "";

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
