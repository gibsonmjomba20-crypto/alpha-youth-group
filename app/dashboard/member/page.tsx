"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Card, Badge, BottomNav, Button } from "../../../components/ui";
import { Home, Wallet, HeartHandshake, CalendarDays, MoreHorizontal, Bell, X, Phone, ArrowLeft, Target, Zap, Landmark, Search } from "lucide-react";

export default function MemberPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [savings, setSavings] = useState<number>(0);
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [myCare, setMyCare] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
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
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleCare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careReq.agreed) return alert("Agree to terms.");
    await supabase.from("alpha_care").insert({ user_id: profile.id, reason: careReq.reason, is_emergency: careReq.isEmergency, status: "pending" });
    alert("Request submitted."); setCareReq({ reason: "", isEmergency: false, agreed: false }); window.location.reload();
  };

  if (loading) return <div className="min-h-screen bg-[#09090B] flex justify-center items-center text-[#9333EA]">Loading...</div>;
  if (!profile) return <div className="text-white p-5">Not found</div>;

  const safeInitial = profile.full_name?.charAt(0) || "M";

  return (
    <div className="min-h-screen bg-[#09090B] text-white pb-20">
      <header className="p-4 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#09090B]/90 z-50">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 rounded-full bg-[#9333EA] flex items-center justify-center font-black italic text-lg shadow-lg">A</div>
           <h1 className="text-sm font-extrabold text-white">ALPHA YOUTH</h1>
        </div>
        <div onClick={() => setActiveTab("more")} className="w-8 h-8 rounded-full bg-[#18181B] border border-[#9333EA] flex items-center justify-center font-bold cursor-pointer text-sm">{safeInitial}</div>
      </header>

      <main className="p-5 max-w-lg mx-auto">
        {activeTab === "home" && (
          <div>
            <div className="bg-[#18181B] p-5 rounded-2xl border border-white/10 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#9333EA] flex items-center justify-center text-xl font-bold border-2 border-[#D946EF]">{safeInitial}</div>
                <div><p className="text-xs text-gray-400">Welcome,</p><h2 className="text-xl font-extrabold">{profile.full_name?.split(' ')[0]}</h2></div>
              </div>
              <p className="text-xs text-gray-400">ID: <span className="text-white font-bold">{profile.member_code}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card onClick={() => setActiveTab("wallet")} className="cursor-pointer border-[#9333EA]">
                <Wallet size={20} className="text-[#9333EA] mb-2" /><p className="text-[11px] text-gray-400">Wallet</p><h3 className="text-lg font-bold">KES {savings.toLocaleString()}</h3>
              </Card>
              <Card onClick={() => setActiveTab("care")} className="cursor-pointer border-[#D946EF]">
                <HeartHandshake size={20} className="text-[#D946EF] mb-2" /><p className="text-[11px] text-gray-400">Alpha Care</p><h3 className="text-sm font-bold">{myCare.filter(c => c.status === 'pending').length} Pending</h3>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "care" && (
          <div>
            <button onClick={() => setActiveTab("home")} className="text-sm text-gray-400 mb-5 flex items-center gap-1"><ArrowLeft size={16}/> Back</button>
            <h2 className="text-2xl font-extrabold text-[#D946EF] mb-6">Alpha Care</h2>
            <Card className="mb-6">
              <form onSubmit={handleCare} className="flex flex-col gap-3">
                <textarea placeholder="Reason for support..." required value={careReq.reason} onChange={e => setCareReq({...careReq, reason: e.target.value})} className="p-3 bg-black/40 border border-white/10 rounded-lg outline-none h-24" />
                <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={careReq.isEmergency} onChange={e => setCareReq({...careReq, isEmergency: e.target.checked})} /> Emergency</label>
                <label className="text-xs flex items-center gap-2 text-[#9333EA]"><input type="checkbox" required checked={careReq.agreed} onChange={e => setCareReq({...careReq, agreed: e.target.checked})} /> I agree to terms</label>
                <Button type="submit" variant="primary" className="w-full">Submit Request</Button>
              </form>
            </Card>
          </div>
        )}

        {activeTab === "wallet" && (
          <div>
            <button onClick={() => setActiveTab("home")} className="text-sm text-gray-400 mb-5 flex items-center gap-1"><ArrowLeft size={16}/> Back</button>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2"><Wallet className="text-[#9333EA]"/> Wallet</h2>
            <Card className="border-[#9333EA] mb-6">
              <p className="text-sm font-bold text-[#D946EF] mb-2 flex items-center gap-2"><Landmark size={16}/> M-Pesa Details</p>
              <p className="text-xs text-gray-400">Paybill: <span className="text-white font-bold">522522</span></p>
              <p className="text-xs text-gray-400">Account: <span className="text-[#9333EA] font-bold">{profile.member_code}</span></p>
            </Card>
            <Card className="text-center mb-6">
              <p className="text-gray-400 text-sm">Balance</p>
              <h3 className="text-4xl font-black text-white mt-1">KES {savings.toLocaleString()}</h3>
            </Card>
            <h3 className="font-bold mb-4">History</h3>
            {myPayments.map(p => (
              <Card key={p.id} className="mb-2 flex justify-between items-center p-4">
                <div><p className="font-bold">KES {p.amount}</p><p className="text-[10px] text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p></div>
                <Badge status={p.status} />
              </Card>
            ))}
          </div>
        )}

        {activeTab === "events" && (
          <div>
            <button onClick={() => setActiveTab("home")} className="text-sm text-gray-400 mb-5 flex items-center gap-1"><ArrowLeft size={16}/> Back</button>
            <h2 className="text-2xl font-extrabold mb-6">Events</h2>
            <Card className="text-center py-10"><CalendarDays size={40} className="mx-auto text-gray-500 mb-3"/><p className="text-gray-400">No events yet.</p></Card>
          </div>
        )}

        {activeTab === "more" && (
          <div>
            <h2 className="text-2xl font-extrabold mb-6">More</h2>
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input type="text" placeholder="Search..." className="w-full p-3 pl-10 bg-[#18181B] border border-white/10 rounded-xl outline-none" />
            </div>
            <Button variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full mt-8">Sign Out</Button>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} tabs={[
        { id: "home", label: "Home", icon: <Home /> },
        { id: "care", label: "Care", icon: <HeartHandshake /> },
        { id: "wallet", label: "Wallet", icon: <Wallet /> },
        { id: "events", label: "Events", icon: <CalendarDays /> },
        { id: "more", label: "More", icon: <MoreHorizontal /> }
      ]} />
    </div>
  );
}
