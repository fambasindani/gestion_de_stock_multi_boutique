'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'default' | 'icon' | 'icon-sm';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-600/25 hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:shadow-blue-600/30 focus-visible:ring-blue-500/60',
    default: 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-600/25 hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:shadow-blue-600/30 focus-visible:ring-blue-500/60', // Alias de primary
    secondary: 'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 hover:shadow focus-visible:ring-slate-400/60',
    outline: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400/60',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400/60',
    danger: 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm shadow-red-600/25 hover:from-red-600 hover:to-red-700 hover:shadow-md hover:shadow-red-600/30 focus-visible:ring-red-500/60',
    destructive: 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm shadow-red-600/25 hover:from-red-600 hover:to-red-700 hover:shadow-md hover:shadow-red-600/30 focus-visible:ring-red-500/60', // Alias de danger
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    default: 'px-4 py-2 text-sm', // Alias de md
    icon: 'h-10 w-10 p-0',
    'icon-sm': 'h-8 w-8 p-0',
  };

  // Résoudre les alias
  const resolvedVariant = variant === 'default' ? 'primary' : variant === 'destructive' ? 'danger' : variant;
  const resolvedSize = size === 'default' ? 'md' : size;

  return (
    <button
      className={cn(
        baseStyles,
        variants[resolvedVariant as keyof typeof variants],
        sizes[resolvedSize as keyof typeof sizes],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}