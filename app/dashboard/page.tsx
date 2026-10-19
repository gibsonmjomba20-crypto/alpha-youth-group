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
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "" });
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", location: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "" });
  
  const [showSettings, setShowSettings] = useState(false);
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

    const { data: meetingsData } = await supabase.from("meetings").select("*").order("meeting_date", { ascending: true }).limit(3);
    if (meetingsData) setMeetings(meetingsData);

    const { data: announcementsData } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(2);
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

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING SYSTEM...</div>;

  const filteredPayments = payments.filter(p => p.mpesa_code.toLowerCase().includes(searchQuery.toLowerCase()));
  const glassCard = { backgroundColor: theme.card, backdropFilter: "blur(16px)", padding: "28px", borderRadius: "20px", border: `1px solid ${theme.border}`, boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)" };
  const statBox = { background: "rgba(0,0,0,0.2)", padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column" as const, gap: "12px", position: "relative" as const };
  const inputStyle = { width: "100%", padding: "14px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "12px", color: theme.text, marginBottom: "16px", outline: "none", fontSize: "15px" };
  const isLeader = profile.role !== 'member';
  const referralLink = `https://alpha-youth-group.vercel.app/register?ref=${profile.member_code || 'PENDING'}`;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif" }}>
      
      {/* SETTINGS MODAL */}
      {showSettings && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ ...glassCard, maxWidth: "450px", width: "90%" }}>
            <h2 style={{ color: theme.text, fontSize: "24px", marginBottom: "20px" }}>Appearance</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <button onClick={() => { setThemeName("navy"); setShowSettings(false); }} style={{ padding: "24px 16px", borderRadius: "12px", backgroundColor: "#0f172a", color: "white", border: themeName === 'navy' ? `2px solid #FBBF24` : "1px solid #334155", cursor: "pointer" }}>Navy</button>
              <button onClick={() => { setThemeName("purple"); setShowSettings(false); }} style={{ padding: "24px 16px", borderRadius: "12px", backgroundColor: "#1a0b2e", color: "white", border: themeName === 'purple' ? `2px solid #D946EF` : "1px solid #334155", cursor: "pointer" }}>Purple</button>
              <button onClick={() => { setThemeName("emerald"); setShowSettings(false); }} style={{ padding: "24px 16px", borderRadius: "12px", backgroundColor: "#064e3b", color: "white", border: themeName === 'emerald' ? `2px solid #10B981` : "1px solid #334155", cursor: "pointer" }}>Emerald</button>
              <button onClick={() => { setThemeName("sleek"); setShowSettings(false); }} style={{ padding: "24px 16px", borderRadius: "12px", backgroundColor: "#111111", color: "white", border: themeName === 'sleek' ? `2px solid #EF4444` : "1px solid #334155", cursor: "pointer" }}>Sleek</button>
            </div>
            <button onClick={() => setShowSettings(false)} style={{ width: "100%", padding: "16px", marginTop: "24px", backgroundColor: "transparent", color: theme.textMuted, border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${theme.border}`, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: theme.gradient, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "900" }}>A</div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: theme.text }}>ALPHA YOUTH</h1>
        </div>
        <div style={{ flex: 1, maxWidth: "400px" }}>
          <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...inputStyle, borderRadius: "30px", marginBottom: 0 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button onClick={() => setShowSettings(true)} style={{ background: "transparent", border: "none", color: theme.text, fontWeight: "600", cursor: "pointer" }}>SETTINGS</button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "rgba(0,0,0,0.2)", padding: "8px 16px", borderRadius: "30px", border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: "14px", fontWeight: "700" }}>{profile.full_name.split(' ')[0]}</span>
            <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontWeight: "700" }}>LOGOUT</button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 32px" }}>
        
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800" }}>Welcome back, {profile.full_name.split(' ')[0]}</h2>
          <p style={{ color: theme.textMuted, marginTop: "8px" }}>Member Code: <span style={{ color: theme.accent, fontFamily: "monospace" }}>{profile.member_code || "PENDING"}</span> | Role: {profile.role.toUpperCase()}</p>
        </div>

        {/* ANNOUNCEMENTS */}
        <div style={{ ...glassCard, marginBottom: "40px", borderLeft: `4px solid #F59E0B` }}>
           <h2 style={{ color: theme.text, fontSize: "20px", marginBottom: "16px" }}>Announcements</h2>
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

        {/* ADMIN CONSOLE */}
        {isLeader && (
          <div style={{ ...glassCard, borderLeft: `4px solid #EF4444`, marginBottom: "40px" }}>
            <h2 style={{ color: "#EF4444", fontSize: "20px", marginBottom: "24px" }}>MANAGEMENT CONSOLE ({profile.role.toUpperCase()})</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              
              {/* Payment Verification */}
              <div>
                <h3 style={{ marginBottom: "16px" }}>Pending M-Pesa Payments</h3>
                {allPayments.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "14px" }}>No pending payments.</p> : (
                  <table style={{ width: "100%", textAlign: "left", fontSize: "14px" }}>
                    <thead><tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}><th>Member</th><th>Code</th><th>Action</th></tr></thead>
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
                )}
              </div>

              {/* Loan Approvals */}
              <div>
                <h3 style={{ marginBottom: "16px" }}>Pending Loans</h3>
                {allLoans.length === 0 ? <p style={{ color: theme.textMuted, fontSize: "14px" }}>No pending loans.</p> : (
                  <table style={{ width: "100%", textAlign: "left", fontSize: "14px" }}>
                    <thead><tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}><th>Member</th><th>Amount</th><th>Action</th></tr></thead>
                    <tbody>
                      {allLoans.map(l => (
                        <tr key={l.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: "8px 0" }}>{l.profiles?.full_name}</td>
                          <td style={{ color: "#10B981", fontWeight: "bold" }}>KES {l.amount}</td>
                          <td style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => handleLoanAction(l.id, "approved")} style={{ backgroundColor: "#10B981", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>APPROVE</button>
                            <button onClick={() => handleLoanAction(l.id, "rejected")} style={{ backgroundColor: "#EF4444", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>REJECT</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Post Announcement & Schedule Meeting */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px", borderTop: `1px solid ${theme.border}`, paddingTop: "24px" }}>
              <div>
                <h3 style={{ marginBottom: "12px" }}>Post Announcement</h3>
                <form onSubmit={handlePostAnnouncement}>
                  <input placeholder="Title" required value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} style={inputStyle} />
                  <textarea placeholder="Message" required value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} style={{ ...inputStyle, height: "80px" }} />
                  <button type="submit" style={{ background: theme.gradient, color: "#000", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer" }}>POST</button>
                </form>
              </div>
              <div>
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

        {/* STATS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          <div style={statBox}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#10B981" }}></div><p style={{ color: theme.textMuted }}>Total Savings</p><p style={{ fontSize: "32px", fontWeight: "800" }}>KES {savings}</p></div>
          <div style={statBox}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#3B82F6" }}></div><p style={{ color: theme.textMuted }}>My Shares</p><p style={{ fontSize: "32px", fontWeight: "800" }}>{shares}</p></div>
          <div style={statBox}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: theme.accent }}></div><p style={{ color: theme.textMuted }}>Loan Limit (3x)</p><p style={{ fontSize: "32px", fontWeight: "800", color: theme.accent }}>KES {savings * 3}</p></div>
        </div>

        {/* LOANS & REFERRALS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          
          <div style={glassCard}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Apply for a Loan</h2>
            <form onSubmit={handleApplyLoan}>
              <input type="number" placeholder="Amount (KES)" required value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})} style={inputStyle} />
              <input type="text" placeholder="Purpose of Loan" required value={loanRequest.purpose} onChange={e => setLoanRequest({...loanRequest, purpose: e.target.value})} style={inputStyle} />
              <button type="submit" style={{ width: "100%", padding: "14px", background: theme.gradient, color: "#000", borderRadius: "8px", border: "none", fontWeight: "800" }}>SUBMIT APPLICATION</button>
            </form>
            {loans.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={{ fontSize: "14px", color: theme.textMuted, marginBottom: "8px" }}>My Loan Status</h3>
                {loans.map(l => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                    <span>KES {l.amount} ({l.purpose})</span>
                    <span style={{ fontWeight: "bold", color: l.status === 'approved' ? '#10B981' : l.status === 'rejected' ? '#EF4444' : '#FBBF24' }}>{l.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...glassCard, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>Refer a Friend</h2>
              <p style={{ color: theme.textMuted, marginBottom: "16px" }}>You have referred <strong style={{ color: "#10B981" }}>{referralCount}</strong> member(s).</p>
              <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", wordBreak: "break-all", border: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: "14px", fontFamily: "monospace", color: theme.accent }}>{referralLink}</span>
              </div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(referralLink); alert("Copied!"); }} style={{ width: "100%", padding: "14px", marginTop: "16px", background: theme.gradient, color: "#000", borderRadius: "8px", border: "none", fontWeight: "800" }}>COPY REFERRAL LINK</button>
          </div>

        </div>

        {/* HISTORY TABLE */}
        <div style={glassCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Recent Transactions</h2>
            <button onClick={downloadStatement} style={{ backgroundColor: "transparent", border: `1px solid ${theme.accent}`, color: theme.accent, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>DOWNLOAD STATEMENT</button>
          </div>
          {filteredPayments.length === 0 ? <p style={{ color: theme.textMuted }}>No transactions found.</p> : (
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
          )}
        </div>

        {/* MEETINGS */}
        <div style={{ ...glassCard, marginTop: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Upcoming Meetings</h2>
          {meetings.length === 0 ? <p style={{ color: theme.textMuted }}>No meetings scheduled.</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {meetings.map(m => (
                <div key={m.id} style={{ padding: "20px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "12px", borderLeft: `4px solid ${theme.accent}` }}>
                  <p style={{ fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>{m.title}</p>
                  <p style={{ color: theme.textMuted, fontSize: "14px", marginBottom: "4px" }}>Date: {m.meeting_date}</p>
                  <p style={{ color: theme.textMuted, fontSize: "14px" }}>Location: {m.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
