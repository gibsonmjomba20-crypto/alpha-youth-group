"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "", location: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
        },
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else if (data.session) {
      // This runs if "Confirm Email" is OFF in Supabase
      setMessage("Registration successful! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      // This runs if "Confirm Email" is ON
      setMessage("Registration successful! Please check your email to confirm your account.");
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "white", marginBottom: "16px", outline: "none" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "450px", backgroundColor: "#0f172a", border: "1px solid rgba(234, 179, 8, 0.3)", borderRadius: "16px", padding: "32px", boxShadow: "0 0 20px rgba(234, 179, 8, 0.1)" }}>
        
        <h2 style={{ fontSize: "28px", fontWeight: "bold", textAlign: "center", color: "#eab308", marginBottom: "24px" }}>
          Join Alpha Youth
        </h2>
        
        {message && (
          <div style={{ padding: "12px", marginBottom: "16px", fontSize: "14px", borderRadius: "8px", backgroundColor: message.includes("Error") ? "rgba(153, 27, 27, 0.5)" : "rgba(20, 83, 45, 0.5)", color: message.includes("Error") ? "#fca5a5" : "#86efac" }}>
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
          <input type="text" placeholder="Full Name" required style={inputStyle} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          <input type="email" placeholder="Email Address" required style={inputStyle} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="tel" placeholder="Phone Number" required style={inputStyle} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          <input type="text" placeholder="Location" required style={inputStyle} onChange={(e) => setFormData({...formData, location: e.target.value})} />
          <input type="password" placeholder="Password" required style={inputStyle} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          
          <button type="submit" disabled={loading} style={{ backgroundColor: "#eab308", color: "#020617", fontWeight: "bold", padding: "14px", borderRadius: "8px", marginTop: "8px", border: "none", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "24px", fontSize: "14px" }}>
          Already have an account? <Link href="/login" style={{ color: "#eab308", textDecoration: "none" }}>Login here</Link>
        </p>
      </div>
    </main>
  );
}
