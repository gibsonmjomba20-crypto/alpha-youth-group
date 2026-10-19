"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Home, ArrowRightLeft, Briefcase, User, Wallet, TrendingUp, FileText, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "rgba(30, 41, 59, 0.7)", border: "rgba(255, 255, 255, 0.1)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", gradient: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", purple: "#9333EA" },
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
  
  // Navigation State for Member Dashboard
  const [activeTab, setActiveTab] = useState("home");

  // Admin State
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", location: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
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

    const { data: announcementsData } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3);
    if (announcementsData) setAnnouncements(announcementsData);

    const { data: loansData } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (loansData) setLoans(loansData);

    // ADMIN ONLY DATA
    if (profileData && profileData.role !== 'member') {
      const { data: pendingP } = await supabase.from("payments").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingP) setAllPayments(pendingP);
      const { data: pendingL } = await supabase.from("loans").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pendingL) setAllLoans(pendingL);
    }

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING PORTAL...</div>;

  const isLeader = profile.role !== 'member';
  const loanLimit = savings * 3;
  
  // ==========================================
  // MEMBER DASHBOARD UI (From your screenshot)
  // ==========================================
  if (!isLeader) {
    const glassCard = { backgroundColor: theme.card, backdropFilter: "blur(16px)", padding: "20px", borderRadius: "20px", border: `1px solid ${theme.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" };
    
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px" }}>
        
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
            <Bell size={24} color={theme.text} />
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>
              {profile.full_name.charAt(0)}
            </div>
          </div>
        </header>

        <main style={{ padding: "20px" }}>
          
          {/* WELCOME BANNER */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: theme.textMuted, fontSize: "14px" }}>Welcome back,</p>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: theme.accent }}>{profile.full_name.split(' ')[0]}</h2>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: theme.purple, padding: "6px 12px", borderRadius: "20px", marginTop: "8px", border: `1px solid ${theme.accent}` }}>
              <ShieldCheck size={14} color={theme.accent} />
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>{profile.membership_status.toUpperCase()}</span>
            </div>
            <p style={{ color: theme.textMuted, fontSize: "12px", marginTop: "12px", lineHeight: "1.5" }}>Together we grow, support one another, and build a brighter future.</p>
          </div>

          {/* ACCOUNT CARDS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            
            <div style={glassCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ padding: "8px", backgroundColor: "rgba(16, 185, 129, 0.2)", borderRadius: "10px" }}><Wallet size={20} color="#10B981" /></div>
                <p style={{ fontSize: "12px", color: theme.textMuted }}>Total Savings</p>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.accent }}>KES {savings}</h3>
            </div>

            <div style={glassCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ padding: "8px", backgroundColor: "rgba(147, 51, 234, 0.2)", borderRadius: "10px" }}><TrendingUp size={20} color={theme.purple} /></div>
                <p style={{ fontSize: "12px", color: theme.textMuted }}>My Shares</p>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>{shares}</h3>
            </div>

            <div style={glassCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ padding: "8px", backgroundColor: "rgba(59, 130, 246, 0.2)", borderRadius: "10px" }}><Briefcase size={20} color="#3B82F6" /></div>
                <p style={{ fontSize: "12px", color: theme.textMuted }}>Loan Limit</p>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>KES {loanLimit}</h3>
            </div>

            <div style={glassCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ padding: "8px", backgroundColor: "rgba(239, 68, 68, 0.2)", borderRadius: "10px" }}><ArrowRightLeft size={20} color="#EF4444" /></div>
                <p style={{ fontSize: "12px", color: theme.textMuted }}>Transactions</p>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>{payments.length}</h3>
            </div>

          </div>

          {/* QUICK ACTIONS */}
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            <Link href="/dashboard/payment" style={{ textDecoration: "none" }}>
              <div style={{ ...glassCard, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", gap: "8px", cursor: "pointer" }}>
                <Wallet size={24} color={theme.accent} />
                <span style={{ fontSize: "11px", fontWeight: "600", textAlign: "center" }}>Add Savings</span>
              </div>
            </Link>
            <div onClick={() => setActiveTab("loans")} style={{ ...glassCard, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", gap: "8px", cursor: "pointer" }}>
              <Briefcase size={24} color={theme.purple} />
              <span style={{ fontSize: "11px", fontWeight: "600", textAlign: "center" }}>View Loans</span>
            </div>
            <div onClick={() => setActiveTab("activity")} style={{ ...glassCard, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", gap: "8px", cursor: "pointer" }}>
              <FileText size={24} color="#3B82F6" />
              <span style={{ fontSize: "11px", fontWeight: "600", textAlign: "center" }}>Transactions</span>
            </div>
          </div>

          {/* RECENT ACTIVITY PREVIEW */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Recent Activity</h3>
            <button onClick={() => setActiveTab("activity")} style={{ background: "transparent", border: "none", color: theme.accent, fontSize: "12px", fontWeight: "bold" }}>View All</button>
          </div>
          
          <div style={{ ...glassCard, textAlign: "center", padding: "40px 20px" }}>
            {payments.length === 0 ? (
              <>
                <FileText size={40} color={theme.textMuted} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
                <p style={{ fontWeight: "bold", marginBottom: "4px" }}>No transactions yet</p>
                <p style={{ fontSize: "12px", color: theme.textMuted }}>Your recent activity will appear here once you make a transaction.</p>
              </>
            ) : (
              payments.slice(0, 3).map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px", marginBottom: "12px" }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "14px", fontWeight: "bold" }}>{p.mpesa_code}</p>
                    <p style={{ fontSize: "10px", color: theme.textMuted }}>{p.payment_date}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "14px", fontWeight: "bold", color: "#10B981" }}>+ KES {p.amount}</p>
                    <p style={{ fontSize: "10px", color: theme.accent }}>{p.status.toUpperCase()}</p>
                  </div>
                </div>
              ))
            )}
          </div>

        </main>

        {/* BOTTOM NAVIGATION */}
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(20px)", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 1000 }}>
          <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted, cursor: "pointer" }}>
            <Home size={20} />
            <span style={{ fontSize: "10px", fontWeight: "600" }}>Home</span>
          </div>
          <div onClick={() => setActiveTab("activity")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "activity" ? theme.accent : theme.textMuted, cursor: "pointer" }}>
            <ArrowRightLeft size={20} />
            <span style={{ fontSize: "10px", fontWeight: "600" }}>Transactions</span>
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
  // ADMIN / EXECUTIVE DASHBOARD (Kept as is)
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
           {/* Admin Payment Verification */}
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

           {/* Admin Loan Approval */}
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
