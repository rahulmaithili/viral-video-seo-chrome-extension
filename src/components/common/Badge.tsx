import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const styles = {
    default: 'bg-gray-800 text-gray-300 border-gray-700',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    info: 'bg-sky-950/70 text-sky-300 border-sky-800/60',
    purple: 'bg-brand-950/70 text-brand-300 border-brand-800/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
