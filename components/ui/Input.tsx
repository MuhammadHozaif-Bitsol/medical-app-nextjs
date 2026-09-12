import React, { forwardRef, useId } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, rightElement, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <input
            ref={ref}
            id={inputId}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 ${
              error ? "border-red-500" : "border-slate-300"
            } ${rightElement ? "pr-10" : ""} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-slate-400">
              {rightElement}
            </div>
          )}
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
