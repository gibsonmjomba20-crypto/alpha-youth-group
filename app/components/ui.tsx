"use client";
import React from "react";

export const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-gradient-to-br from-[#18181B] to-[#09090B] border border-white/10 rounded-2xl p-5 shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-[#9333EA]/20 hover:border-[#9333EA]/50 active:scale-[0.98]' : ''} ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }: { children: React.ReactNode, onClick?: () => void, variant?: "primary" | "secondary" | "danger" | "ghost", className?: string, disabled?: boolean, type?: "button" | "submit" | "reset" }) => {
  const baseStyle = "px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2";
  const variants = {
    primary: "bg-[#9333EA] text-white hover:bg-[#7e22ce] shadow-[0_0_15px_rgba(147,51,234,0.4)]",
    secondary: "bg-[#18181B] text-white border border-[#9333EA]/50 hover:bg-[#9333EA]/20",
    danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20",
    ghost: "bg-white/5 text-white border border-white/10 hover:bg-white/10"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};
