"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Card, StatCard, Button } from "../../components/ui";
import { Menu, X, LogOut, LayoutDashboard, Users, History, Activity, Landmark } from "lucide-react";

export default function AdminPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (p) setProfile(p);
      const { data: u } = await supabase.from("profiles").select("*").order("full_name");
      if (u) setAllUsers(u);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#09090B] flex justify-center items-center text-[#9333EA]">Loading...</div>;

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex">
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/80 z-[999]" />}
      <div className={`fixed top-0 left-0 h-screen w-[260px] bg-[#18181B] z-[1000] transition-transform p-5 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8"><h2 className="text-lg font-extrabold text-[#9333EA]">Admin</h2><button onClick={() => setIsMenuOpen(false)}><X size={24} /></button></div>
        <button onClick={() => { setActiveTab("overview"); setIsMenuOpen(false); }} className={`flex items-center gap-3 p-3.5 rounded-xl font-bold mb-2 ${activeTab === "overview" ? 'bg-[#9333EA]/20 text-[#9333EA]' : 'text-gray-400'}`}><LayoutDashboard size={20} /> Overview</button>
        <button onClick={() => { setActiveTab("audit"); setIsMenuOpen(false); }} className={`flex items-center gap-3 p-3.5 rounded-xl font-bold ${activeTab === "audit" ? 'bg-[#9333EA]/20 text-[#9333EA]' : 'text-gray-400'}`}><History size={20} /> Audit Logs</button>
        <div className="mt-auto flex flex-col gap-3">
          <Button variant="ghost" onClick={() => router.push("/dashboard/treasurer")} className="w-full border border-[#10B981] text-[#10B981]">Treasurer Portal</Button>
          <Button variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full">Logout</Button>
        </div>
      </div>
      <div className="flex-1 w-full">
        <div className="bg-[#09090B]/90 border-b border-white/10 p-5 flex justify-between items-center sticky top-0 z-50">
            <button onClick={() => setIsMenuOpen(true)} className="text-white p-2 bg-white/5 rounded-xl"><Menu size={24} /></button>
            <h1 className="text-lg font-extrabold">Admin Portal</h1>
            <div className="w-9 h-9 rounded-xl bg-[#9333EA] flex items-center justify-center font-bold">{profile?.full_name?.charAt(0)}</div>
        </div>
        <div className="p-5 max-w-4xl mx-auto">
          {activeTab === "overview" && (
             <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard title="Total Members" value={String(allUsers.length)} icon={<Users size={24} />} color="#9333EA" />
                <StatCard title="System Status" value="Online" icon={<Activity size={24} />} color="#10B981" />
            </div>
          )}
          {activeTab === "audit" && (<div className="text-gray-400">Audit logs coming soon...</div>)}
        </div>
      </div>
    </div>
  );
}
