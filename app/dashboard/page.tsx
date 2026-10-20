"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, GraduationCap, CalendarDays, HandCoins, Banknote, UserX, UserCheck, BarChart3, AlertCircle } from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444" }
};

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [savings, setSavings] = useState<number>(0);
  const [totalGroupSavings, setTotalGroupSavings] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  // ADMIN STATE
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [appSettings, setAppSettings] = useState({ paybill_number: "", paybill_account: "" });
  
  // FORMS
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [settingsMsg, setSettingsMsg] = useState("");
  const [replyMsg, setReplyMsg] = useState("");

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home"); 
  const [adminTab, setAdminTab] = useState("overview"); 
  
  const theme = THEMES.navy;
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

    if (profileData && profileData.role !== 'member') {
      const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (users) setAllUsers(users);
      
      const { data: pendingP } = await supabase.from("payments").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingP) setAllPayments(pendingP);
      
      const { data: allL } = await supabase.from("loans").select(`*, profiles:user_id (full_name)`).order("created_at", { ascending: false });
      if (allL) setAllLoans(allL);

      const { data: allS } = await supabase.from("savings").select("total_savings");
      if (allS) setTotalGroupSavings(allS.reduce((acc, curr) => acc + curr.total_savings, 0));

      const { data: settingsData } = await supabase.from("app_settings").select("*").single();
      if (settingsData) setAppSettings(settingsData);
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
    await supabase.from("app_settings").update({ paybill_number: appSettings.paybill_number, paybill_account: appSettings.paybill_account }).eq("id", 1);
    setSettingsMsg("Settings Saved!"); setTimeout(() => setSettingsMsg(""), 3000);
  };

  const handleAdminReply = async (id: string) => {
    if (!replyMsg) return;
    await supabase.from("support_tickets").update({ admin_reply: replyMsg, status: "closed" }).eq("id", id);
    alert("Reply sent!"); setReplyMsg(""); fetchDashboardData();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  // PENDING GATE
  if (profile.membership_status !== 'active' && profile.role === 'member') {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
        <Clock size={48} color={theme.accent} style={{ marginBottom: "20px" }} />
        <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px" }}>Application Pending</h2>
        <p style={{ color: theme.textMuted, fontSize: "14px", maxWidth: "400px", marginBottom: "24px" }}>Your KES 1,000 payment is under review. Call <strong>0704785116</strong> to verify your code.</p>
        <a href="tel:0704785116" style={{ padding: "14px 24px", backgroundColor: theme.green, color: "#000", borderRadius: "8px", fontWeight: "bold", textDecoration: "none" }}>Call Support</a>
        <button onClick={handleLogout} style={{ marginTop: "24px", background: "transparent", border: "none", color: theme.textMuted, textDecoration: "underline", cursor: "pointer" }}>Logout</button>
      </div>
    );
  }

  // ==========================================
  // SUPER ADMIN / EXECUTIVE PORTAL (Matches Screenshot)
  // ==========================================
  if (profile.role !== 'member') {
    return (
      <div style={{ backgroundColor: "#050810", color: theme.text, fontFamily: "sans-serif", minHeight: "100vh", paddingBottom: "80px" }}>
        
        {/* HEADER */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", padding: "20px", borderBottom: "1px solid rgba(147, 51, 234, 0.3)", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px", position: "relative", overflow: "hidden" }}>
           <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "150px", background: "radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)" }}></div>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
             <div>
               <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>Admin Dashboard</h1>
               <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>Welcome back, Administrator</p>
               <p style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Manage members, approvals and keep the organization running smoothly.</p>
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "6px 12px", borderRadius: "20px", border: "1px solid #10B981" }}>
               <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }}></div>
               <span style={{ fontSize: "10px", fontWeight: "bold", color: "#10B981" }}>System status: Online</span>
             </div>
           </div>
        </div>

        <div style={{ padding: "20px" }}>
          
          {/* OVERVIEW TAB */}
          {adminTab === "overview" && (
            <div>
              {/* 6 STAT CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                
                {/* Total Members */}
                <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)", position: "relative" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><Users size={20} color="#fff" /></div>
                  <p style={{ fontSize: "12px", color: "#d1d5db" }}>Total Members</p>
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", margin: "4px 0" }}>{allUsers.length}</h3>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>Registered members</p>
                  <ChevronRight size={16} color="#9ca3af" style={{ position: "absolute", bottom: "16px", right: "16px" }} />
                </div>

                {/* Pending Approvals */}
                <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)", position: "relative" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#FBBF24", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><FileText size={20} color="#fff" /></div>
                  <p style={{ fontSize: "12px", color: "#d1d5db" }}>Pending Approvals</p>
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", margin: "4px 0" }}>{allUsers.filter(u => u.membership_status === 'pending').length}</h3>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>Applications to review</p>
                  <ChevronRight size={16} color="#9ca3af" style={{ position: "absolute", bottom: "16px", right: "16px" }} />
                </div>

                {/* Verified Savings */}
                <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.3)", position: "relative" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><Wallet size={20} color="#fff" /></div>
                  <p style={{ fontSize: "12px", color: "#d1d5db" }}>Verified Savings</p>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", margin: "4px 0" }}>KES {totalGroupSavings.toLocaleString()}</h3>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>Total verified savings</p>
                  <ChevronRight size={16} color="#9ca3af" style={{ position: "absolute", bottom: "16px", right: "16px" }} />
                </div>

                {/* Pending Payments */}
                <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.3)", position: "relative" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><CreditCard size={20} color="#fff" /></div>
                  <p style={{ fontSize: "12px", color: "#d1d5db" }}>Pending Payments</p>
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", margin: "4px 0" }}>{allPayments.length}</h3>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>Awaiting verification</p>
                  <ChevronRight size={16} color="#9ca3af" style={{ position: "absolute", bottom: "16px", right: "16px" }} />
                </div>

                {/* Active Loans */}
                <div style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(59, 130, 246, 0.3)", position: "relative" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><HandCoins size={20} color="#fff" /></div>
                  <p style={{ fontSize: "12px", color: "#d1d5db" }}>Active Loans</p>
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", margin: "4px 0" }}>{allLoans.filter(l => l.status === 'approved').length}</h3>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>Currently disbursed</p>
                  <ChevronRight size={16} color="#9ca3af" style={{ position: "absolute", bottom: "16px", right: "16px" }} />
                </div>

                {/* Upcoming Events */}
                <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)", position: "relative" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><Calendar size={20} color="#fff" /></div>
                  <p style={{ fontSize: "12px", color: "#d1d5db" }}>Upcoming Events</p>
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", margin: "4px 0" }}>{events.length}</h3>
                  <p style={{ fontSize: "10px", color: "#9ca3af" }}>Next 7 days</p>
                  <ChevronRight size={16} color="#9ca3af" style={{ position: "absolute", bottom: "16px", right: "16px" }} />
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} color={theme.accent}/> Quick Actions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "24px" }}>
                
                {/* Review Applications */}
                <div onClick={() => setAdminTab("approvals")} style={{ backgroundColor: "#131C2E", padding: "16px 10px", borderRadius: "16px", border: "1px solid #FBBF24", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(251, 191, 36, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><UserCheck size={20} color="#FBBF24" /></div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Review Applications</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>Check membership</p>
                </div>

                {/* Verify M-Pesa */}
                <div onClick={() => setAdminTab("finance")} style={{ backgroundColor: "#131C2E", padding: "16px 10px", borderRadius: "16px", border: "1px solid #9333EA", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(147, 51, 234, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><Smartphone size={20} color="#9333EA" /></div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Verify M-Pesa</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>Review payments</p>
                </div>

                {/* Add Announcement */}
                <div onClick={() => setAdminTab("broadcast")} style={{ backgroundColor: "#131C2E", padding: "16px 10px", borderRadius: "16px", border: "1px solid #3B82F6", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><Megaphone size={20} color="#3B82F6" /></div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Add Announcement</p>
                  <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>Share important updates</p>
                </div>
              </div>

              {/* APPROVAL QUEUE */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}><FileText size={18} color={theme.accent}/> Approval Queue</h3>
                <span style={{ fontSize: "12px", color: theme.accent }}>View All</span>
              </div>
              
              <div style={{ backgroundColor: "#131C2E", borderRadius: "16px", padding: "16px", marginBottom: "24px" }}>
                {allPayments.length === 0 ? <p style={{ color: "#9ca3af", fontSize: "12px" }}>No pending approvals.</p> : allPayments.slice(0, 3).map(p => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(147, 51, 234, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={18} color="#9333EA" /></div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "bold" }}>{p.profiles?.full_name || "New Member"}</p>
                        <p style={{ fontSize: "11px", color: "#9ca3af" }}>M-Pesa: {p.mpesa_code}</p>
                      </div>
                    </div>
                    <button onClick={() => setAdminTab("approvals")} style={{ padding: "6px 12px", backgroundColor: "rgba(147, 51, 234, 0.1)", border: "1px solid #9333EA", color: "#9333EA", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>Review</button>
                  </div>
                ))}
              </div>

              {/* RECENT ACTIVITY */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}><Clock size={18} color={theme.accent}/> Recent Activity</h3>
                <span style={{ fontSize: "12px", color: theme.accent }}>View All</span>
              </div>
              
              <div style={{ backgroundColor: "#131C2E", borderRadius: "16px", padding: "16px" }}>
                {allUsers.slice(0, 3).map(u => (
                   <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={18} color="#10B981" /></div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "bold" }}>New member registered</p>
                        <p style={{ fontSize: "11px", color: "#9ca3af" }}>{u.full_name}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", padding: "4px 8px", backgroundColor: "rgba(251, 191, 36, 0.1)", color: "#FBBF24", borderRadius: "4px", fontWeight: "bold" }}>Pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPROVALS TAB */}
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

          {/* FINANCE TAB */}
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

          {/* MEMBERS TAB */}
          {adminTab === "members" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `2px solid ${theme.red}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.red }}>Member Management</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "14px", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}><th style={{ padding: "12px 8px" }}>Name</th><th>Code</th><th>Role</th><th>Actions</th></tr></thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: "12px 8px", fontWeight: "bold" }}>{u.full_name}</td>
                        <td style={{ color: theme.accent, fontFamily: "monospace" }}>{u.member_code || "PENDING"}</td>
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

          {/* BROADCAST TAB */}
          {adminTab === "broadcast" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>Send Announcement</h3>
              <form onSubmit={handlePostAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "500px" }}>
                <input type="text" placeholder="Title" required value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <textarea placeholder="Message..." required value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", height: "100px" }} />
                <button type="submit" style={{ padding: "12px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>BROADCAST MESSAGE</button>
              </form>
            </div>
          )}

          {/* SETTINGS TAB */}
          {adminTab === "settings" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>Paybill Settings</h3>
              {settingsMsg && <p style={{ color: "#10B981", marginBottom: "12px" }}>{settingsMsg}</p>}
              <form onSubmit={handleUpdateSettings} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px" }}>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Business Paybill Number</label>
                <input type="text" required value={appSettings.paybill_number} onChange={e => setAppSettings({...appSettings, paybill_number: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Account Number Instruction</label>
                <input type="text" required value={appSettings.paybill_account} onChange={e => setAppSettings({...appSettings, paybill_account: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <button type="submit" style={{ padding: "12px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SAVE SETTINGS</button>
              </form>
            </div>
          )}

        </div>

        {/* ADMIN BOTTOM NAVIGATION */}
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#0a101d", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
          <div onClick={() => setAdminTab("overview")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "overview" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Home size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Overview</span></div>
          <div onClick={() => setAdminTab("approvals")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "approvals" ? theme.accent : theme.textMuted, cursor: "pointer" }}><UserCheck size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Approvals</span></div>
          <div onClick={() => setAdminTab("finance")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "finance" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Banknote size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Finance</span></div>
          <div onClick={() => setAdminTab("members")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "members" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Users size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Members</span></div>
          <div onClick={() => setAdminTab("settings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: adminTab === "settings" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Menu size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>More</span></div>
        </nav>
      </div>
    );
  }

  // ==========================================
  // MEMBER DASHBOARD (Simplified for this update)
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
