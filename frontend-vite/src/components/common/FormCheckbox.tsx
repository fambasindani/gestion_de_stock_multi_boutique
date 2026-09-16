"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  name,
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          id={name}
          className={cn(
            "h-4 w-4 rounded border-gray-300 dark:border-gray-700",
            "text-blue-600 focus:ring-2 focus:ring-blue-500",
            error && "border-red-500 ring-2 ring-red-500/20",
            className
          )}
          {...props}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </label>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};