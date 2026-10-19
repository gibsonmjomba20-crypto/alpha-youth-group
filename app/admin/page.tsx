"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      
      if (profile?.role !== "admin" && profile?.role !== "treasurer") {
        alert("Unauthorized: You are not an admin."); 
        return router.push("/dashboard");
      }

      const { data } = await supabase.from("payments").select(`*, profiles:user_id (full_name, phone)`).eq("status", "pending");
      if (data) setPayments(data);
      setLoading(false);
    };
    fetch();
  }, [router]);

  const verify = async (id: string, uid: string) => {
    const code = `AYG-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from("payments").update({ status: "verified" }).eq("id", id);
    await supabase.from("profiles").update({ membership_status: "active", member_code: code }).eq("id", uid);
    alert(`Verified! Code: ${code}`);
    window.location.reload();
  };

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: "#020617", color: "#eab308", display: "flex", alignItems: "center", justifyContent: "center" }}>Checking Admin Status...</div>;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", color: "white", padding: "32px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#eab308", marginBottom: "24px" }}>Admin Dashboard</h1>
      {payments.length === 0 ? <p>No pending payments.</p> : (
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid #334155" }}><th style={{ padding: "12px" }}>Name</th><th>Code</th><th>Action</th></tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "12px" }}>{p.profiles?.full_name}</td>
                <td style={{ color: "#eab308" }}>{p.mpesa_code}</td>
                <td><button onClick={() => verify(p.id, p.user_id)} style={{ backgroundColor: "#16a34a", color: "white", padding: "6px 12px", borderRadius: "4px", border: "none" }}>Verify</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
