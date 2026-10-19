"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Home, ArrowRightLeft, Briefcase, User, Wallet, TrendingUp, FileText, ShieldCheck, CheckCircle2, XCircle, Clock, Settings, Download, MessageCircle, MapPin, Phone, Save, X, Calendar, Megaphone, Share2, Calculator, Menu, Users, BookOpen, Folder, HelpCircle, Target, Receipt, ArrowUpRight, ArrowDownLeft, PieChart, Check } from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "rgba(30, 41, 59, 0.7)", border: "rgba(255, 255, 255, 0.1)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", gradient: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", purple: "#9333EA" }
};

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [savings, setSavings] = useState<number>(0);
  const [savingsGoal, setSavingsGoal] = useState<number>(0);
  const [savingsHistory, setSavingsHistory] = useState<any[]>([]);
  const [shares, setShares] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation & Settings State
  const [activeTab, setActiveTab] = useState("home");
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("navy");
  const theme = THEMES[themeName];

  // Form States
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "", period: "1" });
  const [loanCalc, setLoanCalc] = useState({ amount: "", period: "1", interest: "10" });
  const [loanCalcResult, setLoanCalcResult] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({ phone: "", county: "", sub_county: "" });
  const [updateMsg, setUpdateMsg] = useState("");
  const [goalInput, setGoalInput] = useState({ name: "New Goal", amount: "" });

  const router = useRouter();

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) {
      setProfile(profileData);
      setUpdateForm({ phone: profileData.phone || "", county: profileData.county || "", sub_county: profileData.sub_county || "" });
    }

    const { data: p } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (p) setPayments(p);

    const { data: s } = await supabase.from("savings").select("total_savings, goal_amount").eq("user_id", user.id).single();
    if (s) { setSavings(s.total_savings); setSavingsGoal(s.goal_amount || 0); }

    const { data: sh } = await supabase.from("shares").select("total_shares").eq("user_id", user.id).single();
    if (sh) setShares(sh.total_shares);

    const { data: l } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (l) setLoans(l);

    const { data: shist } = await supabase.from("savings_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (shist) setSavingsHistory(shist);

    const { data: notif } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (notif) setNotifications(notif);

    if (profileData && profileData.role !== 'member') {
      const { data: pendingP } = await supabase.from("payments").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingP) setAllPayments(pendingP);
      const { data: pendingL } = await supabase.from("loans").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingL) setAllLoans(pendingL);
    }

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loanRequest.amount);
    if (amount > savings * 3) return alert("Error: You can only borrow up to 3x your total savings.");
    await supabase.from("loans").insert({ user_id: profile.id, amount, purpose: loanRequest.purpose, repayment_period_months: parseInt(loanRequest.period), status: "pending" });
    alert("Loan application submitted!");
    setLoanRequest({ amount: "", purpose: "", period: "1" });
    fetchDashboardData();
  };

  const calculateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(loanCalc.amount);
    const t = parseInt(loanCalc.period);
    const r = parseFloat(loanCalc.interest) / 100;
    if (!p || !t) return;
    
    // Simple interest calculation for estimate
    const interestAmt = p * r * (t / 12);
    const total = p + interestAmt;
    const monthly = total / t;
    
    setLoanCalcResult({ interest: Math.round(interestAmt), total: Math.round(total), monthly: Math.round(monthly) });
  };

  const updateGoal = async () => {
    await supabase.from("savings").update({ goal_amount: parseFloat(goalInput.amount), goal_name: goalInput.name }).eq("user_id", profile.id);
    setSavingsGoal(parseFloat(goalInput.amount));
    alert("Goal updated!");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setUpdateMsg("Saving...");
    await supabase.from("profiles").update(updateForm).eq("id", profile.id);
    setUpdateMsg("Profile updated!"); setTimeout(() => setUpdateMsg(""), 3000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  const isLeader = profile.role !== 'member';
  const loanLimit = savings * 3;
  const glassCard = { backgroundColor: theme.card, backdropFilter: "blur(16px)", padding: "20px", borderRadius: "20px", border: `1px solid ${theme.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", marginBottom: "16px" };
  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", marginBottom: "12px", outline: "none" };

  // ==========================================
  // MEMBER DASHBOARD UI
  // ==========================================
  if (!isLeader) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px" }}>
        
        <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: theme.gradient, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "900" }}>A</div>
             <div><h1 style={{ fontSize: "16px", fontWeight: "800", color: theme.accent }}>ALPHA YOUTH GROUP</h1><p style={{ fontSize: "10px", color: theme.textMuted, fontStyle: "italic" }}>— Together We Rise and Shine! —</p></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Bell size={24} color={theme.text} />
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>{profile.full_name.charAt(0)}</div>
          </div>
        </header>

        <main style={{ padding: "20px" }}>
          
          {/* ================= HOME TAB ================= */}
          {activeTab === "home" && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <p style={{ color: theme.textMuted, fontSize: "14px" }}>Welcome back,</p>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme.accent }}>{profile.full_name.split(' ')[0]}</h2>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: theme.purple, padding: "6px 12px", borderRadius: "20px", marginTop: "8px", border: `1px solid ${theme.accent}` }}><ShieldCheck size={14} color={theme.accent} /><span style={{ fontSize: "12px", fontWeight: "bold" }}>{profile.membership_status.toUpperCase()}</span></div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div style={{ ...glassCard, marginBottom: 0 }} onClick={() => setActiveTab("savings")}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(16, 185, 129, 0.2)", borderRadius: "10px" }}><Wallet size={20} color="#10B981" /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>Total Savings</p></div><h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.accent }}>KES {savings}</h3></div>
                <div style={{ ...glassCard, marginBottom: 0 }} onClick={() => setActiveTab("shares")}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(147, 51, 234, 0.2)", borderRadius: "10px" }}><TrendingUp size={20} color={theme.purple} /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>My Shares</p></div><h3 style={{ fontSize: "18px", fontWeight: "800" }}>{shares}</h3></div>
                <div style={{ ...glassCard, marginBottom: 0 }} onClick={() => setActiveTab("loans")}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(59, 130, 246, 0.2)", borderRadius: "10px" }}><Briefcase size={20} color="#3B82F6" /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>Active Loans</p></div><h3 style={{ fontSize: "18px", fontWeight: "800" }}>{loans.filter(l => l.status === 'approved').length}</h3></div>
                <div style={{ ...glassCard, marginBottom: 0 }} onClick={() => setActiveTab("more")}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(239, 68, 68, 0.2)", borderRadius: "10px" }}><Clock size={20} color="#EF4444" /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>Notifications</p></div><h3 style={{ fontSize: "18px", fontWeight: "800" }}>{notifications.filter(n => !n.is_read).length}</h3></div>
              </div>

              {/* Latest Notification */}
              {notifications.length > 0 && (
                <div style={{ ...glassCard, borderLeft: `4px solid ${theme.accent}` }}>
                   <p style={{ fontSize: "12px", fontWeight: "bold", color: theme.accent }}>LATEST UPDATE</p>
                   <p style={{ fontSize: "14px", fontWeight: "bold", marginTop: "4px" }}>{notifications[0].title}</p>
                   <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{notifications[0].message}</p>
                </div>
              )}
            </div>
          )}

          {/* ================= SAVINGS TAB ================= */}
          {activeTab === "savings" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Savings Account</h2>
              <div style={{ ...glassCard, textAlign: "center", padding: "32px 20px" }}>
                <Wallet size={40} color={theme.accent} style={{ margin: "0 auto 12px auto" }} />
                <p style={{ color: theme.textMuted, fontSize: "14px" }}>Verified Balance</p>
                <h3 style={{ fontSize: "36px", fontWeight: "900", color: theme.accent }}>KES {savings}</h3>
                
                {/* GOAL PROGRESS */}
                <div style={{ marginTop: "24px", backgroundColor: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "12px", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <p style={{ fontSize: "12px", color: theme.textMuted }}>Target Goal: KES {savingsGoal}</p>
                    <p style={{ fontSize: "12px", fontWeight: "bold", color: theme.accent }}>{savingsGoal > 0 ? `${Math.round((savings / savingsGoal) * 100)}%` : '0%'}</p>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: theme.border, borderRadius: "4px", overflow: "hidden" }}><div style={{ width: savingsGoal > 0 ? `${Math.min((savings / savingsGoal) * 100, 100)}%` : '0%', height: "100%", background: theme.gradient }}></div></div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <input type="number" placeholder="Set Goal (KES)" value={goalInput.amount} onChange={e => setGoalInput({...goalInput, amount: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
                    <button onClick={updateGoal} style={{ padding: "12px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", border: "none", fontWeight: "bold" }}>Set</button>
                  </div>
                </div>
              </div>

              {/* SAVINGS LEDGER */}
              <div style={{ ...glassCard }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Contribution Ledger</h3>
                {savingsHistory.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "14px" }}>No contributions found.</p> : savingsHistory.map(h => (
                  <div key={h.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                    <div><p style={{ fontWeight: "bold", fontSize: "14px" }}>KES {h.amount}</p><p style={{ fontSize: "10px", color: theme.textMuted }}>{new Date(h.created_at).toLocaleDateString()}</p></div>
                    <span style={{ fontSize: "10px", color: h.status === 'verified' ? '#10B981' : '#FBBF24', fontWeight: "bold" }}>{h.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= LOANS TAB ================= */}
          {activeTab === "loans" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Loans Center</h2>
              
              {/* ELIGIBILITY CARD */}
              <div style={{ ...glassCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "12px", color: theme.textMuted }}>Your Eligibility Limit</p>
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#10B981" }}>KES {loanLimit}</h3>
                  <p style={{ fontSize: "10px", color: theme.textMuted, marginTop: "4px" }}>Based on 3x verified savings</p>
                </div>
                <PieChart size={40} color="#10B981" />
              </div>

              {/* LOAN CALCULATOR */}
              <div style={{ ...glassCard }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Calculator size={18} /> Loan Calculator</h3>
                <form onSubmit={calculateLoan} style={{ display: "grid", gap: "8px" }}>
                  <input type="number" placeholder="Amount (KES)" value={loanCalc.amount} onChange={e => setLoanCalc({...loanCalc, amount: e.target.value})} style={inputStyle} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select value={loanCalc.period} onChange={e => setLoanCalc({...loanCalc, period: e.target.value})} style={inputStyle}><option value="1">1 Month</option><option value="3">3 Months</option><option value="6">6 Months</option><option value="12">12 Months</option></select>
                    <input type="number" placeholder="Interest %" value={loanCalc.interest} onChange={e => setLoanCalc({...loanCalc, interest: e.target.value})} style={inputStyle} />
                  </div>
                  <button type="submit" style={{ padding: "12px", backgroundColor: theme.purple, color: "#fff", borderRadius: "8px", border: "none", fontWeight: "bold" }}>Calculate</button>
                </form>
                {loanCalcResult && (
                  <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontSize: "12px", color: theme.textMuted }}>Monthly Installment:</span><span style={{ fontSize: "14px", fontWeight: "bold", color: theme.accent }}>KES {loanCalcResult.monthly}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "12px", color: theme.textMuted }}>Total Repayment:</span><span style={{ fontSize: "14px", fontWeight: "bold" }}>KES {loanCalcResult.total}</span></div>
                  </div>
                )}
              </div>

              {/* APPLY FOR LOAN */}
              <div style={{ ...glassCard }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Apply for Loan</h3>
                <form onSubmit={handleApplyLoan}>
                  <input type="number" placeholder="Amount (KES)" required value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})} style={inputStyle} />
                  <input type="text" placeholder="Purpose" required value={loanRequest.purpose} onChange={e => setLoanRequest({...loanRequest, purpose: e.target.value})} style={inputStyle} />
                  <select value={loanRequest.period} onChange={e => setLoanRequest({...loanRequest, period: e.target.value})} style={inputStyle}><option value="1">1 Month</option><option value="3">3 Months</option><option value="6">6 Months</option></select>
                  <button type="submit" style={{ width: "100%", padding: "12px", background: theme.gradient, color: "#000", borderRadius: "8px", border: "none", fontWeight: "800" }}>SUBMIT APPLICATION</button>
                </form>
              </div>

              {/* LOAN TRACKER */}
              <div style={{ ...glassCard }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>My Loan Applications</h3>
                {loans.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "14px" }}>No applications found.</p> : loans.map(l => (
                  <div key={l.id} style={{ borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <p style={{ fontWeight: "bold", fontSize: "14px" }}>KES {l.amount}</p>
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: l.status === 'approved' ? '#10B981' : l.status === 'rejected' ? '#EF4444' : '#FBBF24' }}>{l.status.toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: theme.textMuted }}>{l.purpose} | {l.repayment_period_months} Months</p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ================= MORE MENU ================= */}
          {activeTab === "more" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>More Services</h2>
              
              <div style={{ ...glassCard, borderLeft: `4px solid ${theme.accent}` }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: theme.accent }}>NOTIFICATIONS</h3>
                {notifications.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "12px" }}>No notifications.</p> : notifications.slice(0,3).map(n => (
                  <div key={n.id} style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px", marginBottom: "8px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "bold" }}>{n.title}</p>
                    <p style={{ fontSize: "10px", color: theme.textMuted }}>{n.message}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div onClick={() => setActiveTab("shares")} style={{ ...glassCard, cursor: "pointer", textAlign: "center", marginBottom: 0 }}><TrendingUp size={24} color={theme.purple} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Shares</p></div>
                <div onClick={() => setActiveTab("profile")} style={{ ...glassCard, cursor: "pointer", textAlign: "center", marginBottom: 0 }}><User size={24} color={theme.accent} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Profile</p></div>
                <div style={{ ...glassCard, cursor: "pointer", textAlign: "center", marginBottom: 0, opacity: 0.5 }}><Calendar size={24} color="#3B82F6" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Events</p></div>
                <div style={{ ...glassCard, cursor: "pointer", textAlign: "center", marginBottom: 0, opacity: 0.5 }}><BookOpen size={24} color="#F59E0B" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Learning</p></div>
                <div style={{ ...glassCard, cursor: "pointer", textAlign: "center", marginBottom: 0, opacity: 0.5 }}><Receipt size={24} color="#10B981" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Statements</p></div>
                <div style={{ ...glassCard, cursor: "pointer", textAlign: "center", marginBottom: 0, opacity: 0.5 }}><HelpCircle size={24} color="#EF4444" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Support</p></div>
              </div>
            </div>
          )}

          {/* ================= PROFILE TAB ================= */}
          {activeTab === "profile" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Profile</h2>
              <div style={{ ...glassCard }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>{profile.full_name.charAt(0)}</div>
                  <div><h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{profile.full_name}</h3><p style={{ fontSize: "12px", color: theme.accent }}>Code: {profile.member_code || "PENDING"}</p></div>
                </div>
                {updateMsg && <p style={{ color: "#10B981", fontSize: "12px", marginBottom: "12px" }}>{updateMsg}</p>}
                <form onSubmit={handleUpdateProfile}>
                  <input type="tel" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} style={inputStyle} placeholder="Phone" />
                  <input type="text" value={updateForm.county} onChange={e => setUpdateForm({...updateForm, county: e.target.value})} style={inputStyle} placeholder="County" />
                  <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "transparent", border: `1px solid ${theme.accent}`, color: theme.accent, borderRadius: "8px", fontWeight: "bold" }}>SAVE</button>
                </form>
              </div>
              <button onClick={handleLogout} style={{ width: "100%", padding: "14px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>LOGOUT</button>
            </div>
          )}

          {/* SHARES TAB PLACEHOLDER */}
          {activeTab === "shares" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>My Shares</h2>
              <div style={{ ...glassCard, textAlign: "center", padding: "40px 20px" }}>
                 <TrendingUp size={48} color={theme.purple} style={{ margin: "0 auto 16px auto" }} />
                 <h3 style={{ fontSize: "36px", fontWeight: "900" }}>{shares}</h3>
                 <p style={{ color: theme.textMuted }}>Total Shares Owned</p>
              </div>
            </div>
          )}

        </main>

        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(20px)", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
          <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted }}><Home size={20} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Home</span></div>
          <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted }}><Wallet size={20} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Savings</span></div>
          <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "loans" ? theme.accent : theme.textMuted }}><Briefcase size={20} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Loans</span></div>
          <div onClick={() => setActiveTab("more")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "more" ? theme.accent : theme.textMuted }}><Menu size={20} /><span style={{ fontSize: "10px", fontWeight: "600" }}>More</span></div>
        </nav>
      </div>
    );
  }

  // ==========================================
  // ADMIN / EXECUTIVE DASHBOARD
  // ==========================================
  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", minHeight: "100vh" }}>
      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "20px" }}>
          <div><h1 style={{ fontSize: "32px", fontWeight: "800", color: theme.accent }}>EXECUTIVE PORTAL</h1><p style={{ color: theme.textMuted }}>Role: {profile.role.replace('_', ' ').toUpperCase()}</p></div>
          <button onClick={handleLogout} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", fontWeight: "700", cursor: "pointer" }}>LOGOUT</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
           <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
             <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending Payments</h3>
             {allPayments.length === 0 ? <p style={{ color: theme.textMuted }}>No pending payments.</p> : allPayments.map(p => (
               <div key={p.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "8px 0" }}>
                 <span>{p.profiles?.full_name}</span>
                 <button onClick={async () => {
                   const code = `AYG-${Math.floor(1000 + Math.random() * 9000)}`;
                   await supabase.from("payments").update({ status: "verified" }).eq("id", p.id);
                   await supabase.from("profiles").update({ membership_status: "active", member_code: code }).eq("id", p.user_id);
                   alert(`Verified! Code: ${code}`); fetchDashboardData();
                 }} style={{ backgroundColor: "#10B981", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>VERIFY</button>
               </div>
             ))}
           </div>

           <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
             <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending Loans</h3>
             {allLoans.length === 0 ? <p style={{ color: theme.textMuted }}>No pending loans.</p> : allLoans.map(l => (
               <div key={l.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "8px 0" }}>
                 <span>{l.profiles?.full_name} - KES {l.amount}</span>
                 <div style={{ display: "flex", gap: "8px" }}>
                   <button onClick={async () => { await supabase.from("loans").update({ status: "approved" }).eq("id", l.id); fetchDashboardData(); }} style={{ backgroundColor: "#10B981", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>APPROVE</button>
                   <button onClick={async () => { await supabase.from("loans").update({ status: "rejected" }).eq("id", l.id); fetchDashboardData(); }} style={{ backgroundColor: "#EF4444", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>REJECT</button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
