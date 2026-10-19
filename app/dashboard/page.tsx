"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const THEMES = {
  navy: { bg: "#0B1120", card: "rgba(30, 41, 59, 0.7)", border: "rgba(255, 255, 255, 0.1)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", gradient: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)" },
  purple: { bg: "#0F0A1A", card: "rgba(45, 27, 78, 0.6)", border: "rgba(217, 70, 239, 0.2)", accent: "#D946EF", text: "#F8FAFC", textMuted: "#C4B5FD", gradient: "linear-gradient(135deg, #D946EF 0%, #A21CAF 100%)" },
  emerald: { bg: "#021A14", card: "rgba(6, 78, 59, 0.5)", border: "rgba(16, 185, 129, 0.2)", accent: "#10B981", text: "#F8FAFC", textMuted: "#6EE7B7", gradient: "linear-gradient(135deg, #10B981 0%, #047857 100%)" },
  sleek: { bg: "#000000", card: "rgba(20, 20, 20, 0.8)", border: "rgba(255, 255, 255, 0.1)", accent: "#EF4444", text: "#F8FAFC", textMuted: "#A1A1AA", gradient: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)" }
};

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [savings, setSavings] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState("overview");

  // Search & Admin State
  const [searchQuery, setSearchQuery] = useState("");
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "" });
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", location: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "" });
  
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("navy");
  const theme = THEMES[themeName];

  const router = useRouter();

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) setProfile(profileData);

    const { data: paymentsData } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (paymentsData) setPayments(paymentsData);

    const { data: savingsData } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
    if (savingsData) setSavings(savingsData.total_savings);

    const { data: sharesData } = await supabase.from("shares").select("total_shares").eq("user_id", user.id).single();
    if (sharesData) setShares(sharesData.total_shares);

    const { data: meetingsData } = await supabase.from("meetings").select("*").order("meeting_date", { ascending: true }).limit(5);
    if (meetingsData) setMeetings(meetingsData);

    const { data: announcementsData } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3);
    if (announcementsData) setAnnouncements(announcementsData);

    const { data: loansData } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (loansData) setLoans(loansData);

    if (profileData) {
      const { count } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("referred_by", profileData.id);
      setReferralCount(count || 0);
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

  // Admin Actions
  const handleVerifyPayment = async (id: string, uid: string) => {
    const code = `AYG-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from("payments").update({ status: "verified" }).eq("id", id);
    await supabase.from("profiles").update({ membership_status: "active", member_code: code }).eq("id", uid);
    alert(`Payment Verified! Member Code: ${code}`);
    fetchDashboardData();
  };

  const handleLoanAction = async (id: string, status: string) => {
    await supabase.from("loans").update({ status }).eq("id", id);
    alert(`Loan ${status} successfully.`);
    fetchDashboardData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("events").insert({ title: newEvent.title, event_date: newEvent.date, location: newEvent.location });
    alert("Event published!");
    setNewEvent({ title: "", date: "", location: "" });
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("meetings").insert({ title: newMeeting.title, meeting_date: newMeeting.date, location: newMeeting.location });
    alert("Meeting scheduled!");
    setNewMeeting({ title: "", date: "", location: "" });
    fetchDashboardData();
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("announcements").insert({ title: newAnnouncement.title, content: newAnnouncement.content });
    alert("Announcement posted!");
    setNewAnnouncement({ title: "", content: "" });
    fetchDashboardData();
  };

  // Member Actions
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

  const filteredPayments = payments.filter(p => p.mpesa_code.toLowerCase().includes(searchQuery.toLowerCase()));
  const glassCard = { backgroundColor: theme.card, backdropFilter: "blur(16px)", padding: "28px", borderRadius: "20px", border: `1px solid ${theme.border}`, boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)" };
  const statBox = { background: "rgba(0,0,0,0.2)", padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column" as const, gap: "12px", position: "relative" as const };
  const inputStyle = { width: "100%", padding: "14px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "12px", color: theme.text, marginBottom: "16px", outline: "none", fontSize: "15px" };
  const isLeader = profile.role !== 'member';
  const referralLink = `https://alpha-youth-group.vercel.app/register?ref=${profile.member_code || 'PENDING'}`;

  // CSS for responsive sidebar
  const css = `
    .dash-layout { display: flex; min-height: 100vh; }
    .sidebar { width: 260px; background-color: ${theme.card}; border-right: 1px solid ${theme.border}; padding: 24px; display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
    .main-content { flex: 1; padding: 40px; overflow-y: auto; }
    .nav-item { padding: 14px 16px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: 0.2s; color: ${theme.textMuted}; border: 1px solid transparent; background: transparent; text-align: left; font-size: 15px; }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: ${theme.text}; }
    .nav-item.active { background: rgba(255,255,255,0.1); color: ${theme.accent}; border: 1px solid ${theme.border}; }
    
    @media (max-width: 768px) {
      .dash-layout { flex-direction: column; }
      .sidebar { width: 100%; flex-direction: row; overflow-x: auto; padding: 16px; border-right: none; border-bottom: 1px solid ${theme.border}; align-items: center; }
      .sidebar-header { display: none !important; }
      .nav-item { white-space: nowrap; padding: 10px 16px; }
      .main-content { padding: 20px; }
    }
  `;

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", minHeight: "100vh" }}>
      <style>{css}</style>
      
      <div className="dash-layout">
        
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-header" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: theme.gradient, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "900" }}>A</div>
            <h1 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>ALPHA YOUTH</h1>
          </div>

          <div style={{ display: "flex", flexDirection: "row", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            <button onClick={() => setActiveTab("overview")} className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}>Overview</button>
            <button onClick={() => setActiveTab("transactions")} className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}>Transactions</button>
            <button onClick={() => setActiveTab("loans")} className={`nav-item ${activeTab === 'loans' ? 'active' : ''}`}>Loans</button>
            <button onClick={() => setActiveTab("referrals")} className={`nav-item ${activeTab === 'referrals' ? 'active' : ''}`}>Referrals</button>
            {isLeader && <button onClick={() => setActiveTab("admin")} className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}>Admin Console</button>}
            <button onClick={() => setActiveTab("settings")} className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>Settings</button>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: `1px solid ${theme.border}` }} className="sidebar-header">
            <p style={{ fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>{profile.full_name}</p>
            <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "16px" }}>Code: {profile.member_code || "PENDING"}</p>
            <button onClick={handleLogout} style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", fontWeight: "700", cursor: "pointer" }}>LOGOUT</button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "32px", fontWeight: "800" }}>Welcome, {profile.full_name.split(' ')[0]}</h2>
                  <p style={{ color: theme.textMuted, marginTop: "8px" }}>Role: <span style={{ color: theme.accent, fontWeight: "bold" }}>{profile.role.toUpperCase()}</span></p>
                </div>
                <button onClick={handleLogout} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", fontWeight: "700", cursor: "pointer" }}>LOGOUT</button>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                <div style={statBox}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#10B981" }}></div><p style={{ color: theme.textMuted }}>Total Savings</p><p style={{ fontSize: "28px", fontWeight: "800" }}>KES {savings}</p></div>
                <div style={statBox}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#3B82F6" }}></div><p style={{ color: theme.textMuted }}>My Shares</p><p style={{ fontSize: "28px", fontWeight: "800" }}>{shares}</p></div>
                <div style={statBox}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: theme.accent }}></div><p style={{ color: theme.textMuted }}>Loan Limit (3x)</p><p style={{ fontSize: "28px", fontWeight: "800", color: theme.accent }}>KES {savings * 3}</p></div>
              </div>

              {/* Announcements */}
              <div style={{ ...glassCard, marginBottom: "32px", borderLeft: `4px solid #F59E0B` }}>
                <h2 style={{ color: theme.text, fontSize: "20px", marginBottom: "16px" }}>Latest Announcements</h2>
                {announcements.length === 0 ? <p style={{ color: theme.textMuted }}>No announcements yet.</p> : (
                  <div style={{ display: "grid", gap: "16px" }}>
                    {announcements.map(a => (
                      <div key={a.id} style={{ padding: "16px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                        <p style={{ fontWeight: "700", color: theme.accent }}>{a.title}</p>
                        <p style={{ color: theme.textMuted, fontSize: "14px", marginTop: "4px" }}>{a.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Meetings */}
              <div style={{ ...glassCard }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Upcoming Meetings</h2>
                {meetings.length === 0 ? <p style={{ color: theme.textMuted }}>No meetings scheduled.</p> : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                    {meetings.map(m => (
                      <div key={m.id} style={{ padding: "20px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "12px", borderLeft: `4px solid ${theme.accent}` }}>
                        <p style={{ fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>{m.title}</p>
                        <p style={{ color: theme.textMuted, fontSize: "14px" }}>Date: {m.meeting_date}</p>
                        <p style={{ color: theme.textMuted, fontSize: "14px" }}>Location: {m.location}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "800" }}>Transactions</h2>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <input type="text" placeholder="Search M-Pesa Code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: "250px" }} />
                  <button onClick={downloadStatement} style={{ backgroundColor: "transparent", border: `1px solid ${theme.accent}`, color: theme.accent, padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>DOWNLOAD STATEMENT</button>
                </div>
              </div>

              <div style={glassCard}>
                {filteredPayments.length === 0 ? <p style={{ color: theme.textMuted }}>No transactions found.</p> : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", textAlign: "left", fontSize: "14px", borderCollapse: "collapse" }}>
                      <thead><tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}><th style={{ padding: "12px 8px" }}>Date</th><th>Code</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {filteredPayments.map(p => (
                          <tr key={p.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                            <td style={{ padding: "12px 8px" }}>{p.payment_date}</td>
                            <td style={{ fontFamily: "monospace", color: theme.accent }}>{p.mpesa_code}</td>
                            <td>KES {p.amount}</td>
                            <td><span style={{ color: p.status === 'verified' ? '#10B981' : '#FBBF24', fontWeight: "bold" }}>{p.status.toUpperCase()}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LOANS TAB */}
          {activeTab === "loans" && (
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "24px" }}>My Loans</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                
                <div style={glassCard}>
                  <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Apply for a Loan</h3>
                  <form onSubmit={handleApplyLoan}>
                    <input type="number" placeholder="Amount (KES)" required value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})} style={inputStyle} />
                    <input type="text" placeholder="Purpose of Loan" required value={loanRequest.purpose} onChange={e => setLoanRequest({...loanRequest, purpose: e.target.value})} style={inputStyle} />
                    <button type="submit" style={{ width: "100%", padding: "14px", background: theme.gradient, color: "#000", borderRadius: "8px", border: "none", fontWeight: "800" }}>SUBMIT APPLICATION</button>
                  </form>
                </div>

                <div style={glassCard}>
                  <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Loan History</h3>
                  {loans.length === 0 ? <p style={{ color: theme.textMuted }}>No loan history.</p> : (
                    loans.map(l => (
                      <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <div>
                          <p style={{ fontWeight: "bold" }}>KES {l.amount}</p>
                          <p style={{ color: theme.textMuted, fontSize: "12px" }}>{l.purpose}</p>
                        </div>
                        <span style={{ fontWeight: "bold", color: l.status === 'approved' ? '#10B981' : l.status === 'rejected' ? '#EF4444' : '#FBBF24' }}>{l.status.toUpperCase()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* REFERRALS TAB */}
          {activeTab === "referrals" && (
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "24px" }}>Refer a Friend</h2>
              <div style={glassCard}>
                <p style={{ color: theme.textMuted, marginBottom: "16px" }}>You have successfully referred <strong style={{ color: "#10B981" }}>{referralCount}</strong> member(s).</p>
                <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "8px", wordBreak: "break-all", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
                  <span style={{ fontSize: "14px", fontFamily: "monospace", color: theme.accent }}>{referralLink}</span>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(referralLink); alert("Copied!"); }} style={{ width: "100%", padding: "14px", background: theme.gradient, color: "#000", borderRadius: "8px", border: "none", fontWeight: "800" }}>COPY REFERRAL LINK</button>
              </div>
            </div>
          )}

          {/* ADMIN CONSOLE TAB */}
          {activeTab === "admin" && isLeader && (
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "24px", color: "#EF4444" }}>Admin Console ({profile.role.toUpperCase()})</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px", marginBottom: "24px" }}>
                
                {/* Payments */}
                <div style={glassCard}>
                  <h3 style={{ marginBottom: "16px" }}>Pending Payments</h3>
                  {allPayments.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "14px" }}>No pending payments.</p> : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", textAlign: "left", fontSize: "14px" }}>
                        <thead><tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}><th style={{ paddingBottom: "8px" }}>Member</th><th>Code</th><th>Action</th></tr></thead>
                        <tbody>
                          {allPayments.map(p => (
                            <tr key={p.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                              <td style={{ padding: "8px 0" }}>{p.profiles?.full_name}</td>
                              <td style={{ color: theme.accent, fontFamily: "monospace" }}>{p.mpesa_code}</td>
                              <td><button onClick={() => handleVerifyPayment(p.id, p.user_id)} style={{ backgroundColor: "#10B981", color: "white", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}>VERIFY</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Loans */}
                <div style={glassCard}>
                  <h3 style={{ marginBottom: "16px" }}>Pending Loans</h3>
                  {allLoans.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "14px" }}>No pending loans.</p> : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", textAlign: "left", fontSize: "14px" }}>
                        <thead><tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}><th style={{ paddingBottom: "8px" }}>Member</th><th>Amount</th><th>Action</th></tr></thead>
                        <tbody>
                          {allLoans.map(l => (
                            <tr key={l.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                              <td style={{ padding: "8px 0" }}>{l.profiles?.full_name}</td>
                              <td style={{ color: "#10B981", fontWeight: "bold" }}>KES {l.amount}</td>
                              <td style={{ display: "flex", gap: "8px", padding: "8px 0" }}>
                                <button onClick={() => handleLoanAction(l.id, "approved")} style={{ backgroundColor: "#10B981", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>APPROVE</button>
                                <button onClick={() => handleLoanAction(l.id, "rejected")} style={{ backgroundColor: "#EF4444", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>REJECT</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                {/* Announcement */}
                <div style={glassCard}>
                  <h3 style={{ marginBottom: "12px" }}>Post Announcement</h3>
                  <form onSubmit={handlePostAnnouncement}>
                    <input placeholder="Title" required value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} style={inputStyle} />
                    <textarea placeholder="Message" required value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} style={{ ...inputStyle, height: "80px" }} />
                    <button type="submit" style={{ background: theme.gradient, color: "#000", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer" }}>POST</button>
                  </form>
                </div>

                {/* Meeting */}
                <div style={glassCard}>
                  <h3 style={{ marginBottom: "12px" }}>Schedule Meeting</h3>
                  <form onSubmit={handleCreateMeeting}>
                    <input placeholder="Meeting Title" required value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} style={inputStyle} />
                    <input type="date" required value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} style={inputStyle} />
                    <input placeholder="Location" required value={newMeeting.location} onChange={e => setNewMeeting({...newMeeting, location: e.target.value})} style={inputStyle} />
                    <button type="submit" style={{ background: theme.gradient, color: "#000", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer" }}>SCHEDULE</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "24px" }}>Settings</h2>
              
              <div style={{ ...glassCard, marginBottom: "24px" }}>
                <h3 style={{ marginBottom: "16px" }}>Appearance Theme</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <button onClick={() => setThemeName("navy")} style={{ padding: "24px 16px", borderRadius: "12px", backgroundColor: "#0f172a", color: "white", border: themeName === 'navy' ? `2px solid #FBBF24` : "1px solid #334155", cursor: "pointer" }}>Navy</button>
                  <button onClick={() => setThemeName("purple")} style={{ padding: "24px 16px", borderRadius: "12px", backgroundColor: "#1a0b2e", color: "white", border: themeName === 'purple' ? `2px solid #D946EF` : "1px solid #334155", cursor: "pointer" }}>Purple</button>
                  <button onClick={() => setThemeName("emerald")} style={{ padding: "24px 16px", borderRadius: "12px", backgroundColor: "#064e3b", color: "white", border: themeName === 'emerald' ? `2px solid #10B981` : "1px solid #334155", cursor: "pointer" }}>Emerald</button>
                  <button onClick={() => setThemeName("sleek")} style={{ padding: "24px 16px", borderRadius: "12px", backgroundColor: "#111111", color: "white", border: themeName === 'sleek' ? `2px solid #EF4444` : "1px solid #334155", cursor: "pointer" }}>Sleek</button>
                </div>
              </div>

              <div style={glassCard}>
                <h3 style={{ marginBottom: "16px" }}>Profile Information</h3>
                <p style={{ color: theme.textMuted, marginBottom: "8px" }}>Full Name: <span style={{ color: theme.text }}>{profile.full_name}</span></p>
                <p style={{ color: theme.textMuted, marginBottom: "8px" }}>Email: <span style={{ color: theme.text }}>{profile.email}</span></p>
                <p style={{ color: theme.textMuted, marginBottom: "8px" }}>County: <span style={{ color: theme.text }}>{profile.county}</span></p>
                <p style={{ color: theme.textMuted, marginBottom: "8px" }}>Sub-county: <span style={{ color: theme.text }}>{profile.sub_county}</span></p>
                <p style={{ color: theme.textMuted }}>ID Number: <span style={{ color: theme.text }}>{profile.id_number}</span></p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
