"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "", county: "", sub_county: "", id_number: "", dob: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.id_number.length < 6) {
      setMessage("Error: ID Number must be at least 6 digits.");
      setLoading(false); return;
    }

    const birthDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) { setMessage("Error: You must be 18 years or older."); setLoading(false); return; }

    const phoneRegex = /^(07|01)\d{8}$/;
    if (!phoneRegex.test(formData.phone)) { setMessage("Error: Valid Kenyan phone number required (e.g., 0712345678)."); setLoading(false); return; }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.id_number, 
      options: {
        data: {
          full_name: formData.full_name, phone: formData.phone, county: formData.county, sub_county: formData.sub_county, id_number: formData.id_number, date_of_birth: formData.dob, role: "member",
        },
      },
    });

    if (error) { setMessage(`Error: ${error.message}`); setLoading(false); }
    else if (data.session) { setMessage("Registration successful! Redirecting..."); setTimeout(() => { router.push("/dashboard"); }, 1000); }
    else { setMessage("Registration successful! Please check your email."); setLoading(false); }
  };

  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "white", marginBottom: "12px", outline: "none" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#0f172a", border: "1px solid rgba(234, 179, 8, 0.3)", borderRadius: "16px", padding: "32px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", textAlign: "center", color: "#eab308", marginBottom: "24px" }}>Join Alpha Youth</h2>
        {message && (<div style={{ padding: "12px", marginBottom: "16px", fontSize: "14px", borderRadius: "8px", backgroundColor: message.includes("Error") ? "rgba(153, 27, 27, 0.5)" : "rgba(20, 83, 45, 0.5)", color: message.includes("Error") ? "#fca5a5" : "#86efac" }}>{message}</div>)}
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
          <input type="text" placeholder="Full Name (As on ID)" required style={inputStyle} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          <input type="email" placeholder="Email Address" required style={inputStyle} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="tel" placeholder="Phone Number (e.g. 0712345678)" required style={inputStyle} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="text" placeholder="County" required style={inputStyle} onChange={(e) => setFormData({...formData, county: e.target.value})} />
            <input type="text" placeholder="Sub-county" required style={inputStyle} onChange={(e) => setFormData({...formData, sub_county: e.target.value})} />
          </div>
          <label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>Date of Birth (Must be 18+)</label>
          <input type="date" required style={inputStyle} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
          <input type="text" placeholder="ID Number (6+ Digits - This is your password)" required maxLength={8} style={inputStyle} onChange={(e) => setFormData({...formData, id_number: e.target.value})} />
          <p style={{ fontSize: "12px", color: "#eab308", marginBottom: "16px", textAlign: "center" }}>⚠️ Your password is your ID Number.</p>
          <button type="submit" disabled={loading} style={{ backgroundColor: "#eab308", color: "#020617", fontWeight: "bold", padding: "14px", borderRadius: "8px", border: "none", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
            {loading ? "Verifying..." : "Create Account"}
          </button>
        </form>
        <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "24px", fontSize: "14px" }}>Already have an account? <Link href="/login" style={{ color: "#eab308", textDecoration: "none" }}>Login here</Link></p>
      </div>
    </main>
  );
}
