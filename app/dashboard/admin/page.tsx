"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import ExecutiveManager from "../executives";
import { Card, StatCard, Button, Badge, Skeleton } from "../../components/ui";
import { 
  Menu, X, LogOut, LayoutDashboard, Users, History, Activity, 
  CheckCircle2, ShieldAlert, TrendingDown, Crown, Landmark, 
  Settings, Shield, Info
} from "lucide-react";

const THEMES = { navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444" } };
const MASTER_ADMIN_EMAIL = "gibsonmjomba20@gmail.com";

export default function AdminPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);

  const theme = THEMES.navy;
  const router = useRouter();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: pData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (pData) setProfile(pData);

    const { data: users } = await supabase.from("profiles").select("*").order("full_name", { ascending: true });
    if (users) setAllUsers(users);

    const { data: logs } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(30);
    if (logs) setAuditLogs(logs);

    const { data: payments } = await supabase.from("payments").select("*");
    if (payments) setAllPayments(payments);

    setLoading(false);
  };

  const logAction = async (action: string, targetId: string, details: any) => {
    try { await supabase.from("audit_logs").insert({ actor_id: profile.id, actor_name: profile.full_name, action, target_id: targetId, details }); } catch (e) {}
  };

  const handleRoleChange = async (userId: string, userEmail: string, newRole: string) => {
    if (userEmail?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) return alert("Cannot change Master Admin.");
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    await logAction("ROLE_CHANGE", userId, { new_role: newRole }); 
    fetchData();
  };

  if (loading) return <div className="min-h-screen bg-[#0B1120] flex justify-center items-center text-[#FBBF24]">Loading Admin Portal...</div>;
  if (!profile) return <div className="text-white p-5">Profile not found.</div>;

  const safeInitial = profile.full_name?.charAt(0) || "A";
  const pendingTx = allPayments.filter(p => p.status === 'pending');

  return (
    <div className="bg-[#0B1120] text-white min-h-screen flex">
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/70 z-[999]" />}
      
      {/* SIDEBAR */}
      <div className={`fixed top-0 left-0 h-screen w-[260px] bg-[#131C2E] z-[1000] transition-transform duration-300 border-r border-white/10 p-5 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-extrabold text-[#FBBF24] flex items-center gap-2"><Crown size={20}/> Admin</h2>
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><X size={24} /></button>
        </div>
        {[
          { id: "overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
          { id: "directory", label: "Manage Executives", icon: <Users size={20} /> },
          { id: "audit", label: "System Audit Logs", icon: <History size={20} /> },
        ].map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }} className={`flex items-center gap-3 p-3.5 rounded-lg mb-2 font-bold ${activeTab === item.id ? 'bg-[#FBBF24]/10 text-[#FBBF24]' : 'bg-transparent text-gray-400'}`}>
            {item.icon} {item.label}
          </button>
        ))}
        <div className="mt-auto">
          <Button variant="ghost" onClick={() => router.push("/dashboard/treasurer")} className="w-full mb-2 border border-[#10B981] text-[#10B981]"><Landmark size={20} /> Switch to Treasurer</Button>
          <Button variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full"><LogOut size={20} /> Logout</Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 pb-20 w-full">
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] p-5 border-b border-[#9333EA] flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMenuOpen(true)} className="text-white"><Menu size={28} /></button>
              <h1 className="text-xl font-extrabold text-white">Admin Portal</h1>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#9333EA] flex items-center justify-center font-bold text-white border border-[#FBBF24]">{safeInitial}</div>
        </div>

        <div className="p-5">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
             <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard title="Total Members" value={String(allUsers.length)} icon={<Users size={24} />} color="#9333EA" />
                <StatCard title="System Status" value="Online" icon={<Activity size={24} />} color="#10B981" />
                <StatCard title="Pending Verifications" value={String(pendingTx.length)} icon={<ShieldAlert size={24} />} color="#FBBF24" />
                <StatCard title="Total Users" value={String(allUsers.length)} icon={<Shield size={24} />} color="#3B82F6" />
            </div>
          )}

          {/* DIRECTORY TAB */}
          {activeTab === "directory" && (
            <ExecutiveManager users={allUsers} onRoleChange={handleRoleChange} theme={theme} />
          )}
          
          {/* AUDIT LOGS TAB */}
          {activeTab === "audit" && (
            <div>
              <h3 className="mb-4 text-[#3B82F6] font-bold flex items-center gap-2"><History size={20}/> Recent Activity</h3>
              {auditLogs.length === 0 ? <p className="text-gray-400 text-sm">No audit logs found.</p> : auditLogs.map(log => {
                let LogIcon = <Activity size={16} className="text-gray-400"/>;
                if (log.action.includes("VERIFIED")) LogIcon = <CheckCircle2 size={16} className="text-[#10B981]"/>;
                if (log.action.includes("REJECTED")) LogIcon = <X size={16} className="text-[#EF4444]"/>;
                if (log.action.includes("ROLE")) LogIcon = <ShieldAlert size={16} className="text-[#FBBF24]"/>;
                if (log.action.includes("EXPENSE")) LogIcon = <TrendingDown size={16} className="text-[#EF4444]"/>;

                return (
                  <Card key={log.id} className="mb-2 flex items-start gap-3">
                    <div className="mt-1">{LogIcon}</div>
                    <div>
                      <p className="font-bold text-sm text-white">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400">By: {log.actor_name}</p>
                      <p className="text-[10px] text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
// Rebuild trigger
