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
  Trophy, Calculator, Book, Award, FileBadge, Sparkles, Eye, Trash2, Download, Printer, Filter, ChevronDown
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
  const [financeSubTab, setFinanceSubTab] = useState("overview"); // overview, register, verify, recon, reports
  const [financeSearch, setFinanceSearch] = useState("");
  const [financeStatus, setFinanceStatus] = useState("all");
  const [financeType, setFinanceType] = useState("all");
  const [selectedTx, setSelectedTx] = useState<any>(null); // For details modal
  const [receiptTx, setReceiptTx] = useState<any>(null); // For receipt modal

  // FORMS & MODALS
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", time: "", location: "" });
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "" });
  const [careRequest, setCareRequest] = useState({ reason: "", isEmergency: false, agreed: false });
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "" });
  
  // FEATURES STATE
  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [featureSearch, setFeatureSearch] = useState("");
  const [featureCategory, setFeatureCategory] = useState("All");
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home"); 
  const [adminTab, setAdminTab] = useState("finance"); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  const theme = THEMES.navy;
  const router = useRouter();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) {
        setProfile(profileData);
        setSavingsGoal(profileData.savings_goal || 10000);
      }

      const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
      if (s) setSavings(s.total_savings);

      const { data: p } = await supabase.from("payments").select("*, profiles:user_id(full_name, member_code, phone)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (p) setMyPayments(p);

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
        
        const { data: allP } = await supabase.from("payments").select(`*, profiles:user_id (full_name, member_code, phone)`).order("created_at", { ascending: false });
        if (allP) setAllPayments(allP);
        
        const { data: pendingCare } = await supabase.from("alpha_care").select(`*, profiles:user_id (full_name, phone)`).eq("status", "pending");
        if (pendingCare) setAllCareRequests(pendingCare);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  // FINANCE ACTIONS
  const logAction = async (action: string, targetId: string, details: any) => {
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      actor_name: profile.full_name,
      action,
      target_id: targetId,
      details
    });
  };

  const handleVerifyPayment = async (tx: any, action: "verified" | "rejected", reason?: string) => {
    if (action === "verified") {
      // 1. Check for duplicate M-Pesa code
      if (tx.mpesa_code) {
        const { data: duplicate } = await supabase.from("payments").select("id").eq("mpesa_code", tx.mpesa_code).eq("status", "verified").neq("id", tx.id);
        if (duplicate && duplicate.length > 0) {
          return alert("ERROR: This M-Pesa code has already been verified on another transaction. Duplicate credits are blocked.");
        }
      }

      // 2. Update payment status
      await supabase.from("payments").update({ 
        status: "verified", 
        verified_by: profile.full_name,
        verified_at: new Date().toISOString()
      }).eq("id", tx.id);

      // 3. Update member savings (if applicable)
      if (tx.transaction_type === 'income' && tx.category !== 'Loan Disbursement') {
        const { data: currentS } = await supabase.from("savings").select("total_savings").eq("user_id", tx.user_id).single();
        if (currentS) {
          await supabase.from("savings").update({ total_savings: currentS.total_savings + tx.amount }).eq("user_id", tx.user_id);
        }
      }

      await logAction("VERIFIED_PAYMENT", tx.id, { amount: tx.amount, code: tx.mpesa_code });
      alert("Payment Verified and Ledger Updated.");
    } else {
      await supabase.from("payments").update({ 
        status: "rejected", 
        rejection_reason: reason,
        verified_by: profile.full_name,
        verified_at: new Date().toISOString()
      }).eq("id", tx.id);
      await logAction("REJECTED_PAYMENT", tx.id, { amount: tx.amount, reason });
      alert("Payment Rejected.");
    }
    
    setSelectedTx(null);
    fetchDashboardData();
  };

  const exportToCSV = () => {
    const filtered = getFilteredPayments();
    if (filtered.length === 0) return alert("No data to export.");
    
    const headers = ["Date", "Reference", "M-Pesa Code", "Member", "Code", "Type", "Category", "Amount", "Status"];
    const csvRows = [headers.join(",")];
    
    filtered.forEach(p => {
      csvRows.push([
        new Date(p.created_at).toLocaleDateString(),
        p.id.split('-')[0],
        p.mpesa_code || "N/A",
        `"${p.profiles?.full_name || 'System'}"`,
        p.profiles?.member_code || "N/A",
        p.transaction_type,
        p.category || "General",
        p.amount,
        p.status
      ].join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AYG_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getFilteredPayments = () => {
    return allPayments.filter(p => {
      const matchSearch = 
        p.profiles?.full_name?.toLowerCase().includes(financeSearch.toLowerCase()) || 
        p.mpesa_code?.toLowerCase().includes(financeSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(financeSearch.toLowerCase());
      const matchStatus = financeStatus === "all" || p.status === financeStatus;
      const matchType = financeType === "all" || p.transaction_type === financeType;
      return matchSearch && matchStatus && matchType;
    });
  };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><RefreshCw className="animate-spin" size={32} /></div>;
  if (!profile) return <div style={{ color: "white", padding: "20px" }}>Profile not found.</div>;

  const safeName = profile?.full_name || "Member";
  const safeInitial = safeName.charAt(0);
  const isMasterAdmin = profile.email === MASTER_ADMIN_EMAIL || profile.role === 'admin';

  // ==========================================
  // MEMBER DASHBOARD UI (WITH PAYMENT HISTORY)
  // ==========================================
  if (!isMasterAdmin) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px" }}>
        {/* RECEIPT MODAL FOR MEMBERS */}
        {receiptTx && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ backgroundColor: "white", color: "black", width: "100%", maxWidth: "400px", borderRadius: "8px", padding: "30px", position: "relative" }}>
              <button onClick={() => setReceiptTx(null)} style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer" }}><X size={24} /></button>
              <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: "15px", marginBottom: "15px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "bold", textTransform: "uppercase" }}>Alpha Youth Group</h2>
                <p style={{ fontSize: "12px", fontStyle: "italic", color: "#555" }}>Together We Rise and Shine!</p>
              </div>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}><strong>Date:</strong> {new Date(receiptTx.created_at).toLocaleString()}</p>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}><strong>Receipt No:</strong> AYG-{receiptTx.id.slice(0,6).toUpperCase()}</p>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}><strong>Member:</strong> {receiptTx.profiles?.full_name} ({receiptTx.profiles?.member_code})</p>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}><strong>Purpose:</strong> {receiptTx.category || "General Payment"}</p>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}><strong>Method:</strong> M-Pesa</p>
              <p style={{ fontSize: "12px", marginBottom: "15px" }}><strong>M-Pesa Code:</strong> {receiptTx.mpesa_code}</p>
              <div style={{ backgroundColor: "#f3f4f6", padding: "15px", borderRadius: "8px", textAlign: "center", marginBottom: "20px" }}>
                <p style={{ fontSize: "12px", color: "#555", textTransform: "uppercase", fontWeight: "bold" }}>Amount Paid</p>
                <h3 style={{ fontSize: "28px", fontWeight: "900" }}>KES {receiptTx.amount.toLocaleString()}</h3>
              </div>
              <p style={{ fontSize: "10px", textAlign: "center", color: "#555" }}>Verified by: {receiptTx.verified_by || "Admin"}</p>
              <p style={{ fontSize: "10px", textAlign: "center", color: "green", fontWeight: "bold", marginTop: "5px" }}>STATUS: VERIFIED</p>
              <button onClick={() => window.print()} style={{ width: "100%", padding: "12px", backgroundColor: "#000", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", marginTop: "20px", cursor: "pointer", display: "flex", justifyContent: "center", gap: "8px" }}><Printer size={18}/> Print Receipt</button>
            </div>
          </div>
        )}

        <header style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bg, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", fontStyle: "italic" }}>A</div>
             <div><h1 style={{ fontSize: "15px", fontWeight: "800", color: theme.accent }}>{appSettings.app_name}</h1></div>
          </div>
          <div onClick={() => setActiveTab("more")} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}`, cursor: "pointer" }}>{safeInitial}</div>
        </header>

        <main style={{ padding: "20px" }}>
          {/* My Payments (Member View) */}
          <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>My Payment History</h2>
          <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
            {myPayments.length === 0 ? <p style={{ color: theme.textMuted }}>No payment records found.</p> : myPayments.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                <div>
                  <p style={{ fontWeight: "bold", fontSize: "14px" }}>KES {p.amount}</p>
                  <p style={{ fontSize: "10px", color: theme.textMuted }}>{p.category || "General"} • {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px", backgroundColor: p.status === 'verified' ? 'rgba(16, 185, 129, 0.2)' : p.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: p.status === 'verified' ? theme.green : p.status === 'rejected' ? theme.red : theme.accent }}>
                    {p.status.toUpperCase()}
                  </span>
                  {p.status === 'verified' && (
                    <button onClick={() => setReceiptTx(p)} style={{ background: "none", border: "none", color: theme.blue, cursor: "pointer" }}><FileText size={18} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // ADMIN / TREASURER DASHBOARD UI
  // ==========================================
  const pendingPayments = allPayments.filter(p => p.status === 'pending');
  const filteredAdminPayments = getFilteredPayments();
  
  // Financial Calculations
  const totalIncome = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
  const netBalance = totalIncome - totalExpense;
  const pendingVolume = pendingPayments.reduce((a, b) => a + Number(b.amount), 0);

  const adminMenuItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { id: "finance", label: "Treasurer Portal", icon: <Landmark size={20} /> },
    { id: "directory", label: "Member Directory", icon: <Users size={20} /> },
    { id: "broadcast", label: "Broadcast", icon: <Megaphone size={20} /> },
    { id: "care", label: "Alpha Care", icon: <HeartHandshake size={20} /> },
    { id: "settings", label: "App Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", minHeight: "100vh", display: "flex" }}>
      
      {/* ADMIN SIDEBAR */}
      {isAdminMenuOpen && <div onClick={() => setIsAdminMenuOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 999 }} />}
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
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", width: "100%", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: theme.red, border: "none", fontWeight: "bold", cursor: "pointer" }}><LogOut size={20} /> Logout</button>
        </div>
      </div>

      <div style={{ flex: 1, paddingBottom: "80px", width: "100%" }}>
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", padding: "20px", borderBottom: `1px solid ${theme.purple}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <button onClick={() => setIsAdminMenuOpen(true)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><Menu size={28} /></button>
             <div><h1 style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>{adminTab === 'finance' ? 'Treasurer Portal' : 'Admin Portal'}</h1></div>
           </div>
           <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}` }}>{safeInitial}</div>
        </div>

        <div style={{ padding: "20px" }}>
          
          {/* ========================================== */}
          {/* FINANCE / TREASURER PORTAL */}
          {/* ========================================== */}
          {adminTab === "finance" && (
            <div>
              {/* Finance Sub-Tabs */}
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px", scrollbarWidth: "none" }}>
                <style>{`::-webkit-scrollbar { display: none; }`}</style>
                {[
                  { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
                  { id: "register", label: "Register", icon: <FileText size={16} /> },
                  { id: "verify", label: "Verification", icon: <CheckCircle2 size={16} />, badge: pendingPayments.length },
                  { id: "recon", label: "Reconciliation", icon: <ArrowRightLeft size={16} /> },
                  { id: "reports", label: "Reports & CSV", icon: <Download size={16} /> },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setFinanceSubTab(tab.id)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "20px", whiteSpace: "nowrap", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: financeSubTab === tab.id ? theme.accent : theme.card, color: financeSubTab === tab.id ? "#000" : theme.text }}>
                    {tab.icon} {tab.label} {tab.badge ? `(${tab.badge})` : ""}
                  </button>
                ))}
              </div>

              {/* FINANCE OVERVIEW */}
              {financeSubTab === "overview" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "24px" }}>
                    <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                      <TrendingUp size={24} color={theme.green} />
                      <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Verified Income</p>
                      <h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.green }}>KES {totalIncome.toLocaleString()}</h3>
                    </div>
                    <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                      <ArrowRightLeft size={24} color={theme.red} />
                      <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Verified Expenses</p>
                      <h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.red }}>KES {totalExpense.toLocaleString()}</h3>
                    </div>
                    <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                      <Clock size={24} color={theme.accent} />
                      <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Pending Volume</p>
                      <h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>KES {pendingVolume.toLocaleString()}</h3>
                    </div>
                    <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)" }}>
                      <Wallet size={24} color={theme.purple} />
                      <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Net Cash Movement</p>
                      <h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.purple }}>KES {netBalance.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* FINANCE REGISTER & FILTERS */}
              {financeSubTab === "register" && (
                <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    <div style={{ position: "relative" }}>
                      <Search size={18} color={theme.textMuted} style={{ position: "absolute", left: "12px", top: "12px" }} />
                      <input type="text" placeholder="Search by name, M-Pesa code, or ref..." value={financeSearch} onChange={e => setFinanceSearch(e.target.value)} style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: "rgba(0,0,0,0.3)", color: "white" }} />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <select value={financeStatus} onChange={e => setFinanceStatus(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", color: "white", border: `1px solid ${theme.border}` }}>
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <select value={financeType} onChange={e => setFinanceType(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", color: "white", border: `1px solid ${theme.border}` }}>
                        <option value="all">All Types</option>
                        <option value="income">Income (In)</option>
                        <option value="expense">Expense (Out)</option>
                      </select>
                    </div>
                  </div>

                  <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "10px" }}>Showing {filteredAdminPayments.length} transactions</p>

                  {filteredAdminPayments.map(p => (
                    <div key={p.id} onClick={() => setSelectedTx(p)} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "10px", borderLeft: `4px solid ${p.transaction_type === 'income' ? theme.green : theme.red}`, cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong>{p.profiles?.full_name || "System Expense"}</strong>
                        <span style={{ color: p.transaction_type === 'income' ? theme.green : theme.red, fontWeight: "bold" }}>
                          {p.transaction_type === 'income' ? "+" : "-"} KES {p.amount}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: theme.textMuted }}>
                        <span>{p.category || "General"} • {p.mpesa_code || "No Code"}</span>
                        <span style={{ color: p.status === 'verified' ? theme.green : p.status === 'pending' ? theme.accent : theme.red, fontWeight: "bold" }}>{p.status.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* M-PESA VERIFICATION QUEUE */}
              {financeSubTab === "verify" && (
                <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending M-Pesa Submissions</h3>
                  {pendingPayments.length === 0 ? <p style={{ color: theme.textMuted }}>No pending payments to verify.</p> : pendingPayments.map(p => (
                    <div key={p.id} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "12px", borderLeft: `3px solid ${theme.accent}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div>
                          <strong>{p.profiles?.full_name}</strong>
                          <p style={{ fontSize: "11px", color: theme.textMuted }}>Code: {p.profiles?.member_code || "N/A"}</p>
                        </div>
                        <span style={{ fontWeight: "bold", color: theme.accent }}>KES {p.amount}</span>
                      </div>
                      <p style={{ fontSize: "12px", marginBottom: "12px" }}>M-Pesa Ref: <strong style={{ color: theme.blue }}>{p.mpesa_code}</strong></p>
                      
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => handleVerifyPayment(p, "verified")} style={{ flex: 1, padding: "10px", backgroundColor: theme.green, color: "#000", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}><CheckCircle2 size={16}/> Verify</button>
                        <button onClick={() => { const reason = prompt("Reason for rejection:"); if(reason) handleVerifyPayment(p, "rejected", reason); }} style={{ flex: 1, padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: theme.red, border: `1px solid ${theme.red}`, borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}><X size={16}/> Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* REPORTS & EXPORTS */}
              {financeSubTab === "reports" && (
                <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                  <FileText size={40} color={theme.accent} style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ marginBottom: "8px" }}>Export Financial Register</h3>
                  <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "20px" }}>Download a CSV file of all filtered transactions for accounting and reconciliation.</p>
                  <button onClick={exportToCSV} style={{ padding: "12px 24px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", width: "100%" }}>
                    <Download size={18}/> Download CSV Report
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OTHER ADMIN TABS (Simplified for this prompt) */}
          {adminTab === "overview" && <div style={{ color: theme.textMuted }}>Go to Treasurer Portal for the full financial overview.</div>}
          
        </div>
      </div>

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTx && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: theme.card, width: "100%", maxWidth: "400px", borderRadius: "16px", border: `1px solid ${theme.purple}`, padding: "20px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: theme.accent }}>Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={20} /></button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                <span style={{ color: theme.textMuted }}>Member:</span>
                <strong>{selectedTx.profiles?.full_name || "System"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                <span style={{ color: theme.textMuted }}>Amount:</span>
                <strong style={{ color: selectedTx.transaction_type === 'income' ? theme.green : theme.red }}>KES {selectedTx.amount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                <span style={{ color: theme.textMuted }}>M-Pesa Code:</span>
                <strong style={{ color: theme.blue }}>{selectedTx.mpesa_code || "N/A"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                <span style={{ color: theme.textMuted }}>Status:</span>
                <strong style={{ color: selectedTx.status === 'verified' ? theme.green : theme.accent }}>{selectedTx.status.toUpperCase()}</strong>
              </div>
              
              {selectedTx.status === 'verified' && (
                <div style={{ marginTop: "20px" }}>
                  <button onClick={() => { setReceiptTx(selectedTx); setSelectedTx(null); }} style={{ width: "100%", padding: "12px", backgroundColor: theme.purple, color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", gap: "8px" }}><Printer size={18}/> View Receipt</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL FOR ADMIN */}
      {receiptTx && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "white", color: "black", width: "100%", maxWidth: "400px", borderRadius: "8px", padding: "30px", position: "relative" }}>
            <button onClick={() => setReceiptTx(null)} style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer" }}><X size={24} /></button>
            <div style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: "15px", marginBottom: "15px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", textTransform: "uppercase" }}>Alpha Youth Group</h2>
              <p style={{ fontSize: "12px", fontStyle: "italic", color: "#555" }}>Together We Rise and Shine!</p>
            </div>
            <p style={{ fontSize: "12px", marginBottom: "5px" }}><strong>Date:</strong> {new Date(receiptTx.created_at).toLocaleString()}</p>
            <p style={{ fontSize: "12px", marginBottom: "5px" }}><strong>Receipt No:</strong> AYG-{receiptTx.id.slice(0,6).toUpperCase()}</p>
            <p style={{ fontSize: "12px", marginBottom: "5px" }}><strong>Member:</strong> {receiptTx.profiles?.full_name}</p>
            <p style={{ fontSize: "12px", marginBottom: "15px" }}><strong>M-Pesa Ref:</strong> {receiptTx.mpesa_code}</p>
            <div style={{ backgroundColor: "#f3f4f6", padding: "15px", borderRadius: "8px", textAlign: "center", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#555", textTransform: "uppercase", fontWeight: "bold" }}>Amount Paid</p>
              <h3 style={{ fontSize: "28px", fontWeight: "900" }}>KES {receiptTx.amount.toLocaleString()}</h3>
            </div>
            <button onClick={() => window.print()} style={{ width: "100%", padding: "12px", backgroundColor: "#000", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", gap: "8px" }}><Printer size={18}/> Print Receipt</button>
          </div>
        </div>
      )}

    </div>
  );
}
