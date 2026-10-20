"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, GraduationCap, CalendarDays, HandCoins, Banknote } from "lucide-react";

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
  const [tickets, setTickets] = useState<any[]>([]);
  
  // ADMIN STATE
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState({ paybill_number: "", paybill_account: "" });
  
  // FORMS
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", time: "", location: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "" });
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [newOpportunity, setNewOpportunity] = useState({ title: "", description: "", link: "" });
  const [replyMsg, setReplyMsg] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home"); // Member view
  const [adminTab, setAdminTab] = useState("overview"); // Admin view
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("navy");
  
  const theme = THEMES[themeName];
  const router = useRouter();

  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "", period: "1" });
  const [updateForm, setUpdateForm] = useState({ phone: "", county: "" });
  const [updateMsg, setUpdateMsg] = useState("");
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "" });

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

    // ADMIN DATA
    if (profileData && profileData.role !== 'member') {
      const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (users) setAllUsers(users);
      
      const { data: pendingP } = await supabase.from("payments").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingP) setAllPayments(pendingP);
      
      const { data: pendingL } = await supabase.from("loans").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingL) setAllLoans(pendingL);
      
      const { data: tk } = await supabase.from("support_tickets").select(`*, profiles:user_id (full_name)`).eq("status", "open");
      if (tk) setAllTickets(tk);

      const { data: settingsData } = await supabase.from("app_settings").select("*").single();
      if (settingsData) setAppSettings(settingsData);
    } else {
      const { data: tk } = await supabase.from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (tk) setTickets(tk);
    }

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  // MEMBER ACTIONS
  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loanRequest.amount);
    if (amount > savings * 3) return alert(`❌ REJECTED: Max loan is KES ${savings * 3}`);
    await supabase.from("loans").insert({ user_id: profile.id, amount, purpose: loanRequest.purpose, repayment_period_months: parseInt(loanRequest.period), status: "pending" });
    alert("✅ Loan Submitted"); setLoanRequest({ amount: "", purpose: "", period: "1" }); fetchDashboardData();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setUpdateMsg("Saving...");
    await supabase.from("profiles").update(updateForm).eq("id", profile.id);
    setProfile({ ...profile, ...updateForm }); setUpdateMsg("Updated!"); setTimeout(() => setUpdateMsg(""), 3000);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("support_tickets").insert({ user_id: profile.id, subject: ticketForm.subject, message: ticketForm.message });
    alert("Message sent to Admin!"); setTicketForm({ subject: "", message: "" }); fetchDashboardData();
  };

  // ADMIN ACTIONS
  const handleVerifyPayment = async (id: string, uid: string, isRegistration: boolean) => {
    const code = `AYG-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from("payments").update({ status: "verified" }).eq("id", id);
    if (isRegistration) {
      await supabase.from("profiles").update({ membership_status: "active", member_code: code }).eq("id", uid);
      alert(`Member Approved! Code: ${code}`);
    } else {
      alert(`Payment Verified!`);
    }
    fetchDashboardData();
  };

  const handleLoanAction = async (id: string, status: string) => {
    await supabase.from("loans").update({ status }).eq("id", id); alert(`Loan ${status}!`); fetchDashboardData();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`Change role to ${newRole.toUpperCase()}?`)) return;
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    alert("Role updated!"); fetchDashboardData();
  };

  const handleAdminReply = async (id: string) => {
    if (!replyMsg) return;
    await supabase.from("support_tickets").update({ admin_reply: replyMsg, status: "closed" }).eq("id", id);
    alert("Reply sent!"); setReplyMsg(""); fetchDashboardData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault(); await supabase.from("events").insert({ title: newEvent.title, event_date: newEvent.date, location: newEvent.location });
    alert("Event Published!"); setNewEvent({ title: "", date: "", location: "" }); fetchDashboardData();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault(); await supabase.from("projects").insert({ title: newProject.title, description: newProject.description });
    alert("Project Added!"); setNewProject({ title: "", description: "" }); fetchDashboardData();
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault(); await supabase.from("opportunities").insert({ title: newOpportunity.title, description: newOpportunity.description, link: newOpportunity.link });
    alert("Opportunity Posted!"); setNewOpportunity({ title: "", description: "", link: "" }); fetchDashboardData();
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSettingsMsg("Saving...");
    await supabase.from("app_settings").update({ paybill_number: appSettings.paybill_number, paybill_account: appSettings.paybill_account }).eq("id", 1);
    setSettingsMsg("Settings Saved!"); setTimeout(() => setSettingsMsg(""), 3000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  // PENDING GATE
  if (profile.membership_status !== 'active' && profile.role === 'member') {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
        <Clock size={48} color={theme.accent} style={{ marginBottom: "20px" }} />
        <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px" }}>Application Pending</h2>
        <p style={{ color: theme.textMuted, fontSize: "14px", maxWidth: "400px", marginBottom: "24px" }}>Your KES 1,000 payment is under review. Call <strong>0704785116</strong> to verify your code.</p>
        <a href="tel:0704785116" style={{ padding: "14px 24px", backgroundColor: theme.green, color: "#000", borderRadius: "8px", fontWeight: "bold", textDecoration: "none" }}>Call Support</a>
        <button onClick={handleLogout} style={{ marginTop: "24px", background: "transparent", border: "none", color: theme.textMuted, textDecoration: "underline", cursor: "pointer" }}>Logout</button>
      </div>
    );
  }

  // ==========================================
  // SUPER ADMIN / EXECUTIVE PORTAL
  // ==========================================
  if (profile.role !== 'member') {
    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", minHeight: "100vh" }}>
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "20px" }}>
            <div><h1 style={{ fontSize: "28px", fontWeight: "800", color: theme.accent }}>EXECUTIVE PORTAL</h1><p style={{ color: theme.textMuted }}>Role: {profile.role.replace('_', ' ').toUpperCase()}</p></div>
            <button onClick={handleLogout} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", fontWeight: "700", cursor: "pointer" }}>LOGOUT</button>
          </div>

          {/* ADMIN NAVIGATION TABS */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "30px", overflowX: "auto", paddingBottom: "10px" }}>
            <button onClick={() => setAdminTab("overview")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "overview" ? theme.accent : theme.card, color: adminTab === "overview" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Overview</button>
            <button onClick={() => setAdminTab("approvals")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "approvals" ? theme.accent : theme.card, color: adminTab === "approvals" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Approvals</button>
            <button onClick={() => setAdminTab("finance")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "finance" ? theme.accent : theme.card, color: adminTab === "finance" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Finance</button>
            <button onClick={() => setAdminTab("members")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "members" ? theme.accent : theme.card, color: adminTab === "members" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Members</button>
            <button onClick={() => setAdminTab("content")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "content" ? theme.accent : theme.card, color: adminTab === "content" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Content</button>
            <button onClick={() => setAdminTab("support")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "support" ? theme.accent : theme.card, color: adminTab === "support" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Support</button>
            {(profile.role === 'admin' || profile.role === 'treasurer') && (
              <button onClick={() => setAdminTab("settings")} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: adminTab === "settings" ? theme.accent : theme.card, color: adminTab === "settings" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Settings</button>
            )}
          </div>

          {/* OVERVIEW */}
          {adminTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}><p style={{ fontSize: "14px", color: theme.textMuted }}>Total Members</p><h3 style={{ fontSize: "32px", fontWeight: "800", color: theme.accent }}>{allUsers.length}</h3></div>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}><p style={{ fontSize: "14px", color: theme.textMuted }}>Total Savings</p><h3 style={{ fontSize: "32px", fontWeight: "800", color: theme.green }}>KES {savings.toLocaleString()}</h3></div>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}><p style={{ fontSize: "14px", color: theme.textMuted }}>Pending Approvals</p><h3 style={{ fontSize: "32px", fontWeight: "800", color: theme.red }}>{allPayments.filter(p => p.is_registration_fee).length}</h3></div>
            </div>
          )}

          {/* APPROVALS */}
          {adminTab === "approvals" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending Registrations (KES 1000)</h3>
              {allPayments.filter(p => p.is_registration_fee).length === 0 ? <p style={{ color: theme.textMuted }}>No pending registrations.</p> : allPayments.filter(p => p.is_registration_fee).map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                  <div><p style={{ fontWeight: "bold" }}>{p.profiles?.full_name}</p><p style={{ fontSize: "12px", color: theme.textMuted }}>Code: <span style={{ color: theme.accent, fontWeight: "bold" }}>{p.mpesa_code}</span> | Amount: KES {p.amount}</p></div>
                  <button onClick={() => handleVerifyPayment(p.id, p.user_id, true)} style={{ backgroundColor: "#10B981", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>APPROVE</button>
                </div>
              ))}
            </div>
          )}

          {/* FINANCE */}
          {adminTab === "finance" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
              <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending Savings Payments</h3>
                {allPayments.filter(p => !p.is_registration_fee).length === 0 ? <p style={{ color: theme.textMuted }}>No pending savings.</p> : allPayments.filter(p => !p.is_registration_fee).map(p => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "8px 0" }}>
                    <div><p style={{ fontWeight: "bold" }}>{p.profiles?.full_name}</p><p style={{ fontSize: "12px", color: theme.textMuted }}>Code: {p.mpesa_code}</p></div>
                    <button onClick={() => handleVerifyPayment(p.id, p.user_id, false)} style={{ backgroundColor: "#10B981", color: "white", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" }}>VERIFY</button>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending Loans</h3>
                {allLoans.length === 0 ? <p style={{ color: theme.textMuted }}>No pending loans.</p> : allLoans.map(l => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, padding: "8px 0" }}>
                    <div><p style={{ fontWeight: "bold" }}>{l.profiles?.full_name}</p><p style={{ fontSize: "12px", color: theme.textMuted }}>KES {l.amount}</p></div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleLoanAction(l.id, "approved")} style={{ backgroundColor: "#10B981", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>APPROVE</button>
                      <button onClick={() => handleLoanAction(l.id, "rejected")} style={{ backgroundColor: "#EF4444", color: "white", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>REJECT</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEMBERS DIRECTORY */}
          {adminTab === "members" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `2px solid ${theme.red}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.red }}>Member Directory</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "14px", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}><th style={{ padding: "12px 8px" }}>Name</th><th>Code</th><th>Status</th><th>Role</th></tr></thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: "12px 8px", fontWeight: "bold" }}>{u.full_name}</td>
                        <td style={{ color: theme.accent, fontFamily: "monospace" }}>{u.member_code || "PENDING"}</td>
                        <td><span style={{ color: u.membership_status === 'active' ? '#10B981' : '#FBBF24', fontWeight: "bold", fontSize: "12px" }}>{u.membership_status.toUpperCase()}</span></td>
                        <td>
                          <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} style={{ padding: "6px", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.5)", color: "white", border: `1px solid ${theme.border}` }}>
                            <option value="member">Member</option><option value="chairman">Chairman</option><option value="vice_chairman">Vice Chairman</option><option value="treasurer">Treasurer</option><option value="secretary">Secretary</option><option value="organizing_secretary">Organizing Secretary</option><option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTENT MANAGEMENT */}
          {adminTab === "content" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "12px", color: theme.accent }}>Create Event</h3>
                <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input type="text" placeholder="Title" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <input type="text" placeholder="Location" required value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <button type="submit" style={{ padding: "10px", backgroundColor: theme.accent, color: "#000", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer" }}>PUBLISH</button>
                </form>
              </div>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "12px", color: theme.accent }}>Create Project</h3>
                <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input type="text" placeholder="Title" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <textarea placeholder="Description" required value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white", height: "60px" }} />
                  <button type="submit" style={{ padding: "10px", backgroundColor: theme.accent, color: "#000", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer" }}>ADD PROJECT</button>
                </form>
              </div>
              <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginBottom: "12px", color: theme.accent }}>Post Opportunity</h3>
                <form onSubmit={handleCreateOpportunity} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input type="text" placeholder="Title (e.g. Scholarship)" required value={newOpportunity.title} onChange={e => setNewOpportunity({...newOpportunity, title: e.target.value})} style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <input type="text" placeholder="Description" required value={newOpportunity.description} onChange={e => setNewOpportunity({...newOpportunity, description: e.target.value})} style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <input type="text" placeholder="Link (optional)" value={newOpportunity.link} onChange={e => setNewOpportunity({...newOpportunity, link: e.target.value})} style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "6px", color: "white" }} />
                  <button type="submit" style={{ padding: "10px", backgroundColor: theme.accent, color: "#000", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer" }}>POST</button>
                </form>
              </div>
            </div>
          )}

          {/* SUPPORT TICKETS */}
          {adminTab === "support" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>Member Support Tickets</h3>
              {allTickets.length === 0 ? <p style={{ color: theme.textMuted }}>No open tickets.</p> : allTickets.map(t => (
                <div key={t.id} style={{ borderBottom: `1px solid ${theme.border}`, padding: "16px 0" }}>
                  <p style={{ fontWeight: "bold" }}>{t.profiles?.full_name} - {t.subject}</p>
                  <p style={{ fontSize: "14px", color: theme.textMuted, margin: "8px 0" }}>{t.message}</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input type="text" placeholder="Reply..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "none", backgroundColor: "rgba(0,0,0,0.3)", color: "white" }} />
                    <button onClick={() => handleAdminReply(t.id)} style={{ padding: "8px 16px", backgroundColor: "#3B82F6", color: "white", borderRadius: "4px", border: "none", cursor: "pointer", fontWeight: "bold" }}>REPLY</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS (TREASURER) */}
          {adminTab === "settings" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>Paybill Settings</h3>
              {settingsMsg && <p style={{ color: "#10B981", marginBottom: "12px" }}>{settingsMsg}</p>}
              <form onSubmit={handleUpdateSettings} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px" }}>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Business Paybill Number</label>
                <input type="text" required value={appSettings.paybill_number} onChange={e => setAppSettings({...appSettings, paybill_number: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Account Number Instruction</label>
                <input type="text" required value={appSettings.paybill_account} onChange={e => setAppSettings({...appSettings, paybill_account: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <button type="submit" style={{ padding: "12px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SAVE SETTINGS</button>
              </form>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ==========================================
  // MEMBER DASHBOARD
  // ==========================================
  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px", transition: "background-color 0.3s" }}>
      <header style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bg, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", fontStyle: "italic" }}>A</div>
           <div><h1 style={{ fontSize: "15px", fontWeight: "800", color: theme.accent }}>ALPHA YOUTH GROUP</h1><p style={{ fontSize: "9px", color: theme.textMuted, fontStyle: "italic" }}>— Together We Rise and Shine! —</p></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Bell size={22} color={theme.text} />
          <div onClick={() => setActiveTab("settings")} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}`, cursor: "pointer" }}>{profile.full_name.charAt(0)}</div>
        </div>
      </header>

      <main style={{ padding: "20px" }}>
        {activeTab === "home" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: theme.accent }}>Welcome back, {profile.full_name.split(' ')[0]}</h2>
              <p style={{ color: theme.textMuted, fontSize: "12px" }}>Member Code: {profile.member_code}</p>
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
            </div>
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}><Calendar size={16} /> Meeting Schedules</h3>
              {meetings.length === 0 ? <p style={{ fontSize: "12px", color: theme.textMuted }}>No meetings scheduled.</p> : meetings.map(m => (
                <div key={m.id} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", marginBottom: "8px" }}><p style={{ fontWeight: "bold" }}>{m.title}</p><p style={{ fontSize: "12px", color: theme.textMuted }}>{m.meeting_date} at {m.time} | {m.location}</p></div>
              ))}
            </div>
          </div>
        )}
        {/* Add Savings, Loans, Activity, More, Settings tabs here... (Same as previous member code) */}
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
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <form onSubmit={handleApplyLoan} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input type="number" placeholder={`Amount (Max: ${savings * 3})`} required value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <input type="text" placeholder="Purpose" required value={loanRequest.purpose} onChange={e => setLoanRequest({...loanRequest, purpose: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                <button type="submit" style={{ padding: "12px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>SUBMIT</button>
              </form>
            </div>
          </div>
        )}
        {activeTab === "settings" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Settings</h2>
            <button onClick={handleLogout} style={{ width: "100%", padding: "14px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>LOGOUT</button>
          </div>
        )}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: theme.bg, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
        <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted }}><Home size={22} /><span style={{ fontSize: "10px" }}>Home</span></div>
        <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted }}><Wallet size={22} /><span style={{ fontSize: "10px" }}>Savings</span></div>
        <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "loans" ? theme.accent : theme.textMuted }}><Briefcase size={22} /><span style={{ fontSize: "10px" }}>Loans</span></div>
        <div onClick={() => setActiveTab("settings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "settings" ? theme.accent : theme.textMuted }}><Settings size={22} /><span style={{ fontSize: "10px" }}>Settings</span></div>
      </nav>
    </div>
  );
}
