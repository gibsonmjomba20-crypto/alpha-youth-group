"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import ExecutiveManager from "./executives";
import { Card, StatCard, Button, Badge, Skeleton } from "../components/ui";
import { 
  Bell, Home, Wallet, TrendingUp, TrendingDown, Briefcase, ArrowRightLeft, User, ShieldCheck, 
  Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, 
  Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, 
  Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, 
  Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, 
  GraduationCap, CalendarDays, HandCoins, Banknote, UserX, UserCheck, BarChart3, 
  Search, MessagesSquare, X, MessageSquare, ExternalLink, LogOut, Presentation, 
  HeartHandshake, LifeBuoy, AlertCircle, LayoutDashboard, MoreHorizontal, AlertTriangle,
  Trophy, Calculator, Book, Award, FileBadge, Sparkles, Eye, Trash2, Download, Printer, Crown, Shield, Info, Activity, FileSpreadsheet, Server, PlusSquare
} from "lucide-react";

const THEMES = { navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444", whatsapp: "#25D366" } };
const MASTER_ADMIN_EMAIL = "gibsonmjomba20@gmail.com";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [savings, setSavings] = useState<number>(0);
  const [myPayments, setMyPayments] = useState<any[]>([]); 
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [financeSearch, setFinanceSearch] = useState("");
  const [newExpense, setNewExpense] = useState({ amount: "", category: "Operating Expenses", notes: "" });
  const [manualPayment, setManualPayment] = useState({ user_id: "", amount: "", category: "Membership Fees", mpesa_code: "", notes: "" });

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

      if (profileData && (profileData.role === 'admin' || profileData.role === 'treasurer' || profileData.role === 'chairman' || profileData.email === MASTER_ADMIN_EMAIL)) {
        const { data: users } = await supabase.from("profiles").select("*").order("full_name", { ascending: true });
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
        const { error: payError } = await supabase.from("payments").update({ 
          status: "verified", 
          verified_by: profile.full_name, 
          verified_at: new Date().toISOString() 
        }).eq("id", tx.id);
        
        if (payError) throw new Error(`Payment update failed: ${payError.message}`);

        if (tx.transaction_type === 'income' || !tx.transaction_type) {
          const amountToAdd = Number(tx.amount) || 0;
          
          const { data: currentS, error: fetchError } = await supabase.from("savings").select("total_savings").eq("user_id", tx.user_id).single();
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            throw new Error(`Fetch savings failed: ${fetchError.message}`);
          }

          if (currentS) {
            const newTotal = Number(currentS.total_savings || 0) + amountToAdd;
            const { error: savError } = await supabase.from("savings").update({ total_savings: newTotal }).eq("user_id", tx.user_id);
            if (savError) throw new Error(`Savings update failed: ${savError.message}`);
          } else {
            const { error: insError } = await supabase.from("savings").insert({ user_id: tx.user_id, total_savings: amountToAdd });
            if (insError) throw new Error(`Savings insert failed: ${insError.message}`);
          }
        }

        await logAction("VERIFIED_PAYMENT", tx.id, { amount: tx.amount }); 
        alert("Success! Payment Approved and Added to Wallet.");
      } else {
        const { error: rejError } = await supabase.from("payments").update({ 
          status: "rejected", 
          rejection_reason: reason, 
          verified_by: profile.full_name 
        }).eq("id", tx.id);
        
        if (rejError) throw new Error(`Rejection failed: ${rejError.message}`);
        await logAction("REJECTED_PAYMENT", tx.id, { amount: tx.amount, reason }); 
        alert("Payment Rejected.");
      }
      fetchDashboardData(); 
    } catch (err: any) { 
      alert("DATABASE ERROR: " + err.message); 
    }
  };

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPayment.user_id) return alert("Please select a member.");
    try {
      const { error: payError } = await supabase.from("payments").insert({
        user_id: manualPayment.user_id, amount: parseFloat(manualPayment.amount), category: manualPayment.category,
        mpesa_code: manualPayment.mpesa_code || `CASH-${Date.now()}`, status: "verified", transaction_type: "income",
        verified_by: profile.full_name, verified_at: new Date().toISOString(), notes: manualPayment.notes
      });
      if (payError) throw payError;

      const { data: currentS } = await supabase.from("savings").select("total_savings").eq("user_id", manualPayment.user_id).single();
      if (currentS) {
         await supabase.from("savings").update({ total_savings: currentS.total_savings + parseFloat(manualPayment.amount) }).eq("user_id", manualPayment.user_id);
      } else {
         await supabase.from("savings").insert({ user_id: manualPayment.user_id, total_savings: parseFloat(manualPayment.amount) });
      }
      await logAction("MANUAL_PAYMENT", manualPayment.user_id, { amount: manualPayment.amount });
      alert("Payment recorded!"); setManualPayment({ user_id: "", amount: "", category: "Membership Fees", mpesa_code: "", notes: "" }); fetchDashboardData();
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
      user_id: profile.id, amount: parseFloat(newExpense.amount), mpesa_code: `EXP-${Date.now().toString().slice(-6)}`,
      status: "verified", transaction_type: "expense", category: newExpense.category,
      verified_by: profile.full_name, notes: newExpense.notes
    });
    await logAction("LOGGED_EXPENSE", "N/A", { amount: newExpense.amount }); alert("Expense Logged.");
    setNewExpense({ amount: "", category: "Operating Expenses", notes: "" }); fetchDashboardData();
  };

  const handleRoleChange = async (userId: string, userEmail: string, newRole: string) => {
    if (userEmail?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) return alert("Cannot change Master Admin.");
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    await logAction("ROLE_CHANGE", userId, { new_role: newRole }); fetchDashboardData();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B1120] p-6 pt-20">
      <Skeleton className="h-20 w-full mb-6" />
      <div className="grid grid-cols-2 gap-4 mb-6"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
  
  if (!profile) return <div className="text-white p-5">Profile not found.</div>;

  const safeName = profile?.full_name || "User";
  const safeInitial = safeName.charAt(0);
  const isTreasurer = profile.role === 'treasurer' && profile.email !== MASTER_ADMIN_EMAIL;
  const isAdmin = profile.role === 'admin' || profile.email === MASTER_ADMIN_EMAIL;

  // ==========================================
  // 1. TREASURER DASHBOARD
  // ==========================================
  if (isTreasurer) {
    const pendingTx = allPayments.filter(p => p.status === 'pending');
    const income = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const expense = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const net = income - expense;

    return (
      <div className="bg-[#0B1120] text-white min-h-screen flex">
        {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/70 z-[999]" />}
        <div className={`fixed top-0 left-0 h-screen w-[260px] bg-[#131C2E] z-[1000] transition-transform duration-300 border-r border-white/10 p-5 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-extrabold text-[#10B981]">Treasurer Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><X size={24} /></button>
          </div>
          {[
            { id: "treasury_overview", label: "Financial Overview", icon: <BarChart3 size={20} /> },
            { id: "record_payment", label: "Record Payment", icon: <PlusSquare size={20} /> },
            { id: "verification", label: "Verify Payments", icon: <CheckCircle2 size={20} />, badge: pendingTx.length },
            { id: "register", label: "Transaction Register", icon: <FileSpreadsheet size={20} /> },
            { id: "loans", label: "Loan Approvals", icon: <HandCoins size={20} />, badge: allLoans.length },
            { id: "expenses", label: "Log an Expense", icon: <TrendingDown size={20} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => { setTreasurerTab(item.id); setIsMenuOpen(false); }} className={`flex items-center justify-between p-3.5 rounded-lg mb-2 font-bold ${treasurerTab === item.id ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-transparent text-gray-400'}`}>
              <div className="flex items-center gap-3">{item.icon} {item.label}</div>
              {item.badge > 0 && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{item.badge}</span>}
            </button>
          ))}
          <div className="mt-auto">
            <Button variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full"><LogOut size={20} /> Logout</Button>
          </div>
        </div>

        <div className="flex-1 pb-20 w-full">
          <div className="bg-gradient-to-br from-[#064e3b] to-[#0f172a] p-5 border-b border-[#10B981] flex justify-between items-center">
             <div className="flex items-center gap-3">
               <button onClick={() => setIsMenuOpen(true)} className="text-white"><Menu size={28} /></button>
               <h1 className="text-xl font-extrabold text-white">Treasurer Portal</h1>
             </div>
             <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center font-bold text-white border border-white">{safeInitial}</div>
          </div>

          <div className="p-5">
            {treasurerTab === "treasury_overview" && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Info size={18} className="text-[#10B981]"/> Financial Summary</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <StatCard title="Verified Income" value={`KES ${income.toLocaleString()}`} icon={<TrendingUp size={24} />} color="#10B981" />
                  <StatCard title="Verified Expenses" value={`KES ${expense.toLocaleString()}`} icon={<TrendingDown size={24} />} color="#EF4444" />
                  <StatCard title="Net Cash Balance" value={`KES ${net.toLocaleString()}`} icon={<Wallet size={24} />} color="#9333EA" />
                  <StatCard title="Pending Verifications" value={`${pendingTx.length} Records`} icon={<Clock size={24} />} color="#FBBF24" trend="Action Required" />
                </div>
              </div>
            )}

            {treasurerTab === "record_payment" && (
              <Card>
                <h3 className="mb-4 text-[#10B981] font-bold flex items-center gap-2"><PlusSquare size={20}/> Record Direct Payment</h3>
                <form onSubmit={handleManualPayment} className="flex flex-col gap-3">
                  <select required value={manualPayment.user_id} onChange={e => setManualPayment({...manualPayment, user_id: e.target.value})} className="p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none">
                    <option value="">Select Member...</option>
                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.member_code || "No ID"})</option>)}
                  </select>
                  <input type="number" placeholder="Amount (KES)" required value={manualPayment.amount} onChange={e => setManualPayment({...manualPayment, amount: e.target.value})} className="p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none" />
                  <input type="text" placeholder="M-Pesa Code (Optional)" value={manualPayment.mpesa_code} onChange={e => setManualPayment({...manualPayment, mpesa_code: e.target.value})} className="p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none" />
                  <Button variant="primary" type="submit" className="w-full mt-2">Record & Approve</Button>
                </form>
              </Card>
            )}

            {treasurerTab === "verification" && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#10B981]">Pending M-Pesa Submissions</h3>
                {pendingTx.length === 0 ? <p className="text-gray-400">No pending payments.</p> : pendingTx.map(p => (
                  <Card key={p.id} className="mb-3 border-l-4 border-l-[#10B981]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-white">{p.profiles?.full_name}</p>
                        <p className="text-[11px] text-gray-400">Code: {p.profiles?.member_code || "N/A"}</p>
                      </div>
                      <span className="font-bold text-[#FBBF24]">KES {p.amount}</span>
                    </div>
                    <p className="text-xs mb-4">M-Pesa Ref: <strong className="text-[#3B82F6]">{p.mpesa_code}</strong></p>
                    <div className="flex gap-3">
                      <Button variant="primary" onClick={() => handleVerifyPayment(p, "verified")} className="flex-1 py-2 text-xs">Verify</Button>
                      <Button variant="danger" onClick={() => { const reason = prompt("Reason:"); if(reason) handleVerifyPayment(p, "rejected", reason); }} className="flex-1 py-2 text-xs">Reject</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {treasurerTab === "register" && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#3B82F6]">Transaction Register</h3>
                <input type="text" placeholder="Search..." value={financeSearch} onChange={e => setFinanceSearch(e.target.value)} className="w-full p-3 mb-4 rounded-lg bg-black/30 border border-white/10 text-white outline-none" />
                {allPayments.filter(p => p.profiles?.full_name?.toLowerCase().includes(financeSearch.toLowerCase())).map(p => (
                  <Card key={p.id} className={`mb-3 border-l-4 ${p.transaction_type === 'income' ? 'border-l-[#10B981]' : 'border-l-[#EF4444]'}`}>
                    <div className="flex justify-between mb-2">
                      <strong className="text-white">{p.profiles?.full_name || "System Expense"}</strong>
                      <span className={`font-bold ${p.transaction_type === 'income' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{p.transaction_type === 'income' ? "+" : "-"} KES {p.amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2">
                      <div className="flex gap-2 items-center"><Badge status={p.status} /> <span>{p.category}</span></div>
                      {p.status === 'pending' && <Button variant="primary" onClick={() => handleVerifyPayment(p, "verified")} className="py-1 px-3 text-[10px]">Approve</Button>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {treasurerTab === "loans" && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#9333EA]">Loan Approvals</h3>
                {allLoans.map(l => (
                  <Card key={l.id} className="mb-3 border-l-4 border-l-[#9333EA]">
                    <p className="font-bold text-white">{l.profiles?.full_name}</p>
                    <p className="text-xs text-gray-400 mb-4">Amount: KES {l.amount} | {l.purpose}</p>
                    <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => handleApproveLoan(l, "approved")} className="flex-1 py-2 text-xs">Approve</Button>
                      <Button variant="danger" onClick={() => handleApproveLoan(l, "rejected")} className="flex-1 py-2 text-xs">Reject</Button>
                    </div>
                  </Card>
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
    return (
      <div className="bg-[#0B1120] text-white min-h-screen flex">
        {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/70 z-[999]" />}
        <div className={`fixed top-0 left-0 h-screen w-[260px] bg-[#131C2E] z-[1000] transition-transform duration-300 border-r border-white/10 p-5 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-extrabold text-[#FBBF24]">Admin Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><X size={24} /></button>
          </div>
          {[
            { id: "overview", label: "Dashboard Overview", icon: <LayoutDashboard size={20} /> },
            { id: "directory", label: "Manage Executives", icon: <Users size={20} /> },
            { id: "audit", label: "System Audit Logs", icon: <Server size={20} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => { setAdminTab(item.id); setIsMenuOpen(false); }} className={`flex items-center gap-3 p-3.5 rounded-lg mb-2 font-bold ${adminTab === item.id ? 'bg-[#FBBF24]/10 text-[#FBBF24]' : 'bg-transparent text-gray-400'}`}>
              {item.icon} {item.label}
            </button>
          ))}
          <div className="mt-auto">
            <Button variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full"><LogOut size={20} /> Logout</Button>
          </div>
        </div>

        <div className="flex-1 pb-20 w-full">
          <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] p-5 border-b border-[#9333EA] flex justify-between items-center">
             <div className="flex items-center gap-3">
               <button onClick={() => setIsMenuOpen(true)} className="text-white"><Menu size={28} /></button>
               <h1 className="text-xl font-extrabold text-white">Admin Portal</h1>
             </div>
             <div className="w-8 h-8 rounded-full bg-[#9333EA] flex items-center justify-center font-bold text-white border border-[#FBBF24]">{safeInitial}</div>
          </div>

          <div className="p-5">
            {adminTab === "overview" && (
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <StatCard title="Total Members" value={String(allUsers.length)} icon={<Users size={24} />} color="#9333EA" />
                  <StatCard title="System Status" value="Online" icon={<Activity size={24} />} color="#10B981" />
              </div>
            )}
            {adminTab === "directory" && <ExecutiveManager users={allUsers} onRoleChange={handleRoleChange} theme={theme} />}
            {adminTab === "audit" && (
              <div>
                <h3 className="mb-4 text-[#3B82F6] font-bold flex items-center gap-2"><Server size={20}/> Recent System Activity</h3>
                {auditLogs.map(log => (
                  <Card key={log.id} className="mb-2">
                    <p className="font-bold text-sm text-white">{log.action.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-400">By: {log.actor_name} | {new Date(log.created_at).toLocaleString()}</p>
                  </Card>
                ))}
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
    <div className="min-h-screen bg-[#0B1120] text-white p-5">
      <h2 className="text-2xl font-extrabold mb-5">Welcome, {safeName.split(' ')[0]}</h2>
      <Card className="mb-6">
        <p className="text-gray-400">Alpha Wallet Balance</p>
        <h3 className="text-3xl font-black text-[#FBBF24]">KES {savings.toLocaleString()}</h3>
      </Card>
      <Button variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full">Sign Out</Button>
    </div>
  );
}
