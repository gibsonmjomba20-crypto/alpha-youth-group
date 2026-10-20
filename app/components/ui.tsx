"use client";
import React from "react";

// 1. PREMIUM CARD TEMPLATE
export const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-[#131C2E] border border-white/10 rounded-2xl p-5 shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-[#1a243a] active:scale-95' : ''} ${className}`}>
    {children}
  </div>
);

// 2. STAT CARD TEMPLATE
export const StatCard = ({ title, value, icon, color = "#FBBF24", trend }: { title: string, value: string, icon: React.ReactNode, color?: string, trend?: string }) => (
  <div className="bg-[#131C2E] border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden">
    <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10" style={{ backgroundColor: color }}></div>
    <div className="mb-2" style={{ color }}>{icon}</div>
    <p className="text-xs text-[#94A3B8] font-medium mb-1">{title}</p>
    <h3 className="text-xl font-bold text-white">{value}</h3>
    {trend && <p className="text-[10px] mt-1 font-semibold" style={{ color }}>{trend}</p>}
  </div>
);

// 3. PREMIUM BUTTON TEMPLATE
export const Button = ({ children, onClick, variant = "primary", className = "", disabled = false }: { children: React.ReactNode, onClick?: () => void, variant?: "primary" | "secondary" | "danger" | "ghost", className?: string, disabled?: boolean }) => {
  const baseStyle = "px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2";
  const variants = {
    primary: "bg-[#FBBF24] text-black hover:bg-[#f59e0b]",
    secondary: "bg-[#9333EA] text-white hover:bg-[#7e22ce]",
    danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20",
    ghost: "bg-white/5 text-white border border-white/10 hover:bg-white/10"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// 4. STATUS BADGE TEMPLATE
export const Badge = ({ status }: { status: string }) => {
  const getStyle = () => {
    switch (status.toLowerCase()) {
      case 'verified': case 'active': case 'approved': return "bg-green-500/10 text-green-500 border-green-500/20";
      case 'pending': return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 'rejected': case 'suspended': return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };
  return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getStyle()}`}>{status}</span>;
};

// 5. BOTTOM NAVIGATION TEMPLATE
export const BottomNav = ({ activeTab, setActiveTab, tabs }: { activeTab: string, setActiveTab: (t: string) => void, tabs: {id: string, label: string, icon: React.ReactNode}[] }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-[#0B1120]/90 backdrop-blur-lg border-t border-white/10 flex justify-around items-center pt-2 pb-6 px-2 z-50">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <div key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 cursor-pointer w-16 transition-all ${isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}>
          <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-[#FBBF24]/20' : 'bg-transparent'}`}>
            {React.cloneElement(tab.icon as React.ReactElement, { color: isActive ? '#FBBF24' : '#94A3B8', size: 24 })}
          </div>
          <span className={`text-[10px] font-bold ${isActive ? 'text-[#FBBF24]' : 'text-[#94A3B8]'}`}>{tab.label}</span>
        </div>
      );
    })}
  </nav>
);

// 6. SKELETON LOADER
export const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`}></div>
);
