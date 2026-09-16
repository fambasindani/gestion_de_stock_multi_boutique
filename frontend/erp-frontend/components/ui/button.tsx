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
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500', // Alias de primary
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500', // Alias de danger
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
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