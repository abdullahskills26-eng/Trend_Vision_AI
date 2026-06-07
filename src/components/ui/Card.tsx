import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl 
        shadow-lg backdrop-blur-md
        ${hover ? 'hover:border-[var(--color-brand-primary)]/40 hover:shadow-xl transition-all duration-300 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
