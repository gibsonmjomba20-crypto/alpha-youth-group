"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        
        if (error) {
          setErrorMsg(`Database Error: ${error.message} (Code: ${error.code})`);
        } else if (!data) {
          setErrorMsg("Profile not found in database. Did you run the SQL command?");
        } else {
          setProfile(data);
        }
      } catch (err: any) {
        setErrorMsg(`System Error: ${err.message}`);
      }
    };
    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // If there is an error, show it in a red box instead of loading forever
  if (errorMsg) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020617", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "rgba(153, 27, 27, 0.8)", padding: "20px", borderRadius: "12px", border: "1px solid #ef4444", maxWidth: "400px", textAlign: "center" }}>
        <h2 style={{ color: "#fca5a5", marginBottom: "10px" }}>Oops! Something went wrong.</h2>
        <p style={{ fontSize: "14px" }}>{errorMsg}</p>
        <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#eab308", color: "#000", fontWeight: "bold", borderRadius: "8px", border: "none" }}>Go Back to Login</button>
      </div>
    </div>
  );

  // If no profile and no error, keep loading
  if (!profile) return <div style={{ minHeight: "100vh", backgroundColor: "#020617", color: "#eab308", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", color: "white", padding: "32px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(234, 179, 8, 0.3)", paddingBottom: "16px", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", color: "#eab308", fontWeight: "bold" }}>Member Dashboard</h1>
          <button onClick={handleLogout} style={{ border: "1px solid #334155", padding: "8px 16px", borderRadius: "4px", color: "white", backgroundColor: "transparent" }}>Logout</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <h2 style={{ color: "#eab308", fontSize: "18px", marginBottom: "16px" }}>My Profile</h2>
            <p style={{ marginBottom: "8px" }}><span style={{ color: "#94a3b8" }}>Name:</span> {profile.full_name}</p>
            <p style={{ marginBottom: "8px" }}><span style={{ color: "#94a3b8" }}>Status:</span> <span style={{ color: profile.membership_status === 'active' ? '#4ade80' : '#facc15' }}>{profile.membership_status?.toUpperCase()}</span></p>
            <p style={{ marginBottom: "8px" }}><span style={{ color: "#94a3b8" }}>Member Code:</span> {profile.member_code || "Pending Verification"}</p>
          </div>

          <div style={{ backgroundColor: "#0f172a", padding: "24px", borderRadius: "12px", border: "1px solid #1e293b" }}>
            <h2 style={{ color: "#eab308", fontSize: "18px", marginBottom: "16px" }}>Payment</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px" }}>Submit your M-Pesa code to activate your account.</p>
            <Link href="/dashboard/payment" style={{ display: "block", textAlign: "center", backgroundColor: "#eab308", color: "#020617", fontWeight: "bold", padding: "12px", borderRadius: "8px", textDecoration: "none" }}>Submit M-Pesa</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
