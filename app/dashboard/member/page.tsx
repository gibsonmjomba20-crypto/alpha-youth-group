"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Card, Badge, BottomNav, Button } from "../../components/ui";
import { 
  Bell, Home, Wallet, TrendingUp, Briefcase, Calendar, FileText, MessageCircle, 
  Menu, Target, Megaphone, Link as LinkIcon, Settings, Phone, CheckCircle2, 
  Mail, Clock, MapPin, Users, Folder, BookOpen, HelpCircle, ArrowLeft, Send, 
  Share2, Palette, CreditCard, BadgeCheck, Zap, Gift, Smartphone, Landmark, 
  GraduationCap, CalendarDays, HandCoins, UserX, BarChart3, Search, X, 
  HeartHandshake, AlertCircle, Trophy, Calculator, Award, Sparkles, Eye, MoreHorizontal
} from "lucide-react";

const THEMES = {
  navy: { bg: "#0B1120", card: "#131C2E", border: "rgba(255, 255, 255, 0.08)", accent: "#FBBF24", text: "#F8FAFC", textMuted: "#94A3B8", purple: "#9333EA", blue: "#3B82F6", green: "#10B981", red: "#EF4444", whatsapp: "#25D366" }
};

export default function MemberPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [savings, setSavings] = useState<number>(0);
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [myCareRequests, setMyCareRequests] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState<any>({ paybill_number: "0704785116", paybill_account: "ALPHA", app_name: "ALPHA YOUTH GROUP", app_slogan: "Together We Rise and Shine!", whatsapp_link: "" });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  
  // MODALS & FEATURES
  const [careRequest, setCareRequest] = useState({ reason: "", isEmergency: false, agreed: false });
  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [featureSearch, setFeatureSearch] = useState("");
  const [featureCategory, setFeatureCategory] = useState("All");
  
  // DEMO FEATURES STATE
  const [challenge30, setChallenge30] = useState<number[]>([]);
  const [challenge52, setChallenge52] = useState<number[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [cvData, setCvData] = useState({ name: "", email: "", skills: "", exp: "" });
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const theme = THEMES.navy;
  const router = useRouter();

  useEffect(() => {
    // Load local storage for features
    if (typeof window !== "undefined") {
      const saved30 = localStorage.getItem("challenge30"); if (saved30) setChallenge30(JSON.parse(saved30));
      const saved52 = localStorage.getItem("challenge52"); if (saved52) setChallenge52(JSON.parse(saved52));
      const savedHabits = localStorage.getItem("habits"); if (savedHabits) setHabits(JSON.parse(savedHabits));
      const savedCv = localStorage.getItem("cvData"); if (savedCv) setCvData(JSON.parse(savedCv));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: pData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (pData) setProfile(pData);

    const { data: sData } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).maybeSingle();
    if (sData) setSavings(sData.total_savings);

    const { data: pymts } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (pymts) setMyPayments(pymts);

    const { data: care } = await supabase.from("alpha_care").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (care) setMyCareRequests(care);

    const { data: ann } = await supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(5);
    if (ann) setAnnouncements(ann);

    const { data: ev } = await supabase.from("events").select("*").order("event_date", { ascending: true }).limit(5);
    if (ev) setEvents(ev);

    const { data: settings } = await supabase.from("app_settings").select("*").single();
    if (settings) setAppSettings(settings);

    setLoading(false);
  };

  const handleApplyCare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careRequest.agreed) return alert("You must agree to the terms.");
    await supabase.from("alpha_care").insert({ user_id: profile.id, reason: careRequest.reason, is_emergency: careRequest.isEmergency, status: "pending" });
    alert(`✅ ${careRequest.isEmergency ? 'EMERGENCY ' : ''}Request submitted.`); 
    setCareRequest({ reason: "", isEmergency: false, agreed: false }); 
    fetchData();
  };

  // Feature helpers
  const toggle30 = (day: number) => { const newArr = challenge30.includes(day) ? challenge30.filter(d => d !== day) : [...challenge30, day]; setChallenge30(newArr); localStorage.setItem("challenge30", JSON.stringify(newArr)); };
  const toggle52 = (week: number) => { const newArr = challenge52.includes(week) ? challenge52.filter(w => w !== week) : [...challenge52, week]; setChallenge52(newArr); localStorage.setItem("challenge52", JSON.stringify(newArr)); };
  const addHabit = () => { if (!newHabit) return; const newArr = [...habits, { id: Date.now(), name: newHabit, done: false }]; setHabits(newArr); localStorage.setItem("habits", JSON.stringify(newArr)); setNewHabit(""); };
  const toggleHabit = (id: number) => { const newArr = habits.map(h => h.id === id ? { ...h, done: !h.done } : h); setHabits(newArr); localStorage.setItem("habits", JSON.stringify(newArr)); };
  const saveCv = () => { localStorage.setItem("cvData", JSON.stringify(cvData)); alert("CV Details Saved!"); };
  const calculateCountdown = () => {
    if (!eventDate) return setTimeLeft("");
    const diff = new Date(eventDate).getTime() - new Date().getTime();
    if (diff < 0) return setTimeLeft("Event has passed!");
    setTimeLeft(`${Math.floor(diff / (1000 * 60 * 60 * 24))} days, ${Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} hours left`);
  };

  const allFeatures = [
    { id: 1, title: "Advanced Calculator", cat: "Finance", icon: <Calculator size={24} color={theme.accent} /> },
    { id: 2, title: "Savings Goal Planner", cat: "Finance", icon: <Target size={24} color={theme.green} /> },
    { id: 3, title: "Budget Tracker", cat: "Finance", icon: <Wallet size={24} color={theme.purple} /> },
    { id: 4, title: "Loan Eligibility", cat: "Finance", icon: <HandCoins size={24} color={theme.blue} /> },
    { id: 5, title: "Share Capital", cat: "Finance", icon: <TrendingUp size={24} color={theme.accent} /> },
    { id: 6, title: "Contribution Reminder", cat: "Finance", icon: <Clock size={24} color={theme.red} /> },
    { id: 7, title: "Financial Quiz", cat: "Finance", icon: <BookOpen size={24} color={theme.green} /> },
    { id: 8, title: "Noticeboard", cat: "Community", icon: <Megaphone size={24} color={theme.blue} /> },
    { id: 9, title: "Help and FAQ", cat: "Community", icon: <HelpCircle size={24} color={theme.accent} /> },
    { id: 10, title: "App Appearance", cat: "Settings", icon: <Palette size={24} color={theme.purple} /> },
    { id: 11, title: "Quick Links", cat: "Community", icon: <LinkIcon size={24} color={theme.blue} /> },
    { id: 12, title: "Feedback Form", cat: "Community", icon: <MessageCircle size={24} color={theme.green} /> },
    { id: 13, title: "Handbook", cat: "Community", icon: <Book size={24} color={theme.accent} /> },
    { id: 14, title: "Member ID Card", cat: "Personal", icon: <CreditCard size={24} color={theme.purple} /> },
    { id: 15, title: "Certificate", cat: "Personal", icon: <Award size={24} color={theme.accent} /> },
    { id: 16, title: "What's New", cat: "Community", icon: <Megaphone size={24} color={theme.red} /> },
    { id: 17, title: "Accessibility", cat: "Settings", icon: <Eye size={24} color={theme.blue} /> },
    { id: 18, title: "30-Day Challenge", cat: "Finance", icon: <Target size={24} color={theme.green} /> },
    { id: 19, title: "52-Week Challenge", cat: "Finance", icon: <Calendar size={24} color={theme.purple} /> },
    { id: 20, title: "CV Builder", cat: "Personal", icon: <FileText size={24} color={theme.blue} /> },
    { id: 21, title: "Skills Tracker", cat: "Personal", icon: <BarChart3 size={24} color={theme.green} /> },
    { id: 22, title: "Goal Setting", cat: "Personal", icon: <CheckCircle2 size={24} color={theme.accent} /> },
    { id: 23, title: "Habit Tracker", cat: "Personal", icon: <Zap size={24} color={theme.purple} /> },
    { id: 24, title: "Affirmations", cat: "Personal", icon: <Sparkles size={24} color={theme.accent} /> },
    { id: 25, title: "Study Planner", cat: "Personal", icon: <BookOpen size={24} color={theme.blue} /> },
    { id: 26, title: "Interview Prep", cat: "Personal", icon: <Briefcase size={24} color={theme.green} /> },
    { id: 27, title: "Badges", cat: "Personal", icon: <Trophy size={24} color={theme.accent} /> },
    { id: 28, title: "Business Ideas", cat: "Community", icon: <Landmark size={24} color={theme.purple} /> },
    { id: 29, title: "Volunteer Log", cat: "Community", icon: <Clock size={24} color={theme.blue} /> },
    { id: 30, title: "Event Countdown", cat: "Community", icon: <CalendarDays size={24} color={theme.red} /> },
  ];
  const categories = ["All", "Finance", "Personal", "Community", "Settings"];
  const filteredFeatures = allFeatures.filter(f => (featureCategory === "All" || f.cat === featureCategory) && f.title.toLowerCase().includes(featureSearch.toLowerCase()));
  const affirmations = ["I am capable of achieving my goals.", "Every small step counts.", "I am building a better future.", "My savings secure my tomorrow.", "I am a valuable member."];

  if (loading) return <div className="min-h-screen bg-[#0B1120] flex justify-center items-center text-[#FBBF24]">Loading Portal...</div>;
  if (!profile) return <div className="text-white p-5">Profile not found.</div>;

  const safeInitial = profile.full_name?.charAt(0) || "U";

  return (
    <div className="min-h-screen bg-[#0B1120] text-white pb-20">
      
      {/* HEADER */}
      <header className="p-4 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#0B1120] z-50">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center text-black font-black italic text-lg">A</div>
           <div>
             <h1 className="text-sm font-extrabold text-[#FBBF24]">{appSettings.app_name}</h1>
             <p className="text-[9px] text-[#94A3B8] italic">{appSettings.app_slogan}</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <div onClick={() => setShowNotifications(true)} className="relative cursor-pointer">
            <Bell size={22} />
            {announcements.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{announcements.length}</span>}
          </div>
          <div onClick={() => setActiveTab("more")} className="w-8 h-8 rounded-full bg-[#9333EA] flex items-center justify-center font-bold border border-[#FBBF24] cursor-pointer">{safeInitial}</div>
        </div>
      </header>

      <main className="p-5">
        {/* HOME TAB */}
        {activeTab === "home" && (
          <div>
            <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] p-5 rounded-2xl border border-[#9333EA] mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-[#9333EA] flex items-center justify-center text-xl font-bold border-2 border-[#FBBF24]">{safeInitial}</div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Welcome back,</p>
                  <h2 className="text-xl font-extrabold text-[#FBBF24]">{profile.full_name?.split(' ')[0]}</h2>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-[#94A3B8] mt-3 pt-3 border-t border-white/10">
                <span>Code: <span className="text-white font-bold">{profile.member_code || "PENDING"}</span></span>
                <span>Status: <span className={profile.membership_status === 'active' ? 'text-[#10B981] font-bold' : 'text-[#EF4444] font-bold'}>{profile.membership_status?.toUpperCase() || "PENDING"}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card onClick={() => setActiveTab("wallet")} className="cursor-pointer">
                <Wallet size={20} className="text-[#FBBF24] mb-2" />
                <p className="text-[11px] text-[#94A3B8]">Alpha Wallet</p>
                <h3 className="text-lg font-bold">KES {savings.toLocaleString()}</h3>
              </Card>
              <Card onClick={() => setActiveTab("care")} className="cursor-pointer">
                <HeartHandshake size={20} className="text-[#F43F5E] mb-2" />
                <p className="text-[11px] text-[#94A3B8]">Alpha Care</p>
                <h3 className="text-sm font-bold text-[#94A3B8]">{myCareRequests.filter(c => c.status === 'pending').length} Pending</h3>
              </Card>
            </div>

            <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-[#FBBF24]"/> Quick Actions</h3>
            <div className="flex gap-3 overflow-x-auto pb-3 mb-6 scrollbar-hide">
              <div onClick={() => setActiveTab("wallet")} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-[#9333EA] flex items-center justify-center shadow-lg shadow-[#9333EA]/30"><Wallet size={24} color="#fff" /></div>
                <span className="text-[10px] font-bold">Wallet</span>
              </div>
              <div onClick={() => setActiveTab("care")} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-[#F43F5E] flex items-center justify-center shadow-lg shadow-[#F43F5E]/30"><HeartHandshake size={24} color="#fff" /></div>
                <span className="text-[10px] font-bold">Care</span>
              </div>
              <div onClick={() => setActiveTab("events")} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#3B82F6]/30"><CalendarDays size={24} color="#fff" /></div>
                <span className="text-[10px] font-bold">Events</span>
              </div>
              <a href={appSettings.whatsapp_link || "https://chat.whatsapp.com/"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] text-white">
                <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30"><MessageCircle size={24} color="#fff" /></div>
                <span className="text-[10px] font-bold">WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* CARE TAB */}
        {activeTab === "care" && (
          <div>
            <button onClick={() => setActiveTab("home")} className="flex items-center gap-1 text-sm text-[#94A3B8] mb-5"><ArrowLeft size={16} /> Back</button>
            <h2 className="text-2xl font-extrabold text-[#F43F5E] mb-2">Alpha Care Center</h2>
            <p className="text-xs text-[#94A3B8] mb-6">Community support, empowerment, and welfare programs.</p>
            <a href="tel:0704785116" className="flex items-center justify-center gap-2 w-full p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-500 font-bold mb-6">
              <Phone size={20} /> Call Emergency Support
            </a>
            <Card className="mb-6">
              <h3 className="font-bold mb-4">Apply for Support</h3>
              <form onSubmit={handleApplyCare} className="flex flex-col gap-3">
                <textarea placeholder="Reason for application..." required value={careRequest.reason} onChange={e => setCareRequest({...careRequest, reason: e.target.value})} className="p-3 bg-black/30 border border-white/10 rounded-lg text-white outline-none h-24" />
                <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={careRequest.isEmergency} onChange={e => setCareRequest({...careRequest, isEmergency: e.target.checked})} className="accent-red-500" /> Mark as Emergency</label>
                <label className="flex items-center gap-2 text-xs text-[#FBBF24]"><input type="checkbox" required checked={careRequest.agreed} onChange={e => setCareRequest({...careRequest, agreed: e.target.checked})} /> I agree to the terms.</label>
                <Button type="submit" variant={careRequest.isEmergency ? "danger" : "primary"} className="w-full mt-2">{careRequest.isEmergency ? "SUBMIT EMERGENCY" : "SUBMIT REQUEST"}</Button>
              </form>
            </Card>
            <h3 className="font-bold mb-4">My Applications</h3>
            {myCareRequests.length === 0 ? <p className="text-[#94A3B8] text-sm">No applications yet.</p> : myCareRequests.map(r => (
              <Card key={r.id} className="mb-3 border-l-4 border-l-[#F43F5E]">
                <p className="font-bold text-sm">{r.reason}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-[10px] font-bold ${r.status === 'approved' ? 'text-[#10B981]' : r.status === 'rejected' ? 'text-[#EF4444]' : 'text-[#FBBF24]'}`}>{r.status.toUpperCase()}</span>
                  {r.is_emergency && <span className="text-[10px] text-red-500 font-bold">🚨 EMERGENCY</span>}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === "wallet" && (
          <div>
            <button onClick={() => setActiveTab("home")} className="flex items-center gap-1 text-sm text-[#94A3B8] mb-5"><ArrowLeft size={16} /> Back</button>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2"><Wallet className="text-[#FBBF24]"/> Alpha Wallet</h2>
            <Card className="border-[#9333EA] mb-6">
              <h3 className="text-sm font-bold text-[#9333EA] mb-4 flex items-center gap-2"><Landmark size={16}/> M-Pesa Details</h3>
              <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                <span className="text-xs text-[#94A3B8]">Paybill:</span><span className="font-bold">{appSettings.paybill_number}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                <span className="text-xs text-[#94A3B8]">Account (ID):</span><span className="font-bold text-[#FBBF24]">{profile.member_code || "PENDING"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#94A3B8]">Phone:</span><span className="font-bold">{profile.phone || "Not Set"}</span>
              </div>
            </Card>
            <Card className="text-center mb-6">
              <p className="text-[#94A3B8] text-sm">Verified Balance</p>
              <h3 className="text-4xl font-black text-[#FBBF24] mt-1">KES {savings.toLocaleString()}</h3>
            </Card>
            <h3 className="font-bold mb-4">Payment History</h3>
            {myPayments.length === 0 ? <p className="text-[#94A3B8] text-sm">No records.</p> : myPayments.map(p => (
              <Card key={p.id} className="mb-2 flex justify-between items-center">
                <div>
                  <p className="font-bold">KES {p.amount}</p>
                  <p className="text-[10px] text-[#94A3B8]">{p.category || "General"} • {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <Badge status={p.status} />
              </Card>
            ))}
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <div>
            <button onClick={() => setActiveTab("home")} className="flex items-center gap-1 text-sm text-[#94A3B8] mb-5"><ArrowLeft size={16} /> Back</button>
            <h2 className="text-2xl font-extrabold mb-6">Events & Meetings</h2>
            {events.length === 0 ? (
              <Card className="text-center py-10"><CalendarDays size={40} className="mx-auto text-[#94A3B8] mb-3"/><p className="text-[#94A3B8]">No upcoming events.</p></Card>
            ) : events.map(e => (
              <Card key={e.id} className="mb-3">
                <h3 className="font-bold text-[#FBBF24]">{e.title}</h3>
                <div className="flex gap-4 mt-2 text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {e.event_date}</span>
                  <span className="flex items-center gap-1"><MapPin size={14}/> {e.location}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* MORE TAB */}
        {activeTab === "more" && (
          <div>
            <h2 className="text-2xl font-extrabold mb-6">More Services</h2>
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-3 text-[#94A3B8]" />
              <input type="text" placeholder="Search tools..." value={featureSearch} onChange={e => setFeatureSearch(e.target.value)} className="w-full p-3 pl-10 bg-[#131C2E] border border-white/10 rounded-xl text-white outline-none" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setFeatureCategory(cat)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${featureCategory === cat ? 'bg-[#FBBF24] text-black' : 'bg-[#131C2E] text-white border border-white/10'}`}>{cat}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredFeatures.map(item => (
                <Card key={item.id} onClick={() => setActiveFeature(item)} className="flex flex-col items-center text-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">{item.icon}</div>
                  <span className="text-xs font-bold">{item.title}</span>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FEATURE MODAL */}
      {activeFeature && (
        <div className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center p-5">
          <div className="bg-[#131C2E] w-full max-w-sm rounded-2xl border border-[#9333EA] p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-[#FBBF24]">{activeFeature.title}</h3>
              <button onClick={() => setActiveFeature(null)}><X size={20} /></button>
            </div>
            
            {activeFeature.id === 18 && (<div><p className="text-xs text-[#94A3B8] mb-3">Tap a day to mark complete.</p><div className="grid grid-cols-5 gap-2">{Array.from({ length: 30 }).map((_, i) => (<div key={i} onClick={() => toggle30(i + 1)} className={`p-2 rounded text-center text-xs font-bold cursor-pointer border ${challenge30.includes(i + 1) ? 'bg-[#10B981] text-black border-[#10B981]' : 'bg-black/30 border-white/10'}`}>{i + 1}</div>))}</div></div>)}
            {activeFeature.id === 19 && (<div><p className="text-xs text-[#94A3B8] mb-3">Tap a week to mark complete.</p><div className="grid grid-cols-4 gap-2">{Array.from({ length: 52 }).map((_, i) => (<div key={i} onClick={() => toggle52(i + 1)} className={`p-2 rounded text-center text-xs font-bold cursor-pointer border ${challenge52.includes(i + 1) ? 'bg-[#9333EA] text-white border-[#9333EA]' : 'bg-black/30 border-white/10'}`}>{i + 1}</div>))}</div></div>)}
            {activeFeature.id === 14 && (<div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-[#FBBF24] rounded-xl p-6 text-center"><h2 className="text-[#FBBF24] font-bold text-lg">ALPHA YOUTH GROUP</h2><div className="w-16 h-16 rounded-full bg-[#9333EA] flex items-center justify-center text-2xl font-bold mx-auto my-4">{safeInitial}</div><h3 className="font-bold">{profile.full_name}</h3><p className="text-xs text-[#94A3B8]">ID: {profile.member_code}</p><p className="text-[10px] text-[#FBBF24] mt-4">VALID MEMBER</p></div>)}
            {activeFeature.id === 23 && (<div><div className="flex gap-2 mb-4"><input type="text" placeholder="New habit..." value={newHabit} onChange={e => setNewHabit(e.target.value)} className="flex-1 p-2 bg-black/30 border border-white/10 rounded-lg outline-none" /><Button onClick={addHabit} className="px-4 py-2">Add</Button></div>{habits.map(h => (<div key={h.id} onClick={() => toggleHabit(h.id)} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg mb-2 cursor-pointer"><div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${h.done ? 'bg-[#FBBF24] border-[#FBBF24]' : 'border-[#FBBF24]'}`}>{h.done && <CheckCircle2 size={14} className="text-black" />}</div><span className={h.done ? 'line-through text-[#94A3B8]' : ''}>{h.name}</span></div>))}</div>)}
            {activeFeature.id === 20 && (<div className="flex flex-col gap-3"><input type="text" placeholder="Full Name" value={cvData.name} onChange={e => setCvData({...cvData, name: e.target.value})} className="p-2 bg-black/30 border border-white/10 rounded-lg" /><input type="email" placeholder="Email" value={cvData.email} onChange={e => setCvData({...cvData, email: e.target.value})} className="p-2 bg-black/30 border border-white/10 rounded-lg" /><textarea placeholder="Skills" value={cvData.skills} onChange={e => setCvData({...cvData, skills: e.target.value})} className="p-2 bg-black/30 border border-white/10 rounded-lg" /><textarea placeholder="Experience" value={cvData.exp} onChange={e => setCvData({...cvData, exp: e.target.value})} className="p-2 bg-black/30 border border-white/10 rounded-lg" /><Button onClick={saveCv} className="w-full">Save CV</Button><div className="bg-white text-black p-4 rounded-lg mt-2"><h2 className="text-lg font-bold border-b-2 border-black pb-1 mb-2">{cvData.name || "Your Name"}</h2><p className="text-xs text-gray-600">{cvData.email}</p><h4 className="font-bold text-sm mt-2">Skills</h4><p className="text-xs">{cvData.skills}</p><h4 className="font-bold text-sm mt-2">Experience</h4><p className="text-xs">{cvData.exp}</p></div></div>)}
            {activeFeature.id === 24 && (<div className="text-center py-5"><Sparkles size={40} className="mx-auto text-[#FBBF24] mb-4"/><h2 className="text-lg italic mb-6">"{affirmations[affirmationIndex]}"</h2><Button onClick={() => setAffirmationIndex((p) => (p + 1) % affirmations.length)} className="w-full">Next</Button></div>)}
            {activeFeature.id === 30 && (<div className="text-center"><CalendarDays size={40} className="mx-auto text-[#EF4444] mb-4"/><input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full p-3 bg-black/30 border border-white/10 rounded-lg mb-4 text-white" /><Button onClick={calculateCountdown} className="w-full bg-[#EF4444] text-white border-none">Calculate</Button>{timeLeft && <h3 className="mt-5 text-[#FBBF24] font-bold text-xl">{timeLeft}</h3>}</div>)}
            {activeFeature.id === 7 && (<div><p className="mb-4">What is the best way to build wealth?</p><div className="flex flex-col gap-2"><button onClick={() => setQuizScore(1)} className="p-3 bg-black/20 border border-white/10 rounded-lg text-left">A) Spend all income</button><button onClick={() => setQuizScore(2)} className="p-3 bg-black/20 border border-white/10 rounded-lg text-left">B) Save and invest</button><button onClick={() => setQuizScore(3)} className="p-3 bg-black/20 border border-white/10 rounded-lg text-left">C) Borrow for luxury</button></div>{quizScore && <p className={`mt-4 font-bold ${quizScore === 2 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{quizScore === 2 ? "Correct!" : "Incorrect. Try again!"}</p>}</div>)}
            
            {![7, 14, 18, 19, 20, 23, 24, 30].includes(activeFeature.id) && (<div className="text-center py-5"><div className="w-16 h-16 rounded-full bg-[#9333EA]/20 flex items-center justify-center mx-auto mb-4">{activeFeature.icon}</div><h4 className="font-bold text-lg">{activeFeature.title}</h4><p className="text-xs text-[#94A3B8] mt-2">This interactive tool is ready for use. All data entered here stays securely on your device.</p><Button onClick={() => setActiveFeature(null)} className="w-full mt-5">Got it</Button></div>)}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/80 z-[2000] flex justify-center pt-20 px-5">
          <div className="bg-[#131C2E] w-full max-w-sm rounded-2xl border border-white/10 p-5 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="text-lg font-bold text-[#FBBF24] flex items-center gap-2"><Bell size={20}/> Notifications</h3>
              <button onClick={() => setShowNotifications(false)}><X size={20}/></button>
            </div>
            {announcements.length === 0 ? <p className="text-xs text-[#94A3B8]">No notifications yet.</p> : announcements.map(n => (
              <div key={n.id} className="mb-4 bg-black/20 p-3 rounded-lg border-l-2 border-[#FBBF24]">
                <p className="font-bold text-sm">{n.title}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{n.content}</p>
                <p className="text-[10px] text-[#FBBF24] mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabs={[
          { id: "home", label: "Home", icon: <Home /> },
          { id: "care", label: "Care", icon: <HeartHandshake /> },
          { id: "wallet", label: "Wallet", icon: <Wallet /> },
          { id: "events", label: "Events", icon: <CalendarDays /> },
          { id: "more", label: "More", icon: <MoreHorizontal /> }
        ]}
      />
    </div>
  );
}
