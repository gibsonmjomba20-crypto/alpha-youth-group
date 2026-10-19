"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send } from "lucide-react";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [savings, setSavings] = useState<number>(0);
  const [savingsGoal, setSavingsGoal] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);

  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "", period: "1" });
  const [updateForm, setUpdateForm] = useState({ phone: "", county: "" });
  const [updateMsg, setUpdateMsg] = useState("");
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "" });

  const router = useRouter();

  const theme = { 
    bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444"
  };

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) {
      setProfile(profileData);
      setUpdateForm({ phone: profileData.phone || "", county: profileData.county || "" });
    }

    const { data: p } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (p) setPayments(p);

    const { data: s } = await supabase.from("savings").select("total_savings, goal_amount").eq("user_id", user.id).single();
    if (s) { setSavings(s.total_savings); setSavingsGoal(s.goal_amount || 10000); }

    const { data: sh } = await supabase.from("shares").select("total_shares").eq("user_id", user.id).single();
    if (sh) setShares(sh.total_shares);

    const { data: l } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (l) setLoans(l);

    const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3);
    if (ann) setAnnouncements(ann);

    const { data: meet } = await supabase.from("meetings").select("*").order("meeting_date", { ascending: true }).limit(3);
    if (meet) setMeetings(meet);

    const { data: ev } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    if (ev) setEvents(ev);

    const { data: proj } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (proj) setProjects(proj);

    const { data: opp } = await supabase.from("opportunities").select("*").order("created_at", { ascending: false });
    if (opp) setOpportunities(opp);

    const { data: tk } = await supabase.from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (tk) setTickets(tk);

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loanRequest.amount);
    if (amount > savings * 3) {
      alert(`❌ APPLICATION REJECTED\n\nYou requested KES ${amount}, but you only qualify for a maximum of KES ${savings * 3} (3x your savings).`);
      return;
    }
    await supabase.from("loans").insert({ user_id: profile.id, amount, purpose: loanRequest.purpose, repayment_period_months: parseInt(loanRequest.period), status: "pending" });
    alert("✅ APPLICATION SUBMITTED"); setLoanRequest({ amount: "", purpose: "", period: "1" }); fetchDashboardData();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setUpdateMsg("Saving...");
    await supabase.from("profiles").update(updateForm).eq("id", profile.id);
    setProfile({ ...profile, ...updateForm }); setUpdateMsg("Profile updated!"); setTimeout(() => setUpdateMsg(""), 3000);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("support_tickets").insert({ user_id: profile.id, subject: ticketForm.subject, message: ticketForm.message });
    alert("Support ticket submitted! Admin will reply soon.");
    setTicketForm({ subject: "", message: "" }); fetchDashboardData();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  const savingsProgress = savingsGoal > 0 ? Math.min(Math.round((savings / savingsGoal) * 100), 100) : 0;
  const loanLimit = savings * 3;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px" }}>
      
      {showNotifications && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "80px" }}>
          <div style={{ backgroundColor: theme.card, width: "90%", maxWidth: "400px", borderRadius: "16px", border: `1px solid ${theme.border}`, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: theme.accent }}>Notifications</h3>
              <button onClick={() => setShowNotifications(false)} style={{ background: "none", border: "none", color: theme.textMuted, fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}>✕</button>
            </div>
            {announcements.length === 0 ? (
              <p style={{ fontSize: "12px", color: theme.textMuted }}>No new notifications.</p>
            ) : announcements.map(n => (
              <div key={n.id} style={{ marginBottom: "16px", backgroundColor: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", borderLeft: `3px solid ${theme.accent}` }}>
                <p style={{ fontSize: "14px", fontWeight: "bold", color: theme.text }}>{n.title}</p>
                <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{n.content}</p>
                <p style={{ fontSize: "10px", color: theme.accent, marginTop: "8px" }}>{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <header style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, backgroundColor: "#0a101d", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", fontStyle: "italic" }}>A</div>
           <div>
             <h1 style={{ fontSize: "15px", fontWeight: "800", color: theme.accent, letterSpacing: "0.5px" }}>ALPHA YOUTH GROUP</h1>
             <p style={{ fontSize: "9px", color: theme.textMuted, fontStyle: "italic" }}>— Together We Rise and Shine! —</p>
           </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div onClick={() => setShowNotifications(true)} style={{ position: "relative", cursor: "pointer" }}>
            <Bell size={22} color={theme.text} />
            {announcements.length > 0 && (
              <div style={{ position: "absolute", top: -2, right: 0, width: "14px", height: "14px", backgroundColor: theme.red, borderRadius: "50%", border: `2px solid #0a101d`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: "bold", color: "white" }}>{announcements.length}</div>
            )}
          </div>
          <div onClick={() => setActiveTab("settings")} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}`, cursor: "pointer" }}>
            {profile.full_name.charAt(0)}
          </div>
        </div>
      </header>

      <main style={{ padding: "20px" }}>
        
        {activeTab === "home" && (
          <div>
            <div style={{ position: "relative", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: `1px solid ${theme.purple}`, overflow: "hidden", display: "flex", justifyContent: "space-between" }}>
              <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)" }}></div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>{profile.full_name.charAt(0)}</div>
                  <div>
                    <p style={{ fontSize: "12px", color: theme.textMuted }}>Welcome back,</p>
                    <h2 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>{profile.full_name.split(' ')[0]}</h2>
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: theme.textMuted }}>Member Code: <span style={{ color: theme.text, fontWeight: "bold" }}>{profile.member_code || "AYG-2025"}</span></p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(16, 185, 129, 0.2)", padding: "4px 10px", borderRadius: "20px", marginTop: "8px", border: `1px solid ${theme.green}` }}>
                  <ShieldCheck size={12} color={theme.green} />
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: theme.green }}>{profile.membership_status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div onClick={() => setActiveTab("savings")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "6px", backgroundColor: "rgba(147, 51, 234, 0.2)", borderRadius: "8px" }}><Wallet size={16} color={theme.purple} /></div><p style={{ fontSize: "11px", color: theme.textMuted }}>My Savings</p></div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.accent }}>KES {savings.toLocaleString()}</h3>
              </div>
              <div onClick={() => setActiveTab("loans")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "6px", backgroundColor: "rgba(16, 185, 129, 0.2)", borderRadius: "8px" }}><Briefcase size={16} color={theme.green} /></div><p style={{ fontSize: "11px", color: theme.textMuted }}>Active Loans</p></div>
                <h3 style={{ fontSize: "18px", fontWeight: "800" }}>KES {loans.filter(l => l.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h3>
              </div>
              <div onClick={() => setActiveTab("activity")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "6px", backgroundColor: "rgba(239, 68, 68, 0.2)", borderRadius: "8px" }}><ArrowRightLeft size={16} color={theme.red} /></div><p style={{ fontSize: "11px", color: theme.textMuted }}>Transactions</p></div>
                <h3 style={{ fontSize: "18px", fontWeight: "800" }}>{payments.length}</h3>
              </div>
              <div onClick={() => setActiveTab("shares")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "6px", backgroundColor: "rgba(59, 130, 246, 0.2)", borderRadius: "8px" }}><TrendingUp size={16} color={theme.blue} /></div><p style={{ fontSize: "11px", color: theme.textMuted }}>My Shares</p></div>
                <h3 style={{ fontSize: "18px", fontWeight: "800" }}>{shares}</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === "savings" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Savings Account</h2>
            <div style={{ backgroundColor: theme.card, padding: "32px 20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", marginBottom: "16px" }}>
              <Wallet size={40} color={theme.accent} style={{ margin: "0 auto 12px auto" }} />
              <p style={{ color: theme.textMuted, fontSize: "14px" }}>Verified Balance</p>
              <h3 style={{ fontSize: "36px", fontWeight: "900", color: theme.accent }}>KES {savings}</h3>
              <button onClick={() => router.push('/dashboard/payment')} style={{ marginTop: "20px", padding: "12px 24px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>Add Savings via M-Pesa</button>
            </div>
          </div>
        )}

        {activeTab === "loans" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Loans Center</h2>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#10B981" }}>KES {loanLimit}</h3>
              <p style={{ fontSize: "12px", color: theme.textMuted }}>Your Max Eligibility (3x Savings)</p>
            </div>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Apply for a Loan</h3>
              <form onSubmit={handleApplyLoan} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input type="number" placeholder={`Amount (Max: ${loanLimit})`} required value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <input type="text" placeholder="Purpose of Loan" required value={loanRequest.purpose} onChange={e => setLoanRequest({...loanRequest, purpose: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <select value={loanRequest.period} onChange={e => setLoanRequest({...loanRequest, period: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }}>
                  <option value="1">Repay in 1 Month</option><option value="3">Repay in 3 Months</option><option value="6">Repay in 6 Months</option>
                </select>
                <button type="submit" style={{ padding: "12px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SUBMIT APPLICATION</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>My Transactions</h2>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              {payments.length === 0 ? <p style={{ color: theme.textMuted, textAlign: "center" }}>No transactions yet.</p> : payments.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                  <div><p style={{ fontWeight: "bold", fontSize: "14px" }}>{p.mpesa_code}</p><p style={{ fontSize: "10px", color: theme.textMuted }}>{p.payment_date}</p></div>
                  <div style={{ textAlign: "right" }}><p style={{ fontWeight: "bold", color: theme.green }}>+ KES {p.amount}</p><p style={{ fontSize: "10px", color: theme.accent }}>{p.status.toUpperCase()}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "more" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>More Services</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div onClick={() => setActiveTab("events_page")} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><Calendar size={28} color={theme.blue} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Events</p></div>
              <div onClick={() => setActiveTab("projects_page")} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><Users size={28} color={theme.green} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Projects</p></div>
              <div onClick={() => setActiveTab("opportunities_page")} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><BookOpen size={28} color={theme.accent} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Opportunities</p></div>
              <div onClick={() => setActiveTab("documents_page")} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><FileText size={28} color={theme.purple} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Documents</p></div>
              <div onClick={() => setActiveTab("support_page")} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><HelpCircle size={28} color={theme.red} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Support</p></div>
              <div onClick={() => setActiveTab("settings")} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><Settings size={28} color={theme.textMuted} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "12px", fontWeight: "bold" }}>Settings</p></div>
            </div>
          </div>
        )}

        {["events_page", "projects_page", "opportunities_page", "documents_page", "support_page"].includes(activeTab) && (
          <button onClick={() => setActiveTab("more")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}>
            <ArrowLeft size={16} /> Back to More
          </button>
        )}

        {activeTab === "events_page" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Upcoming Events</h2>
            {events.length === 0 ? <p style={{ color: theme.textMuted }}>No upcoming events.</p> : events.map(e => (
              <div key={e.id} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
                <h3 style={{ color: theme.accent, fontWeight: "bold" }}>{e.title}</h3>
                <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}><Calendar size={12}/> {e.event_date} | <MapPin size={12}/> {e.location}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "projects_page" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Community Projects</h2>
            {projects.length === 0 ? <p style={{ color: theme.textMuted }}>No ongoing projects.</p> : projects.map(p => (
              <div key={p.id} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
                <h3 style={{ color: theme.accent, fontWeight: "bold" }}>{p.title}</h3>
                <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "opportunities_page" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Youth Opportunities</h2>
            {opportunities.length === 0 ? <p style={{ color: theme.textMuted }}>No opportunities listed.</p> : opportunities.map(o => (
              <div key={o.id} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
                <h3 style={{ color: theme.accent, fontWeight: "bold" }}>{o.title}</h3>
                <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{o.description}</p>
                {o.link && <a href={o.link} target="_blank" style={{ color: theme.blue, fontSize: "12px", marginTop: "8px", display: "inline-block" }}>Apply Here</a>}
              </div>
            ))}
          </div>
        )}

        {activeTab === "documents_page" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>My Documents</h2>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
              <FileText size={40} color={theme.textMuted} style={{ margin: "0 auto 12px auto" }} />
              <p style={{ color: theme.textMuted, fontSize: "14px" }}>Official documents like receipts, statements, and agreements will appear here once generated.</p>
            </div>
          </div>
        )}

        {activeTab === "support_page" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Support Center</h2>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>Send a Message to Admin</h3>
              <form onSubmit={handleSubmitTicket} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="text" placeholder="Subject" required value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <textarea placeholder="How can we help you?" required value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", height: "80px" }} />
                <button type="submit" style={{ padding: "12px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SEND MESSAGE</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Settings</h2>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>{profile.full_name.charAt(0)}</div>
                <div><h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{profile.full_name}</h3><p style={{ fontSize: "12px", color: theme.accent }}>Code: {profile.member_code || "PENDING"}</p></div>
              </div>
              {updateMsg && <p style={{ color: "#10B981", fontSize: "12px", marginBottom: "12px", textAlign: "center" }}>{updateMsg}</p>}
              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Phone Number</label>
                <input type="tel" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <label style={{ fontSize: "12px", color: theme.textMuted }}>County</label>
                <input type="text" value={updateForm.county} onChange={e => setUpdateForm({...updateForm, county: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <button type="submit" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "12px", backgroundColor: "transparent", border: `1px solid ${theme.accent}`, color: theme.accent, borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "8px" }}><Save size={16}/> SAVE CHANGES</button>
              </form>
            </div>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
               <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: theme.accent }}>Contact Alpha Youth Group</h3>
               <p style={{ fontSize: "14px", color: theme.textMuted, marginBottom: "16px" }}>We are available 24/7 to help you.</p>
               <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                 <a href="tel:0704785116" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", backgroundColor: theme.green, color: "#000", borderRadius: "8px", fontWeight: "bold", textDecoration: "none" }}><Phone size={18} /> Call Support: 0704785116</a>
                 <a href="mailto:info@alphayouthgroup.com" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", backgroundColor: theme.blue, color: "#fff", borderRadius: "8px", fontWeight: "bold", textDecoration: "none" }}><Mail size={18} /> Email Us</a>
               </div>
            </div>
            <button onClick={handleLogout} style={{ width: "100%", padding: "14px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>LOGOUT</button>
          </div>
        )}

      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#0a101d", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
        <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Home size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Home</span></div>
        <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Wallet size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Savings</span></div>
        <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "loans" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Briefcase size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Loans</span></div>
        <div onClick={() => setActiveTab("activity")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "activity" ? theme.accent : theme.textMuted, cursor: "pointer" }}><ArrowRightLeft size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Activity</span></div>
        <div onClick={() => setActiveTab("more")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "more" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Menu size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>More</span></div>
      </nav>
    </div>
  );
}
