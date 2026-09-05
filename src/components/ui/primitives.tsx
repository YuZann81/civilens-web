import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#225332]";

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs sm:text-sm gap-2",
    lg: "px-5 py-2.5 text-sm sm:text-base gap-2.5",
  };

  const variants = {
    primary: "bg-[#225332] text-white hover:bg-[#173722] shadow-sm",
    secondary: "bg-[#f2f7f3] text-[#225332] border border-[#c5dcce] hover:bg-[#e2ede4]",
    outline: "bg-white text-[#1c241e] border border-[#e2e6df] hover:bg-[#fafaf7] hover:border-[#8c978f] shadow-xs",
    ghost: "bg-transparent text-[#5c685f] hover:text-[#1c241e] hover:bg-[#f4f5f0]",
    danger: "bg-[#b91c1c] text-white hover:bg-[#991b1b] shadow-sm",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
      )}
      {children}
    </button>
  );
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "elevated";
}

export function Card({ children, className = "", variant = "default", ...props }: CardProps) {
  const variants = {
    default: "bg-white border border-[#e2e6df] shadow-xs",
    muted: "bg-[#fafaf7] border border-[#e2e6df]",
    elevated: "bg-white border border-[#e2e6df] shadow-sm",
  };

  return (
    <div className={`rounded-2xl ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({ children, className = "", variant = "neutral", size = "md", ...props }: BadgeProps) {
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  const variants = {
    brand: "bg-[#f2f7f3] text-[#225332] border border-[#c5dcce]",
    success: "bg-[#edf7ed] text-[#15803d] border border-[#bbf7d0]",
    warning: "bg-[#fef3c7] text-[#b45309] border border-[#fde68a]",
    danger: "bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]",
    info: "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]",
    neutral: "bg-[#f4f5f0] text-[#5c685f] border border-[#e2e6df]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export function Input({ error, label, helperText, className = "", id, ...props }: InputProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[#1c241e]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#1c241e] placeholder-[#8c978f] outline-none transition duration-150 focus:border-[#225332] focus:ring-1 focus:ring-[#225332] disabled:bg-[#f4f5f0] disabled:text-[#8c978f] ${
          error ? "border-[#b91c1c]" : "border-[#e2e6df]"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-[11px] font-medium text-[#b91c1c]">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#5c685f]">{helperText}</p>
      ) : null}
    </div>
  );
}
