"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import ExecutiveManager from "./executives";
import { 
  Bell, Home, Wallet, TrendingUp, TrendingDown, Briefcase, ArrowRightLeft, User, ShieldCheck, 
  Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, 
  Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, 
  Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, 
  Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, 
  GraduationCap, CalendarDays, HandCoins, Banknote, UserX, UserCheck, BarChart3, 
  Search, MessagesSquare, X, MessageSquare, ExternalLink, LogOut, Presentation, 
  HeartHandshake, LifeBuoy, AlertCircle, LayoutDashboard, MoreHorizontal, AlertTriangle,
  Trophy, Calculator, Book, Award, FileBadge, Sparkles, Eye, Trash2, Download, Printer, Crown, Shield, Info, Activity, FileSpreadsheet, Server
} from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444", whatsapp: "#25D366" }
};

const MASTER_ADMIN_EMAIL = "gibsonmjomba20@gmail.com";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [savings, setSavings] = useState<number>(0);
  const [myPayments, setMyPayments] = useState<any[]>([]); 
  
  // ADMIN & TREASURER DATA
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // FINANCE SPECIFIC STATE
  const [financeSubTab, setFinanceSubTab] = useState("overview"); 
  const [financeSearch, setFinanceSearch] = useState("");
  const [financeStatus, setFinanceStatus] = useState("all");
  
  // FORMS
  const [newExpense, setNewExpense] = useState({ amount: "", category: "Operating Expenses", notes: "" });

  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState("overview"); 
  const [treasurerTab, setTreasurerTab] = useState("treasury_overview"); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const theme = THEMES.navy;
  const router = useRouter();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) setProfile(profileData);

      const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
      if (s) setSavings(s.total_savings);

      const { data: p } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (p) setMyPayments(p);

      // Load Staff Data
      if (profileData && (profileData.role === 'admin' || profileData.role === 'treasurer' || profileData.role === 'chairman' || profileData.email === MASTER_ADMIN_EMAIL)) {
        const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (users) setAllUsers(users);
        
        const { data: allP } = await supabase.from("payments").select(`*, profiles:user_id (full_name, member_code)`).order("created_at", { ascending: false });
        if (allP) setAllPayments(allP);

        const { data: allL } = await supabase.from("loans").select(`*, profiles:user_id (full_name, member_code)`).eq("status", "pending");
        if (allL) setAllLoans(allL);

        if (profileData.role === 'admin' || profileData.email === MASTER_ADMIN_EMAIL) {
          const { data: logs } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(20);
          if (logs) setAuditLogs(logs);
        }
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const logAction = async (action: string, targetId: string, details: any) => {
    try { await supabase.from("audit_logs").insert({ actor_id: profile.id, actor_name: profile.full_name, action, target_id: targetId, details }); } catch (e) {}
  };

  const handleVerifyPayment = async (tx: any, action: "verified" | "rejected", reason?: string) => {
    try {
      if (action === "verified") {
        await supabase.from("payments").update({ status: "verified", verified_by: profile.full_name, verified_at: new Date().toISOString() }).eq("id", tx.id);
        if (tx.transaction_type === 'income') {
          const { data: currentS } = await supabase.from("savings").select("total_savings").eq("user_id", tx.user_id).single();
          if (currentS) await supabase.from("savings").update({ total_savings: currentS.total_savings + tx.amount }).eq("user_id", tx.user_id);
        }
        await logAction("VERIFIED_PAYMENT", tx.id, { amount: tx.amount }); alert("Payment Verified.");
      } else {
        await supabase.from("payments").update({ status: "rejected", rejection_reason: reason, verified_by: profile.full_name }).eq("id", tx.id);
        await logAction("REJECTED_PAYMENT", tx.id, { amount: tx.amount, reason }); alert("Payment Rejected.");
      }
      fetchDashboardData();
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleApproveLoan = async (loan: any, action: "approved" | "rejected") => {
    await supabase.from("loans").update({ status: action }).eq("id", loan.id);
    await logAction(`${action.toUpperCase()}_LOAN`, loan.id, { amount: loan.amount });
    alert(`Loan ${action}!`); fetchDashboardData();
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("payments").insert({ 
      user_id: profile.id, 
      amount: parseFloat(newExpense.amount), 
      mpesa_code: `EXP-${Date.now().toString().slice(-6)}`,
      status: "verified", // Expenses logged by treasurer are immediately verified
      transaction_type: "expense",
      category: newExpense.category,
      verified_by: profile.full_name,
      notes: newExpense.notes
    });
    await logAction("LOGGED_EXPENSE", "N/A", { amount: newExpense.amount, category: newExpense.category });
    alert("Expense Logged Successfully.");
    setNewExpense({ amount: "", category: "Operating Expenses", notes: "" });
    fetchDashboardData();
  };

  const handleRoleChange = async (userId: string, userEmail: string, newRole: string) => {
    if (userEmail?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) return alert("Cannot change Master Admin.");
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    await logAction("ROLE_CHANGE", userId, { new_role: newRole });
    fetchDashboardData();
  };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><RefreshCw className="animate-spin" size={32} /></div>;
  if (!profile) return <div style={{ color: "white", padding: "20px" }}>Profile not found.</div>;

  const safeName = profile?.full_name || "User";
  const safeInitial = safeName.charAt(0);
  
  const isTreasurer = profile.role === 'treasurer' && profile.email !== MASTER_ADMIN_EMAIL;
  const isAdmin = profile.role === 'admin' || profile.email === MASTER_ADMIN_EMAIL;
  const isStaff = isAdmin || isTreasurer;

  // ==========================================
  // 1. TREASURER DASHBOARD (Separated)
  // ==========================================
  if (isTreasurer) {
    const pendingTx = allPayments.filter(p => p.status === 'pending');
    const income = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const expense = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const net = income - expense;

    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh", display: "flex" }}>
        {/* TREASURER SIDEBAR */}
        {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 999 }} />}
        <div style={{ position: "fixed", top: 0, left: isMenuOpen ? 0 : "-280px", width: "260px", height: "100vh", backgroundColor: theme.card, zIndex: 1000, transition: "0.3s", borderRight: `1px solid ${theme.border}`, padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: theme.green }}>Treasurer Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} style={{ background: "none", border: "none", color: theme.textMuted }}><X size={24} /></button>
          </div>
          {[
            { id: "treasury_overview", label: "Financial Overview", icon: <BarChart3 size={20} /> },
            { id: "verification", label: "Verify Payments", icon: <CheckCircle2 size={20} />, badge: pendingTx.length },
            { id: "register", label: "Transaction Register", icon: <FileSpreadsheet size={20} /> },
            { id: "loans", label: "Loan Approvals", icon: <HandCoins size={20} />, badge: allLoans.length },
            { id: "expenses", label: "Log an Expense", icon: <TrendingDown size={20} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => { setTreasurerTab(item.id); setIsMenuOpen(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", borderRadius: "8px", backgroundColor: treasurerTab === item.id ? "rgba(16, 185, 129, 0.1)" : "transparent", color: treasurerTab === item.id ? theme.green : theme.textMuted, border: "none", fontWeight: "bold", cursor: "pointer", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>{item.icon} {item.label}</div>
              {item.badge > 0 && <span style={{ backgroundColor: theme.red, color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "10px" }}>{item.badge}</span>}
            </button>
          ))}
          <div style={{ marginTop: "auto" }}>
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", width: "100%", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: theme.red, border: "none", fontWeight: "bold", cursor: "pointer" }}><LogOut size={20} /> Logout</button>
          </div>
        </div>

        <div style={{ flex: 1, paddingBottom: "80px", width: "100%" }}>
          <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #0f172a 100%)", padding: "20px", borderBottom: `1px solid ${theme.green}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
               <button onClick={() => setIsMenuOpen(true)} style={{ background: "none", border: "none", color: "white" }}><Menu size={28} /></button>
               <div><h1 style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>Treasurer Portal</h1></div>
             </div>
             <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.green, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid #fff` }}>{safeInitial}</div>
          </div>

          <div style={{ padding: "20px" }}>
            {treasurerTab === "treasury_overview" && (
              <div>
                <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Info size={18} color={theme.green}/> Financial Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "24px" }}>
                  <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.3)" }}><TrendingUp size={24} color={theme.green} /><p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Verified Income</p><h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.green }}>KES {income.toLocaleString()}</h3></div>
                  <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.3)" }}><TrendingDown size={24} color={theme.red} /><p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Verified Expenses</p><h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.red }}>KES {expense.toLocaleString()}</h3></div>
                  <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)" }}><Wallet size={24} color={theme.purple} /><p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Net Cash Balance</p><h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.purple }}>KES {net.toLocaleString()}</h3></div>
                  <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}><Clock size={24} color={theme.accent} /><p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>Pending Verifications</p><h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>{pendingTx.length} Records</h3></div>
                </div>
              </div>
            )}

            {treasurerTab === "verification" && (
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "16px", color: theme.green }}>Pending M-Pesa Submissions</h3>
                {pendingTx.length === 0 ? <p style={{ color: theme.textMuted }}>No pending payments.</p> : pendingTx.map(p => (
                  <div key={p.id} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "12px", borderLeft: `3px solid ${theme.green}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><div><strong>{p.profiles?.full_name}</strong><p style={{ fontSize: "11px", color: theme.textMuted }}>Code: {p.profiles?.member_code || "N/A"}</p></div><span style={{ fontWeight: "bold", color: theme.accent }}>KES {p.amount}</span></div>
                    <p style={{ fontSize: "12px", marginBottom: "12px" }}>M-Pesa Ref: <strong style={{ color: theme.blue }}>{p.mpesa_code}</strong></p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => handleVerifyPayment(p, "verified")} style={{ flex: 1, padding: "10px", backgroundColor: theme.green, color: "#000", border: "none", borderRadius: "6px", fontWeight: "bold" }}>Verify</button>
                      <button onClick={() => { const reason = prompt("Reason:"); if(reason) handleVerifyPayment(p, "rejected", reason); }} style={{ flex: 1, padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: theme.red, border: `1px solid ${theme.red}`, borderRadius: "6px", fontWeight: "bold" }}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {treasurerTab === "loans" && (
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "16px", color: theme.purple }}>Pending Loan Applications</h3>
                {allLoans.length === 0 ? <p style={{ color: theme.textMuted }}>No pending loans.</p> : allLoans.map(l => (
                  <div key={l.id} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "12px", borderLeft: `3px solid ${theme.purple}` }}>
                    <p style={{ fontWeight: "bold" }}>{l.profiles?.full_name}</p>
                    <p style={{ fontSize: "12px", color: theme.textMuted }}>Amount: KES {l.amount} | Purpose: {l.purpose}</p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button onClick={() => handleApproveLoan(l, "approved")} style={{ flex: 1, padding: "10px", backgroundColor: theme.purple, color: "white", border: "none", borderRadius: "6px", fontWeight: "bold" }}>Approve Loan</button>
                      <button onClick={() => handleApproveLoan(l, "rejected")} style={{ flex: 1, padding: "10px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: theme.red, border: `1px solid ${theme.red}`, borderRadius: "6px", fontWeight: "bold" }}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {treasurerTab === "expenses" && (
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "16px", color: theme.red }}>Log Organizational Expense</h3>
                <form onSubmit={handleLogExpense} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input type="number" placeholder="Amount (KES)" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, color: "white" }} />
                  <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, color: "white" }}>
                    <option>Operating Expenses</option><option>Event Costs</option><option>Loan Disbursement</option><option>Alpha Care Assistance</option>
                  </select>
                  <input type="text" placeholder="Notes / Payee" required value={newExpense.notes} onChange={e => setNewExpense({...newExpense, notes: e.target.value})} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, color: "white" }} />
                  <button type="submit" style={{ padding: "12px", backgroundColor: theme.red, color: "#fff", borderRadius: "8px", fontWeight: "bold", border: "none" }}>Log Expense</button>
                </form>
              </div>
            )}

            {treasurerTab === "register" && (
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "16px", color: theme.blue }}>Transaction Register</h3>
                <input type="text" placeholder="Search..." value={financeSearch} onChange={e => setFinanceSearch(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: "rgba(0,0,0,0.3)", color: "white", marginBottom: "16px" }} />
                {allPayments.filter(p => p.profiles?.full_name?.toLowerCase().includes(financeSearch.toLowerCase())).map(p => (
                  <div key={p.id} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "10px", borderLeft: `4px solid ${p.transaction_type === 'income' ? theme.green : theme.red}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><strong>{p.profiles?.full_name || "System Expense"}</strong><span style={{ color: p.transaction_type === 'income' ? theme.green : theme.red, fontWeight: "bold" }}>{p.transaction_type === 'income' ? "+" : "-"} KES {p.amount}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: theme.textMuted }}><span>{p.category || "General"}</span><span>{p.status.toUpperCase()}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ADMIN DASHBOARD
  // ==========================================
  if (isAdmin) {
    const pendingTx = allPayments.filter(p => p.status === 'pending');
    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh", display: "flex" }}>
        {/* ADMIN SIDEBAR */}
        {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 999 }} />}
        <div style={{ position: "fixed", top: 0, left: isMenuOpen ? 0 : "-280px", width: "260px", height: "100vh", backgroundColor: theme.card, zIndex: 1000, transition: "0.3s", borderRight: `1px solid ${theme.border}`, padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: theme.accent }}>Admin Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} style={{ background: "none", border: "none", color: theme.textMuted }}><X size={24} /></button>
          </div>
          {[
            { id: "overview", label: "Dashboard Overview", icon: <LayoutDashboard size={20} /> },
            { id: "directory", label: "Manage Executives", icon: <Users size={20} /> },
            { id: "audit", label: "System Audit Logs", icon: <Server size={20} /> },
            { id: "settings", label: "System Settings", icon: <Settings size={20} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => { setAdminTab(item.id); setIsMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "8px", backgroundColor: adminTab === item.id ? "rgba(251, 191, 36, 0.1)" : "transparent", color: adminTab === item.id ? theme.accent : theme.textMuted, border: "none", fontWeight: "bold", cursor: "pointer", marginBottom: "8px", textAlign: "left" }}>
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
               <button onClick={() => setIsMenuOpen(true)} style={{ background: "none", border: "none", color: "white" }}><Menu size={28} /></button>
               <div><h1 style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>Admin Portal</h1></div>
             </div>
             <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}` }}>{safeInitial}</div>
          </div>

          <div style={{ padding: "20px" }}>
            {adminTab === "overview" && (
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ backgroundColor: "rgba(147, 51, 234, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(147, 51, 234, 0.3)" }}><Users size={24} color="#9333EA" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>Total Members</p><h3 style={{ fontSize: "24px", fontWeight: "800" }}>{allUsers.length}</h3></div>
                  <div style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.3)" }}><Activity size={24} color="#FBBF24" /><p style={{ fontSize: "12px", color: "#d1d5db", marginTop: "8px" }}>System Status</p><h3 style={{ fontSize: "24px", fontWeight: "800", color: theme.green }}>Online</h3></div>
              </div>
            )}

            {adminTab === "directory" && <ExecutiveManager users={allUsers} onRoleChange={handleRoleChange} theme={theme} />}

            {adminTab === "audit" && (
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "16px", color: theme.blue, display: "flex", alignItems: "center", gap: "8px" }}><Server size={20}/> Recent System Activity</h3>
                {auditLogs.length === 0 ? <p style={{ color: theme.textMuted }}>No audit logs found.</p> : auditLogs.map(log => (
                  <div key={log.id} style={{ borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                    <p style={{ fontWeight: "bold", fontSize: "14px" }}>{log.action.replace('_', ' ')}</p>
                    <p style={{ fontSize: "12px", color: theme.textMuted }}>By: {log.actor_name} | {new Date(log.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "settings" && (
              <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: theme.card, borderRadius: "16px" }}>
                <Settings size={40} color={theme.accent} style={{ margin: "0 auto 16px" }} />
                <h3>System Settings</h3>
                <p style={{ fontSize: "12px", color: theme.textMuted }}>Update Paybill and App Configurations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. MEMBER DASHBOARD (Fallback)
  // ==========================================
  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, padding: "20px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Welcome, {safeName.split(' ')[0]}</h2>
      <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
        <p style={{ color: theme.textMuted }}>Alpha Wallet Balance</p>
        <h3 style={{ fontSize: "32px", fontWeight: "900", color: theme.accent }}>KES {savings.toLocaleString()}</h3>
      </div>
      <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} style={{ width: "100%", padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: theme.red, borderRadius: "12px", fontWeight: "bold", border: "none" }}>Sign Out</button>
    </div>
  );
}
