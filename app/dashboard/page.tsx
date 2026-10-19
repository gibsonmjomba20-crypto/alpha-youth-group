"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]); // For Admins
  const [savings, setSavings] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin Forms State
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [adminMsg, setAdminMsg] = useState("");

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

    const { data: meetingsData } = await supabase.from("meetings").select("*").order("meeting_date", { ascending: true }).limit(3);
    if (meetingsData) setMeetings(meetingsData);

    // If user is a leader, fetch ALL pending payments
    if (profileData && profileData.role !== 'member') {
      const { data: pending } = await supabase.from("payments").select(`*, profiles:user_id (full_name)`).eq("status", "pending");
      if (pending) setAllPayments(pending);
    }

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [router]);

  const handleVerifyPayment = async (id: string, uid: string) => {
    const code = `AYG-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from("payments").update({ status: "verified" }).eq("id", id);
    await supabase.from("profiles").update({ membership_status: "active", member_code: code }).eq("id", uid);
    alert(`Payment Verified! Member Code: ${code}`);
    fetchDashboardData(); // Refresh data
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("events").insert({ title: newEvent.title, event_date: newEvent.date, location: newEvent.location });
    setAdminMsg("Event created!");
    setNewEvent({ title: "", date: "", location: "" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: "#020617", color: "#eab308", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading Master Portal...</div>;

  const cardStyle = { backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b", marginBottom: "20px" };
  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "white", marginBottom: "12px" };
  const isLeader = profile.role !== 'member';

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", color: "white", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(234, 179, 8, 0.3)", paddingBottom: "20px", marginBottom: "30px" }}>
          <div>
            <h1 style={{ fontSize: "28px", color: "#eab308", fontWeight: "bold" }}>{isLeader ? `${profile.role.replace('_', ' ').toUpperCase()} DASHBOARD` : 'MEMBER PORTAL'}</h1>
            <p style={{ color: "#94a3b8" }}>Welcome, {profile.full_name} | Code: {profile.member_code || "PENDING"}</p>
          </div>
          <button onClick={handleLogout} style={{ border: "1px solid #ef4444", color: "#ef4444", padding: "10px 20px", borderRadius: "8px", backgroundColor: "transparent", fontWeight: "bold" }}>Logout</button>
        </div>

        {/* ADMIN CONSOLE (Only visible to leaders) */}
        {isLeader && (
          <div style={{ ...cardStyle, borderLeft: "4px solid #ef4444", backgroundColor: "#1e1b1b" }}>
            <h2 style={{ color: "#ef4444", fontSize: "20px", marginBottom: "16px" }}>⚡ Management Console</h2>
            
            {/* Verify Payments */}
            <h3 style={{ color: "white", marginBottom: "10px" }}>Pending M-Pesa Payments</h3>
            {allPayments.length === 0 ? <p style={{ color: "#94a3b8", fontSize: "14px" }}>No pending payments.</p> : (
              <table style={{ width: "100%", textAlign: "left", fontSize: "14px", marginBottom: "30px" }}>
                <thead><tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}><th>Member</th><th>Code</th><th>Action</th></tr></thead>
                <tbody>
                  {allPayments.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #1e293b" }}>
                      <td>{p.profiles?.full_name}</td>
                      <td style={{ color: "#eab308" }}>{p.mpesa_code}</td>
                      <td><button onClick={() => handleVerifyPayment(p.id, p.user_id)} style={{ backgroundColor: "#16a34a", color: "white", padding: "4px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}>Verify</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Create Event */}
            <h3 style={{ color: "white", marginBottom: "10px" }}>Create New Event</h3>
            <form onSubmit={handleCreateEvent} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input placeholder="Event Title" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} style={{ ...inputStyle, flex: 1 }} />
              <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="Location" required value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} style={{ ...inputStyle, flex: 1 }} />
              <button type="submit" style={{ backgroundColor: "#3b82f6", color: "white", padding: "12px 20px", borderRadius: "8px", border: "none", fontWeight: "bold" }}>Add Event</button>
            </form>
          </div>
        )}

        {/* FINANCIAL OVERVIEW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <div style={{ backgroundColor: "#020617", padding: "20px", borderRadius: "8px", textAlign: "center", border: "1px solid #334155" }}>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Total Savings</p>
            <p style={{ color: "#4ade80", fontSize: "24px", fontWeight: "bold" }}>KES {savings}</p>
          </div>
          <div style={{ backgroundColor: "#020617", padding: "20px", borderRadius: "8px", textAlign: "center", border: "1px solid #334155" }}>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>My Shares</p>
            <p style={{ color: "#3b82f6", fontSize: "24px", fontWeight: "bold" }}>{shares}</p>
          </div>
          <div style={{ backgroundColor: "#020617", padding: "20px", borderRadius: "8px", textAlign: "center", border: "1px solid #334155" }}>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loan Limit (3x)</p>
            <p style={{ color: "#eab308", fontSize: "24px", fontWeight: "bold" }}>KES {savings * 3}</p>
          </div>
        </div>

        {/* MEMBER INFO & MEETINGS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={cardStyle}>
            <h2 style={{ color: "#eab308", fontSize: "18px", marginBottom: "12px" }}>Membership Info</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Status: <span style={{ color: profile.membership_status === 'active' ? '#4ade80' : '#facc15', fontWeight: "bold" }}>{profile.membership_status.toUpperCase()}</span></p>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "8px" }}>County: {profile.county} | Sub-county: {profile.sub_county}</p>
            <Link href="/dashboard/payment" style={{ display: "block", textAlign: "center", backgroundColor: "#eab308", color: "#020617", fontWeight: "bold", padding: "10px", borderRadius: "8px", textDecoration: "none", marginTop: "16px" }}>Make Payment</Link>
          </div>

          <div style={cardStyle}>
            <h2 style={{ color: "#eab308", fontSize: "18px", marginBottom: "12px" }}>Meeting Reminders</h2>
            {meetings.length === 0 ? <p style={{ color: "#94a3b8", fontSize: "14px" }}>No meetings scheduled.</p> : (
              meetings.map(m => (
                <div key={m.id} style={{ padding: "10px", backgroundColor: "#020617", borderRadius: "8px", borderLeft: "3px solid #3b82f6", marginBottom: "10px" }}>
                  <p style={{ fontWeight: "bold", fontSize: "14px" }}>{m.title}</p>
                  <p style={{ color: "#94a3b8", fontSize: "12px" }}>📅 {m.meeting_date} | 📍 {m.location}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
