"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Card, StatCard, Button } from "../../components/ui";
import { Menu, X, LogOut, BarChart3, ShieldCheck, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function TreasurerPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (p) setProfile(p);
      const { data: pay } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      if (pay) setAllPayments(pay);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#09090B] flex justify-center items-center text-[#10B981]">Loading...</div>;

  const income = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const expense = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex">
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/80 z-[999]" />}
      <div className={`fixed top-0 left-0 h-screen w-[260px] bg-[#18181B] z-[1000] transition-transform p-5 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8"><h2 className="text-lg font-extrabold text-[#10B981]">Treasurer</h2><button onClick={() => setIsMenuOpen(false)}><X size={24} /></button></div>
        <button onClick={() => { setActiveTab("overview"); setIsMenuOpen(false); }} className={`flex items-center gap-3 p-3.5 rounded-xl font-bold ${activeTab === "overview" ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-gray-400'}`}><BarChart3 size={20} /> Overview</button>
        <div className="mt-auto">
          <Button variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full">Logout</Button>
        </div>
      </div>
      <div className="flex-1 w-full">
        <div className="bg-[#09090B]/90 border-b border-white/10 p-5 flex justify-between items-center sticky top-0 z-50">
            <button onClick={() => setIsMenuOpen(true)} className="text-white p-2 bg-white/5 rounded-xl"><Menu size={24} /></button>
            <h1 className="text-lg font-extrabold">Treasurer Portal</h1>
            <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center font-bold">{profile?.full_name?.charAt(0)}</div>
        </div>
        <div className="p-5 max-w-4xl mx-auto">
          {activeTab === "overview" && (
             <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard title="Income" value={`KES ${income.toLocaleString()}`} icon={<TrendingUp size={24} />} color="#10B981" />
                <StatCard title="Expenses" value={`KES ${expense.toLocaleString()}`} icon={<TrendingDown size={24} />} color="#EF4444" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
