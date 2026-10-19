"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({ 
    full_name: "", email: "", phone: "", county: "", sub_county: "", id_number: "", role: "member" 
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.id_number.length < 6) {
      setMessage("Error: ID Number must be at least 6 digits.");
      setLoading(false);
      return;
    }

    // Use the ID Number as the password!
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.id_number, 
      options: {
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          county: formData.county,
          sub_county: formData.sub_county,
          id_number: formData.id_number,
          role: formData.role,
        },
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else if (data.session) {
      setMessage("Registration successful! Redirecting...");
      setTimeout(() => {
        if (formData.role === "member") router.push("/dashboard");
        else router.push("/dashboard"); // Admin also goes to dashboard, but sees more
      }, 1000);
    } else {
      setMessage("Registration successful! Please check your email to confirm your account.");
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "white", marginBottom: "12px", outline: "none" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#0f172a", border: "1px solid rgba(234, 179, 8, 0.3)", borderRadius: "16px", padding: "32px", boxShadow: "0 0 20px rgba(234, 179, 8, 0.1)" }}>
        
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
          
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="text" placeholder="County" required style={inputStyle} onChange={(e) => setFormData({...formData, county: e.target.value})} />
            <input type="text" placeholder="Sub-county" required style={inputStyle} onChange={(e) => setFormData({...formData, sub_county: e.target.value})} />
          </div>

          <input type="text" placeholder="ID Number (6 Digits - This is your password)" required maxLength={8} style={inputStyle} onChange={(e) => setFormData({...formData, id_number: e.target.value})} />
          
          <select required style={inputStyle} onChange={(e) => setFormData({...formData, role: e.target.value})}>
            <option value="member">Member</option>
            <option value="chairman">Chairman</option>
            <option value="vice_chairman">Vice Chairman</option>
            <option value="treasurer">Treasurer</option>
            <option value="secretary">Secretary</option>
            <option value="organizing_secretary">Organizing Secretary</option>
          </select>

          <p style={{ fontSize: "12px", color: "#eab308", marginBottom: "16px", textAlign: "center" }}>
            ⚠️ Remember: Your password is your 6-digit ID Number.
          </p>
          
          <button type="submit" disabled={loading} style={{ backgroundColor: "#eab308", color: "#020617", fontWeight: "bold", padding: "14px", borderRadius: "8px", border: "none", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
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
