"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Home, ArrowRightLeft, Briefcase, User, Wallet, TrendingUp, FileText, ShieldCheck, CheckCircle2, XCircle, Clock, Settings, Download, MessageCircle, MapPin, Phone, Save, X } from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "rgba(30, 41, 59, 0.7)", border: "rgba(255, 255, 255, 0.1)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", gradient: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", purple: "#9333EA" },
  purple: { bg: "#0F0A1A", card: "rgba(45, 27, 78, 0.6)", border: "rgba(217, 70, 239, 0.2)", accent: "#D946EF", text: "#F8FAFC", textMuted: "#C4B5FD", gradient: "linear-gradient(135deg, #D946EF 0%, #A21CAF 100%)", purple: "#D946EF" },
  emerald: { bg: "#021A14", card: "rgba(6, 78, 59, 0.5)", border: "rgba(16, 185, 129, 0.2)", accent: "#10B981", text: "#F8FAFC", textMuted: "#6EE7B7", gradient: "linear-gradient(135deg, #10B981 0%, #047857 100%)", purple: "#10B981" },
};

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [savings, setSavings] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Notification State
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Navigation & Settings State
  const [activeTab, setActiveTab] = useState("home");
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("navy");
  const theme = THEMES[themeName];

  // Form State
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "" });
  const [updateForm, setUpdateForm] = useState({ phone: "", county: "", sub_county: "" });
  const [updateMsg, setUpdateMsg] = useState("");

  const router = useRouter();

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) {
      setProfile(profileData);
      setUpdateForm({ phone: profileData.phone || "", county: profileData.county || "", sub_county: profileData.sub_county || "" });
    }

    const { data: paymentsData } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (paymentsData) setPayments(paymentsData);

    const { data: savingsData } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
    if (savingsData) setSavings(savingsData.total_savings);

    const { data: sharesData } = await supabase.from("shares").select("total_shares").eq("user_id", user.id).single();
    if (sharesData) setShares(sharesData.total_shares);

    const { data: loansData } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (loansData) setLoans(loansData);

    // Fetch Announcements & Check for New Ones
    const { data: announcementsData } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(5);
    if (announcementsData && announcementsData.length > 0) {
      setAnnouncements(announcementsData);
      
      const latestAnnouncementDate = new Date(announcementsData[0].created_at);
      const lastReadDate = profileData?.last_read_announcement_at ? new Date(profileData.last_read_announcement_at) : new Date(0);
      
      if (latestAnnouncementDate > lastReadDate) {
        setHasNewMessages(true);
      }
    }

    if (profileData && profileData.role !== 'member') {
      const { data: pendingP } = await supabase.from("payments").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingP) setAllPayments(pendingP);
      const { data: pendingL } = await supabase.from("loans").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingL) setAllLoans(pendingL);
    }

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    setHasNewMessages(false);
    // Mark as read in database
    await supabase.from("profiles").update({ last_read_announcement_at: new Date().toISOString() }).eq("id", profile.id);
  };

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loanRequest.amount);
    if (amount > savings * 3) {
      alert("Error: You can only borrow up to 3x your total savings.");
      return;
    }
    await supabase.from("loans").insert({ user_id: profile.id, amount, purpose: loanRequest.purpose });
    alert("Loan application submitted!");
    setLoanRequest({ amount: "", purpose: "" });
    fetchDashboardData();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg("Saving...");
    const { error } = await supabase.from("profiles").update(updateForm).eq("id", profile.id);
    if (error) setUpdateMsg(`Error: ${error.message}`);
    else {
      setUpdateMsg("Profile updated successfully!");
      setProfile({ ...profile, ...updateForm });
    }
    setTimeout(() => setUpdateMsg(""), 3000);
  };

  const downloadStatement = () => {
    let text = `ALPHA YOUTH GROUP\n\nMember: ${profile.full_name}\nCode: ${profile.member_code || 'PENDING'}\nCounty: ${profile.county}\n\n--- FINANCIALS ---\nSavings: KES ${savings}\nShares: ${shares}\nLoan Limit: KES ${savings * 3}\n\n--- PAYMENTS ---\n`;
    payments.forEach(p => text += `${p.payment_date} | ${p.mpesa_code} | KES ${p.amount} | ${p.status.toUpperCase()}\n`);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Statement_${profile.full_name}.txt`; a.click();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  const isLeader = profile.role !== 'member';
  const loanLimit = savings * 3;
  const glassCard = { backgroundColor: theme.card, backdropFilter: "blur(16px)", padding: "20px", borderRadius: "20px", border: `1px solid ${theme.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" };
  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", marginBottom: "12px", outline: "none" };

  // ==========================================
  // MEMBER DASHBOARD UI
  // ==========================================
  if (!isLeader) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px", transition: "background-color 0.3s" }}>
        
        {/* NOTIFICATIONS MODAL */}
        {showNotifications && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <div style={{ ...glassCard, maxWidth: "400px", width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>Notifications</h2>
                <button onClick={() => setShowNotifications(false)} style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={24} /></button>
              </div>
              {announcements.length === 0 ? (
                <p style={{ color: theme.textMuted, textAlign: "center" }}>No new messages.</p>
              ) : (
                announcements.map(a => (
                  <div key={a.id} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", marginBottom: "12px", borderLeft: `3px solid ${theme.accent}` }}>
                    <p style={{ fontWeight: "bold", color: theme.text, fontSize: "14px" }}>{a.title}</p>
                    <p style={{ color: theme.textMuted, fontSize: "12px", marginTop: "4px" }}>{a.content}</p>
                    <p style={{ color: theme.accent, fontSize: "10px", marginTop: "8px" }}>{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* HEADER */}
        <header style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: theme.gradient, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "900" }}>A</div>
             <div>
               <h1 style={{ fontSize: "16px", fontWeight: "800", color: theme.accent }}>ALPHA YOUTH GROUP</h1>
               <p style={{ fontSize: "10px", color: theme.textMuted, fontStyle: "italic" }}>— Together We Rise and Shine! —</p>
             </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            
            {/* BELL ICON WITH RED DOT BADGE */}
            <div onClick={handleOpenNotifications} style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={24} color={theme.text} />
              {hasNewMessages && (
                <div style={{ position: "absolute", top: -2, right: -2, width: "10px", height: "10px", backgroundColor: "#EF4444", borderRadius: "50%", border: `2px solid ${theme.bg}` }}></div>
              )}
            </div>

            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>
              {profile.full_name.charAt(0)}
            </div>
          </div>
        </header>

        <main style={{ padding: "20px" }}>
          
          {/* ================= HOME TAB ================= */}
          {activeTab === "home" && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <p style={{ color: theme.textMuted, fontSize: "14px" }}>Welcome back,</p>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme.accent }}>{profile.full_name.split(' ')[0]}</h2>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: theme.purple, padding: "6px 12px", borderRadius: "20px", marginTop: "8px", border: `1px solid ${theme.accent}` }}>
                  <ShieldCheck size={14} color={theme.accent} />
                  <span style={{ fontSize: "12px", fontWeight: "bold" }}>{profile.membership_status.toUpperCase()}</span>
                </div>
              </div>

              {/* CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div style={glassCard}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(16, 185, 129, 0.2)", borderRadius: "10px" }}><Wallet size={20} color="#10B981" /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>Total Savings</p></div><h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.accent }}>KES {savings}</h3></div>
                <div style={glassCard}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(147, 51, 234, 0.2)", borderRadius: "10px" }}><TrendingUp size={20} color={theme.purple} /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>My Shares</p></div><h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>{shares}</h3></div>
                <div style={glassCard}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(59, 130, 246, 0.2)", borderRadius: "10px" }}><Briefcase size={20} color="#3B82F6" /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>Loan Limit</p></div><h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>KES {loanLimit}</h3></div>
                <div style={glassCard}><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "8px", backgroundColor: "rgba(239, 68, 68, 0.2)", borderRadius: "10px" }}><ArrowRightLeft size={20} color="#EF4444" /></div><p style={{ fontSize: "12px", color: theme.textMuted }}>Transactions</p></div><h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>{payments.length}</h3></div>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Quick Actions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <Link href="/dashboard/payment" style={{ textDecoration: "none" }}><div style={{ ...glassCard, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", gap: "8px", cursor: "pointer" }}><Wallet size={24} color={theme.accent} /><span style={{ fontSize: "11px", fontWeight: "600", textAlign: "center" }}>Add Savings</span></div></Link>
                <div onClick={() => setActiveTab("loans")} style={{ ...glassCard, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", gap: "8px", cursor: "pointer" }}><Briefcase size={24} color={theme.purple} /><span style={{ fontSize: "11px", fontWeight: "600", textAlign: "center" }}>View Loans</span></div>
                <div onClick={() => setActiveTab("activity")} style={{ ...glassCard, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", gap: "8px", cursor: "pointer" }}><FileText size={24} color="#3B82F6" /><span style={{ fontSize: "11px", fontWeight: "600", textAlign: "center" }}>Activity</span></div>
              </div>
            </div>
          )}

          {/* ================= SAVINGS TAB ================= */}
          {activeTab === "savings" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>My Savings & Shares</h2>
              <div style={{ ...glassCard, marginBottom: "24px", textAlign: "center", padding: "40px 20px" }}>
                <Wallet size={48} color={theme.accent} style={{ margin: "0 auto 16px auto" }} />
                <p style={{ color: theme.textMuted, fontSize: "14px", marginBottom: "8px" }}>Total Savings Balance</p>
                <h3 style={{ fontSize: "36px", fontWeight: "900", color: theme.accent }}>KES {savings}</h3>
                <Link href="/dashboard/payment" style={{ textDecoration: "none", display: "inline-block", marginTop: "20px", padding: "12px 24px", background: theme.gradient, color: "#000", borderRadius: "8px", fontWeight: "bold" }}>
                  Add Savings via M-Pesa
                </Link>
              </div>

              <div style={{ ...glassCard }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ padding: "10px", backgroundColor: "rgba(147, 51, 234, 0.2)", borderRadius: "10px" }}><TrendingUp size={24} color={theme.purple} /></div>
                    <div>
                      <p style={{ fontWeight: "bold", fontSize: "16px" }}>My Shares</p>
                      <p style={{ color: theme.textMuted, fontSize: "12px" }}>Accumulated shares</p>
                    </div>
                  </div>
                  <h3 style={{ fontSize: "24px", fontWeight: "800" }}>{shares}</h3>
                </div>
              </div>
            </div>
          )}

          {/* ================= ACTIVITY TAB ================= */}
          {activeTab === "activity" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "800" }}>My Activity</h2>
                <button onClick={downloadStatement} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.1)", color: theme.text, padding: "8px 12px", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                  <Download size={14} /> Statement
                </button>
              </div>
              <div style={{ ...glassCard }}>
                {payments.length === 0 ? (
                  <p style={{ color: theme.textMuted, textAlign: "center" }}>No activity found.</p>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px", marginBottom: "12px" }}>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: "14px", fontWeight: "bold" }}>{p.mpesa_code}</p>
                        <p style={{ fontSize: "12px", color: theme.textMuted }}>{p.payment_date}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "14px", fontWeight: "bold", color: "#10B981" }}>+ KES {p.amount}</p>
                        <p style={{ fontSize: "12px", color: p.status === 'verified' ? '#10B981' : '#FBBF24', fontWeight: "bold" }}>{p.status.toUpperCase()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= LOANS TAB ================= */}
          {activeTab === "loans" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>My Loans</h2>
              
              <div style={{ ...glassCard, marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Apply for a Loan</h3>
                <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "12px" }}>Max Limit: KES {loanLimit}</p>
                <form onSubmit={handleApplyLoan}>
                  <input type="number" placeholder="Amount (KES)" required value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})} style={inputStyle} />
                  <input type="text" placeholder="Purpose of Loan" required value={loanRequest.purpose} onChange={e => setLoanRequest({...loanRequest, purpose: e.target.value})} style={inputStyle} />
                  <button type="submit" style={{ width: "100%", padding: "12px", background: theme.gradient, color: "#000", borderRadius: "8px", border: "none", fontWeight: "800" }}>SUBMIT APPLICATION</button>
                </form>
              </div>

              <div style={{ ...glassCard }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Loan History</h3>
                {loans.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "14px" }}>No loan applications found.</p> : (
                  loans.map(l => (
                    <div key={l.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                      <div>
                        <p style={{ fontWeight: "bold" }}>KES {l.amount}</p>
                        <p style={{ color: theme.textMuted, fontSize: "12px" }}>{l.purpose}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {l.status === 'approved' && <CheckCircle2 size={16} color="#10B981" />}
                        {l.status === 'rejected' && <XCircle size={16} color="#EF4444" />}
                        {l.status === 'pending' && <Clock size={16} color="#FBBF24" />}
                        <span style={{ fontWeight: "bold", color: l.status === 'approved' ? '#10B981' : l.status === 'rejected' ? '#EF4444' : '#FBBF24', fontSize: "12px" }}>{l.status.toUpperCase()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= PROFILE TAB ================= */}
          {activeTab === "profile" && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>My Profile & Settings</h2>
              
              <div style={{ ...glassCard, marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>
                    {profile.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{profile.full_name}</h3>
                    <p style={{ fontSize: "12px", color: theme.accent }}>Code: {profile.member_code || "PENDING"}</p>
                  </div>
                </div>
                
                <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                    <span style={{ color: theme.textMuted, fontSize: "14px" }}>Membership Status</span>
                    <span style={{ fontWeight: "bold", fontSize: "14px", color: profile.membership_status === 'active' ? '#10B981' : '#FBBF24' }}>{profile.membership_status.toUpperCase()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                    <span style={{ color: theme.textMuted, fontSize: "14px" }}>Email Address</span>
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>{profile.email}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                    <span style={{ color: theme.textMuted, fontSize: "14px" }}>ID Number</span>
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>{profile.id_number}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", borderTop: `1px solid ${theme.border}`, paddingTop: "16px" }}>Update Location Details</h3>
                {updateMsg && <p style={{ color: updateMsg.includes("Error") ? "#EF4444" : "#10B981", fontSize: "12px", marginBottom: "12px" }}>{updateMsg}</p>}
                <form onSubmit={handleUpdateProfile}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><Phone size={16} color={theme.textMuted} /><label style={{ fontSize: "12px", color: theme.textMuted }}>Phone Number</label></div>
                  <input type="tel" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} style={inputStyle} />
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><MapPin size={16} color={theme.textMuted} /><label style={{ fontSize: "12px", color: theme.textMuted }}>County</label></div>
                  <input type="text" value={updateForm.county} onChange={e => setUpdateForm({...updateForm, county: e.target.value})} style={inputStyle} />
                  
                  <label style={{ fontSize: "12px", color: theme.textMuted, display: "block", marginBottom: "8px" }}>Sub-county</label>
                  <input type="text" value={updateForm.sub_county} onChange={e => setUpdateForm({...updateForm, sub_county: e.target.value})} style={inputStyle} />
                  
                  <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px", backgroundColor: "transparent", border: `1px solid ${theme.accent}`, color: theme.accent, borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                    <Save size={16} /> SAVE CHANGES
                  </button>
                </form>
              </div>

              <div style={{ ...glassCard, marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Settings size={18} /> App Settings (Theme)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <button onClick={() => setThemeName("navy")} style={{ padding: "16px 8px", borderRadius: "8px", backgroundColor: "#0B1120", color: "white", border: themeName === 'navy' ? `2px solid #FBBF24` : `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Navy</button>
                  <button onClick={() => setThemeName("purple")} style={{ padding: "16px 8px", borderRadius: "8px", backgroundColor: "#0F0A1A", color: "white", border: themeName === 'purple' ? `2px solid #D946EF` : `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Purple</button>
                  <button onClick={() => setThemeName("emerald")} style={{ padding: "16px 8px", borderRadius: "8px", backgroundColor: "#021A14", color: "white", border: themeName === 'emerald' ? `2px solid #10B981` : `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Emerald</button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a href="mailto:support@alphayouthgroup.com" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", border: `1px solid #3B82F6`, borderRadius: "12px", fontWeight: "bold" }}>
                  <MessageCircle size={18} /> CONTACT ALPHA YOUTH GROUP
                </a>
                <button onClick={handleLogout} style={{ width: "100%", padding: "14px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>
                  LOGOUT
                </button>
              </div>
            </div>
          )}

        </main>

        {/* BOTTOM NAVIGATION */}
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(20px)", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
          <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted, cursor: "pointer" }}>
            <Home size={20} />
            <span style={{ fontSize: "10px", fontWeight: "600" }}>Home</span>
          </div>
          <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted, cursor: "pointer" }}>
            <Wallet size={20} />
            <span style={{ fontSize: "10px", fontWeight: "600" }}>Savings</span>
          </div>
          <div onClick={() => setActiveTab("activity")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "activity" ? theme.accent : theme.textMuted, cursor: "pointer" }}>
            <ArrowRightLeft size={20} />
            <span style={{ fontSize: "10px", fontWeight: "600" }}>Activity</span>
          </div>
          <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "loans" ? theme.accent : theme.textMuted, cursor: "pointer" }}>
            <Briefcase size={20} />
            <span style={{ fontSize: "10px", fontWeight: "600" }}>Loans</span>
          </div>
          <div onClick={() => setActiveTab("profile")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "profile" ? theme.accent : theme.textMuted, cursor: "pointer" }}>
            <User size={20} />
            <span style={{ fontSize: "10px", fontWeight: "600" }}>Profile</span>
          </div>
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
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "800", color: theme.accent }}>EXECUTIVE PORTAL</h1>
            <p style={{ color: theme.textMuted }}>Role: {profile.role.replace('_', ' ').toUpperCase()}</p>
          </div>
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
                   alert(`Verified! Code: ${code}`);
                   fetchDashboardData();
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
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
