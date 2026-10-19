"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, Share2, Palette, CreditCard, BadgeCheck, Award, Download, Video } from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444" },
  purple: { bg: "#0F0A1A", card: "rgba(45, 27, 78, 0.6)", border: "rgba(217, 70, 239, 0.2)", accent: "#D946EF", text: "#F8FAFC", textMuted: "#C4B5FD", purple: "#D946EF", blue: "#3B82F6", green: "#10B981", red: "#EF4444" },
  emerald: { bg: "#021A14", card: "rgba(6, 78, 59, 0.5)", border: "rgba(16, 185, 129, 0.2)", accent: "#10B981", text: "#F8FAFC", textMuted: "#6EE7B7", purple: "#10B981", blue: "#3B82F6", green: "#10B981", red: "#EF4444" }
};

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [savings, setSavings] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("navy");
  
  const theme = THEMES[themeName];

  // Forms
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "", period: "1" });
  const [updateForm, setUpdateForm] = useState({ phone: "", county: "" });
  const [updateMsg, setUpdateMsg] = useState("");
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "" });

  const router = useRouter();

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

    const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
    if (s) setSavings(s.total_savings);

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
    setTicketForm({ subject: "", message: "" });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  const loanLimit = savings * 3;
  const referralLink = `https://alpha-youth-group.vercel.app/register?ref=${profile.member_code || "PENDING"}`;
  
  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px", transition: "background-color 0.3s" }}>
      
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

      <header style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bg, position: "sticky", top: 0, zIndex: 100 }}>
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
              <div style={{ position: "absolute", top: -2, right: 0, width: "14px", height: "14px", backgroundColor: theme.red, borderRadius: "50%", border: `2px solid ${theme.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: "bold", color: "white" }}>{announcements.length}</div>
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
                <p style={{ fontSize: "11px", color: theme.textMuted }}>Code: <span style={{ color: theme.text, fontWeight: "bold" }}>{profile.member_code || "AYG-2025"}</span></p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div onClick={() => setActiveTab("savings")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "6px", backgroundColor: "rgba(147, 51, 234, 0.2)", borderRadius: "8px" }}><Wallet size={16} color={theme.purple} /></div><p style={{ fontSize: "11px", color: theme.textMuted }}>My Savings</p></div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.accent }}>KES {savings.toLocaleString()}</h3>
              </div>
              <div onClick={() => setActiveTab("loans")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><div style={{ padding: "6px", backgroundColor: "rgba(16, 185, 129, 0.2)", borderRadius: "8px" }}><Briefcase size={16} color={theme.green} /></div><p style={{ fontSize: "11px", color: theme.textMuted }}>Active Loans</p></div>
                <h3 style={{ fontSize: "18px", fontWeight: "800" }}>KES {loans.filter(l => l.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h3>
              </div>
            </div>

            {/* QUICK ACTIONS WITH ICONS */}
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>Quick Actions</h3>
            <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px", marginBottom: "24px" }}>
              <div onClick={() => router.push('/dashboard/payment')} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}><div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center" }}><PlusCircle size={20} color="#fff" /></div><span style={{ fontSize: "10px", fontWeight: "600" }}>Add Savings</span></div>
              <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}><div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: theme.blue, display: "flex", alignItems: "center", justifyContent: "center" }}><Briefcase size={20} color="#fff" /></div><span style={{ fontSize: "10px", fontWeight: "600" }}>Apply Loan</span></div>
              <div onClick={() => setActiveTab("activity")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}><div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: theme.red, display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRightLeft size={20} color="#fff" /></div><span style={{ fontSize: "10px", fontWeight: "600" }}>Transactions</span></div>
              <div onClick={() => setActiveTab("events_page")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}><div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: theme.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Calendar size={20} color="#000" /></div><span style={{ fontSize: "10px", fontWeight: "600" }}>Events</span></div>
            </div>

            {/* REFERRAL SYSTEM */}
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}><Share2 size={20} color={theme.accent} /><h3 style={{ fontSize: "16px", fontWeight: "700" }}>Refer a Friend</h3></div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="text" readOnly value={referralLink} style={{ flex: 1, padding: "10px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.accent, fontSize: "12px" }} />
                <button onClick={copyReferral} style={{ padding: "10px 16px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>COPY</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "savings" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Savings</h2>
            <div style={{ backgroundColor: theme.card, padding: "32px 20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
              <Wallet size={40} color={theme.accent} style={{ margin: "0 auto 12px auto" }} />
              <p style={{ color: theme.textMuted, fontSize: "14px" }}>Verified Balance</p>
              <h3 style={{ fontSize: "36px", fontWeight: "900", color: theme.accent }}>KES {savings}</h3>
              <button onClick={() => router.push('/dashboard/payment')} style={{ marginTop: "20px", padding: "12px 24px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>Add Savings</button>
            </div>
          </div>
        )}

        {activeTab === "loans" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Loans</h2>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "20px" }}>
              <form onSubmit={handleApplyLoan} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input type="number" placeholder={`Amount (Max: ${loanLimit})`} required value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <input type="text" placeholder="Purpose" required value={loanRequest.purpose} onChange={e => setLoanRequest({...loanRequest, purpose: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <button type="submit" style={{ padding: "12px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SUBMIT</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Transactions</h2>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              {payments.length === 0 ? <p style={{ color: theme.textMuted, textAlign: "center" }}>No transactions.</p> : payments.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                  <div><p style={{ fontWeight: "bold", fontSize: "14px" }}>{p.mpesa_code}</p><p style={{ fontSize: "10px", color: theme.textMuted }}>{p.payment_date}</p></div>
                  <div style={{ textAlign: "right" }}><p style={{ fontWeight: "bold", color: theme.green }}>+ KES {p.amount}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPANDED MORE MENU */}
        {activeTab === "more" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>More Services</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div onClick={() => setActiveTab("events_page")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><Calendar size={24} color={theme.blue} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "10px", fontWeight: "bold" }}>Events</p></div>
              <div onClick={() => setActiveTab("projects_page")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><Users size={24} color={theme.green} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "10px", fontWeight: "bold" }}>Projects</p></div>
              <div onClick={() => setActiveTab("opportunities_page")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><BookOpen size={24} color={theme.accent} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "10px", fontWeight: "bold" }}>Jobs</p></div>
              <div onClick={() => setActiveTab("documents_page")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><FileText size={24} color={theme.purple} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "10px", fontWeight: "bold" }}>Docs</p></div>
              <div onClick={() => setActiveTab("support_page")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><HelpCircle size={24} color={theme.red} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "10px", fontWeight: "bold" }}>Support</p></div>
              <div onClick={() => setActiveTab("settings")} style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", cursor: "pointer" }}><Settings size={24} color={theme.textMuted} style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "10px", fontWeight: "bold" }}>Settings</p></div>
              <div style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", opacity: 0.5 }}><Video size={24} color="#F59E0B" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "10px", fontWeight: "bold" }}>Learning</p></div>
              <div style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", opacity: 0.5 }}><CreditCard size={24} color="#3B82F6" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "10px", fontWeight: "bold" }}>Statements</p></div>
              <div style={{ backgroundColor: theme.card, padding: "16px 10px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", opacity: 0.5 }}><Award size={24} color="#10B981" style={{ margin: "0 auto 8px auto" }}/><p style={{ fontSize: "10px", fontWeight: "bold" }}>Awards</p></div>
            </div>
          </div>
        )}

        {/* SUB PAGES */}
        {["events_page", "projects_page", "opportunities_page", "documents_page", "support_page"].includes(activeTab) && (
          <button onClick={() => setActiveTab("more")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
        )}

        {activeTab === "events_page" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Upcoming Events</h2>
            {events.length === 0 ? <p style={{ color: theme.textMuted }}>No upcoming events.</p> : events.map(e => (
              <div key={e.id} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
                <h3 style={{ color: theme.accent, fontWeight: "bold" }}>{e.title}</h3>
                <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{e.event_date} | {e.location}</p>
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
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Opportunities</h2>
            {opportunities.length === 0 ? <p style={{ color: theme.textMuted }}>No opportunities listed.</p> : opportunities.map(o => (
              <div key={o.id} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
                <h3 style={{ color: theme.accent, fontWeight: "bold" }}>{o.title}</h3>
                <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>{o.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "documents_page" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>My Documents</h2>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
              <FileText size={40} color={theme.textMuted} style={{ margin: "0 auto 12px auto" }} />
              <p style={{ color: theme.textMuted, fontSize: "14px" }}>Receipts and statements will appear here.</p>
            </div>
          </div>
        )}

        {activeTab === "support_page" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Support Center</h2>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
              <form onSubmit={handleSubmitTicket} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="text" placeholder="Subject" required value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <textarea placeholder="How can we help?" required value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", height: "80px" }} />
                <button type="submit" style={{ padding: "12px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SEND</button>
              </form>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Settings & Identity</h2>
            
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Palette size={18} color={theme.accent} /> App Theme</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <button onClick={() => setThemeName("navy")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1120", color: "white", border: themeName === 'navy' ? `2px solid #FBBF24` : `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Navy</button>
                <button onClick={() => setThemeName("purple")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0F0A1A", color: "white", border: themeName === 'purple' ? `2px solid #D946EF` : `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Purple</button>
                <button onClick={() => setThemeName("emerald")} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#021A14", color: "white", border: themeName === 'emerald' ? `2px solid #10B981` : `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Emerald</button>
              </div>
            </div>

            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>{profile.full_name.charAt(0)}</div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>{profile.full_name} <BadgeCheck size={18} color={theme.green}/></h3>
                  <p style={{ fontSize: "12px", color: theme.accent }}>Code: {profile.member_code || "PENDING"}</p>
                </div>
              </div>
              <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "12px", color: theme.textMuted }}>
                <p><strong style={{ color: theme.text }}>ID:</strong> {profile.id_number || "N/A"}</p>
                <p><strong style={{ color: theme.text }}>Email:</strong> {profile.email}</p>
              </div>
              {updateMsg && <p style={{ color: "#10B981", fontSize: "12px", marginBottom: "12px", textAlign: "center" }}>{updateMsg}</p>}
              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input type="tel" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} placeholder="Phone" style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <input type="text" value={updateForm.county} onChange={e => setUpdateForm({...updateForm, county: e.target.value})} placeholder="County" style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <button type="submit" style={{ padding: "12px", border: `1px solid ${theme.accent}`, color: theme.accent, borderRadius: "8px", fontWeight: "bold", backgroundColor: "transparent" }}>SAVE</button>
              </form>
            </div>

            <button onClick={handleLogout} style={{ width: "100%", padding: "14px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>LOGOUT</button>
          </div>
        )}

      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: theme.bg, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
        <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted }}><Home size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Home</span></div>
        <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted }}><Wallet size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Savings</span></div>
        <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "loans" ? theme.accent : theme.textMuted }}><Briefcase size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Loans</span></div>
        <div onClick={() => setActiveTab("activity")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "activity" ? theme.accent : theme.textMuted }}><ArrowRightLeft size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Activity</span></div>
        <div onClick={() => setActiveTab("more")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "more" ? theme.accent : theme.textMuted }}><Menu size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>More</span></div>
      </nav>
    </div>
  );
}
