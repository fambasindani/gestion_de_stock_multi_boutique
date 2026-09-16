"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  error,
  required,
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
      <textarea
        id={name}
        name={name}
        className={cn(
          "w-full rounded-lg border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm transition-colors",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error 
            ? "border-red-500 ring-2 ring-red-500/20 focus:ring-red-500" 
            : "border-gray-300 dark:border-gray-700",
          className
        )}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1.5 mt-1 text-sm text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};