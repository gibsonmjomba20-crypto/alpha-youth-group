"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, GraduationCap, CalendarDays, HandCoins, Banknote, UserX, UserCheck, BarChart3, Search } from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444" },
  purple: { bg: "#0F0A1A", card: "rgba(45, 27, 78, 0.6)", border: "rgba(217, 70, 239, 0.2)", accent: "#D946EF", text: "#F8FAFC", textMuted: "#C4B5FD", purple: "#D946EF", blue: "#3B82F6", green: "#10B981", red: "#EF4444" },
  emerald: { bg: "#021A14", card: "rgba(6, 78, 59, 0.5)", border: "rgba(16, 185, 129, 0.2)", accent: "#10B981", text: "#F8FAFC", textMuted: "#6EE7B7", purple: "#10B981", blue: "#3B82F6", green: "#10B981", red: "#EF4444" }
};

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [savings, setSavings] = useState<number>(0);
  const [totalGroupSavings, setTotalGroupSavings] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [searchQuery, setSearchQuery] = useState("");
  
  const [appSettings, setAppSettings] = useState({ paybill_number: "", paybill_account: "", app_name: "ALPHA YOUTH GROUP", app_slogan: "Together We Rise and Shine!", default_theme: "navy" });
  const [settingsMsg, setSettingsMsg] = useState("");
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("navy");
  
  const theme = THEMES[themeName];
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home"); 
  const [adminTab, setAdminTab] = useState("overview"); 
  
  const router = useRouter();

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) setProfile(profileData);

    const { data: p } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (p) setPayments(p);

    const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
    if (s) setSavings(s.total_savings);

    const { data: l } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (l) setLoans(l);

    const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3);
    if (ann) setAnnouncements(ann);

    const { data: ev } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    if (ev) setEvents(ev);

    const { data: settingsData } = await supabase.from("app_settings").select("*").single();
    if (settingsData) {
      setAppSettings(settingsData);
      setThemeName((settingsData.default_theme as keyof typeof THEMES) || "navy");
    }

    if (profileData && profileData.role !== 'member') {
      const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (users) setAllUsers(users);
      
      const { data: pendingP } = await supabase.from("payments").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingP) setAllPayments(pendingP);
      
      const { data: allL } = await supabase.from("loans").select(`*, profiles:user_id (full_name)`).order("created_at", { ascending: false });
      if (allL) setAllLoans(allL);

      const { data: allS } = await supabase.from("savings").select("total_savings");
      if (allS) setTotalGroupSavings(allS.reduce((acc, curr) => acc + curr.total_savings, 0));
    }

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const handleVerifyPayment = async (id: string, uid: string, isRegistration: boolean) => {
    const code = `AYG-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from("payments").update({ status: "verified" }).eq("id", id);
    if (isRegistration) {
      await supabase.from("profiles").update({ membership_status: "active", member_code: code }).eq("id", uid);
      alert(`Member Approved! Code: ${code}`);
    } else {
      alert(`Payment Verified!`);
    }
    fetchDashboardData();
  };

  const handleLoanAction = async (id: string, status: string) => {
    await supabase.from("loans").update({ status }).eq("id", id); alert(`Loan ${status}!`); fetchDashboardData();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`Change role to ${newRole.toUpperCase()}?`)) return;
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    alert("Role updated!"); fetchDashboardData();
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'ACTIVATE' : 'SUSPEND'} this member?`)) return;
    await supabase.from("profiles").update({ membership_status: newStatus }).eq("id", userId);
    alert(`Member status updated.`); fetchDashboardData();
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("announcements").insert({ title: newAnnouncement.title, content: newAnnouncement.content });
    alert("Broadcast sent!"); setNewAnnouncement({ title: "", content: "" }); fetchDashboardData();
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSettingsMsg("Saving...");
    await supabase.from("app_settings").update({ 
      paybill_number: appSettings.paybill_number, 
      paybill_account: appSettings.paybill_account,
      app_name: appSettings.app_name,
      app_slogan: appSettings.app_slogan,
      default_theme: themeName
    }).eq("id", 1);
    
    setSettingsMsg("App Settings Saved!"); 
    setTimeout(() => setSettingsMsg(""), 3000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  // ==========================================
  // SUPER ADMIN / EXECUTIVE PORTAL
  // ==========================================
  if (profile.role !== 'member') {
    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", minHeight: "100vh", paddingBottom: "80px", transition: "background-color 0.3s" }}>
        
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", padding: "20px", borderBottom: `1px solid ${theme.purple}`, borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
             <div>
               <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>Admin Dashboard</h1>
               <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>Welcome back, {profile.full_name.split(' ')[0]}</p>
               <p style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{appSettings.app_slogan}</p>
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "6px 12px", borderRadius: "20px", border: "1px solid #10B981" }}>
               <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }}></div>
               <span style={{ fontSize: "10px", fontWeight: "bold", color: "#10B981" }}>Online</span>
             </div>
           </div>
        </div>

        <div style={{ padding: "20px" }}>
          
          {adminTab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)" }}><Users size={20} color="#9333EA" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Total Members</p><h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>{allUsers.length}</h3></div>
                <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}><FileText size={20} color="#FBBF24" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Pending Approvals</p><h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>{allUsers.filter(u => u.membership_status === 'pending').length}</h3></div>
                <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.3)" }}><Wallet size={20} color="#10B981" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Verified Savings</p><h3 style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>KES {totalGroupSavings.toLocaleString()}</h3></div>
                <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.3)" }}><CreditCard size={20} color="#EF4444" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Pending Payments</p><h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>{allPayments.length}</h3></div>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} color={theme.accent}/> Quick Actions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "24px" }}>
                <div onClick={() => setAdminTab("approvals")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: "1px solid #FBBF24", cursor: "pointer", textAlign: "center" }}><UserCheck size={20} color="#FBBF24" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Review Apps</p></div>
                <div onClick={() => setAdminTab("finance")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: "1px solid #9333EA", cursor: "pointer", textAlign: "center" }}><Smartphone size={20} color="#9333EA" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Verify M-Pesa</p></div>
                <div onClick={() => setAdminTab("broadcast")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: "1px solid #3B82F6", cursor: "pointer", textAlign: "center" }}><Megaphone size={20} color="#3B82F6" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Announce</p></div>
              </div>
            </div>
          )}

          {adminTab === "approvals" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending Registrations (KES 1000)</h3>
              {allPayments.filter(p => p.is_registration_fee).length === 0 ? <p style={{ color: theme.textMuted }}>No pending registrations.</p> : allPayments.filter(p => p.is_registration_fee).map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                  <div><p style={{ fontWeight: "bold" }}>{p.profiles?.full_name}</p><p style={{ fontSize: "12px", color: theme.textMuted }}>Code: <span style={{ color: theme.accent, fontWeight: "bold" }}>{p.mpesa_code}</span></p></div>
                  <button onClick={() => handleVerifyPayment(p.id, p.user_id, true)} style={{ backgroundColor: "#10B981", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>APPROVE</button>
                </div>
              ))}
            </div>
          )}

          {adminTab === "finance" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending Savings Payments</h3>
              {allPayments.filter(p => !p.is_registration_fee).length === 0 ? <p style={{ color: theme.textMuted }}>No pending savings.</p> : allPayments.filter(p => !p.is_registration_fee).map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                  <div><p style={{ fontWeight: "bold" }}>{p.profiles?.full_name}</p><p style={{ fontSize: "12px", color: theme.textMuted }}>Code: {p.mpesa_code} | KES {p.amount}</p></div>
                  <button onClick={() => handleVerifyPayment(p.id, p.user_id, false)} style={{ backgroundColor: "#10B981", color: "white", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" }}>VERIFY</button>
                </div>
              ))}
            </div>
          )}

          {adminTab === "members" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `2px solid ${theme.red}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ color: theme.red }}>Member Directory</h3>
                <div style={{ position: "relative" }}>
                  <Search size={16} color={theme.textMuted} style={{ position: "absolute", left: "10px", top: "10px" }} />
                  <input type="text" placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: "8px 10px 8px 34px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: "rgba(0,0,0,0.3)", color: "white", outline: "none" }} />
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "14px", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}><th style={{ padding: "12px 8px" }}>Name</th><th>Phone</th><th>Role</th><th>Actions</th></tr></thead>
                  <tbody>
                    {allUsers.filter(u => u.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: "12px 8px", fontWeight: "bold" }}>{u.full_name}</td>
                        <td style={{ color: theme.textMuted }}>{u.phone || "N/A"}</td>
                        <td>
                          <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} style={{ padding: "6px", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.5)", color: "white", border: `1px solid ${theme.border}` }}>
                            <option value="member">Member</option><option value="chairman">Chairman</option><option value="treasurer">Treasurer</option><option value="secretary">Secretary</option><option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <button onClick={() => handleStatusChange(u.id, u.membership_status)} style={{ backgroundColor: u.membership_status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: u.membership_status === 'active' ? '#EF4444' : '#10B981', padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                            {u.membership_status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === "settings" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>App Settings (Templates & Themes)</h3>
              {settingsMsg && <p style={{ color: "#10B981", marginBottom: "12px" }}>{settingsMsg}</p>}
              
              <form onSubmit={handleUpdateSettings} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "bold" }}>App Name (Template)</label>
                  <input type="text" required value={appSettings.app_name} onChange={e => setAppSettings({...appSettings, app_name: e.target.value})} style={{ width: "100%", padding: "12px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "bold" }}>Slogan (Template)</label>
                  <input type="text" required value={appSettings.app_slogan} onChange={e => setAppSettings({...appSettings, app_slogan: e.target.value})} style={{ width: "100%", padding: "12px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "bold" }}>Background Theme</label>
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button type="button" onClick={() => setThemeName("navy")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1120", color: "white", border: themeName === 'navy' ? `2px solid #FBBF24` : `1px solid ${theme.border}`, cursor: "pointer", fontWeight: "bold" }}>Navy</button>
                    <button type="button" onClick={() => setThemeName("purple")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0F0A1A", color: "white", border: themeName === 'purple' ? `2px solid #D946EF` : `1px solid ${theme.border}`, cursor: "pointer", fontWeight: "bold" }}>Purple</button>
                    <button type="button" onClick={() => setThemeName("emerald")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#021A14", color: "white", border: themeName === 'emerald' ? `2px solid #10B981` : `1px solid ${theme.border}`, cursor: "pointer", fontWeight: "bold" }}>Emerald</button>
                  </div>
                </div>

                <hr style={{ borderColor: theme.border, margin: "16px 0" }} />

                <div>
                  <label style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "bold" }}>Paybill Number</label>
                  <input type="text" required value={appSettings.paybill_number} onChange={e => setAppSettings({...appSettings, paybill_number: e.target.value})} style={{ width: "100%", padding: "12px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "bold" }}>Account Number Instruction</label>
                  <input type="text" required value={appSettings.paybill_account} onChange={e => setAppSettings({...appSettings, paybill_account: e.target.value})} style={{ width: "100%", padding: "12px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                </div>

                <button type="submit" style={{ padding: "14px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", marginTop: "12px" }}>SAVE SETTINGS</button>
              </form>
            </div>
          )}

        </div>

        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#0a101d", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
          <div onClick={() => setAdminTab("overview")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "overview" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Home size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Overview</span></div>
          <div onClick={() => setAdminTab("approvals")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "approvals" ? theme.accent : theme.textMuted, cursor: "pointer" }}><UserCheck size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Approvals</span></div>
          <div onClick={() => setAdminTab("finance")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "finance" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Banknote size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Finance</span></div>
          <div onClick={() => setAdminTab("members")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "members" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Users size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Members</span></div>
          <div onClick={() => setAdminTab("settings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "settings" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Settings size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Settings</span></div>
        </nav>
      </div>
    );
  }

  // ==========================================
  // MEMBER DASHBOARD (Bypasses pending screen)
  // ==========================================
  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "800", color: theme.accent }}>Welcome, {profile.full_name.split(' ')[0]}</h2>
      <p style={{ color: theme.textMuted, fontSize: "12px" }}>Code: {profile.member_code}</p>
      
      <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", marginTop: "20px" }}>
        <h3>Total Savings: KES {savings}</h3>
      </div>
      
      <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px", width: "100%", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "none", borderRadius: "8px" }}>Logout</button>
    </div>
  );
}
