"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else {
      router.push("/dashboard"); 
    }
  };

  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "white", marginBottom: "16px", outline: "none" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "#0f172a", border: "1px solid rgba(234, 179, 8, 0.3)", borderRadius: "16px", padding: "32px", boxShadow: "0 0 20px rgba(234, 179, 8, 0.1)" }}>
        
        <h2 style={{ fontSize: "28px", fontWeight: "bold", textAlign: "center", color: "#eab308", marginBottom: "24px" }}>
          Member Login
        </h2>
        
        {message && (
          <div style={{ padding: "12px", marginBottom: "16px", fontSize: "14px", borderRadius: "8px", backgroundColor: "rgba(153, 27, 27, 0.5)", color: "#fca5a5" }}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
          <input type="email" placeholder="Email Address" required style={inputStyle} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="ID Number (Password)" required style={inputStyle} onChange={(e) => setPassword(e.target.value)} />
          
          <button type="submit" disabled={loading} style={{ backgroundColor: "#eab308", color: "#020617", fontWeight: "bold", padding: "14px", borderRadius: "8px", marginTop: "8px", border: "none", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "24px", fontSize: "14px" }}>
          Don't have an account? <Link href="/register" style={{ color: "#eab308", textDecoration: "none" }}>Register here</Link>
        </p>
      </div>
    </main>
  );
}
