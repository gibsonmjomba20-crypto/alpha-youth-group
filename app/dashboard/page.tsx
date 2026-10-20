"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, GraduationCap, CalendarDays, HandCoins, Banknote } from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444" }
};

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [savings, setSavings] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  // Admin State
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [appSettings, setAppSettings] = useState({ paybill_number: "", paybill_account: "" });
  const [settingsMsg, setSettingsMsg] = useState("");

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [adminTab, setAdminTab] = useState("overview");
  
  const theme = THEMES.navy;
  const router = useRouter();

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) setProfile(profileData);

    const { data: p } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (p) setPayments(p);

    const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
    if (s) setSavings(s.total_savings);

    const { data: l } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (l) setLoans(l);

    const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3);
    if (ann) setAnnouncements(ann);

    if (profileData && profileData.role !== 'member') {
      const { data: pendingP } = await supabase.from("payments").select(`*, profiles:user_id (full_name)`).eq("status", "pending").eq("is_registration_fee", true);
      if (pendingP) setAllPayments(pendingP);
      
      const { data: settingsData } = await supabase.from("app_settings").select("*").single();
      if (settingsData) setAppSettings(settingsData);
    }

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const handleVerifyPayment = async (id: string, uid: string) => {
    const code = `AYG-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from("payments").update({ status: "verified" }).eq("id", id);
    await supabase.from("profiles").update({ membership_status: "active", member_code: code }).eq("id", uid);
    alert(`Approved! Member Code: ${code}.`); fetchDashboardData();
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg("Saving...");
    await supabase.from("app_settings").update({ 
      paybill_number: appSettings.paybill_number, 
      paybill_account: appSettings.paybill_account 
    }).eq("id", 1);
    setSettingsMsg("Paybill details updated successfully!");
    setTimeout(() => setSettingsMsg(""), 3000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>LOADING...</div>;

  // PENDING APPROVAL GATE
  if (profile.membership_status !== 'active' && profile.role === 'member') {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
        <Clock size={48} color={theme.accent} style={{ marginBottom: "20px" }} />
        <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px" }}>Application Pending</h2>
        <p style={{ color: theme.textMuted, fontSize: "14px", maxWidth: "400px", marginBottom: "24px", lineHeight: "1.6" }}>
          Your KES 1,000 payment is under review. <br/><br/>Call <strong>0704785116</strong> to verify your M-Pesa code. Once verified, the Admin will approve your account.
        </p>
        <a href="tel:0704785116" style={{ padding: "14px 24px", backgroundColor: theme.green, color: "#000", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}><Phone size={18} /> Call Support</a>
        <button onClick={handleLogout} style={{ marginTop: "24px", background: "transparent", border: "none", color: theme.textMuted, textDecoration: "underline", cursor: "pointer" }}>Logout</button>
      </div>
    );
  }

  // ==========================================
  // ADMIN / TREASURER PORTAL
  // ==========================================
  if (profile.role !== 'member') {
    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", minHeight: "100vh" }}>
        <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "20px" }}>
            <div><h1 style={{ fontSize: "32px", fontWeight: "800", color: theme.accent }}>EXECUTIVE PORTAL</h1><p style={{ color: theme.textMuted }}>Role: {profile.role.replace('_', ' ').toUpperCase()}</p></div>
            <button onClick={handleLogout} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid #EF4444", fontWeight: "700", cursor: "pointer" }}>LOGOUT</button>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "30px" }}>
            <button onClick={() => setAdminTab("approvals")} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: adminTab === "approvals" ? theme.accent : theme.card, color: adminTab === "approvals" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer" }}>Registration Approvals</button>
            
            {/* TREASURER SETTINGS TAB */}
            {(profile.role === 'treasurer' || profile.role === 'admin') && (
              <button onClick={() => setAdminTab("settings")} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: adminTab === "settings" ? theme.accent : theme.card, color: adminTab === "settings" ? "#000" : theme.text, fontWeight: "bold", border: "none", cursor: "pointer" }}>Paybill Settings</button>
            )}
          </div>

          {adminTab === "approvals" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>Pending Registrations (KES 1000)</h3>
              {allPayments.length === 0 ? <p style={{ color: theme.textMuted }}>No pending registrations.</p> : allPayments.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, padding: "12px 0" }}>
                  <div>
                    <p style={{ fontWeight: "bold" }}>{p.profiles?.full_name}</p>
                    <p style={{ fontSize: "12px", color: theme.textMuted }}>M-Pesa Code: <span style={{ color: theme.accent, fontWeight: "bold" }}>{p.mpesa_code}</span> | Amount: KES {p.amount}</p>
                  </div>
                  <button onClick={() => handleVerifyPayment(p.id, p.user_id)} style={{ backgroundColor: "#10B981", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>APPROVE MEMBER</button>
                </div>
              ))}
            </div>
          )}

          {/* TREASURER SETTINGS FORM */}
          {adminTab === "settings" && (
            <div style={{ backgroundColor: theme.card, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
              <h3 style={{ marginBottom: "16px", color: theme.accent }}>Update Paybill Instructions</h3>
              <p style={{ color: theme.textMuted, fontSize: "12px", marginBottom: "16px" }}>Whatever you put here will appear on the Registration page for members to see.</p>
              
              {settingsMsg && <p style={{ color: "#10B981", marginBottom: "12px" }}>{settingsMsg}</p>}
              
              <form onSubmit={handleUpdateSettings} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px" }}>
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Business Paybill Number</label>
                <input type="text" required value={appSettings.paybill_number} onChange={e => setAppSettings({...appSettings, paybill_number: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                
                <label style={{ fontSize: "12px", color: theme.textMuted }}>Account Number Instruction</label>
                <input type="text" required value={appSettings.paybill_account} onChange={e => setAppSettings({...appSettings, paybill_account: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white" }} />
                
                <button type="submit" style={{ padding: "12px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", marginTop: "12px" }}>SAVE SETTINGS</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // MEMBER DASHBOARD (Simplified for this update)
  // ==========================================
  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "800", color: theme.accent }}>Welcome, {profile.full_name.split(' ')[0]}</h2>
      <p style={{ color: theme.textMuted, fontSize: "12px" }}>Code: {profile.member_code}</p>
      
      <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", marginTop: "20px" }}>
        <h3>Total Savings: KES {savings}</h3>
      </div>
      
      <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px", width: "100%", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "none", borderRadius: "8px" }}>Logout</button>
    </div>
  );
}
