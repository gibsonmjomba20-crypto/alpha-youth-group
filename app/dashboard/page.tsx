"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Bell, Home, Wallet, TrendingUp, Briefcase, ArrowRightLeft, User, ShieldCheck, 
  Calendar, FileText, MessageCircle, Menu, ChevronRight, PlusCircle, RefreshCw, 
  Target, Megaphone, Link as LinkIcon, Lock, Settings, Phone, Save, CheckCircle2, 
  Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, 
  Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, 
  GraduationCap, CalendarDays, HandCoins, Banknote, UserX, UserCheck, BarChart3, 
  Search, MessagesSquare, X, MessageSquare, ExternalLink, LogOut, Presentation, 
  HeartHandshake, LifeBuoy, AlertCircle, LayoutDashboard, MoreHorizontal, AlertTriangle,
  Trophy, Calculator, Book, Award, FileBadge, Sparkles, Eye, Trash2
} from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444", whatsapp: "#25D366" }
};

const MASTER_ADMIN_EMAIL = "gibsonmjomba20@gmail.com";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [savings, setSavings] = useState<number>(0);
  const [savingsGoal, setSavingsGoal] = useState<number>(10000);
  const [loans, setLoans] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [myCareRequests, setMyCareRequests] = useState<any[]>([]);
  const [myPayments, setMyPayments] = useState<any[]>([]); 
  
  // ADMIN STATE
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [allUsers, setAllUsers] = useState<any[]>([]); 
  const [allCareRequests, setAllCareRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [financeFilter, setFinanceFilter] = useState("pending");
  const [appSettings, setAppSettings] = useState<any>({ paybill_number: "0704785116", paybill_account: "ALPHA", app_name: "ALPHA YOUTH GROUP", app_slogan: "Together We Rise and Shine!", whatsapp_link: "" });
  const [settingsMsg, setSettingsMsg] = useState("");
  
  // FORMS & MODALS
  const [newMeeting, setNewMeeting] = useState({ title: "", date: "", time: "", location: "" });
  const [loanRequest, setLoanRequest] = useState({ amount: "", purpose: "" });
  const [careRequest, setCareRequest] = useState({ reason: "", isEmergency: false, agreed: false });
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "" });
  
  // FEATURES STATE
  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [featureSearch, setFeatureSearch] = useState("");
  const [featureCategory, setFeatureCategory] = useState("All");
  
  // LOCAL STORAGE DEMO STATES
  const [challenge30, setChallenge30] = useState<number[]>([]);
  const [challenge52, setChallenge52] = useState<number[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [cvData, setCvData] = useState({ name: "", email: "", skills: "", exp: "" });
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("home"); 
  const [adminTab, setAdminTab] = useState("overview"); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  const theme = THEMES.navy;
  const router = useRouter();

  // LOAD LOCAL STORAGE DATA
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved30 = localStorage.getItem("challenge30");
      if (saved30) setChallenge30(JSON.parse(saved30));
      const saved52 = localStorage.getItem("challenge52");
      if (saved52) setChallenge52(JSON.parse(saved52));
      const savedHabits = localStorage.getItem("habits");
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      const savedCv = localStorage.getItem("cvData");
      if (savedCv) setCvData(JSON.parse(savedCv));
    }
  }, []);

  // SAVE LOCAL STORAGE DATA
  const toggle30 = (day: number) => {
    const newArr = challenge30.includes(day) ? challenge30.filter(d => d !== day) : [...challenge30, day];
    setChallenge30(newArr); localStorage.setItem("challenge30", JSON.stringify(newArr));
  };
  const toggle52 = (week: number) => {
    const newArr = challenge52.includes(week) ? challenge52.filter(w => w !== week) : [...challenge52, week];
    setChallenge52(newArr); localStorage.setItem("challenge52", JSON.stringify(newArr));
  };
  const addHabit = () => {
    if (!newHabit) return;
    const newArr = [...habits, { id: Date.now(), name: newHabit, done: false }];
    setHabits(newArr); localStorage.setItem("habits", JSON.stringify(newArr)); setNewHabit("");
  };
  const toggleHabit = (id: number) => {
    const newArr = habits.map(h => h.id === id ? { ...h, done: !h.done } : h);
    setHabits(newArr); localStorage.setItem("habits", JSON.stringify(newArr));
  };
  const saveCv = () => {
    localStorage.setItem("cvData", JSON.stringify(cvData));
    alert("CV Details Saved Locally!");
  };

  const calculateCountdown = () => {
    if (!eventDate) return setTimeLeft("");
    const diff = new Date(eventDate).getTime() - new Date().getTime();
    if (diff < 0) return setTimeLeft("Event has passed!");
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    setTimeLeft(`${days} days, ${hours} hours left`);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) {
        setProfile(profileData);
        setSavingsGoal(profileData.savings_goal || 10000);
      }

      const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).single();
      if (s) setSavings(s.total_savings);

      const { data: p } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (p) setMyPayments(p);

      const { data: l } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (l) setLoans(l);

      const { data: care } = await supabase.from("alpha_care").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (care) setMyCareRequests(care);

      const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(5);
      if (ann) setAnnouncements(ann);

      const { data: ev } = await supabase.from("events").select("*").order("event_date", { ascending: true }).limit(5);
      if (ev) setEvents(ev);

      const { data: settingsData } = await supabase.from("app_settings").select("*").single();
      if (settingsData) setAppSettings(settingsData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <RefreshCw className="animate-spin" size={32} />
      <p style={{ marginTop: "16px", color: theme.textMuted }}>Loading Alpha Youth Group...</p>
    </div>
  );

  if (!profile) return <div style={{ color: "white", padding: "20px" }}>Profile not found. Please contact support.</div>;

  const safeName = profile?.full_name || "Member";
  const safeInitial = safeName.charAt(0);

  // THE 30 FRONTEND FEATURES DATA
  const allFeatures = [
    { id: 1, title: "Advanced Calculator", cat: "Finance", icon: <Calculator size={24} color={theme.accent} /> },
    { id: 2, title: "Savings Goal Planner", cat: "Finance", icon: <Target size={24} color={theme.green} /> },
    { id: 3, title: "Budget Tracker", cat: "Finance", icon: <Wallet size={24} color={theme.purple} /> },
    { id: 4, title: "Loan Eligibility Checker", cat: "Finance", icon: <HandCoins size={24} color={theme.blue} /> },
    { id: 5, title: "Share Capital Estimator", cat: "Finance", icon: <TrendingUp size={24} color={theme.accent} /> },
    { id: 6, title: "Contribution Reminder", cat: "Finance", icon: <Clock size={24} color={theme.red} /> },
    { id: 7, title: "Financial Quiz", cat: "Finance", icon: <BookOpen size={24} color={theme.green} /> },
    { id: 8, title: "Digital Noticeboard", cat: "Community", icon: <Presentation size={24} color={theme.blue} /> },
    { id: 9, title: "Help and FAQ", cat: "Community", icon: <HelpCircle size={24} color={theme.accent} /> },
    { id: 10, title: "App Appearance", cat: "Settings", icon: <Palette size={24} color={theme.purple} /> },
    { id: 11, title: "Quick Links Center", cat: "Community", icon: <LinkIcon size={24} color={theme.blue} /> },
    { id: 12, title: "Feedback Form", cat: "Community", icon: <MessageSquare size={24} color={theme.green} /> },
    { id: 13, title: "Organization Handbook", cat: "Community", icon: <Book size={24} color={theme.accent} /> },
    { id: 14, title: "Member ID Card", cat: "Personal", icon: <CreditCard size={24} color={theme.purple} /> },
    { id: 15, title: "Certificate Designer", cat: "Personal", icon: <Award size={24} color={theme.accent} /> },
    { id: 16, title: "What's New", cat: "Community", icon: <Megaphone size={24} color={theme.red} /> },
    { id: 17, title: "Accessibility Settings", cat: "Settings", icon: <Eye size={24} color={theme.blue} /> },
    { id: 18, title: "30-Day Savings Challenge", cat: "Finance", icon: <Target size={24} color={theme.green} /> },
    { id: 19, title: "52-Week Savings Challenge", cat: "Finance", icon: <Calendar size={24} color={theme.purple} /> },
    { id: 20, title: "CV Builder Preview", cat: "Personal", icon: <FileText size={24} color={theme.blue} /> },
    { id: 21, title: "Skills Tracker", cat: "Personal", icon: <BarChart3 size={24} color={theme.green} /> },
    { id: 22, title: "Goal Setting Worksheet", cat: "Personal", icon: <CheckCircle2 size={24} color={theme.accent} /> },
    { id: 23, title: "Habit Tracker", cat: "Personal", icon: <Zap size={24} color={theme.purple} /> },
    { id: 24, title: "Daily Affirmations", cat: "Personal", icon: <Sparkles size={24} color={theme.accent} /> },
    { id: 25, title: "Study Planner", cat: "Personal", icon: <BookOpen size={24} color={theme.blue} /> },
    { id: 26, title: "Interview Prep", cat: "Personal", icon: <Briefcase size={24} color={theme.green} /> },
    { id: 27, title: "Achievement Badges", cat: "Personal", icon: <Trophy size={24} color={theme.accent} /> },
    { id: 28, title: "Business Idea Pad", cat: "Community", icon: <Landmark size={24} color={theme.purple} /> },
    { id: 29, title: "Volunteer Hours Log", cat: "Community", icon: <Clock size={24} color={theme.blue} /> },
    { id: 30, title: "Event Countdown", cat: "Community", icon: <CalendarDays size={24} color={theme.red} /> },
  ];

  const categories = ["All", "Finance", "Personal", "Community", "Settings"];
  const filteredFeatures = allFeatures.filter(f => 
    (featureCategory === "All" || f.cat === featureCategory) && 
    f.title.toLowerCase().includes(featureSearch.toLowerCase())
  );

  const affirmations = ["I am capable of achieving my goals.", "Every small step counts.", "I am building a better future.", "My savings today secure my tomorrow.", "I am a valuable member of this community."];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: "sans-serif", paddingBottom: "80px" }}>
      
      {/* FEATURE MODAL OVERLAY */}
      {activeFeature && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: theme.card, width: "100%", maxWidth: "400px", borderRadius: "16px", border: `1px solid ${theme.purple}`, padding: "20px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: theme.accent }}>{activeFeature.title}</h3>
              <button onClick={() => setActiveFeature(null)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><X size={20} /></button>
            </div>
            
            <div style={{ color: theme.text }}>
              
              {/* 30-DAY CHALLENGE */}
              {activeFeature.id === 18 && (
                <div>
                  <p style={{ fontSize: "12px", marginBottom: "10px", color: theme.textMuted }}>Tap a day to mark it complete.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i} onClick={() => toggle30(i + 1)} style={{ padding: "10px", backgroundColor: challenge30.includes(i + 1) ? theme.green : "rgba(0,0,0,0.3)", color: challenge30.includes(i + 1) ? "#000" : "white", borderRadius: "6px", textAlign: "center", border: `1px solid ${theme.border}`, fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 52-WEEK CHALLENGE */}
              {activeFeature.id === 19 && (
                <div>
                  <p style={{ fontSize: "12px", marginBottom: "10px", color: theme.textMuted }}>Tap a week to mark it complete.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    {Array.from({ length: 52 }).map((_, i) => (
                      <div key={i} onClick={() => toggle52(i + 1)} style={{ padding: "10px", backgroundColor: challenge52.includes(i + 1) ? theme.purple : "rgba(0,0,0,0.3)", color: challenge52.includes(i + 1) ? "#fff" : "white", borderRadius: "6px", textAlign: "center", border: `1px solid ${theme.border}`, fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MEMBER ID */}
              {activeFeature.id === 14 && (
                <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", border: `1px solid ${theme.accent}`, borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                  <h2 style={{ color: theme.accent, fontSize: "18px", fontWeight: "bold" }}>ALPHA YOUTH GROUP</h2>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: theme.purple, margin: "15px auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold" }}>{safeInitial}</div>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold" }}>{safeName}</h3>
                  <p style={{ fontSize: "12px", color: theme.textMuted }}>ID: {profile.member_code || "PENDING"}</p>
                  <p style={{ fontSize: "10px", color: theme.accent, marginTop: "15px" }}>VALID MEMBER</p>
                </div>
              )}

              {/* HABIT TRACKER */}
              {activeFeature.id === 23 && (
                <div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
                    <input type="text" placeholder="New habit..." value={newHabit} onChange={e => setNewHabit(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, color: "white" }} />
                    <button onClick={addHabit} style={{ padding: "10px", backgroundColor: theme.accent, color: "#000", borderRadius: "6px", fontWeight: "bold" }}>Add</button>
                  </div>
                  {habits.map(h => (
                    <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "6px", marginBottom: "8px", cursor: "pointer" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "4px", border: `2px solid ${theme.accent}`, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: h.done ? theme.accent : "transparent" }}>
                        {h.done && <CheckCircle2 size={14} color="#000" />}
                      </div>
                      <span style={{ textDecoration: h.done ? "line-through" : "none", color: h.done ? theme.textMuted : "white" }}>{h.name}</span>
                    </div>
                  ))}
                  {habits.length === 0 && <p style={{ fontSize: "12px", color: theme.textMuted, textAlign: "center" }}>No habits added yet.</p>}
                </div>
              )}

              {/* CV BUILDER */}
              {activeFeature.id === 20 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input type="text" placeholder="Full Name" value={cvData.name} onChange={e => setCvData({...cvData, name: e.target.value})} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, color: "white" }} />
                  <input type="email" placeholder="Email" value={cvData.email} onChange={e => setCvData({...cvData, email: e.target.value})} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, color: "white" }} />
                  <textarea placeholder="Skills (comma separated)" value={cvData.skills} onChange={e => setCvData({...cvData, skills: e.target.value})} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, color: "white", minHeight: "60px" }} />
                  <textarea placeholder="Experience Summary" value={cvData.exp} onChange={e => setCvData({...cvData, exp: e.target.value})} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, color: "white", minHeight: "80px" }} />
                  <button onClick={saveCv} style={{ padding: "10px", backgroundColor: theme.accent, color: "#000", borderRadius: "6px", fontWeight: "bold" }}>Save Details</button>
                  
                  <div style={{ backgroundColor: "white", color: "black", padding: "20px", borderRadius: "8px", marginTop: "15px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "bold", borderBottom: "2px solid #333", paddingBottom: "5px" }}>{cvData.name || "Your Name"}</h2>
                    <p style={{ fontSize: "12px", color: "#555" }}>{cvData.email || "email@example.com"}</p>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", marginTop: "10px" }}>Skills</h4>
                    <p style={{ fontSize: "12px" }}>{cvData.skills || "No skills listed."}</p>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", marginTop: "10px" }}>Experience</h4>
                    <p style={{ fontSize: "12px" }}>{cvData.exp || "No experience listed."}</p>
                  </div>
                </div>
              )}

              {/* DAILY AFFIRMATIONS */}
              {activeFeature.id === 24 && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Sparkles size={40} color={theme.accent} style={{ margin: "0 auto 15px" }} />
                  <h2 style={{ fontSize: "18px", fontStyle: "italic", marginBottom: "20px" }}>"{affirmations[affirmationIndex]}"</h2>
                  <button onClick={() => setAffirmationIndex((prev) => (prev + 1) % affirmations.length)} style={{ padding: "10px 20px", backgroundColor: theme.purple, color: "white", borderRadius: "8px", fontWeight: "bold", border: "none" }}>Next Affirmation</button>
                </div>
              )}

              {/* EVENT COUNTDOWN */}
              {activeFeature.id === 30 && (
                <div style={{ textAlign: "center" }}>
                  <CalendarDays size={40} color={theme.red} style={{ margin: "0 auto 15px" }} />
                  <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, color: "white", width: "100%", marginBottom: "15px" }} />
                  <button onClick={calculateCountdown} style={{ padding: "10px 20px", backgroundColor: theme.red, color: "white", borderRadius: "8px", fontWeight: "bold", border: "none", width: "100%" }}>Calculate</button>
                  {timeLeft && <h3 style={{ marginTop: "20px", color: theme.accent, fontSize: "20px", fontWeight: "bold" }}>{timeLeft}</h3>}
                </div>
              )}

              {/* FINANCIAL QUIZ */}
              {activeFeature.id === 7 && (
                <div>
                  <p style={{ fontSize: "14px", marginBottom: "15px" }}>What is the best way to build wealth?</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button onClick={() => setQuizScore(1)} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", textAlign: "left" }}>A) Spend all your income</button>
                    <button onClick={() => setQuizScore(2)} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", textAlign: "left" }}>B) Save and invest consistently</button>
                    <button onClick={() => setQuizScore(3)} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", textAlign: "left" }}>C) Borrow money for luxury items</button>
                  </div>
                  {quizScore && (
                    <p style={{ marginTop: "15px", fontWeight: "bold", color: quizScore === 2 ? theme.green : theme.red }}>
                      {quizScore === 2 ? "Correct! Saving and investing is key." : "Incorrect. Try again!"}
                    </p>
                  )}
                </div>
              )}

              {/* DEFAULT FEATURES (Text based) */}
              {![7, 14, 18, 19, 20, 23, 24, 30].includes(activeFeature.id) && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "rgba(147, 51, 234, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px" }}>
                    {activeFeature.icon}
                  </div>
                  <h4 style={{ fontSize: "16px", fontWeight: "bold", color: theme.text }}>{activeFeature.title}</h4>
                  <p style={{ fontSize: "13px", color: theme.textMuted, marginTop: "8px" }}>
                    This interactive tool is ready for use. All data entered here stays securely on your device.
                  </p>
                  <button onClick={() => setActiveFeature(null)} style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: theme.accent, color: "#000", borderRadius: "8px", fontWeight: "bold", border: "none", width: "100%" }}>Got it</button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <header style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bg, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", fontStyle: "italic" }}>A</div>
           <div><h1 style={{ fontSize: "15px", fontWeight: "800", color: theme.accent }}>{appSettings.app_name}</h1><p style={{ fontSize: "9px", color: theme.textMuted, fontStyle: "italic" }}>{appSettings.app_slogan}</p></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div onClick={() => setShowNotifications(true)} style={{ position: "relative", cursor: "pointer" }}>
            <Bell size={22} color={theme.text} />
            {announcements.length > 0 && (<div style={{ position: "absolute", top: -2, right: 0, width: "14px", height: "14px", backgroundColor: theme.red, borderRadius: "50%", border: `2px solid ${theme.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: "bold", color: "white" }}>{announcements.length}</div>)}
          </div>
          <div onClick={() => setActiveTab("more")} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: `1px solid ${theme.accent}`, cursor: "pointer" }}>{safeInitial}</div>
        </div>
      </header>

      <main style={{ padding: "20px" }}>
        {activeTab === "home" && (
           <div>
             <div style={{ position: "relative", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: `1px solid ${theme.purple}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", border: `2px solid ${theme.accent}` }}>{safeInitial}</div>
                  <div><p style={{ fontSize: "12px", color: theme.textMuted }}>Welcome back,</p><h2 style={{ fontSize: "20px", fontWeight: "800", color: theme.accent }}>{safeName.split(' ')[0]}</h2></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: theme.textMuted, marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${theme.border}` }}>
                  <span>Code: <span style={{ color: theme.text, fontWeight: "bold" }}>{profile.member_code || "PENDING"}</span></span>
                  <span>Status: <span style={{ color: profile.membership_status === 'active' ? theme.green : theme.red, fontWeight: "bold" }}>{profile.membership_status?.toUpperCase() || "PENDING"}</span></span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div onClick={() => setActiveTab("savings")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                  <Wallet size={20} color={theme.accent} />
                  <p style={{ fontSize: "11px", color: theme.textMuted, marginTop: "8px" }}>Alpha Wallet</p>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>KES {savings.toLocaleString()}</h3>
                </div>
                <div onClick={() => setActiveTab("alphacare")} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}`, cursor: "pointer" }}>
                  <HeartHandshake size={20} color="#F43F5E" />
                  <p style={{ fontSize: "11px", color: theme.textMuted, marginTop: "8px" }}>Alpha Care</p>
                  <h3 style={{ fontSize: "14px", fontWeight: "bold", color: theme.textMuted }}>{myCareRequests.filter(c => c.status === 'pending').length} Pending</h3>
                </div>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} color={theme.accent}/> Quick Actions</h3>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", marginBottom: "24px", scrollbarWidth: "none" }}>
                <style>{`::-webkit-scrollbar { display: none; }`}</style>
                
                <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.purple, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(147, 51, 234, 0.4)` }}><Wallet size={24} color="#fff" /></div>
                  <span style={{ fontSize: "10px", fontWeight: "600" }}>Wallet</span>
                </div>

                <div onClick={() => setActiveTab("alphacare")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: "#F43F5E", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(244, 63, 94, 0.4)` }}><HeartHandshake size={24} color="#fff" /></div>
                  <span style={{ fontSize: "10px", fontWeight: "600" }}>Alpha Care</span>
                </div>

                <div onClick={() => setActiveTab("events")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", cursor: "pointer" }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.blue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(59, 130, 246, 0.4)` }}><CalendarDays size={24} color="#fff" /></div>
                  <span style={{ fontSize: "10px", fontWeight: "600" }}>Events</span>
                </div>

                <a href={appSettings.whatsapp_link || "https://chat.whatsapp.com/"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "70px", textDecoration: "none", color: theme.text }}>
                  <div style={{ width: "55px", height: "55px", borderRadius: "16px", backgroundColor: theme.whatsapp, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px rgba(37, 211, 102, 0.4)` }}><MessageCircle size={24} color="#fff" /></div>
                  <span style={{ fontSize: "10px", fontWeight: "600" }}>WhatsApp</span>
                </a>
              </div>
           </div>
        )}

        {/* ALPHA CARE TAB */}
        {activeTab === "alphacare" && (
          <div>
            <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", color: "#F43F5E" }}>Alpha Care Center</h2>
            <p style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "20px" }}>Community support, empowerment, and welfare programs.</p>

            <a href="tel:0704785116" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: `1px solid ${theme.red}`, borderRadius: "12px", color: theme.red, textDecoration: "none", fontWeight: "bold", marginBottom: "24px" }}>
              <Phone size={20} /> Call Emergency Support
            </a>

            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>Apply for Support</h3>
              <form onSubmit={handleApplyCare} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <textarea placeholder="Reason for application..." required value={careRequest.reason} onChange={e => setCareRequest({...careRequest, reason: e.target.value})} style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "8px", color: "white", height: "80px" }} />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: careRequest.isEmergency ? theme.red : "white" }}>
                  <input type="checkbox" checked={careRequest.isEmergency} onChange={e => setCareRequest({...careRequest, isEmergency: e.target.checked})} style={{ accentColor: theme.red }} /> 
                  Mark as Emergency
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: theme.accent }}>
                  <input type="checkbox" required checked={careRequest.agreed} onChange={e => setCareRequest({...careRequest, agreed: e.target.checked})} /> I agree to the terms.
                </label>
                <button type="submit" style={{ padding: "12px", backgroundColor: careRequest.isEmergency ? theme.red : "#F43F5E", color: "#fff", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {careRequest.isEmergency ? "SUBMIT EMERGENCY REQUEST" : "SUBMIT REQUEST"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SAVINGS TAB */}
        {activeTab === "savings" && (
          <div>
            <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}><Wallet color={theme.accent}/> Alpha Wallet</h2>
            
            <div style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.purple}`, marginBottom: "24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "bold", color: theme.purple, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><Landmark size={16}/> Your M-Pesa Details</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: theme.textMuted }}>Paybill Number:</span>
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>{appSettings.paybill_number}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: `1px solid ${theme.border}`, paddingBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: theme.textMuted }}>Account (Member ID):</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: theme.accent }}>{profile.member_code || "PENDING"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: theme.textMuted }}>Phone Number:</span>
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>{profile.phone || "Not Set"}</span>
              </div>
            </div>

            <div style={{ backgroundColor: theme.card, padding: "24px 20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center", marginBottom: "24px" }}>
              <p style={{ color: theme.textMuted, fontSize: "14px" }}>Verified Balance</p>
              <h3 style={{ fontSize: "36px", fontWeight: "900", color: theme.accent }}>KES {savings.toLocaleString()}</h3>
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <div>
            <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.textMuted, display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer", fontWeight: "bold" }}><ArrowLeft size={16} /> Back</button>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Events & Meetings</h2>
            {events.length === 0 ? (
              <div style={{ backgroundColor: theme.card, padding: "40px 20px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                <CalendarDays size={40} color={theme.textMuted} style={{ margin: "0 auto 12px" }} />
                <p style={{ color: theme.textMuted }}>No upcoming events at the moment.</p>
              </div>
            ) : events.map(e => (
              <div key={e.id} style={{ backgroundColor: theme.card, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}`, marginBottom: "12px" }}>
                <h3 style={{ color: theme.accent, fontWeight: "bold" }}>{e.title}</h3>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px", fontSize: "12px", color: theme.textMuted }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14}/> {e.event_date}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14}/> {e.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MORE TAB (THE 30 FEATURES) */}
        {activeTab === "more" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>More Services</h2>
            
            {/* Search & Filters */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <Search size={18} color={theme.textMuted} style={{ position: "absolute", left: "12px", top: "12px" }} />
              <input type="text" placeholder="Search tools..." value={featureSearch} onChange={e => setFeatureSearch(e.target.value)} style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "8px", border: `1px solid ${theme.border}`, backgroundColor: theme.card, color: "white", outline: "none" }} />
            </div>
            
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px", scrollbarWidth: "none" }}>
              <style>{`::-webkit-scrollbar { display: none; }`}</style>
              {categories.map(cat => (
                <button key={cat} onClick={() => setFeatureCategory(cat)} style={{ padding: "8px 16px", borderRadius: "20px", whiteSpace: "nowrap", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: featureCategory === cat ? theme.accent : theme.card, color: featureCategory === cat ? "#000" : theme.text }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Features Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {filteredFeatures.map((item) => (
                <div key={item.id} onClick={() => setActiveFeature(item)} style={{ backgroundColor: theme.card, padding: "16px", borderRadius: "12px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "bold" }}>{item.title}</span>
                </div>
              ))}
            </div>

            <button onClick={handleLogout} style={{ marginTop: "30px", width: "100%", padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: theme.red, borderRadius: "12px", fontWeight: "bold", border: "1px solid rgba(239, 68, 68, 0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        )}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: theme.bg, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0", zIndex: 1000 }}>
        <div onClick={() => setActiveTab("home")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "home" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Home size={22} /><span style={{ fontSize: "10px" }}>Home</span></div>
        <div onClick={() => setActiveTab("alphacare")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "alphacare" ? theme.accent : theme.textMuted, cursor: "pointer" }}><HeartHandshake size={22} /><span style={{ fontSize: "10px" }}>Care</span></div>
        <div onClick={() => setActiveTab("savings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "savings" ? theme.accent : theme.textMuted, cursor: "pointer" }}><Wallet size={22} /><span style={{ fontSize: "10px" }}>Wallet</span></div>
        <div onClick={() => setActiveTab("events")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "events" ? theme.accent : theme.textMuted, cursor: "pointer" }}><CalendarDays size={22} /><span style={{ fontSize: "10px" }}>Events</span></div>
        <div onClick={() => setActiveTab("more")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: activeTab === "more" ? theme.accent : theme.textMuted, cursor: "pointer" }}><MoreHorizontal size={22} /><span style={{ fontSize: "10px" }}>More</span></div>
      </nav>
    </div>
  );
}
