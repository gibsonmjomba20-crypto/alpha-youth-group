"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Card, Badge, BottomNav, Button } from "../../components/ui";
import { 
  Home, Wallet, HeartHandshake, CalendarDays, MoreHorizontal, 
  Bell, X, Phone, ArrowLeft, Target, Zap, Landmark, Search, 
  User, Award, Briefcase, Folder, Share2, LifeBuoy, Settings, 
  LogOut, CheckCircle2, AlertCircle, FileText, Download, QrCode
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function MemberPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [savings, setSavings] = useState<number>(0);
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [myCare, setMyCare] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [careReq, setCareReq] = useState({ reason: "", isEmergency: false, agreed: false });
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (p) setProfile(p);
      
      const { data: s } = await supabase.from("savings").select("total_savings").eq("user_id", user.id).maybeSingle();
      if (s) setSavings(s.total_savings);
      
      const { data: pay } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (pay) setMyPayments(pay);
      
      const { data: care } = await supabase.from("alpha_care").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (care) setMyCare(care);

      const { data: ev } = await supabase.from("events").select("*").order("event_date", { ascending: true }).limit(3);
      if (ev) setEvents(ev);

      const { data: notif } = await supabase.from("notifications").select("*").eq("user_id", user.id).eq("is_read", false);
      if (notif) setNotifications(notif);
      
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleCare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careReq.agreed) return alert("Agree to terms.");
    await supabase.from("alpha_care").insert({ user_id: profile.id, reason: careReq.reason, is_emergency: careReq.isEmergency, status: "pending" });
    alert("Request submitted."); 
    setCareReq({ reason: "", isEmergency: false, agreed: false }); 
    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen bg-[#09090B] flex justify-center items-center text-[#9333EA]">Loading Member Portal...</div>;
  if (!profile) return <div className="text-white p-5">Profile not found. Please contact support.</div>;

  // Enforce Membership Approval
  if (profile.membership_status !== 'active') {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-5 text-center">
        <AlertCircle size={60} className="text-[#FBBF24] mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Application Under Review</h1>
        <p className="text-gray-400 mb-6">Status: <span className="text-[#9333EA] font-bold uppercase">{profile.membership_status || "PENDING"}</span></p>
        <p className="text-sm text-gray-500 max-w-md">Your application is being reviewed by the administrators. You will receive a notification and an email once your membership code is issued.</p>
        <Button onClick={handleLogout} className="mt-8" variant="danger">Sign Out</Button>
      </div>
    );
  }

  const safeInitial = profile.full_name?.charAt(0) || "M";

  return (
    <div className="min-h-screen bg-[#09090B] text-white pb-24">
      {/* HEADER */}
      <header className="p-4 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#09090B]/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9333EA] to-[#4C1D95] flex items-center justify-center font-black italic text-lg shadow-lg">A</div>
           <div>
             <h1 className="text-sm font-extrabold text-white">ALPHA YOUTH</h1>
             <p className="text-[9px] text-[#9333EA] font-bold">Together We Rise!</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <div onClick={() => setShowNotifications(true)} className="relative cursor-pointer">
            <Bell size={22} className="text-gray-300 hover:text-white transition" />
            {notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#09090B]">{notifications.length}</span>}
          </div>
          <div onClick={() => setActiveTab("more")} className="w-8 h-8 rounded-full bg-[#18181B] border border-[#9333EA]/50 flex items-center justify-center font-bold cursor-pointer text-sm">{safeInitial}</div>
        </div>
      </header>

      <main className="p-5 max-w-2xl mx-auto">
        
        {/* ================= HOME TAB ================= */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#18181B] to-[#09090B] p-5 rounded-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9333EA]/10 rounded-bl-full blur-2xl"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-14 h-14 rounded-full bg-[#9333EA] flex items-center justify-center text-2xl font-bold border-2 border-[#D946EF]">{safeInitial}</div>
                <div>
                  <p className="text-xs text-gray-400">Welcome back,</p>
                  <h2 className="text-2xl font-black">{profile.full_name?.split(' ')[0]}</h2>
                  <p className="text-xs text-[#9333EA] font-bold mt-1">ID: {profile.member_code}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 pt-3 border-t border-white/10 relative z-10">
                <span>Joined: {new Date(profile.created_at).toLocaleDateString()}</span>
                <span>Status: <span className="text-[#10B981] font-bold uppercase">{profile.membership_status}</span></span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: "wallet", icon: <Wallet />, label: "Wallet", color: "#9333EA" },
                { id: "care", icon: <HeartHandshake />, label: "Care", color: "#D946EF" },
                { id: "events", icon: <CalendarDays />, label: "Events", color: "#3B82F6" },
                { id: "profile", icon: <User />, label: "ID Card", color: "#10B981" }
              ].map((act) => (
                <div key={act.id} onClick={() => setActiveTab(act.id)} className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105" style={{ backgroundColor: `${act.color}20`, color: act.color }}>
                    {act.icon}
                  </div>
                  <span className="text-[10px] font-bold text-gray-300">{act.label}</span>
                </div>
              ))}
            </div>

            {/* Upcoming Events */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Upcoming Events</h3>
                <span onClick={() => setActiveTab("events")} className="text-xs text-[#9333EA] font-bold cursor-pointer">View All</span>
              </div>
              {events.length === 0 ? (
                <Card className="text-center py-6"><p className="text-gray-500 text-sm">No upcoming events.</p></Card>
              ) : events.map(e => (
                <Card key={e.id} className="mb-2 flex justify-between items-center p-4">
                  <div>
                    <p className="font-bold">{e.title}</p>
                    <p className="text-xs text-gray-400">{new Date(e.event_date).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" className="py-1 px-3 text-xs">Register</Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ================= WALLET TAB ================= */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-2"><Wallet className="text-[#9333EA]"/> Alpha Wallet</h2>
            
            <Card className="text-center bg-gradient-to-br from-[#18181B] to-[#09090B]">
              <p className="text-gray-400 text-sm">Verified Balance</p>
              <h3 className="text-4xl font-black text-white mt-1">KES {savings.toLocaleString()}</h3>
              <p className="text-xs text-[#10B981] mt-2 font-bold flex items-center justify-center gap-1"><CheckCircle2 size={12}/> Updated automatically by Treasurer</p>
            </Card>

            <Card className="border-[#9333EA]/50">
              <h3 className="text-sm font-bold text-[#D946EF] mb-4 flex items-center gap-2"><Landmark size={16}/> M-Pesa Payment Details</h3>
              <div className="flex justify-between border-b border-white/10 pb-3 mb-3">
                <span className="text-xs text-gray-400">Paybill Number:</span>
                <span className="font-bold text-white">522522</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Account Number:</span>
                <span className="font-bold text-[#9333EA]">{profile.member_code}</span>
              </div>
            </Card>

            <div>
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-3">Contribution History</h3>
              {myPayments.length === 0 ? (
                <Card className="text-center py-6"><p className="text-gray-500 text-sm">No payments recorded yet.</p></Card>
              ) : myPayments.map(p => (
                <Card key={p.id} className="mb-2 flex justify-between items-center p-4">
                  <div>
                    <p className="font-bold">KES {p.amount}</p>
                    <p className="text-[10px] text-gray-400">{p.category || "General"} • {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={p.status} />
                    {p.status === 'verified' && <Download size={16} className="text-[#9333EA] cursor-pointer" />}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ================= ALPHA CARE TAB ================= */}
        {activeTab === "care" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black flex items-center gap-2 text-[#D946EF]"><HeartHandshake /> Alpha Care</h2>
              <a href="tel:0704785116" className="bg-red-500/20 text-red-500 p-2 rounded-lg"><Phone size={18}/></a>
            </div>
            
            <Card className="border-[#D946EF]/30">
              <h3 className="font-bold mb-4">Request Support</h3>
              <form onSubmit={handleCare} className="flex flex-col gap-3">
                <select className="p-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-[#D946EF]">
                  <option>Medical Emergency</option>
                  <option>Accident or Emergency Transport</option>
                  <option>Education Difficulties</option>
                  <option>Food and Essential Needs</option>
                  <option>Shelter or Family Hardship</option>
                  <option>Bereavement</option>
                </select>
                <textarea placeholder="Please describe your situation..." required value={careReq.reason} onChange={e => setCareReq({...careReq, reason: e.target.value})} className="p-3 bg-black/40 border border-white/10 rounded-lg outline-none h-24 text-white focus:border-[#D946EF]" />
                <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={careReq.isEmergency} onChange={e => setCareReq({...careReq, isEmergency: e.target.checked})} className="accent-[#D946EF]" /> This is an emergency</label>
                <label className="text-xs flex items-center gap-2 text-gray-400"><input type="checkbox" required checked={careReq.agreed} onChange={e => setCareReq({...careReq, agreed: e.target.checked})} className="accent-[#D946EF]" /> I agree to the privacy terms.</label>
                <Button type="submit" variant="secondary" className="w-full mt-2">Submit Application</Button>
              </form>
            </Card>

            <div>
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-3">My Applications</h3>
              {myCare.length === 0 ? (
                <Card className="text-center py-6"><p className="text-gray-500 text-sm">No support requests yet.</p></Card>
              ) : myCare.map(c => (
                <Card key={c.id} className="mb-2 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm">{c.reason}</p>
                    <Badge status={c.status} />
                  </div>
                  {c.is_emergency && <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-bold">EMERGENCY</span>}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ================= EVENTS TAB ================= */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-2"><CalendarDays className="text-[#3B82F6]"/> Events</h2>
            {events.length === 0 ? (
              <Card className="text-center py-10"><CalendarDays size={40} className="mx-auto text-gray-500 mb-3"/><p className="text-gray-400">No events scheduled.</p></Card>
            ) : events.map(e => (
              <Card key={e.id} className="p-5">
                <h3 className="font-bold text-lg text-white mb-1">{e.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{e.description}</p>
                <div className="flex justify-between items-center text-xs text-[#3B82F6] font-bold mb-4">
                  <span>{new Date(e.event_date).toLocaleDateString()}</span>
                  <span>{e.location}</span>
                </div>
                <Button variant="primary" className="w-full py-2">Register to Attend</Button>
              </Card>
            ))}
          </div>
        )}

        {/* ================= MORE TAB ================= */}
        {activeTab === "more" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black mb-4">More Services</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "profile", icon: <User />, label: "My ID Card", color: "#10B981" },
                { id: "shares", icon: <Landmark />, label: "Share Tracker", color: "#FBBF24" },
                { id: "projects", icon: <Folder />, label: "Community Projects", color: "#3B82F6" },
                { id: "opportunities", icon: <Briefcase />, label: "Opportunities", color: "#D946EF" },
                { id: "impact", icon: <Award />, label: "My Impact", color: "#9333EA" },
                { id: "support", icon: <LifeBuoy />, label: "Help & Support", color: "#EF4444" },
                { id: "settings", icon: <Settings />, label: "Settings", color: "#A1A1AA" },
                { id: "refer", icon: <Share2 />, label: "Refer a Friend", color: "#10B981" },
              ].map((item) => (
                <Card key={item.id} onClick={() => alert(`${item.label} feature coming soon!`)} className="flex flex-col items-center text-center gap-3 p-6 cursor-pointer hover:bg-white/5">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}20`, color: item.color }}>{item.icon}</div>
                  <span className="text-xs font-bold text-white">{item.label}</span>
                </Card>
              ))}
            </div>

            <Button variant="danger" onClick={handleLogout} className="w-full mt-6"><LogOut size={18}/> Sign Out</Button>
          </div>
        )}

        {/* ================= PROFILE / DIGITAL ID TAB ================= */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <button onClick={() => setActiveTab("more")} className="text-sm text-gray-400 mb-2 flex items-center gap-1 hover:text-white"><ArrowLeft size={16}/> Back</button>
            <h2 className="text-2xl font-black mb-4">Digital Membership Card</h2>
            
            <div className="bg-gradient-to-br from-[#18181B] to-[#09090B] border border-[#9333EA] rounded-3xl p-6 text-center shadow-[0_0_30px_rgba(147,51,234,0.2)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#9333EA]/20 rounded-bl-full blur-2xl"></div>
               <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#9333EA] to-[#4C1D95] rounded-2xl flex items-center justify-center text-white font-black italic text-3xl shadow-lg mb-4">A</div>
               <h1 className="text-lg font-black text-white tracking-widest">ALPHA YOUTH GROUP</h1>
               <p className="text-xs text-[#D946EF] font-bold mb-6">Together We Rise and Shine!</p>
               
               <div className="w-24 h-24 rounded-full bg-[#18181B] mx-auto flex items-center justify-center text-4xl font-bold border-4 border-[#9333EA] mb-4">{safeInitial}</div>
               <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
               <p className="text-sm text-gray-400 mb-4">{profile.member_code}</p>

               <div className="bg-white p-2 rounded-xl w-fit mx-auto mb-4">
                 <QRCodeSVG value={`https://alpha-youth-group.vercel.app/verify/${profile.member_code}`} size={100} />
               </div>

               <div className="flex justify-between text-[10px] text-gray-500 mt-6 border-t border-white/10 pt-4">
                 <span>JOINED: {new Date(profile.created_at).getFullYear()}</span>
                 <span className="text-[#10B981] font-bold">ACTIVE MEMBER</span>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* NOTIFICATIONS MODAL */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex justify-center pt-20 px-5">
          <div className="bg-[#18181B] w-full max-w-sm rounded-3xl border border-white/10 p-5 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Bell size={20}/> Notifications</h3>
              <button onClick={() => setShowNotifications(false)}><X size={20}/></button>
            </div>
            {notifications.length === 0 ? <p className="text-xs text-gray-400 text-center py-10">No new notifications.</p> : notifications.map(n => (
              <div key={n.id} className="mb-4 bg-black/40 p-3 rounded-xl border-l-2 border-[#9333EA]">
                <p className="font-bold text-sm text-white">{n.title}</p>
                <p className="text-xs text-gray-400 mt-1">{n.message}</p>
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
