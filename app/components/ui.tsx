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

export const Badge = ({ status }: { status: string }) => {
  const getStyle = () => {
    switch (status.toLowerCase()) {
      case 'verified': case 'active': case 'approved': return "bg-green-500/10 text-green-500 border-green-500/30";
      case 'pending': return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case 'rejected': case 'suspended': return "bg-red-500/10 text-red-500 border-red-500/30";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };
  return <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStyle()}`}>{status}</span>;
};

export const BottomNav = ({ activeTab, setActiveTab, tabs }: { activeTab: string, setActiveTab: (t: string) => void, tabs: {id: string, label: string, icon: React.ReactElement<any>}[] }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-center pt-2 pb-6 px-2 z-50">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <div key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 cursor-pointer w-16 transition-all ${isActive ? 'scale-110' : 'opacity-50 hover:opacity-100'}`}>
          <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#9333EA]/20 shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'bg-transparent'}`}>
            {React.cloneElement(tab.icon, { color: isActive ? '#9333EA' : '#A1A1AA', size: 22 })}
          </div>
          <span className={`text-[10px] font-bold ${isActive ? 'text-[#9333EA]' : 'text-[#A1A1AA]'}`}>{tab.label}</span>
        </div>
      );
    })}
  </nav>
);
