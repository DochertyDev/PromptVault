import React from 'react';
import { Tag } from 'lucide-react';

interface TagBadgeProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  variant?: 'default' | 'outline';
}

export function TagBadge({
  label,
  size = 'md',
  onClick,
  className = '',
  variant = 'default'
}: TagBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const variantClasses = {
    default: 'bg-accent-light text-accent border border-accent/30',
    outline: 'bg-transparent text-accent border border-accent/50'
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg font-medium transition-all ${sizeClasses[size]} ${variantClasses[variant]} hover:border-accent ${onClick ? 'cursor-pointer hover:bg-accent/10' : 'cursor-default'} ${className}`}
      title={label}
    >
      {onClick && <Tag className="w-3 h-3" />}
      {label}
    </button>
  );
}