"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, name, error, required, icon, className, ...props }, ref) => {
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
          <input
            ref={ref}
            id={name}
            name={name}
            // ✅ Ne pas mettre required dans le HTML pour laisser le backend gérer
            className={cn(
              "w-full rounded-lg border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm transition-colors",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error 
                ? "border-red-500 ring-2 ring-red-500/20 focus:ring-red-500" 
                : "border-gray-300 dark:border-gray-700",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <div className="flex items-center gap-1.5 mt-1 text-sm text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";