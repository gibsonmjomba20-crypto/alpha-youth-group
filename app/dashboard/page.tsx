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
  const [meetings, setMeetings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  // ADMIN STATE
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [searchQuery, setSearchQuery] = useState("");
  
  // SETTINGS & TEMPLATES
  const [appSettings, setAppSettings] = useState({ paybill_number: "", paybill_account: "", app_name: "ALPHA YOUTH GROUP", app_slogan: "Together We Rise and Shine!", default_theme: "navy" });
  const [settingsMsg, setSettingsMsg] = useState("");
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("navy");
  
  const theme = THEMES[themeName];

  // FORMS
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "", period: "1" });
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home"); // Member view
  const [adminTab, setAdminTab] = useState("overview"); // Admin view
  const [showNotifications, setShowNotifications] = useState(false);
  
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

    const { data: meet } = await supabase.from("meetings").select("*").order("meeting_date", { ascending: true }).limit(3);
    if (meet) setMeetings(meet);

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

  // --- MEMBER ACTIONS ---
  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loanRequest.amount);
    if (amount > savings * 3) return alert(`❌ REJECTED: Max loan is KES ${savings * 3}`);
    await supabase.from("loans").insert({ user_id: profile.id, amount, purpose: loanRequest.purpose, repayment_period_months: parseInt(loanRequest.period), status: "pending" });
    alert("✅ Loan Submitted"); setLoanRequest({ amount: "", purpose: "", period: "1" }); fetchDashboardData();
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("support_tickets").insert({ user_id: profile.id, subject: ticketForm.subject, message: ticketForm.message });
    alert("Message sent!"); setTicketForm({ subject: "", message: "" }); fetchDashboardData();
  };

  // --- ADMIN ACTIONS ---
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
      paybill_number: appSettings.paybill_number, paybill_account: appSettings.paybill_account, app_name: appSettings.app_name, app_slogan: appSettings.app_slogan, default_theme: themeName
    }).eq("id", 1);
    setSettingsMsg("Settings Saved!"); setTimeout(() => setSettingsMsg(""), 3000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  const loanLimit = savings * 3;
  const referralLink = `https://alpha-youth-group.vercel.app/register?ref=${profile.member_code || "PENDING"}`;
  const copyReferral = () => { navigator.clipboard.writeText(referralLink); alert("Referral Link Copied!"); };

  // ==========================================
  // MEMBER DASHBOARD UI
  // ==========================================
  if (profile.role === 'member') {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px", transition: "background-color 0.3s" }}>
        
        <header style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bg, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", fontStyle: "italic" }}>A</div>
             <div><h1 style={{ fontSize: "15px", fontWeight: "800", color: theme.accent }}>{appSettings.app_name}</h1><p style={{ fontSize: "9px", color: theme.textMuted, fontStyle: "italic" }}>{appSettings.app_slogan}</p></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div onClick={() => setShowNotifications(true)} style={{ position: "relative", cursor: "pointer" }}><Bell size={22} color={theme.text} />{announcements.length > 0 && (<div style={{ position: "absolute", top: -2, right: 0, width: "14px", height: "14px", backgroundColor: theme.red, borderRadius: "50%", border: `2px solid ${theme.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: "bold", color: "white" }}>{announcements.length}</div>)}</div>
            <div onClick={() => setActiveTab("settings")} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}`, cursor: "pointer" }}>{profile.full_name.charAt(0)}</div>
          </div>
        </header>

        <main style={{ padding: "20px" }}>
          
          {activeTab === "home" && (
            <div>
              <div style={{ position: "relative", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: `1px solid ${theme.purple}`, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>{profile.full_name.charAt(0)}</div>
                  <div><p style={{ fontSize: "12px", color: theme.textMuted }}>Welcome back,</p><h2 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>{profile.full_name.split(' ')[0]}</h2></div>
                </div>
                <p style={{ fontSize: "11px", color: theme.textMuted }}>Member Code: <span style={{ color: theme.text, fontWeight: "bold" }}>{profile.member_code || "AYG-2025"}</span></p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div onClick={() => setActiveTab("savings")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(147, 51, 234, 0.2)", borderRadius: "10px" }}><Wallet size={20} color={theme.purple} /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>My Savings</p></div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>KES {savings.toLocaleString()}</h3>
                </div>
                <div onClick={() => setActiveTab("loans")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(16, 185, 129, 0.2)", borderRadius: "10px" }}><Briefcase size={20} color={theme.green} /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>Active Loans</p></div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800" }}>KES {loans.filter(l => l.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h3>
                </div>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} color={theme.accent}/> Quick Actions</h3>
              <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px", marginBottom: "24px" }}>
                <div onClick={() => router.push('/dashboard/payment')} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(147, 51, 234, 0.4)` }}><Banknote size={24} color="#fff" /></div>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>Add Savings</span>
                </div>
                <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.green, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(16, 185, 129, 0.4)` }}><HandCoins size={24} color="#fff" /></div>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>Apply Loan</span>
                </div>
                <div onClick={() => setActiveTab("events_page")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.blue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(59, 130, 246, 0.4)` }}><CalendarDays size={24} color="#fff" /></div>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>Events</span>
                </div>
                <div onClick={() => setActiveTab("support_page")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(239, 68, 68, 0.4)` }}><MessagesSquare size={24} color="#fff" /></div>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>Support</span>
                </div>
              </div>

              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><Share2 size={20} color={theme.accent} /><h3 style={{ fontSize: "16px", fontWeight: "700" }}>Refer a Friend</h3></div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="text" readOnly value={referralLink} style={{ flex: 1, padding: "10px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.accent, fontSize: "12px" }} />
                  <button onClick={copyReferral} style={{ padding: "10px 16px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>COPY</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "savings" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Savings</h2>
              <div style={{ backgroundColor: theme.card, padding: "32px 20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                <Wallet size={40} color={theme.accent} style={{ margin: "0 auto 12px auto" }} />
                <p style={{ color: theme.textMuted, fontSize: "14px" }}>Verified Balance</p>
                <h3 style={{ fontSize: "36px", fontWeight: "900", color: theme.accent }}>KES {savings}</h3>
                <button onClick={() => router.push('/dashboard/payment')} style={{ marginTop: "20px", padding: "12px 24px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>Add Savings</button>
              </div>
            </div>
          )}

          {activeTab === "loans" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Loans</h2>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <form onSubmit={handleApplyLoan} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input type="number" placeholder={`Amount (Max: ${loanLimit})`} required value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                  <input type="text" placeholder="Purpose" required value={loanRequest.purpose} onChange={e => setLoanRequest({...loanRequest, purpose: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                  <button type="submit" style={{ padding: "12px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SUBMIT</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Transactions</h2>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                {payments.length === 0 ? <p style={{ color: theme.textMuted, textAlign: "center" }}>No transactions.</p> : payments.map(p => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                    <div><p style={{ fontWeight: "bold", fontSize: "14px" }}>{p.mpesa_code}</p><p style={{ fontSize: "10px", color: theme.textMuted }}>{p.payment_date}</p></div>
                    <div style={{ textAlign: "right" }}><p style={{ fontWeight: "bold", color: theme.green }}>+ KES {p.amount}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "more" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>More Services</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div onClick={() => setActiveTab("events_page")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><CalendarDays size={24} color={theme.blue} /></div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center" }}>Events</p>
                </div>
                <div onClick={() => setActiveTab("projects_page")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><Landmark size={24} color={theme.green} /></div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center" }}>Projects</p>
                </div>
                <div onClick={() => setActiveTab("opportunities_page")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "rgba(251, 191, 36, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><GraduationCap size={24} color={theme.accent} /></div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center" }}>Opportunities</p>
                </div>
                <div onClick={() => setActiveTab("documents_page")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "rgba(147, 51, 234, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><Folder size={24} color={theme.purple} /></div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center" }}>Documents</p>
                </div>
                <div onClick={() => setActiveTab("support_page")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><HelpCircle size={24} color={theme.red} /></div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center" }}>Support</p>
                </div>
                <div onClick={() => setActiveTab("settings")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "rgba(148, 163, 184, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><Settings size={24} color={theme.textMuted} /></div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", textAlign: "center" }}>Settings</p>
                </div>
              </div>
            </div>
          )}

          {["events_page", "projects_page", "opportunities_page", "documents_page", "support_page"].includes(activeTab) && (
            <button onClick={() => setActiveTab("more")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
          )}

          {activeTab === "events_page" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Upcoming Events</h2>
              {events.length === 0 ? <p style={{ color: theme.textMuted }}>No events.</p> : events.map(e => (
                <div key={e.id} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
                  <h3 style={{ color: theme.accent, fontWeight: "bold" }}>{e.title}</h3>
                  <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{e.event_date} | {e.location}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "projects_page" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Community Projects</h2>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                 <Landmark size={40} color={theme.textMuted} style={{ margin: "0 auto 12px auto" }} />
                 <p style={{ color: theme.textMuted, fontSize: "14px" }}>Projects will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === "opportunities_page" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Opportunities</h2>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                 <GraduationCap size={40} color={theme.textMuted} style={{ margin: "0 auto 12px auto" }} />
                 <p style={{ color: theme.textMuted, fontSize: "14px" }}>Jobs and scholarships will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === "documents_page" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Documents</h2>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                <Folder size={40} color={theme.textMuted} style={{ margin: "0 auto 12px auto" }} />
                <p style={{ color: theme.textMuted, fontSize: "14px" }}>Official receipts and statements will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === "support_page" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Support</h2>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <form onSubmit={handleSubmitTicket} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input type="text" placeholder="Subject" required value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                  <textarea placeholder="Message" required value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", height: "80px" }} />
                  <button type="submit" style={{ padding: "12px", background: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SEND</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Settings</h2>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Palette size={18} /> App Theme</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <button onClick={() => setThemeName("navy")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1120", color: "white", border: themeName === 'navy' ? `2px solid #FBBF24` : `1px solid ${theme.border}` }}>Navy</button>
                  <button onClick={() => setThemeName("purple")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0F0A1A", color: "white", border: themeName === 'purple' ? `2px solid #D946EF` : `1px solid ${theme.border}` }}>Purple</button>
                  <button onClick={() => setThemeName("emerald")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#021A14", color: "white", border: themeName === 'emerald' ? `2px solid #10B981` : `1px solid ${theme.border}` }}>Emerald</button>
                </div>
              </div>
              <button onClick={handleLogout} style={{ width: "100%", padding: "14px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>LOGOUT</button>
            </div>
          )}
        </main>

        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: theme.bg, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
          <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted }}><Home size={22} /><span style={{ fontSize: "10px" }}>Home</span></div>
          <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted }}><Wallet size={22} /><span style={{ fontSize: "10px" }}>Savings</span></div>
          <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "loans" ? theme.accent : theme.textMuted }}><Briefcase size={22} /><span style={{ fontSize: "10px" }}>Loans</span></div>
          <div onClick={() => setActiveTab("activity")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "activity" ? theme.accent : theme.textMuted }}><ArrowRightLeft size={22} /><span style={{ fontSize: "10px" }}>Activity</span></div>
          <div onClick={() => setActiveTab("more")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "more" ? theme.accent : theme.textMuted }}><Menu size={22} /><span style={{ fontSize: "10px" }}>More</span></div>
        </nav>
      </div>
    );
  }

  // ==========================================
  // SUPER ADMIN / EXECUTIVE PORTAL
  // ==========================================
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)" }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "12px", backgroundColor: "rgba(147, 51, 234, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><Users size={24} color="#9333EA" /></div>
                <p style={{ fontSize: "13px", color: "#d1d5db" }}>Total Members</p>
                <h3 style={{ fontSize: "28px", fontWeight: "800", color: "#fff" }}>{allUsers.length}</h3>
              </div>
              
              <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "12px", backgroundColor: "rgba(251, 191, 36, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><FileText size={24} color="#FBBF24" /></div>
                <p style={{ fontSize: "13px", color: "#d1d5db" }}>Pending Approvals</p>
                <h3 style={{ fontSize: "28px", fontWeight: "800", color: "#fff" }}>{allUsers.filter(u => u.membership_status === 'pending').length}</h3>
              </div>
              
              <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "12px", backgroundColor: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><Wallet size={24} color="#10B981" /></div>
                <p style={{ fontSize: "13px", color: "#d1d5db" }}>Verified Savings</p>
                <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>KES {totalGroupSavings.toLocaleString()}</h3>
              </div>
              
              <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><CreditCard size={24} color="#EF4444" /></div>
                <p style={{ fontSize: "13px", color: "#d1d5db" }}>Pending Payments</p>
                <h3 style={{ fontSize: "28px", fontWeight: "800", color: "#fff" }}>{allPayments.length}</h3>
              </div>
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} color={theme.accent}/> Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div onClick={() => setAdminTab("approvals")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: "1px solid #FBBF24", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "rgba(251, 191, 36, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><UserCheck size={22} color="#FBBF24" /></div>
                <p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", textAlign: "center" }}>Review Apps</p>
              </div>
              <div onClick={() => setAdminTab("finance")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: "1px solid #9333EA", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "rgba(147, 51, 234, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><Smartphone size={22} color="#9333EA" /></div>
                <p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", textAlign: "center" }}>Verify M-Pesa</p>
              </div>
              <div onClick={() => setAdminTab("broadcast")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: "1px solid #3B82F6", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}><Megaphone size={22} color="#3B82F6" /></div>
                <p style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", textAlign: "center" }}>Announce</p>
              </div>
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

        {adminTab === "settings" && (
          <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
            <h3 style={{ marginBottom: "16px", color: theme.accent }}>App Settings</h3>
            {settingsMsg && <p style={{ color: "#10B981", marginBottom: "12px" }}>{settingsMsg}</p>}
            
            <form onSubmit={handleUpdateSettings} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px" }}>
              <div>
                <label style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "bold" }}>App Name</label>
                <input type="text" required value={appSettings.app_name} onChange={e => setAppSettings({...appSettings, app_name: e.target.value})} style={{ width: "100%", padding: "12px", marginTop: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "bold" }}>Slogan</label>
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
