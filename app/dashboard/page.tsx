"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, 
  Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, 
  Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, 
  Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, 
  Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, 
  GraduationCap, CalendarDays, HandCoins, Banknote, UserX, UserCheck, BarChart3, 
  Search, MessagesSquare, X, MessageSquare, ExternalLink, LogOut, Presentation, 
  HeartHandshake, LifeBuoy, AlertCircle, LayoutDashboard, MoreHorizontal, AlertTriangle
} from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444", whatsapp: "#25D366" }
};

const MASTER_ADMIN_EMAIL = "gibsonmjomba20@gmail.com";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [savings, setSavings] = useState<number>(0);
  const [savingsGoal, setSavingsGoal] = useState<number>(10000);
  const [loans, setLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [myCareRequests, setMyCareRequests] = useState<any[]>([]);
  const [myPayments, setMyPayments] = useState<any[]>([]); 
  
  // ADMIN STATE
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [allCareRequests, setAllCareRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [financeFilter, setFinanceFilter] = useState("pending");
  const [appSettings, setAppSettings] = useState<any>({ paybill_number: "0704785116", paybill_account: "ALPHA", app_name: "ALPHA YOUTH GROUP", app_slogan: "Together We Rise and Shine!", whatsapp_link: "" });
  const [settingsMsg, setSettingsMsg] = useState("");
  
  // FORMS
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", time: "", location: "" });
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "" });
  const [careRequest, setCareRequest] = useState({ reason: "", isEmergency: false, agreed: false });
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "" });

  // BROADCAST STATE
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("home"); 
  const [adminTab, setAdminTab] = useState("overview"); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  const theme = THEMES.navy;
  const router = useRouter();

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) {
        setProfile(profileData);
        setSavingsGoal(profileData.savings_goal || 10000);
      }

      const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
      if (s) setSavings(s.total_savings);

      const { data: p } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (p) setMyPayments(p);

      const { data: l } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (l) setLoans(l);

      const { data: care } = await supabase.from("alpha_care").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (care) setMyCareRequests(care);

      const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(5);
      if (ann) setAnnouncements(ann);

      const { data: ev } = await supabase.from("events").select("*").order("event_date", { ascending: true }).limit(5);
      if (ev) setEvents(ev);

      const { data: settingsData } = await supabase.from("app_settings").select("*").single();
      if (settingsData) setAppSettings(settingsData);

      // Admin specific data
      if (profileData && (profileData.role === 'admin' || profileData.email === MASTER_ADMIN_EMAIL)) {
        const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (users) setAllUsers(users);
        
        const { data: allP } = await supabase.from("payments").select(`*, profiles:user_id (full_name, phone)`).order("created_at", { ascending: false });
        if (allP) setAllPayments(allP);
        
        const { data: pendingCare } = await supabase.from("alpha_care").select(`*, profiles:user_id (full_name, phone)`).eq("status", "pending");
        if (pendingCare) setAllCareRequests(pendingCare);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  // MEMBER ACTIONS
  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(loanRequest.amount) > savings * 3) return alert(`❌ REJECTED: Max loan is KES ${savings * 3}`);
    await supabase.from("loans").insert({ user_id: profile.id, amount: parseFloat(loanRequest.amount), purpose: loanRequest.purpose, status: "pending" });
    alert("✅ Loan Submitted"); setLoanRequest({ amount: "", purpose: "" }); fetchDashboardData();
  };

  const handleApplyCare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careRequest.agreed) return alert("You must agree to the terms.");
    await supabase.from("alpha_care").insert({ user_id: profile.id, reason: careRequest.reason, is_emergency: careRequest.isEmergency, status: "pending" });
    alert(`✅ ${careRequest.isEmergency ? 'EMERGENCY ' : ''}Request submitted to Admin.`); 
    setCareRequest({ reason: "", isEmergency: false, agreed: false }); 
    fetchDashboardData();
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

  const handleCareAction = async (id: string, status: string) => {
    await supabase.from("alpha_care").update({ status }).eq("id", id);
    alert(`Alpha Care Request ${status}!`); fetchDashboardData();
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("meetings").insert({ title: newMeeting.title, meeting_date: newMeeting.date, time: newMeeting.time, location: newMeeting.location });
    alert("Meeting Scheduled!"); setNewMeeting({ title: "", date: "", time: "", location: "" }); fetchDashboardData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("events").insert({ title: newEvent.title, event_date: newEvent.date, location: newEvent.location });
    alert("Event Published!"); setNewEvent({ title: "", date: "", location: "" }); fetchDashboardData();
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSending(true);
    const { error } = await supabase.from("announcements").insert({ title: broadcastTitle, content: broadcastContent });
    setBroadcastSending(false);
    if (error) return alert("Error: " + error.message);
    alert("Broadcast sent successfully!");
    setBroadcastTitle(""); setBroadcastContent("");
    fetchDashboardData();
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
      paybill_number: appSettings.paybill_number, 
      paybill_account: appSettings.paybill_account, 
      app_name: appSettings.app_name, 
      app_slogan: appSettings.app_slogan,
      whatsapp_link: appSettings.whatsapp_link
    }).eq("id", 1);
    setSettingsMsg("Settings Saved!"); setTimeout(() => setSettingsMsg(""), 3000); fetchDashboardData();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <RefreshCw className="animate-spin" size={32} />
      <p style={{ marginTop: "16px", color: theme.textMuted }}>Loading Alpha Youth Group...</p>
    </div>
  );

  if (errorMsg) return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
      <AlertCircle size={48} color={theme.red} />
      <h2 style={{ marginTop: "16px", color: theme.red }}>Something went wrong</h2>
      <p style={{ marginTop: "8px", color: theme.textMuted }}>{errorMsg}</p>
      <button onClick={fetchDashboardData} style={{ marginTop: "20px", padding: "12px 24px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>Retry</button>
    </div>
  );

  if (!profile) return <div style={{ color: "white", padding: "20px" }}>Profile not found. Please contact support.</div>;

  const goalProgress = Math.min((savings / savingsGoal) * 100, 100);
  const isMasterAdmin = profile.email === MASTER_ADMIN_EMAIL || profile.role === 'admin';
  const safeName = profile?.full_name || "Member";
  const safeInitial = safeName.charAt(0);

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
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: theme.accent, display: "flex", alignItems: "center", gap: "8px" }}><Bell size={20} /> Notifications</h3>
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
            <div onClick={() => setActiveTab("more")} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}`, cursor: "pointer" }}>{safeInitial}</div>
          </div>
        </header>

        <main style={{ padding: "20px" }}>
          {/* HOME TAB */}
          {activeTab === "home" && (
            <div>
              <div style={{ position: "relative", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: `1px solid ${theme.purple}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>{safeInitial}</div>
                  <div><p style={{ fontSize: "12px", color: theme.textMuted }}>Welcome back,</p><h2 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>{safeName.split(' ')[0]}</h2></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: theme.textMuted, marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${theme.border}` }}>
                  <span>Code: <span style={{ color: theme.text, fontWeight: "bold" }}>{profile.member_code || "PENDING"}</span></span>
                  <span>Status: <span style={{ color: profile.membership_status === 'active' ? theme.green : theme.red, fontWeight: "bold" }}>{profile.membership_status?.toUpperCase() || "PENDING"}</span></span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div onClick={() => setActiveTab("savings")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                  <Wallet size={20} color={theme.accent} />
                  <p style={{ fontSize: "11px", color: theme.textMuted, marginTop: "8px" }}>Alpha Wallet</p>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>KES {savings.toLocaleString()}</h3>
                </div>
                <div onClick={() => setActiveTab("alphacare")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                  <HeartHandshake size={20} color="#F43F5E" />
                  <p style={{ fontSize: "11px", color: theme.textMuted, marginTop: "8px" }}>Alpha Care</p>
                  <h3 style={{ fontSize: "14px", fontWeight: "bold", color: theme.textMuted }}>{myCareRequests.filter(c => c.status === 'pending').length} Pending</h3>
                </div>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} color={theme.accent}/> Quick Actions</h3>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", marginBottom: "24px", scrollbarWidth: "none" }}>
                <style>{`::-webkit-scrollbar { display: none; }`}</style>
                
                <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(147, 51, 234, 0.4)` }}><Wallet size={24} color="#fff" /></div>
                  <span style={{ fontSize: "10px", fontWeight: "600" }}>Wallet</span>
                </div>

                <div onClick={() => setActiveTab("alphacare")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: "#F43F5E", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(244, 63, 94, 0.4)` }}><HeartHandshake size={24} color="#fff" /></div>
                  <span style={{ fontSize: "10px", fontWeight: "600" }}>Alpha Care</span>
                </div>

                <div onClick={() => setActiveTab("events")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.blue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(59, 130, 246, 0.4)` }}><CalendarDays size={24} color="#fff" /></div>
                  <span style={{ fontSize: "10px", fontWeight: "600" }}>Events</span>
                </div>

                <a href={appSettings.whatsapp_link || "https://chat.whatsapp.com/"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", textDecoration: "none", color: theme.text }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.whatsapp, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(37, 211, 102, 0.4)` }}><MessageCircle size={24} color="#fff" /></div>
                  <span style={{ fontSize: "10px", fontWeight: "600" }}>WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* ALPHA CARE TAB */}
          {activeTab === "alphacare" && (
            <div>
              <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", color: "#F43F5E" }}>Alpha Care Center</h2>
              <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "20px" }}>Community support, empowerment, and welfare programs.</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                  <HeartHandshake size={18} color="#F43F5E" /><p style={{ fontSize: "11px", fontWeight: "bold", marginTop: "6px" }}>Assistance</p>
                </div>
                <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                  <Users size={18} color={theme.blue} /><p style={{ fontSize: "11px", fontWeight: "bold", marginTop: "6px" }}>Volunteer</p>
                </div>
                <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                  <Zap size={18} color={theme.accent} /><p style={{ fontSize: "11px", fontWeight: "bold", marginTop: "6px" }}>Empowerment</p>
                </div>
                <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}` }}>
                  <Folder size={18} color={theme.green} /><p style={{ fontSize: "11px", fontWeight: "bold", marginTop: "6px" }}>Projects</p>
                </div>
              </div>

              {/* EMERGENCY CALL BUTTON */}
              <a href="tel:0704785116" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: `1px solid ${theme.red}`, borderRadius: "12px", color: theme.red, textDecoration: "none", fontWeight: "bold", marginBottom: "24px" }}>
                <Phone size={20} /> Call Emergency Support
              </a>

              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>Apply for Support</h3>
                <form onSubmit={handleApplyCare} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <textarea placeholder="Reason for application..." required value={careRequest.reason} onChange={e => setCareRequest({...careRequest, reason: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", height: "80px" }} />
                  
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: careRequest.isEmergency ? theme.red : "white" }}>
                    <input type="checkbox" checked={careRequest.isEmergency} onChange={e => setCareRequest({...careRequest, isEmergency: e.target.checked})} style={{ accentColor: theme.red }} /> 
                    Mark as Emergency
                  </label>
                  
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: theme.accent }}>
                    <input type="checkbox" required checked={careRequest.agreed} onChange={e => setCareRequest({...careRequest, agreed: e.target.checked})} /> I agree to the terms.
                  </label>
                  
                  <button type="submit" style={{ padding: "12px", backgroundColor: careRequest.isEmergency ? theme.red : "#F43F5E", color: "#fff", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "0.3s" }}>
                    {careRequest.isEmergency && <AlertTriangle size={18} />} 
                    {careRequest.isEmergency ? "SUBMIT EMERGENCY REQUEST" : "SUBMIT REQUEST"}
                  </button>
                </form>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>My Support Requests</h3>
              {myCareRequests.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "12px" }}>No support requests yet.</p> : myCareRequests.map(r => (
                <div key={r.id} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "12px", border: `1px solid ${r.is_emergency ? theme.red : theme.border}`, marginBottom: "8px" }}>
                  {r.is_emergency && <p style={{ fontSize: "10px", fontWeight: "bold", color: theme.red, marginBottom: "4px" }}>🚨 EMERGENCY</p>}
                  <p style={{ fontSize: "14px", fontWeight: "bold" }}>{r.reason}</p>
                  <p style={{ fontSize: "12px", fontWeight: "bold", marginTop: "8px", color: r.status === 'approved' ? theme.green : r.status === 'rejected' ? theme.red : theme.accent }}>Status: {r.status.toUpperCase()}</p>
                </div>
              ))}
            </div>
          )}

          {/* SAVINGS / ALPHA WALLET TAB */}
          {activeTab === "savings" && (
            <div>
              <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}><Wallet color={theme.accent}/> Alpha Wallet</h2>
              
              {/* PAYMENT DETAILS CARD */}
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.purple}`, marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "bold", color: theme.purple, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><Landmark size={16}/> Your M-Pesa Details</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: theme.textMuted }}>Paybill Number:</span>
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>{appSettings.paybill_number}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: theme.textMuted }}>Account (Member ID):</span>
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: theme.accent }}>{profile.member_code || "PENDING"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: theme.textMuted }}>Phone Number:</span>
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>{profile.phone || "Not Set"}</span>
                </div>
                <p style={{ fontSize: "10px", color: theme.textMuted, marginTop: "12px", textAlign: "center", fontStyle: "italic" }}>Use your Member ID as the Account Number when paying.</p>
              </div>

              <div style={{ backgroundColor: theme.card, padding: "24px 20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", marginBottom: "24px" }}>
                <p style={{ color: theme.textMuted, fontSize: "14px" }}>Verified Balance</p>
                <h3 style={{ fontSize: "36px", fontWeight: "900", color: theme.accent }}>KES {savings.toLocaleString()}</h3>
                <button onClick={() => router.push('/dashboard/payment')} style={{ marginTop: "20px", padding: "12px 24px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%" }}><Smartphone size={18}/> Deposit via M-Pesa</button>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>Contribution History</h3>
              {myPayments.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "12px" }}>No payment records found.</p> : myPayments.map(p => (
                <div key={p.id} style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: "bold", fontSize: "14px" }}>KES {p.amount}</p>
                    <p style={{ fontSize: "10px", color: theme.textMuted }}>Ref: {p.mpesa_code}</p>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px", backgroundColor: p.status === 'verified' ? 'rgba(16, 185, 129, 0.2)' : p.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: p.status === 'verified' ? theme.green : p.status === 'rejected' ? theme.red : theme.accent }}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <div>
              <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Events & Meetings</h2>
              {events.length === 0 ? (
                <div style={{ backgroundColor: theme.card, padding: "40px 20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                  <CalendarDays size={40} color={theme.textMuted} style={{ margin: "0 auto 12px" }} />
                  <p style={{ color: theme.textMuted }}>No upcoming events at the moment.</p>
                </div>
              ) : events.map(e => (
                <div key={e.id} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
                  <h3 style={{ color: theme.accent, fontWeight: "bold" }}>{e.title}</h3>
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px", fontSize: "12px", color: theme.textMuted }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14}/> {e.event_date}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14}/> {e.location}</span>
                  </div>
                  <p style={{ fontSize: "13px", marginTop: "12px", color: theme.text }}>{e.description || "Join us for this community event."}</p>
                </div>
              ))}
            </div>
          )}

          {/* MORE TAB */}
          {activeTab === "more" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>More Services</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  { title: "My Membership", icon: <User size={24} color={theme.accent} />, action: () => setActiveTab("home") },
                  { title: "Shares", icon: <TrendingUp size={24} color={theme.green} />, action: () => alert("Shares module coming soon") },
                  { title: "Loans", icon: <HandCoins size={24} color={theme.purple} />, action: () => setActiveTab("loans") },
                  { title: "Transactions", icon: <ArrowRightLeft size={24} color={theme.blue} />, action: () => setActiveTab("savings") },
                  { title: "Notifications", icon: <Bell size={24} color={theme.red} />, action: () => setShowNotifications(true) },
                  { title: "Projects", icon: <Folder size={24} color={theme.accent} />, action: () => setActiveTab("alphacare") },
                  { title: "Opportunities", icon: <Briefcase size={24} color={theme.green} />, action: () => alert("Opportunities coming soon") },
                  { title: "Learning Center", icon: <GraduationCap size={24} color={theme.blue} />, action: () => alert("Learning Center coming soon") },
                  { title: "Directory", icon: <Users size={24} color={theme.purple} />, action: () => alert("Directory coming soon") },
                  { title: "Documents", icon: <FileText size={24} color={theme.textMuted} />, action: () => alert("Documents coming soon") },
                  { title: "Support Center", icon: <LifeBuoy size={24} color={theme.red} />, action: () => window.location.href = "tel:0704785116" },
                  { title: "Settings", icon: <Settings size={24} color={theme.text} />, action: () => router.push('/dashboard/settings') },
                ].map((item, index) => (
                  <div key={index} onClick={item.action} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>{item.title}</span>
                  </div>
                ))}
              </div>
              
              <button onClick={handleLogout} style={{ marginTop: "30px", width: "100%", padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: theme.red, borderRadius: "12px", fontWeight: "bold", border: "1px solid rgba(239, 68, 68, 0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          )}

          {/* LOANS TAB */}
          {activeTab === "loans" && (
            <div>
              <button onClick={() => setActiveTab("more")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back to More</button>
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

        </main>

        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: theme.bg, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0", zIndex: 1000 }}>
          <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Home size={22} /><span style={{ fontSize: "10px" }}>Home</span></div>
          <div onClick={() => setActiveTab("alphacare")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "alphacare" ? theme.accent : theme.textMuted, cursor: "pointer" }}><HeartHandshake size={22} /><span style={{ fontSize: "10px" }}>Care</span></div>
          <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Wallet size={22} /><span style={{ fontSize: "10px" }}>Wallet</span></div>
          <div onClick={() => setActiveTab("events")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "events" ? theme.accent : theme.textMuted, cursor: "pointer" }}><CalendarDays size={22} /><span style={{ fontSize: "10px" }}>Events</span></div>
          <div onClick={() => setActiveTab("more")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "more" ? theme.accent : theme.textMuted, cursor: "pointer" }}><MoreHorizontal size={22} /><span style={{ fontSize: "10px" }}>More</span></div>
        </nav>
      </div>
    );
  }

  // ==========================================
  // MASTER ADMIN DASHBOARD (SLIDING SIDEBAR)
  // ==========================================
  const adminMenuItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { id: "finance", label: "Finance", icon: <Wallet size={20} /> },
    { id: "directory", label: "Directory", icon: <Users size={20} /> },
    { id: "broadcast", label: "Broadcast", icon: <Megaphone size={20} /> },
    { id: "care", label: "Alpha Care", icon: <HeartHandshake size={20} /> },
    { id: "content", label: "Events", icon: <CalendarDays size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", minHeight: "100vh", display: "flex" }}>
      
      {isAdminMenuOpen && (
        <div onClick={() => setIsAdminMenuOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 999 }} />
      )}

      <div style={{ position: "fixed", top: 0, left: isAdminMenuOpen ? 0 : "-280px", width: "260px", height: "100vh", backgroundColor: theme.card, zIndex: 1000, transition: "0.3s ease-in-out", borderRight: `1px solid ${theme.border}`, padding: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: theme.accent }}>Admin Menu</h2>
          <button onClick={() => setIsAdminMenuOpen(false)} style={{ background: "none", border: "none", color: theme.textMuted }}><X size={24} /></button>
        </div>

        {adminMenuItems.map((item) => (
          <button key={item.id} onClick={() => { setAdminTab(item.id); setIsAdminMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "8px", backgroundColor: adminTab === item.id ? "rgba(251, 191, 36, 0.1)" : "transparent", color: adminTab === item.id ? theme.accent : theme.textMuted, border: "none", fontWeight: "bold", cursor: "pointer", marginBottom: "8px", textAlign: "left", fontSize: "15px" }}>
            {item.icon} {item.label}
          </button>
        ))}

        <div style={{ marginTop: "auto" }}>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", width: "100%", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: theme.red, border: "none", fontWeight: "bold", cursor: "pointer" }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, paddingBottom: "80px", width: "100%" }}>
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", padding: "20px", borderBottom: `1px solid ${theme.purple}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <button onClick={() => setIsAdminMenuOpen(true)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><Menu size={28} /></button>
             <div><h1 style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>Admin Portal</h1></div>
           </div>
           <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}` }}>{safeInitial}</div>
        </div>

        <div style={{ padding: "20px" }}>
          
          {adminTab === "overview" && (
            <div>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)" }}>
                  <Users size={24} color="#9333EA" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Total Members</p><h3 style={{ fontSize: "24px", fontWeight: "800" }}>{allUsers.length}</h3>
                </div>
                <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                  <FileText size={24} color="#FBBF24" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Pending Approvals</p><h3 style={{ fontSize: "24px", fontWeight: "800" }}>{allPayments.filter(p=>p.status === "pending").length}</h3>
                </div>
              </div>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: theme.accent, display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={18}/> Schedule Meeting</h3>
                <form onSubmit={handleCreateMeeting} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input type="text" placeholder="Meeting Title" required value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <input type="date" required value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <input type="text" placeholder="Location" required value={newMeeting.location} onChange={e => setNewMeeting({...newMeeting, location: e.target.value})} style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <button type="submit" style={{ padding: "10px", backgroundColor: theme.accent, color: "#000", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><PlusCircle size={18}/> PUBLISH</button>
                </form>
              </div>
            </div>
          )}

          {adminTab === "finance" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent, display: "flex", alignItems: "center", gap: "8px" }}><Wallet size={20}/> Finance Ledger</h3>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                {["pending", "verified", "rejected"].map(status => (
                  <button key={status} onClick={() => setFinanceFilter(status)} style={{ padding: "8px 12px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", textTransform: "capitalize", backgroundColor: financeFilter === status ? theme.accent : "rgba(0,0,0,0.3)", color: financeFilter === status ? "#000" : "white" }}>{status}</button>
                ))}
              </div>

              {allPayments.filter(p => p.status === financeFilter).length === 0 ? <p style={{ color: theme.textMuted }}>No {financeFilter} payments found.</p> : allPayments.filter(p => p.status === financeFilter).map(p => (
                <div key={p.id} style={{ backgroundColor: "rgba(0,0,0,0.1)", padding: "16px", borderRadius: "12px", marginBottom: "12px", border: `1px solid ${theme.border}` }}>
                  <p style={{ fontWeight: "bold" }}>{p.profiles?.full_name}</p>
                  <p style={{ fontSize: "11px", color: theme.textMuted }}>Phone: {p.profiles?.phone || "N/A"}</p>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "8px", marginTop: "10px", borderLeft: `3px solid ${theme.accent}` }}>
                    <p style={{ fontSize: "12px", color: theme.textMuted }}>Code: <strong style={{ color: theme.accent }}>{p.mpesa_code}</strong> | KES {p.amount}</p>
                  </div>
                  {p.status === "pending" && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      <button onClick={() => handleApprovePayment(p.id, p.user_id, p.amount)} style={{ flex: 1, padding: "10px", backgroundColor: theme.green, color: "#000", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><CheckCircle2 size={16}/> APPROVE</button>
                      <button onClick={() => handleRejectPayment(p.id)} style={{ flex: 1, padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><X size={16}/> REJECT</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {adminTab === "directory" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ color: theme.accent, display: "flex", alignItems: "center", gap: "8px" }}><Users size={20}/> Directory</h3>
              </div>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <Search size={18} color={theme.textMuted} style={{ position: "absolute", left: "12px", top: "12px" }} />
                <input type="text" placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: "rgba(0,0,0,0.3)", color: "white", outline: "none" }} />
              </div>
              {allUsers.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{u.full_name?.charAt(0) || "U"}</div>
                    <div>
                      <p style={{ fontWeight: "bold" }}>{u.full_name}</p>
                      <p style={{ fontSize: "10px", color: theme.textMuted }}>ID: {u.member_code || "PENDING"}</p>
                      <p style={{ fontSize: "10px", color: theme.textMuted }}>Phone: {u.phone || "N/A"}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                     {u.phone && (
                       <a href={`https://wa.me/${u.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: theme.whatsapp, display: "flex", alignItems: "center", justifyContent: "center", padding: "6px", backgroundColor: "rgba(37, 211, 102, 0.1)", borderRadius: "4px" }}>
                         <MessageCircle size={18} />
                       </a>
                     )}
                     <button onClick={() => handleStatusChange(u.id, u.membership_status)} style={{ backgroundColor: u.membership_status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: u.membership_status === 'active' ? '#EF4444' : '#10B981', padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                       {u.membership_status === 'active' ? 'Suspend' : 'Activate'}
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminTab === "broadcast" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent, display: "flex", alignItems: "center", gap: "8px" }}><Megaphone size={20}/> Send Announcement</h3>
              <form onSubmit={handleSendBroadcast} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <input type="text" placeholder="Announcement Title" required value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <textarea placeholder="Write your message here..." required rows={4} value={broadcastContent} onChange={e => setBroadcastContent(e.target.value)} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <button type="submit" disabled={broadcastSending} style={{ padding: "12px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <Send size={18}/> {broadcastSending ? "SENDING..." : "SEND BROADCAST"}
                </button>
              </form>
              
              <h4 style={{ marginBottom: "12px", color: theme.text }}>Recent Announcements</h4>
              {announcements.map(a => (
                <div key={a.id} style={{ backgroundColor: "rgba(0,0,0,0.1)", padding: "12px", borderRadius: "8px", marginBottom: "8px", border: `1px solid ${theme.border}` }}>
                  <strong style={{ color: theme.accent }}>{a.title}</strong>
                  <p style={{ margin: "4px 0", color: theme.textMuted, fontSize: "14px" }}>{a.content}</p>
                </div>
              ))}
            </div>
          )}

          {adminTab === "settings" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent, display: "flex", alignItems: "center", gap: "8px" }}><Settings size={20}/> App Settings</h3>
              <form onSubmit={handleUpdateSettings} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>App Name</label>
                <input type="text" placeholder="App Name" required value={appSettings.app_name || ""} onChange={e => setAppSettings({...appSettings, app_name: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Slogan</label>
                <input type="text" placeholder="Slogan" required value={appSettings.app_slogan || ""} onChange={e => setAppSettings({...appSettings, app_slogan: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                
                <label style={{ fontSize: "12px", color: theme.textMuted }}>WhatsApp Group Link</label>
                <input type="url" placeholder="https://chat.whatsapp.com/..." required value={appSettings.whatsapp_link || ""} onChange={e => setAppSettings({...appSettings, whatsapp_link: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />

                <label style={{ fontSize: "12px", color: theme.textMuted }}>Paybill Number</label>
                <input type="text" placeholder="Paybill Number" required value={appSettings.paybill_number || ""} onChange={e => setAppSettings({...appSettings, paybill_number: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />

                <label style={{ fontSize: "12px", color: theme.textMuted }}>Paybill Account</label>
                <input type="text" placeholder="Account Number" required value={appSettings.paybill_account || ""} onChange={e => setAppSettings({...appSettings, paybill_account: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />

                <button type="submit" style={{ padding: "12px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Save size={18}/> SAVE SETTINGS</button>
                {settingsMsg && <p style={{ color: theme.green, fontWeight: "bold", textAlign: "center", marginTop: "10px" }}>{settingsMsg}</p>}
              </form>
            </div>
          )}

          {adminTab === "care" && (
             <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `2px solid #F43F5E` }}>
                <h3 style={{ marginBottom: "16px", color: "#F43F5E", display: "flex", alignItems: "center", gap: "8px" }}><HeartHandshake size={20}/> Alpha Care Applications</h3>
                {allCareRequests.length === 0 ? <p style={{ color: theme.textMuted }}>No pending care requests.</p> : allCareRequests.map(c => (
                  <div key={c.id} style={{ backgroundColor: "rgba(0,0,0,0.1)", padding: "16px", borderRadius: "12px", marginBottom: "12px", border: `1px solid ${theme.border}` }}>
                    <p style={{ fontWeight: "bold", color: "#F43F5E" }}>{c.profiles?.full_name}</p>
                    <p style={{ fontSize: "12px", color: theme.textMuted }}>Phone: {c.profiles?.phone || "N/A"}</p>
                    <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", marginTop: "10px", borderLeft: `3px solid ${c.is_emergency ? theme.red : theme.blue}` }}>
                      <p style={{ fontSize: "14px", color: theme.text }}><strong>Reason:</strong> {c.reason}</p>
                      <p style={{ fontSize: "12px", marginTop: "8px", fontWeight: "bold", color: c.is_emergency ? theme.red : theme.textMuted }}>
                        {c.is_emergency ? "🚨 EMERGENCY REQUEST" : "Standard Request"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      <button onClick={() => handleCareAction(c.id, "approved")} style={{ flex: 1, padding: "10px", backgroundColor: theme.green, color: "#000", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><CheckCircle2 size={16}/> APPROVE</button>
                      <button onClick={() => handleCareAction(c.id, "rejected")} style={{ flex: 1, padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><X size={16}/> REJECT</button>
                    </div>
                  </div>
                ))}
              </div>
          )}

          {adminTab === "content" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent, display: "flex", alignItems: "center", gap: "8px" }}><CalendarDays size={20}/> Create Event</h3>
              <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input type="text" placeholder="Event Title" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <input type="text" placeholder="Location" required value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <button type="submit" style={{ padding: "12px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><PlusCircle size={18}/> PUBLISH EVENT</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
