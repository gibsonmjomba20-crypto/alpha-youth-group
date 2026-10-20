"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, GraduationCap, CalendarDays, HandCoins, Banknote, UserX, UserCheck, BarChart3, Search, MessagesSquare, X, MessageSquare, ExternalLink, LogOut } from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444" }
};

const MASTER_ADMIN_EMAIL = "gibsonmjomba20@gmail.com";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [savings, setSavings] = useState<number>(0);
  const [savingsGoal, setSavingsGoal] = useState<number>(10000);
  const [loans, setLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [newMembers, setNewMembers] = useState<any[]>([]);
  
  // ADMIN STATE
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [totalGroupSavings, setTotalGroupSavings] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [appSettings, setAppSettings] = useState({ paybill_number: "", paybill_account: "", app_name: "ALPHA YOUTH GROUP", app_slogan: "Together We Rise and Shine!", default_theme: "navy" });
  const [settingsMsg, setSettingsMsg] = useState("");
  
  // FORMS
  const [newGoal, setNewGoal] = useState("");
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", time: "", location: "" });
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home"); 
  const [adminTab, setAdminTab] = useState("overview"); 
  const [showNotifications, setShowNotifications] = useState(false);
  
  const theme = THEMES.navy;
  const router = useRouter();

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) {
      setProfile(profileData);
      setSavingsGoal(profileData.savings_goal || 10000);
    }

    const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
    if (s) setSavings(s.total_savings);

    const { data: l } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (l) setLoans(l);

    const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(5);
    if (ann) setAnnouncements(ann);

    const { data: meet } = await supabase.from("meetings").select("*").order("meeting_date", { ascending: true }).limit(5);
    if (meet) setMeetings(meet);

    const { data: ev } = await supabase.from("events").select("*").order("event_date", { ascending: true }).limit(5);
    if (ev) setEvents(ev);

    const { data: newM } = await supabase.from("profiles").select("id, full_name, member_code, created_at").order("created_at", { ascending: false }).limit(3);
    if (newM) setNewMembers(newM);

    const { data: settingsData } = await supabase.from("app_settings").select("*").single();
    if (settingsData) setAppSettings(settingsData);

    if (profileData && (profileData.role === 'admin' || profileData.email === MASTER_ADMIN_EMAIL)) {
      const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (users) setAllUsers(users);
      const { data: pendingP } = await supabase.from("payments").select(`*, profiles:user_id (full_name, phone)`).eq("status", "pending");
      if (pendingP) setAllPayments(pendingP);
      const { data: allS } = await supabase.from("savings").select("total_savings");
      if (allS) setTotalGroupSavings(allS.reduce((acc, curr) => acc + curr.total_savings, 0));
    }

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  // MEMBER ACTIONS
  const handleUpdateGoal = async () => {
    await supabase.from("profiles").update({ savings_goal: parseFloat(newGoal) }).eq("id", profile.id);
    setSavingsGoal(parseFloat(newGoal)); alert("Goal updated!");
  };

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(loanRequest.amount) > savings * 3) return alert(`❌ REJECTED: Max loan is KES ${savings * 3}`);
    await supabase.from("loans").insert({ user_id: profile.id, amount: parseFloat(loanRequest.amount), purpose: loanRequest.purpose, status: "pending" });
    alert("✅ Loan Submitted"); setLoanRequest({ amount: "", purpose: "" }); fetchDashboardData();
  };

  // ADMIN ACTIONS
  const handleApprovePayment = async (id: string, uid: string, amount: number) => {
    await supabase.from("payments").update({ status: "verified" }).eq("id", id);
    const { data: currentS } = await supabase.from("savings").select("total_savings").eq("user_id", uid).single();
    if (currentS) {
      await supabase.from("savings").update({ total_savings: currentS.total_savings + amount }).eq("user_id", uid);
    }
    alert("Payment Verified and Added to Savings!"); fetchDashboardData();
  };

  const handleRejectPayment = async (id: string) => {
    await supabase.from("payments").update({ status: "rejected" }).eq("id", id);
    alert("Payment Rejected!"); fetchDashboardData();
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("meetings").insert({ title: newMeeting.title, meeting_date: newMeeting.date, time: newMeeting.time, location: newMeeting.location });
    alert("Meeting Scheduled!"); setNewMeeting({ title: "", date: "", time: "", location: "" }); fetchDashboardData();
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

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSettingsMsg("Saving...");
    await supabase.from("app_settings").update({ 
      paybill_number: appSettings.paybill_number, paybill_account: appSettings.paybill_account, app_name: appSettings.app_name, app_slogan: appSettings.app_slogan 
    }).eq("id", 1);
    setSettingsMsg("Settings Saved!"); setTimeout(() => setSettingsMsg(""), 3000);
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("announcements").insert({ title: newAnnouncement.title, content: newAnnouncement.content });
    alert("Broadcast sent!"); setNewAnnouncement({ title: "", content: "" }); fetchDashboardData();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>LOADING...</div>;

  const goalProgress = Math.min((savings / savingsGoal) * 100, 100);
  const isMasterAdmin = profile.email === MASTER_ADMIN_EMAIL || profile.role === 'admin';

  // ==========================================
  // MEMBER DASHBOARD UI
  // ==========================================
  if (!isMasterAdmin) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px" }}>
        
        {showNotifications && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "80px" }}>
            <div style={{ backgroundColor: theme.card, width: "90%", maxWidth: "400px", borderRadius: "16px", border: `1px solid ${theme.border}`, padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: theme.accent }}>Notifications</h3>
                <button onClick={() => setShowNotifications(false)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={20} /></button>
              </div>
              {announcements.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "12px" }}>No notifications yet.</p> : announcements.map(n => (
                <div key={n.id} style={{ marginBottom: "16px", backgroundColor: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", borderLeft: `3px solid ${theme.accent}` }}>
                  <p style={{ fontSize: "14px", fontWeight: "bold", color: theme.text }}>{n.title}</p>
                  <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{n.content}</p>
                  <p style={{ fontSize: "10px", color: theme.accent, marginTop: "8px" }}>{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <header style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bg, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", fontStyle: "italic" }}>A</div>
             <div><h1 style={{ fontSize: "15px", fontWeight: "800", color: theme.accent }}>{appSettings.app_name}</h1><p style={{ fontSize: "9px", color: theme.textMuted, fontStyle: "italic" }}>{appSettings.app_slogan}</p></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div onClick={() => setShowNotifications(true)} style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={22} color={theme.text} />
              {announcements.length > 0 && (<div style={{ position: "absolute", top: -2, right: 0, width: "14px", height: "14px", backgroundColor: theme.red, borderRadius: "50%", border: `2px solid ${theme.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: "bold", color: "white" }}>{announcements.length}</div>)}
            </div>
            <div onClick={() => setActiveTab("settings")} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}`, cursor: "pointer" }}>{profile.full_name.charAt(0)}</div>
          </div>
        </header>

        <main style={{ padding: "20px" }}>
          {activeTab === "home" && (
            <div>
              <div style={{ position: "relative", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: `1px solid ${theme.purple}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>{profile.full_name.charAt(0)}</div>
                  <div><p style={{ fontSize: "12px", color: theme.textMuted }}>Welcome back,</p><h2 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>{profile.full_name.split(' ')[0]}</h2></div>
                </div>
                <p style={{ fontSize: "11px", color: theme.textMuted }}>Code: <span style={{ color: theme.text, fontWeight: "bold" }}>{profile.member_code}</span></p>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} color={theme.accent}/> Quick Actions</h3>
              <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px", marginBottom: "24px" }}>
                
                <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(147, 51, 234, 0.4)` }}><Wallet size={24} color="#fff" /></div>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>Savings</span>
                </div>

                <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.green, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(16, 185, 129, 0.4)` }}><HandCoins size={24} color="#fff" /></div>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>Loans</span>
                </div>

                <a href="https://chat.whatsapp.com/YOUR_GROUP_LINK" target="_blank" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", textDecoration: "none", color: theme.text }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(37, 211, 102, 0.4)` }}><MessageCircle size={24} color="#fff" /></div>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>WhatsApp</span>
                </a>

                <div onClick={() => setActiveTab("events")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.blue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(59, 130, 246, 0.4)` }}><CalendarDays size={24} color="#fff" /></div>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>Events</span>
                </div>

                <a href="tel:0704785116" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", textDecoration: "none", color: theme.text }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(239, 68, 68, 0.4)` }}><Phone size={24} color="#fff" /></div>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>Support</span>
                </a>
              </div>

              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Target size={18} color={theme.accent}/> Savings Goal</h3>
                <div style={{ width: "100%", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "10px", height: "10px", marginBottom: "8px" }}>
                  <div style={{ width: `${goalProgress}%`, backgroundColor: theme.green, height: "100%", borderRadius: "10px" }}></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: theme.textMuted }}>
                  <span>KES {savings}</span>
                  <span>Goal: KES {savingsGoal}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <input type="number" placeholder="Set new goal" value={newGoal} onChange={e => setNewGoal(e.target.value)} style={{ flex: 1, padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white", fontSize: "12px" }} />
                  <button onClick={handleUpdateGoal} style={{ padding: "8px 16px", backgroundColor: theme.accent, color: "#000", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "12px" }}>Update</button>
                </div>
              </div>

              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={18} color={theme.accent}/> Meeting Schedules</h3>
                {meetings.length === 0 ? <p style={{ fontSize: "12px", color: theme.textMuted }}>No meetings scheduled.</p> : meetings.map(m => (
                  <div key={m.id} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", marginBottom: "8px", borderLeft: `3px solid ${theme.blue}` }}>
                    <p style={{ fontWeight: "bold" }}>{m.title}</p>
                    <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{m.meeting_date} at {m.time} | {m.location}</p>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Users size={18} color={theme.accent}/> New Members Joined</h3>
                {newMembers.map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{m.full_name.charAt(0)}</div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "bold" }}>{m.full_name}</p>
                      <p style={{ fontSize: "10px", color: theme.textMuted }}>Code: {m.member_code || "Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SAVINGS TAB */}
          {activeTab === "savings" && (
            <div>
              <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>My Savings</h2>
              <div style={{ backgroundColor: theme.card, padding: "32px 20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                <Wallet size={40} color={theme.accent} style={{ margin: "0 auto 12px auto" }} />
                <p style={{ color: theme.textMuted, fontSize: "14px" }}>Verified Balance</p>
                <h3 style={{ fontSize: "36px", fontWeight: "900", color: theme.accent }}>KES {savings}</h3>
                <button onClick={() => router.push('/dashboard/payment')} style={{ marginTop: "20px", padding: "12px 24px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>Add Savings via M-Pesa</button>
              </div>
            </div>
          )}

          {/* LOANS TAB */}
          {activeTab === "loans" && (
            <div>
              <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Apply for a Loan</h2>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <form onSubmit={handleApplyLoan} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input type="number" placeholder={`Amount (Max: ${savings * 3})`} required value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                  <input type="text" placeholder="Purpose" required value={loanRequest.purpose} onChange={e => setLoanRequest({...loanRequest, purpose: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                  <button type="submit" style={{ padding: "12px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SUBMIT APPLICATION</button>
                </form>
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <div>
              <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Upcoming Events</h2>
              {events.length === 0 ? <p style={{ color: theme.textMuted }}>No events scheduled.</p> : events.map(e => (
                <div key={e.id} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
                  <h3 style={{ color: theme.accent, fontWeight: "bold" }}>{e.title}</h3>
                  <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{e.event_date} | {e.location}</p>
                </div>
              ))}
            </div>
          )}
        </main>

        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: theme.bg, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
          <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted }}><Home size={22} /><span style={{ fontSize: "10px" }}>Home</span></div>
          <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted }}><Wallet size={22} /><span style={{ fontSize: "10px" }}>Savings</span></div>
          <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "loans" ? theme.accent : theme.textMuted }}><Briefcase size={22} /><span style={{ fontSize: "10px" }}>Loans</span></div>
          <div onClick={() => setActiveTab("events")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "events" ? theme.accent : theme.textMuted }}><CalendarDays size={22} /><span style={{ fontSize: "10px" }}>Events</span></div>
        </nav>
      </div>
    );
  }

  // ==========================================
  // MASTER ADMIN DASHBOARD
  // ==========================================
  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", minHeight: "100vh", paddingBottom: "80px" }}>
      
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", padding: "20px", borderBottom: `1px solid ${theme.purple}` }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
           <div>
             <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>Admin Dashboard</h1>
             <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>Master Account: {profile.full_name}</p>
           </div>
           <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "8px", fontWeight: "bold" }}>LOGOUT</button>
         </div>
      </div>

      <div style={{ padding: "20px" }}>
        
        {/* ADMIN NAVIGATION TABS */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", overflowX: "auto", paddingBottom: "10px" }}>
          <button onClick={() => setAdminTab("overview")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "overview" ? theme.accent : theme.card, color: adminTab === "overview" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Overview</button>
          <button onClick={() => setAdminTab("approvals")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "approvals" ? theme.accent : theme.card, color: adminTab === "approvals" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Approvals</button>
          <button onClick={() => setAdminTab("members")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "members" ? theme.accent : theme.card, color: adminTab === "members" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Members</button>
          <button onClick={() => setAdminTab("settings")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "settings" ? theme.accent : theme.card, color: adminTab === "settings" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Settings</button>
        </div>

        {adminTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)" }}>
                <Users size={24} color="#9333EA" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Total Members</p>
                <h3 style={{ fontSize: "24px", fontWeight: "800" }}>{allUsers.length}</h3>
              </div>
              <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                <FileText size={24} color="#FBBF24" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Pending</p>
                <h3 style={{ fontSize: "24px", fontWeight: "800" }}>{allPayments.length}</h3>
              </div>
              <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                <Wallet size={24} color="#10B981" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Savings</p>
                <h3 style={{ fontSize: "24px", fontWeight: "800" }}>KES {totalGroupSavings}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: theme.accent }}>Schedule Meeting</h3>
              <form onSubmit={handleCreateMeeting} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input type="text" placeholder="Meeting Title" required value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                <input type="date" required value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                <input type="time" value={newMeeting.time} onChange={e => setNewMeeting({...newMeeting, time: e.target.value})} style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                <input type="text" placeholder="Location" required value={newMeeting.location} onChange={e => setNewMeeting({...newMeeting, location: e.target.value})} style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                <button type="submit" style={{ padding: "10px", backgroundColor: theme.accent, color: "#000", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer" }}>PUBLISH</button>
              </form>
            </div>
          </div>
        )}

        {/* APPROVALS TAB */}
        {adminTab === "approvals" && (
          <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
            <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending Payments</h3>
            {allPayments.length === 0 ? <p style={{ color: theme.textMuted }}>No pending payments.</p> : allPayments.map(p => (
              <div key={p.id} style={{ backgroundColor: "rgba(0,0,0,0.1)", padding: "16px", borderRadius: "12px", marginBottom: "12px", border: `1px solid ${theme.border}` }}>
                <p style={{ fontWeight: "bold" }}>{p.profiles?.full_name}</p>
                <p style={{ fontSize: "12px", color: theme.textMuted }}>Phone: {p.profiles?.phone || "N/A"}</p>
                <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "8px", marginTop: "10px", borderLeft: `3px solid ${theme.accent}` }}>
                  <p style={{ fontSize: "12px", color: theme.textMuted }}>Code: <strong style={{ color: theme.accent }}>{p.mpesa_code}</strong></p>
                  <p style={{ fontSize: "12px", color: theme.textMuted }}>Amount: <strong>KES {p.amount}</strong></p>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button onClick={() => handleApprovePayment(p.id, p.user_id, p.amount)} style={{ flex: 1, padding: "10px", backgroundColor: theme.green, color: "#000", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>APPROVE</button>
                  <button onClick={() => handleRejectPayment(p.id)} style={{ flex: 1, padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>REJECT</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MEMBERS TAB */}
        {adminTab === "members" && (
          <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ color: theme.accent }}>Member Directory</h3>
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: "8px 10px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: "rgba(0,0,0,0.3)", color: "white", outline: "none" }} />
            </div>
            {allUsers.filter(u => u.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                <div>
                  <p style={{ fontWeight: "bold" }}>{u.full_name}</p>
                  <p style={{ fontSize: "10px", color: theme.textMuted }}>Code: {u.member_code || "PENDING"}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                   <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} style={{ padding: "6px", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.5)", color: "white", border: `1px solid ${theme.border}` }}>
                      <option value="member">Member</option><option value="chairman">Chairman</option><option value="treasurer">Treasurer</option><option value="secretary">Secretary</option><option value="admin">Admin</option>
                   </select>
                   <button onClick={() => handleStatusChange(u.id, u.membership_status)} style={{ backgroundColor: u.membership_status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: u.membership_status === 'active' ? '#EF4444' : '#10B981', padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                     {u.membership_status === 'active' ? 'Suspend' : 'Activate'}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS TAB */}
        {adminTab === "settings" && (
          <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
            <h3 style={{ marginBottom: "16px", color: theme.accent }}>App Settings</h3>
            {settingsMsg && <p style={{ color: "#10B981", marginBottom: "12px" }}>{settingsMsg}</p>}
            <form onSubmit={handleUpdateSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>App Name</label>
                <input type="text" required value={appSettings.app_name} onChange={e => setAppSettings({...appSettings, app_name: e.target.value})} style={{ width: "100%", padding: "12px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Slogan</label>
                <input type="text" required value={appSettings.app_slogan} onChange={e => setAppSettings({...appSettings, app_slogan: e.target.value})} style={{ width: "100%", padding: "12px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
              </div>
              <hr style={{ borderColor: theme.border }} />
              <div>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Paybill Number</label>
                <input type="text" required value={appSettings.paybill_number} onChange={e => setAppSettings({...appSettings, paybill_number: e.target.value})} style={{ width: "100%", padding: "12px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Account Number</label>
                <input type="text" required value={appSettings.paybill_account} onChange={e => setAppSettings({...appSettings, paybill_account: e.target.value})} style={{ width: "100%", padding: "12px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
              </div>
              <button type="submit" style={{ padding: "14px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", marginTop: "12px" }}>SAVE SETTINGS</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
