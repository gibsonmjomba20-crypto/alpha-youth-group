"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, UserPlus, RefreshCw, Target, Megaphone, Link as LinkIcon, Lock } from "lucide-react";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [savings, setSavings] = useState<number>(0);
  const [savingsGoal, setSavingsGoal] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState("home");

  const router = useRouter();

  // Theme Colors based on your screenshot
  const theme = { 
    bg: "#0B1120", 
    card: "#131C2E", 
    border: "rgba(255, 255, 255, 0.08)", 
    accent: "#FBBF24", 
    text: "#F8FAFC", 
    textMuted: "#94A3B8", 
    purple: "#9333EA",
    blue: "#3B82F6",
    green: "#10B981",
    red: "#EF4444"
  };

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) setProfile(profileData);

    const { data: p } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (p) setPayments(p);

    const { data: s } = await supabase.from("savings").select("total_savings, goal_amount").eq("user_id", user.id).single();
    if (s) { setSavings(s.total_savings); setSavingsGoal(s.goal_amount || 10000); }

    const { data: sh } = await supabase.from("shares").select("total_shares").eq("user_id", user.id).single();
    if (sh) setShares(sh.total_shares);

    const { data: l } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (l) setLoans(l);

    const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(1);
    if (ann) setAnnouncements(ann);

    const { data: ev } = await supabase.from("events").select("*").order("event_date", { ascending: true }).limit(1);
    if (ev) setEvents(ev);

    if (profileData && profileData.role !== 'member') {
      const { data: pendingP } = await supabase.from("payments").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingP) setAllPayments(pendingP);
      const { data: pendingL } = await supabase.from("loans").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingL) setAllLoans(pendingL);
    }

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  const isLeader = profile.role !== 'member';
  
  // Calculate Savings Progress
  const savingsProgress = savingsGoal > 0 ? Math.min(Math.round((savings / savingsGoal) * 100), 100) : 0;

  // ==========================================
  // MEMBER DASHBOARD UI (Matching Screenshot)
  // ==========================================
  if (!isLeader) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px" }}>
        
        {/* HEADER */}
        <header style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, backgroundColor: "#0a101d" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", fontStyle: "italic" }}>A</div>
             <div>
               <h1 style={{ fontSize: "15px", fontWeight: "800", color: theme.accent, letterSpacing: "0.5px" }}>ALPHA YOUTH GROUP</h1>
               <p style={{ fontSize: "9px", color: theme.textMuted, fontStyle: "italic" }}>— Together We Rise and Shine! —</p>
             </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative" }}>
              <Bell size={22} color={theme.text} />
              <div style={{ position: "absolute", top: -2, right: 0, width: "14px", height: "14px", backgroundColor: theme.red, borderRadius: "50%", border: `2px solid #0a101d`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: "bold", color: "white" }}>3</div>
            </div>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}` }}>
              {profile.full_name.charAt(0)}
            </div>
          </div>
        </header>

        <main style={{ padding: "20px" }}>
          
          {/* WELCOME BANNER */}
          <div style={{ position: "relative", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: `1px solid ${theme.purple}`, overflow: "hidden" }}>
            {/* Background Glow */}
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)" }}></div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>
                    {profile.full_name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: theme.textMuted }}>Welcome back,</p>
                    <h2 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>{profile.full_name.split(' ')[0]}</h2>
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: theme.textMuted }}>Member Code: <span style={{ color: theme.text, fontWeight: "bold" }}>{profile.member_code || "AYG-2025"}</span></p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(16, 185, 129, 0.2)", padding: "4px 10px", borderRadius: "20px", marginTop: "8px", border: `1px solid ${theme.green}` }}>
                  <ShieldCheck size={12} color={theme.green} />
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: theme.green }}>Active Member</span>
                </div>
              </div>
              <div style={{ width: "120px", textAlign: "right" }}>
                <p style={{ fontSize: "11px", fontStyle: "italic", color: theme.textMuted, lineHeight: "1.4" }}>"Together we grow, support one another, and build a brighter future."</p>
              </div>
            </div>
          </div>

          {/* TOP 4 CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ padding: "6px", backgroundColor: "rgba(147, 51, 234, 0.2)", borderRadius: "8px" }}><Wallet size={16} color={theme.purple} /></div>
                <p style={{ fontSize: "11px", color: theme.textMuted }}>My Savings</p>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.accent }}>KES {savings.toLocaleString()}</h3>
              <p style={{ fontSize: "9px", color: theme.textMuted, marginTop: "8px", display: "flex", alignItems: "center", gap: "2px" }}>View Details <ChevronRight size={10} /></p>
            </div>

            <div style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ padding: "6px", backgroundColor: "rgba(59, 130, 246, 0.2)", borderRadius: "8px" }}><TrendingUp size={16} color={theme.blue} /></div>
                <p style={{ fontSize: "11px", color: theme.textMuted }}>My Shares</p>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>{shares} <span style={{ fontSize: "12px", fontWeight: "normal" }}>Shares</span></h3>
              <p style={{ fontSize: "9px", color: theme.textMuted, marginTop: "8px", display: "flex", alignItems: "center", gap: "2px" }}>View Details <ChevronRight size={10} /></p>
            </div>

            <div style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ padding: "6px", backgroundColor: "rgba(16, 185, 129, 0.2)", borderRadius: "8px" }}><Briefcase size={16} color={theme.green} /></div>
                <p style={{ fontSize: "11px", color: theme.textMuted }}>Active Loans</p>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>KES {loans.filter(l => l.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h3>
              <p style={{ fontSize: "9px", color: theme.textMuted, marginTop: "8px", display: "flex", alignItems: "center", gap: "2px" }}>View Details <ChevronRight size={10} /></p>
            </div>

            <div style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ padding: "6px", backgroundColor: "rgba(239, 68, 68, 0.2)", borderRadius: "8px" }}><ArrowRightLeft size={16} color={theme.red} /></div>
                <p style={{ fontSize: "11px", color: theme.textMuted }}>Transactions</p>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>{payments.length}</h3>
              <p style={{ fontSize: "9px", color: theme.textMuted, marginTop: "8px", display: "flex", alignItems: "center", gap: "2px" }}>View Details <ChevronRight size={10} /></p>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ color: theme.accent }}>⚡</span> Quick Actions</h3>
            </div>
            <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center" }}><PlusCircle size={20} color="#fff" /></div>
                <span style={{ fontSize: "10px", fontWeight: "600", textAlign: "center" }}>Add Savings</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: theme.blue, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={20} color="#fff" /></div>
                <span style={{ fontSize: "10px", fontWeight: "600", textAlign: "center" }}>View Shares</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: theme.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Briefcase size={20} color="#fff" /></div>
                <span style={{ fontSize: "10px", fontWeight: "600", textAlign: "center" }}>Apply for Loan</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: theme.red, display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRightLeft size={20} color="#fff" /></div>
                <span style={{ fontSize: "10px", fontWeight: "600", textAlign: "center" }}>View Txns</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={20} color="#fff" /></div>
                <span style={{ fontSize: "10px", fontWeight: "600", textAlign: "center" }}>Update Profile</span>
              </div>
            </div>
          </div>

          {/* SAVINGS GOAL & RECENT ACTIVITY */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "24px" }}>
            
            {/* SAVINGS GOAL CIRCLE */}
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><Target size={16} color={theme.accent} /> Savings Goal</h3>
                <p style={{ fontSize: "10px", color: theme.textMuted, marginBottom: "12px" }}>Your progress towards a better future</p>
                <p style={{ fontSize: "12px", fontWeight: "bold" }}>KES {savings.toLocaleString()} / {savingsGoal.toLocaleString()}</p>
                <div style={{ width: "100px", height: "6px", backgroundColor: theme.bg, borderRadius: "4px", marginTop: "8px" }}>
                  <div style={{ width: `${savingsProgress}%`, height: "100%", background: "linear-gradient(90deg, #10B981, #3B82F6)", borderRadius: "4px" }}></div>
                </div>
              </div>
              
              {/* CSS Donut Chart */}
              <div style={{ position: "relative", width: "70px", height: "70px", borderRadius: "50%", background: `conic-gradient(${theme.green} ${savingsProgress}%, ${theme.border} ${savingsProgress}%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: theme.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>{savingsProgress}%</span>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}><RefreshCw size={16} color={theme.blue} /> Recent Activity</h3>
                <span style={{ fontSize: "10px", color: theme.accent }}>View All</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {payments.length === 0 ? (
                  <p style={{ fontSize: "10px", color: theme.textMuted }}>No recent activity.</p>
                ) : (
                  payments.slice(0,3).map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRightLeft size={14} color={theme.green} /></div>
                        <div>
                          <p style={{ fontSize: "11px", fontWeight: "bold" }}>Savings Contribution</p>
                          <p style={{ fontSize: "9px", color: theme.textMuted }}>{p.payment_date}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "11px", fontWeight: "bold" }}>KES {p.amount}</p>
                        <p style={{ fontSize: "9px", color: p.status === 'verified' ? theme.green : theme.accent }}>{p.status.toUpperCase()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ANNOUNCEMENTS */}
          <div style={{ marginBottom: "24px" }}>
             <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><Megaphone size={16} color={theme.accent} /> Announcements</h3>
             <div style={{ backgroundColor: "#1e1b4b", padding: "16px", borderRadius: "12px", border: `1px solid ${theme.purple}` }}>
               {announcements.length > 0 ? (
                 <>
                   <p style={{ fontSize: "12px", fontWeight: "bold", color: theme.accent }}>{announcements[0].title}</p>
                   <p style={{ fontSize: "11px", color: theme.textMuted, marginTop: "4px" }}>{announcements[0].content}</p>
                 </>
               ) : (
                 <p style={{ fontSize: "11px", color: theme.textMuted }}>No announcements at this time.</p>
               )}
             </div>
          </div>

          {/* QUICK LINKS */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><LinkIcon size={16} color={theme.textMuted} /> Quick Links</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
               <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}><Calendar size={18} color={theme.blue} /><span style={{ fontSize: "9px", fontWeight: "bold" }}>Events</span></div>
               <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}><ShieldCheck size={18} color={theme.green} /><span style={{ fontSize: "9px", fontWeight: "bold" }}>Projects</span></div>
               <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}><Briefcase size={18} color={theme.accent} /><span style={{ fontSize: "9px", fontWeight: "bold" }}>Careers</span></div>
               <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}><FileText size={18} color={theme.purple} /><span style={{ fontSize: "9px", fontWeight: "bold" }}>Documents</span></div>
               <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}><Lock size={18} color={theme.red} /><span style={{ fontSize: "9px", fontWeight: "bold" }}>Settings</span></div>
               <div style={{ backgroundColor: theme.card, padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}><MessageCircle size={18} color={theme.textMuted} /><span style={{ fontSize: "9px", fontWeight: "bold" }}>Support</span></div>
            </div>
          </div>

        </main>

        {/* BOTTOM NAVIGATION */}
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#0a101d", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
          <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted }}><Home size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Home</span></div>
          <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted }}><Wallet size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Savings</span></div>
          <div onClick={() => setActiveTab("loans")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "loans" ? theme.accent : theme.textMuted }}><Briefcase size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Loans</span></div>
          <div onClick={() => setActiveTab("activity")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "activity" ? theme.accent : theme.textMuted }}><ArrowRightLeft size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>Activity</span></div>
          <div onClick={() => setActiveTab("more")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "more" ? theme.accent : theme.textMuted }}><Menu size={22} /><span style={{ fontSize: "10px", fontWeight: "600" }}>More</span></div>
        </nav>
      </div>
    );
  }

  // ==========================================
  // ADMIN / EXECUTIVE DASHBOARD (Untouched)
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
