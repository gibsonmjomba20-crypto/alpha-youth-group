"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Card, StatCard, Button, Badge, Skeleton } from "../../components/ui";
import { 
  Menu, X, LogOut, BarChart3, PlusSquare, ShieldCheck, FileSpreadsheet, 
  PiggyBank, HandCoins, TrendingDown, TrendingUp, Wallet, Folder, Clock, 
  Info, Download, Search, Landmark, CheckCircle2, User
} from "lucide-react";

const THEMES = { navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444" } };

export default function TreasurerPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // DATA
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [allSavings, setAllSavings] = useState<any[]>([]);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  
  // FILTERS
  const [financeSearch, setFinanceSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  
  // FORMS
  const [newExpense, setNewExpense] = useState({ amount: "", category: "Operating Expenses", notes: "" });
  const [manualPayment, setManualPayment] = useState({ user_id: "", amount: "", category: "Shares", mpesa_code: "", notes: "" });

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
    
    const { data: allS } = await supabase.from("savings").select("*");
    if (allS) setAllSavings(allS);
    
    const { data: allP } = await supabase.from("payments").select(`*, profiles:user_id (full_name, member_code)`).order("created_at", { ascending: false });
    if (allP) setAllPayments(allP);

    const { data: allL } = await supabase.from("loans").select(`*, profiles:user_id (full_name, member_code)`).eq("status", "pending");
    if (allL) setAllLoans(allL);

    setLoading(false);
  };

  const logAction = async (action: string, targetId: string, details: any) => {
    try { await supabase.from("audit_logs").insert({ actor_id: profile.id, actor_name: profile.full_name, action, target_id: targetId, details }); } catch (e) {}
  };

  const handleVerifyPayment = async (tx: any, action: "verified" | "rejected", reason?: string) => {
    try {
      if (action === "verified") {
        const { error: payError } = await supabase.from("payments").update({ status: "verified", verified_by: profile.full_name, verified_at: new Date().toISOString() }).eq("id", tx.id);
        if (payError) throw new Error(`Payment update failed: ${payError.message}`);
        await logAction("VERIFIED_PAYMENT", tx.id, { amount: tx.amount }); 
        alert("Success! Payment Approved.");
      } else {
        const { error: rejError } = await supabase.from("payments").update({ status: "rejected", rejection_reason: reason, verified_by: profile.full_name }).eq("id", tx.id);
        if (rejError) throw new Error(`Rejection failed: ${rejError.message}`);
        await logAction("REJECTED_PAYMENT", tx.id, { amount: tx.amount, reason }); 
        alert("Payment Rejected.");
      }
      fetchData(); 
    } catch (err: any) { alert("DATABASE ERROR: " + err.message); }
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
      await logAction("MANUAL_PAYMENT", manualPayment.user_id, { amount: manualPayment.amount, category: manualPayment.category });
      alert("Payment recorded successfully!"); setManualPayment({ user_id: "", amount: "", category: "Shares", mpesa_code: "", notes: "" }); fetchData();
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleApproveLoan = async (loan: any, action: "approved" | "rejected") => {
    await supabase.from("loans").update({ status: action }).eq("id", loan.id);
    await logAction(`${action.toUpperCase()}_LOAN`, loan.id, { amount: loan.amount });
    alert(`Loan ${action}!`); fetchData();
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("payments").insert({ 
      user_id: profile.id, amount: parseFloat(newExpense.amount), mpesa_code: `EXP-${Date.now().toString().slice(-6)}`,
      status: "verified", transaction_type: "expense", category: newExpense.category,
      verified_by: profile.full_name, notes: newExpense.notes
    });
    await logAction("LOGGED_EXPENSE", "N/A", { amount: newExpense.amount }); alert("Expense Logged.");
    setNewExpense({ amount: "", category: "Operating Expenses", notes: "" }); fetchData();
  };

  const exportToCSV = () => {
    if (allPayments.length === 0) return alert("No data to export.");
    const headers = ["Date", "Member", "Category", "Type", "Amount", "Status"];
    const rows = allPayments.map(p => [new Date(p.created_at).toLocaleDateString(), `"${p.profiles?.full_name || 'System'}"`, p.category, p.transaction_type, p.amount, p.status].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `AYG_Finance_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  if (loading) return <div className="min-h-screen bg-[#0B1120] flex justify-center items-center text-[#10B981]">Loading Treasurer Portal...</div>;
  if (!profile) return <div className="text-white p-5">Profile not found.</div>;

  const safeInitial = profile.full_name?.charAt(0) || "T";
  const pendingTx = allPayments.filter(p => p.status === 'pending');
  const income = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const expense = allPayments.filter(p => p.status === 'verified' && p.transaction_type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
  const net = income - expense;
  const sharesTotal = allPayments.filter(p => p.status === 'verified' && p.category === 'Shares').reduce((a, b) => a + Number(b.amount), 0);
  const projectTotal = allPayments.filter(p => p.status === 'verified' && p.category === 'Project Funding').reduce((a, b) => a + Number(b.amount), 0);
  const contributionsTotal = allPayments.filter(p => p.status === 'verified' && p.category === 'Contributions').reduce((a, b) => a + Number(b.amount), 0);

  const filteredPayments = allPayments.filter(p => {
    const matchSearch = p.profiles?.full_name?.toLowerCase().includes(financeSearch.toLowerCase()) || p.mpesa_code?.toLowerCase().includes(financeSearch.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchCategory = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="bg-[#0B1120] text-white min-h-screen flex">
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/70 z-[999]" />}
      
      {/* SIDEBAR */}
      <div className={`fixed top-0 left-0 h-screen w-[260px] bg-[#131C2E] z-[1000] transition-transform duration-300 border-r border-white/10 p-5 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-extrabold text-[#10B981] flex items-center gap-2"><Landmark size={20}/> Treasurer</h2>
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><X size={24} /></button>
        </div>
        {[
          { id: "overview", label: "Overview", icon: <BarChart3 size={20} /> },
          { id: "record_payment", label: "Record Payment", icon: <PlusSquare size={20} /> },
          { id: "verification", label: "Verify Payments", icon: <ShieldCheck size={20} />, badge: pendingTx.length },
          { id: "register", label: "Transaction Register", icon: <FileSpreadsheet size={20} /> },
          { id: "member_savings", label: "Member Savings", icon: <PiggyBank size={20} /> },
          { id: "loans", label: "Loan Approvals", icon: <HandCoins size={20} />, badge: allLoans.length },
          { id: "expenses", label: "Log an Expense", icon: <TrendingDown size={20} /> },
        ].map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }} className={`flex items-center justify-between p-3.5 rounded-lg mb-2 font-bold ${activeTab === item.id ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-transparent text-gray-400'}`}>
            <div className="flex items-center gap-3">{item.icon} {item.label}</div>
            {item.badge > 0 && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{item.badge}</span>}
          </button>
        ))}
        <div className="mt-auto">
          <Button variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full"><LogOut size={20} /> Logout</Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 pb-20 w-full">
        <div className="bg-gradient-to-br from-[#064e3b] to-[#0f172a] p-5 border-b border-[#10B981] flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMenuOpen(true)} className="text-white"><Menu size={28} /></button>
              <h1 className="text-xl font-extrabold text-white">Treasurer Portal</h1>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center font-bold text-white border border-white">{safeInitial}</div>
        </div>

        <div className="p-5">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-2 mb-6">
                  <div onClick={() => setActiveTab("record_payment")} className="flex flex-col items-center gap-1 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center text-[#10B981]"><PlusSquare size={24}/></div>
                    <span className="text-[10px] font-bold text-center">Record</span>
                  </div>
                  <div onClick={() => setActiveTab("verification")} className="flex flex-col items-center gap-1 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24]"><ShieldCheck size={24}/></div>
                    <span className="text-[10px] font-bold text-center">Verify</span>
                  </div>
                  <div onClick={() => setActiveTab("register")} className="flex flex-col items-center gap-1 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]"><FileSpreadsheet size={24}/></div>
                    <span className="text-[10px] font-bold text-center">Register</span>
                  </div>
                  <div onClick={() => setActiveTab("expenses")} className="flex flex-col items-center gap-1 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444]"><TrendingDown size={24}/></div>
                    <span className="text-[10px] font-bold text-center">Expense</span>
                  </div>
              </div>

              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Fund Breakdown</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard title="Shares Capital" value={`KES ${sharesTotal.toLocaleString()}`} icon={<TrendingUp size={24} />} color="#10B981" />
                <StatCard title="Project Funds" value={`KES ${projectTotal.toLocaleString()}`} icon={<Folder size={24} />} color="#FBBF24" />
                <StatCard title="Contributions" value={`KES ${contributionsTotal.toLocaleString()}`} icon={<HandCoins size={24} />} color="#3B82F6" />
                <StatCard title="Net Cash" value={`KES ${net.toLocaleString()}`} icon={<Wallet size={24} />} color="#9333EA" />
              </div>
            </div>
          )}

          {/* MEMBER SAVINGS TAB */}
          {activeTab === "member_savings" && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#10B981] flex items-center gap-2"><PiggyBank size={20}/> Member Savings</h3>
              <input type="text" placeholder="Search member..." value={financeSearch} onChange={e => setFinanceSearch(e.target.value)} className="w-full p-3 mb-4 rounded-lg bg-black/30 border border-white/10 text-white outline-none" />
              {allUsers.filter(u => u.full_name?.toLowerCase().includes(financeSearch.toLowerCase())).map(u => {
                const userSavings = allSavings.find(s => s.user_id === u.id)?.total_savings || 0;
                return (
                  <Card key={u.id} className="mb-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{u.full_name}</p>
                      <p className="text-xs text-gray-400">ID: {u.member_code || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Wallet</p>
                      <p className="font-bold text-[#10B981]">KES {userSavings.toLocaleString()}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* RECORD PAYMENT TAB */}
          {activeTab === "record_payment" && (
            <Card>
              <h3 className="mb-4 text-[#10B981] font-bold flex items-center gap-2"><PlusSquare size={20}/> Record Payment</h3>
              <form onSubmit={handleManualPayment} className="flex flex-col gap-3">
                <select required value={manualPayment.user_id} onChange={e => setManualPayment({...manualPayment, user_id: e.target.value})} className="p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none">
                  <option value="">Select Member...</option>
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.member_code || "No ID"})</option>)}
                </select>
                <select value={manualPayment.category} onChange={e => setManualPayment({...manualPayment, category: e.target.value})} className="p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none">
                  <option value="Shares">Shares Capital</option>
                  <option value="Contributions">Monthly Contributions</option>
                  <option value="Project Funding">Project Funding</option>
                  <option value="Membership Fees">Membership Fees</option>
                  <option value="Loan Repayment">Loan Repayment</option>
                  <option value="Alpha Care">Alpha Care</option>
                </select>
                <input type="number" placeholder="Amount (KES)" required value={manualPayment.amount} onChange={e => setManualPayment({...manualPayment, amount: e.target.value})} className="p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none" />
                <Button variant="primary" type="submit" className="w-full mt-2">Record Payment</Button>
              </form>
            </Card>
          )}

          {/* VERIFICATION TAB */}
          {activeTab === "verification" && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#10B981] flex items-center gap-2"><ShieldCheck size={20}/> Verify Payments</h3>
              {pendingTx.length === 0 ? <p className="text-gray-400">No pending payments.</p> : pendingTx.map(p => (
                <Card key={p.id} className="mb-3 border-l-4 border-l-[#10B981]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-white">{p.profiles?.full_name}</p>
                      <p className="text-[11px] text-gray-400">{p.category}</p>
                    </div>
                    <span className="font-bold text-[#FBBF24]">KES {p.amount}</span>
                  </div>
                  <p className="text-xs mb-4">Ref: <strong className="text-[#3B82F6]">{p.mpesa_code}</strong></p>
                  <div className="flex gap-3">
                    <Button variant="primary" onClick={() => handleVerifyPayment(p, "verified")} className="flex-1 py-2 text-xs">Verify</Button>
                    <Button variant="danger" onClick={() => { const reason = prompt("Reason:"); if(reason) handleVerifyPayment(p, "rejected", reason); }} className="flex-1 py-2 text-xs">Reject</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* REGISTER TAB */}
          {activeTab === "register" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#3B82F6] flex items-center gap-2"><FileSpreadsheet size={20}/> Register</h3>
                <Button variant="ghost" onClick={exportToCSV} className="px-3 py-1.5 text-xs"><Download size={14}/> CSV</Button>
              </div>
              
              <div className="flex flex-col gap-2 mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder="Search..." value={financeSearch} onChange={e => setFinanceSearch(e.target.value)} className="w-full p-2 pl-9 rounded-lg bg-black/30 border border-white/10 text-white outline-none text-sm" />
                </div>
                <div className="flex gap-2">
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 flex-1 rounded-lg bg-black/30 border border-white/10 text-white outline-none text-sm">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="p-2 flex-1 rounded-lg bg-black/30 border border-white/10 text-white outline-none text-sm">
                    <option value="all">All Types</option>
                    <option value="Shares">Shares</option>
                    <option value="Project Funding">Projects</option>
                    <option value="Contributions">Contributions</option>
                    <option value="Loan Repayment">Loan Repay</option>
                  </select>
                </div>
              </div>

              {filteredPayments.map(p => (
                <Card key={p.id} className={`mb-3 border-l-4 ${p.transaction_type === 'income' ? 'border-l-[#10B981]' : 'border-l-[#EF4444]'}`}>
                  <div className="flex justify-between mb-2">
                    <strong className="text-white">{p.profiles?.full_name || "System Expense"}</strong>
                    <span className={`font-bold ${p.transaction_type === 'income' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{p.transaction_type === 'income' ? "+" : "-"} KES {p.amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2">
                    <div className="flex gap-2 items-center"><Badge status={p.status} /> <span>{p.category}</span></div>
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* LOANS TAB */}
          {activeTab === "loans" && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#9333EA] flex items-center gap-2"><HandCoins size={20}/> Loan Approvals</h3>
              {allLoans.length === 0 ? <p className="text-gray-400">No pending loans.</p> : allLoans.map(l => (
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

          {/* EXPENSES TAB */}
          {activeTab === "expenses" && (
            <Card>
              <h3 className="mb-4 text-[#EF4444] font-bold flex items-center gap-2"><TrendingDown size={20}/> Log Expense</h3>
              <form onSubmit={handleLogExpense} className="flex flex-col gap-3">
                <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none">
                  <option value="Operating Expenses">Operating Expenses</option>
                  <option value="Loan Disbursement">Loan Disbursement</option>
                  <option value="Project Funding">Project Funding</option>
                </select>
                <input type="number" placeholder="Amount (KES)" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none" />
                <input type="text" placeholder="Notes / Payee" required value={newExpense.notes} onChange={e => setNewExpense({...newExpense, notes: e.target.value})} className="p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none" />
                <Button variant="danger" type="submit" className="w-full mt-2">Log Expense</Button>
              </form>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
