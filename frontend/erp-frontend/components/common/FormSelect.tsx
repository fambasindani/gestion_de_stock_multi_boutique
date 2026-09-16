"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: Option[];
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  options,
  error,
  required,
  icon,
  placeholder = "Sélectionner...",
  className,
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <select
          id={name}
          name={name}
          className={cn(
            "w-full rounded-lg border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm transition-colors appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error 
              ? "border-red-500 ring-2 ring-red-500/20 focus:ring-red-500" 
              : "border-gray-300 dark:border-gray-700",
            icon && "pl-10",
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1 text-sm text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};