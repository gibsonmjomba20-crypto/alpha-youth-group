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
  HeartHandshake, LifeBuoy, AlertCircle, LayoutDashboard, MoreHorizontal, AlertTriangle,
  Trophy, Calculator, Book, Award, FileBadge, Sparkles, Eye, Trash2, Download, Printer, Filter, Crown, Shield
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
  const [appSettings, setAppSettings] = useState<any>({ paybill_number: "0704785116", paybill_account: "ALPHA", app_name: "ALPHA YOUTH GROUP", app_slogan: "Together We Rise and Shine!", whatsapp_link: "" });
  
  // FINANCE SPECIFIC STATE
  const [financeSubTab, setFinanceSubTab] = useState("overview"); 
  const [financeSearch, setFinanceSearch] = useState("");
  const [financeStatus, setFinanceStatus] = useState("all");
  const [financeType, setFinanceType] = useState("all");
  const [selectedTx, setSelectedTx] = useState<any>(null); 
  const [receiptTx, setReceiptTx] = useState<any>(null); 

  // DIRECTORY SPECIFIC STATE
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState("all");

  // FORMS & MODALS
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", time: "", location: "" });
  const [careRequest, setCareRequest] = useState({ reason: "", isEmergency: false, agreed: false });
  
  // FEATURES STATE (MEMBER MORE TAB)
  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [featureSearch, setFeatureSearch] = useState("");
  const [featureCategory, setFeatureCategory] = useState("All");
  
  // LOCAL STORAGE DEMO STATES
  const [challenge30, setChallenge30] = useState<number[]>([]);
  const [challenge52, setChallenge52] = useState<number[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [cvData, setCvData] = useState({ name: "", email: "", skills: "", exp: "" });
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home"); 
  const [adminTab, setAdminTab] = useState("finance"); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  const theme = THEMES.navy;
  const router = useRouter();

  // LOAD LOCAL STORAGE DATA
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved30 = localStorage.getItem("challenge30"); if (saved30) setChallenge30(JSON.parse(saved30));
      const saved52 = localStorage.getItem("challenge52"); if (saved52) setChallenge52(JSON.parse(saved52));
      const savedHabits = localStorage.getItem("habits"); if (savedHabits) setHabits(JSON.parse(savedHabits));
      const savedCv = localStorage.getItem("cvData"); if (savedCv) setCvData(JSON.parse(savedCv));
    }
  }, []);

  const toggle30 = (day: number) => { const newArr = challenge30.includes(day) ? challenge30.filter(d => d !== day) : [...challenge30, day]; setChallenge30(newArr); localStorage.setItem("challenge30", JSON.stringify(newArr)); };
  const toggle52 = (week: number) => { const newArr = challenge52.includes(week) ? challenge52.filter(w => w !== week) : [...challenge52, week]; setChallenge52(newArr); localStorage.setItem("challenge52", JSON.stringify(newArr)); };
  const addHabit = () => { if (!newHabit) return; const newArr = [...habits, { id: Date.now(), name: newHabit, done: false }]; setHabits(newArr); localStorage.setItem("habits", JSON.stringify(newArr)); setNewHabit(""); };
  const toggleHabit = (id: number) => { const newArr = habits.map(h => h.id === id ? { ...h, done: !h.done } : h); setHabits(newArr); localStorage.setItem("habits", JSON.stringify(newArr)); };
  const saveCv = () => { localStorage.setItem("cvData", JSON.stringify(cvData)); alert("CV Details Saved Locally!"); };
  const calculateCountdown = () => {
    if (!eventDate) return setTimeLeft("");
    const diff = new Date(eventDate).getTime() - new Date().getTime();
    if (diff < 0) return setTimeLeft("Event has passed!");
    setTimeLeft(`${Math.floor(diff / (1000 * 60 * 60 * 24))} days, ${Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} hours left`);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) { setProfile(profileData); setSavingsGoal(profileData.savings_goal || 10000); }

      const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
      if (s) setSavings(s.total_savings);

      const { data: p } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (p) setMyPayments(p);

      const { data: care } = await supabase.from("alpha_care").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (care) setMyCareRequests(care);

      const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(5);
      if (ann) setAnnouncements(ann);

      const { data: ev } = await supabase.from("events").select("*").order("event_date", { ascending: true }).limit(5);
      if (ev) setEvents(ev);

      const { data: settingsData } = await supabase.from("app_settings").select("*").single();
      if (settingsData) setAppSettings(settingsData);

      if (profileData && (profileData.role === 'admin' || profileData.role === 'treasurer' || profileData.role === 'chairman' || profileData.email === MASTER_ADMIN_EMAIL)) {
        const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (users) setAllUsers(users);
        
        const { data: allP } = await supabase.from("payments").select(`*, profiles:user_id (full_name, member_code, phone)`).order("created_at", { ascending: false });
        if (allP) setAllPayments(allP);
        
        const { data: pendingCare } = await supabase.from("alpha_care").select(`*, profiles:user_id (full_name, phone)`).eq("status", "pending");
        if (pendingCare) setAllCareRequests(pendingCare);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  // MEMBER ACTIONS
  const handleApplyCare = async (e: React.FormEvent) => {
    e.preventDefault(); if (!careRequest.agreed) return alert("You must agree to the terms.");
    await supabase.from("alpha_care").insert({ user_id: profile.id, reason: careRequest.reason, is_emergency: careRequest.isEmergency, status: "pending" });
    alert(`✅ ${careRequest.isEmergency ? 'EMERGENCY ' : ''}Request submitted.`); setCareRequest({ reason: "", isEmergency: false, agreed: false }); fetchDashboardData();
  };

  // STAFF ACTIONS
  const logAction = async (action: string, targetId: string, details: any) => {
    await supabase.from("audit_logs").insert({ actor_id: profile.id, actor_name: profile.full_name, action, target_id: targetId, details });
  };

  const handleVerifyPayment = async (tx: any, action: "verified" | "rejected", reason?: string) => {
    if (action === "verified") {
      if (tx.mpesa_code) {
        const { data: duplicate } = await supabase.from("payments").select("id").eq("mpesa_code", tx.mpesa_code).eq("status", "verified").neq("id", tx.id);
        if (duplicate && duplicate.length > 0) return alert("ERROR: Duplicate M-Pesa code detected.");
      }
      await supabase.from("payments").update({ status: "verified", verified_by: profile.full_name, verified_at: new Date().toISOString() }).eq("id", tx.id);
      if (tx.transaction_type === 'income' && tx.category !== 'Loan Disbursement') {
        const { data: currentS } = await supabase.from("savings").select("total_savings").eq("user_id", tx.user_id).single();
        if (currentS) await supabase.from("savings").update({ total_savings: currentS.total_savings + tx.amount }).eq("user_id", tx.user_id);
      }
      await logAction("VERIFIED_PAYMENT", tx.id, { amount: tx.amount }); alert("Payment Verified.");
    } else {
      await supabase.from("payments").update({ status: "rejected", rejection_reason: reason, verified_by: profile.full_name, verified_at: new Date().toISOString() }).eq("id", tx.id);
      await logAction("REJECTED_PAYMENT", tx.id, { amount: tx.amount, reason }); alert("Payment Rejected.");
    }
    setSelectedTx(null); fetchDashboardData();
  };

  const handleRoleChange = async (userId: string, userEmail: string, newRole: string) => {
    if (userEmail === MASTER_ADMIN_EMAIL) return alert("You cannot change the role of the Master Admin.");
    if (!window.confirm(`Are you sure you want to appoint this member as ${newRole.toUpperCase()}?`)) return;
    
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    await logAction("ROLE_CHANGE", userId, { new_role: newRole });
    alert(`Role successfully updated to ${newRole.toUpperCase()}`);
    fetchDashboardData();
  };

  const exportToCSV = () => {
    const filtered = getFilteredPayments();
    if (filtered.length === 0) return alert("No data to export.");
    const headers = ["Date", "Reference", "M-Pesa Code", "Member", "Code", "Type", "Category", "Amount", "Status"];
    const csvRows = [headers.join(",")];
    filtered.forEach(p => { csvRows.push([new Date(p.created_at).toLocaleDateString(), p.id.split('-')[0], p.mpesa_code || "N/A", `"${p.profiles?.full_name || 'System'}"`, p.profiles?.member_code || "N/A", p.transaction_type, p.category || "General", p.amount, p.status].join(",")); });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `AYG_Report_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const getFilteredPayments = () => {
    return allPayments.filter(p => {
      const matchSearch = p.profiles?.full_name?.toLowerCase().includes(financeSearch.toLowerCase()) || p.mpesa_code?.toLowerCase().includes(financeSearch.toLowerCase()) || p.id.toLowerCase().includes(financeSearch.toLowerCase());
      return matchSearch && (financeStatus === "all" || p.status === financeStatus) && (financeType === "all" || p.transaction_type === financeType);
    });
  };

  const getFilteredUsers = () => {
    return allUsers.filter(u => {
      const matchSearch = u.full_name?.toLowerCase().includes(directorySearch.toLowerCase()) || u.member_code?.toLowerCase().includes(directorySearch.toLowerCase());
      const matchRole = 
        directoryRoleFilter === "all" ? true :
        directoryRoleFilter === "executive" ? ["admin", "treasurer", "chairman", "secretary"].includes(u.role) :
        u.role === directoryRoleFilter;
      return matchSearch && matchRole;
    });
  };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><RefreshCw className="animate-spin" size={32} /></div>;
  if (!profile) return <div style={{ color: "white", padding: "20px" }}>Profile not found.</div>;

  const safeName = profile?.full_name || "Member";
  const safeInitial = safeName.charAt(0);
  const isStaff = profile.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() || ['admin', 'treasurer', 'chairman'].includes(profile.role);

  // ==========================================
  // MEMBER DASHBOARD UI (Simplified for brevity)
  // ==========================================
  if (!isStaff) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, paddingBottom: "80px" }}>
        <header style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={{ width: "36px", height: "36px", borderRadius: "50%", background: theme.accent, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900" }}>A</div><h1 style={{ fontSize: "15px", fontWeight: "800", color: theme.accent }}>{appSettings.app_name}</h1></div>
           <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{safeInitial}</div>
        </header>
        <main style={{ padding: "20px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Welcome, {safeName.split(' ')[0]}</h2>
          <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
            <p style={{ color: theme.textMuted }}>Alpha Wallet Balance</p>
            <h3 style={{ fontSize: "32px", fontWeight: "900", color: theme.accent }}>KES {savings.toLocaleString()}</h3>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} style={{ width: "100%", padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: theme.red, borderRadius: "12px", fontWeight: "bold", border: "none" }}>Sign Out</button>
        </main>
      </div>
    );
  }

  // ==========================================
  // TREASURER / ADMIN UI
  // ==========================================
  const pendingPayments = allPayments.filter(p => p.status === 'pending');
  const filteredAdminPayments = getFilteredPayments();
  const filteredUsers = getFilteredUsers();
  
  const totalIncome = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
  const netBalance = totalIncome - totalExpense;
  const pendingVolume = pendingPayments.reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh", display: "flex" }}>
      
      {/* SIDEBAR */}
      {isAdminMenuOpen && <div onClick={() => setIsAdminMenuOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 999 }} />}
      <div style={{ position: "fixed", top: 0, left: isAdminMenuOpen ? 0 : "-280px", width: "260px", height: "100vh", backgroundColor: theme.card, zIndex: 1000, transition: "0.3s", borderRight: `1px solid ${theme.border}`, padding: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: theme.accent }}>Admin Menu</h2>
          <button onClick={() => setIsAdminMenuOpen(false)} style={{ background: "none", border: "none", color: theme.textMuted }}><X size={24} /></button>
        </div>
        {[
          { id: "overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
          { id: "finance", label: "Treasurer Portal", icon: <Landmark size={20} /> },
          { id: "directory", label: "Manage Executives", icon: <Users size={20} /> },
        ].map((item) => (
          <button key={item.id} onClick={() => { setAdminTab(item.id); setIsAdminMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "8px", backgroundColor: adminTab === item.id ? "rgba(251, 191, 36, 0.1)" : "transparent", color: adminTab === item.id ? theme.accent : theme.textMuted, border: "none", fontWeight: "bold", cursor: "pointer", marginBottom: "8px", textAlign: "left" }}>
            {item.icon} {item.label}
          </button>
        ))}
        <div style={{ marginTop: "auto" }}>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", width: "100%", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: theme.red, border: "none", fontWeight: "bold", cursor: "pointer" }}><LogOut size={20} /> Logout</button>
        </div>
      </div>

      <div style={{ flex: 1, paddingBottom: "80px", width: "100%" }}>
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", padding: "20px", borderBottom: `1px solid ${theme.purple}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <button onClick={() => setIsAdminMenuOpen(true)} style={{ background: "none", border: "none", color: "white" }}><Menu size={28} /></button>
             <div><h1 style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>{adminTab === 'finance' ? 'Treasurer Portal' : adminTab === 'directory' ? 'Executive Appointments' : 'Admin Portal'}</h1></div>
           </div>
           <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}` }}>{safeInitial}</div>
        </div>

        <div style={{ padding: "20px" }}>
          
          {/* ========================================== */}
          {/* EXECUTIVE DIRECTORY TAB */}
          {/* ========================================== */}
          {adminTab === "directory" && (
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Crown size={24} color={theme.accent} />
                <h3 style={{ color: theme.accent, margin: 0 }}>Manage Leadership</h3>
              </div>
              <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "20px" }}>
                Appoint members to executive roles or remove their privileges. The Master Admin cannot be demoted.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <div style={{ position: "relative" }}>
                  <Search size={18} color={theme.textMuted} style={{ position: "absolute", left: "12px", top: "12px" }} />
                  <input type="text" placeholder="Search by name or member code..." value={directorySearch} onChange={e => setDirectorySearch(e.target.value)} style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: "rgba(0,0,0,0.3)", color: "white" }} />
                </div>
                <select value={directoryRoleFilter} onChange={e => setDirectoryRoleFilter(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", color: "white", border: `1px solid ${theme.border}` }}>
                  <option value="all">All Members</option>
                  <option value="executive">Show Only Executives</option>
                  <option value="member">Show Only Normal Members</option>
                  <option value="admin">Admins</option>
                  <option value="treasurer">Treasurers</option>
                  <option value="chairman">Chairmen</option>
                  <option value="secretary">Secretaries</option>
                </select>
              </div>

              {filteredUsers.map(u => {
                const isMasterAdmin = u.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
                const isExec = ['admin', 'treasurer', 'chairman', 'secretary'].includes(u.role);

                return (
                  <div key={u.id} style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "10px", borderLeft: isMasterAdmin ? `4px solid ${theme.red}` : isExec ? `4px solid ${theme.accent}` : `4px solid ${theme.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: isMasterAdmin ? theme.red : theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{u.full_name?.charAt(0) || "U"}</div>
                        <div>
                          <p style={{ fontWeight: "bold", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                            {u.full_name} 
                            {isMasterAdmin && <Shield size={14} color={theme.red} />}
                          </p>
                          <p style={{ fontSize: "10px", color: theme.textMuted, margin: 0 }}>ID: {u.member_code || "PENDING"}</p>
                        </div>
                      </div>
                      
                      <div style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: isMasterAdmin ? "rgba(239, 68, 68, 0.2)" : isExec ? "rgba(251, 191, 36, 0.2)" : "rgba(255, 255, 255, 0.1)", color: isMasterAdmin ? theme.red : isExec ? theme.accent : theme.textMuted }}>
                        {u.role}
                      </div>
                    </div>

                    {!isMasterAdmin && (
                      <div style={{ display: "flex", gap: "10px", marginTop: "8px", borderTop: `1px solid ${theme.border}`, paddingTop: "10px" }}>
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)} 
                          style={{ flex: 1, padding: "10px", borderRadius: "6px", backgroundColor: theme.bg, color: "white", border: `1px solid ${theme.border}`, fontWeight: "bold" }}
                        >
                          <option value="member">Demote to Member</option>
                          <option value="secretary">Appoint Secretary</option>
                          <option value="treasurer">Appoint Treasurer</option>
                          <option value="chairman">Appoint Chairman</option>
                          <option value="admin">Appoint Admin</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TREASURER PORTAL (Finance) */}
          {adminTab === "finance" && (
            <div>
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px", scrollbarWidth: "none" }}>
                <style>{`::-webkit-scrollbar { display: none; }`}</style>
                {[
                  { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
                  { id: "register", label: "Register", icon: <FileText size={16} /> },
                  { id: "verify", label: "Verification", icon: <CheckCircle2 size={16} />, badge: pendingPayments.length },
                  { id: "reports", label: "Reports & CSV", icon: <Download size={16} /> },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setFinanceSubTab(tab.id)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "20px", whiteSpace: "nowrap", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: financeSubTab === tab.id ? theme.accent : theme.card, color: financeSubTab === tab.id ? "#000" : theme.text }}>
                    {tab.icon} {tab.label} {tab.badge ? `(${tab.badge})` : ""}
                  </button>
                ))}
              </div>

              {financeSubTab === "overview" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "24px" }}>
                    <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                      <TrendingUp size={24} color={theme.green} /><p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Verified Income</p><h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.green }}>KES {totalIncome.toLocaleString()}</h3>
                    </div>
                    <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                      <ArrowRightLeft size={24} color={theme.red} /><p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Verified Expenses</p><h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.red }}>KES {totalExpense.toLocaleString()}</h3>
                    </div>
                    <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                      <Clock size={24} color={theme.accent} /><p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Pending Volume</p><h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>KES {pendingVolume.toLocaleString()}</h3>
                    </div>
                    <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)" }}>
                      <Wallet size={24} color={theme.purple} /><p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Net Cash Movement</p><h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.purple }}>KES {netBalance.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              )}

              {financeSubTab === "register" && (
                <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    <input type="text" placeholder="Search by name or code..." value={financeSearch} onChange={e => setFinanceSearch(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: "rgba(0,0,0,0.3)", color: "white" }} />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <select value={financeStatus} onChange={e => setFinanceStatus(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", color: "white", border: `1px solid ${theme.border}` }}>
                        <option value="all">All Statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option>
                      </select>
                      <select value={financeType} onChange={e => setFinanceType(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", color: "white", border: `1px solid ${theme.border}` }}>
                        <option value="all">All Types</option><option value="income">Income (In)</option><option value="expense">Expense (Out)</option>
                      </select>
                    </div>
                  </div>
                  {filteredAdminPayments.map(p => (
                    <div key={p.id} onClick={() => setSelectedTx(p)} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "10px", borderLeft: `4px solid ${p.transaction_type === 'income' ? theme.green : theme.red}`, cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong>{p.profiles?.full_name || "System Expense"}</strong>
                        <span style={{ color: p.transaction_type === 'income' ? theme.green : theme.red, fontWeight: "bold" }}>{p.transaction_type === 'income' ? "+" : "-"} KES {p.amount}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: theme.textMuted }}>
                        <span>{p.category || "General"} • {p.mpesa_code || "No Code"}</span>
                        <span style={{ color: p.status === 'verified' ? theme.green : p.status === 'pending' ? theme.accent : theme.red, fontWeight: "bold" }}>{p.status.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {financeSubTab === "verify" && (
                <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending M-Pesa Submissions</h3>
                  {pendingPayments.length === 0 ? <p style={{ color: theme.textMuted }}>No pending payments.</p> : pendingPayments.map(p => (
                    <div key={p.id} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "12px", borderLeft: `3px solid ${theme.accent}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div><strong>{p.profiles?.full_name}</strong><p style={{ fontSize: "11px", color: theme.textMuted }}>Code: {p.profiles?.member_code || "N/A"}</p></div>
                        <span style={{ fontWeight: "bold", color: theme.accent }}>KES {p.amount}</span>
                      </div>
                      <p style={{ fontSize: "12px", marginBottom: "12px" }}>M-Pesa Ref: <strong style={{ color: theme.blue }}>{p.mpesa_code}</strong></p>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => handleVerifyPayment(p, "verified")} style={{ flex: 1, padding: "10px", backgroundColor: theme.green, color: "#000", border: "none", borderRadius: "6px", fontWeight: "bold" }}>Verify</button>
                        <button onClick={() => { const reason = prompt("Reason:"); if(reason) handleVerifyPayment(p, "rejected", reason); }} style={{ flex: 1, padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: theme.red, border: `1px solid ${theme.red}`, borderRadius: "6px", fontWeight: "bold" }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {financeSubTab === "reports" && (
                <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                  <FileText size={40} color={theme.accent} style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ marginBottom: "8px" }}>Export Report</h3>
                  <button onClick={exportToCSV} style={{ padding: "12px 24px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", width: "100%" }}><Download size={18}/> Download CSV</button>
                </div>
              )}
            </div>
          )}

          {adminTab === "overview" && (
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)" }}>
                  <Users size={24} color="#9333EA" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Total Members</p><h3 style={{ fontSize: "24px", fontWeight: "800" }}>{allUsers.length}</h3>
                </div>
                <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                  <FileText size={24} color="#FBBF24" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Pending Verifications</p><h3 style={{ fontSize: "24px", fontWeight: "800" }}>{pendingPayments.length}</h3>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
