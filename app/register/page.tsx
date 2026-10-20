"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Phone, CreditCard } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "", county: "", sub_county: "", id_number: "", dob: "", mpesa_code: "" });
  const [settings, setSettings] = useState({ paybill_number: "Loading...", paybill_account: "Loading..." });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch the Treasurer's settings when the page loads
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("app_settings").select("paybill_number, paybill_account").single();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.id_number.length < 6) { setMessage("Error: ID Number must be at least 6 digits."); setLoading(false); return; }
    
    const birthDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) { setMessage("Error: You must be 18 years or older."); setLoading(false); return; }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.id_number, 
      options: { data: { full_name: formData.full_name, phone: formData.phone, county: formData.county, sub_county: formData.sub_county, id_number: formData.id_number, date_of_birth: formData.dob, role: "member" } },
    });

    if (authError) { setMessage(`Error: ${authError.message}`); setLoading(false); return; }

    if (authData.user) {
      await supabase.from("payments").insert({
        user_id: authData.user.id, mpesa_code: formData.mpesa_code.toUpperCase(), amount: 1000, payment_date: new Date().toISOString().split('T')[0], paid_to: "PAYBILL", status: "pending", is_registration_fee: true
      });
      await supabase.from("profiles").update({ membership_status: "pending" }).eq("id", authData.user.id);
      setMessage("✅ Application Submitted! Please call 0704785116 to verify your payment. Once verified, the Admin will approve your account.");
    }
    setLoading(false);
  };

  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "white", marginBottom: "12px", outline: "none" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#0f172a", border: "1px solid rgba(234, 179, 8, 0.3)", borderRadius: "16px", padding: "32px" }}>
        
        <h2 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", color: "#eab308", marginBottom: "8px" }}>Membership Application</h2>
        
        {/* DYNAMIC PAYBILL INSTRUCTIONS BOX */}
        <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid #10B981", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#10B981", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><CreditCard size={16}/> Payment Instructions</h3>
          <p style={{ fontSize: "12px", color: "#d1d5db", lineHeight: "1.6" }}>
            1. Go to <strong>M-Pesa &gt; Lipa na M-Pesa &gt; Pay Bill</strong><br/>
            2. Business Number: <strong>{settings.paybill_number}</strong><br/>
            3. Account Number: <strong>{settings.paybill_account}</strong><br/>
            4. Amount: <strong>KES 1,000</strong><br/>
            5. Paste the M-Pesa code below.
          </p>
        </div>
        
        {message && (<div style={{ padding: "12px", marginBottom: "16px", fontSize: "13px", borderRadius: "8px", backgroundColor: message.includes("Error") ? "rgba(153, 27, 27, 0.5)" : "rgba(20, 83, 45, 0.5)", color: message.includes("Error") ? "#fca5a5" : "#86efac" }}>{message}</div>)}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
          <input type="text" placeholder="Full Name (As on ID)" required style={inputStyle} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          <input type="email" placeholder="Email Address" required style={inputStyle} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="tel" placeholder="Phone Number (e.g. 0712345678)" required style={inputStyle} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="text" placeholder="County" required style={inputStyle} onChange={(e) => setFormData({...formData, county: e.target.value})} />
            <input type="text" placeholder="Sub-county" required style={inputStyle} onChange={(e) => setFormData({...formData, sub_county: e.target.value})} />
          </div>
          <label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>Date of Birth (18+)</label>
          <input type="date" required style={inputStyle} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
          <input type="text" placeholder="ID Number (6+ Digits - Your Password)" required maxLength={8} style={inputStyle} onChange={(e) => setFormData({...formData, id_number: e.target.value})} />
          
          <label style={{ fontSize: "12px", color: "#eab308", marginBottom: "4px", fontWeight: "bold" }}>M-Pesa Paybill Code</label>
          <input type="text" placeholder="e.g. QK12345678" required style={inputStyle} onChange={(e) => setFormData({...formData, mpesa_code: e.target.value})} />
          
          <button type="submit" disabled={loading} style={{ backgroundColor: "#eab308", color: "#020617", fontWeight: "bold", padding: "14px", borderRadius: "8px", border: "none", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", marginTop: "12px" }}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "24px", fontSize: "14px" }}>Already approved? <Link href="/login" style={{ color: "#eab308", textDecoration: "none" }}>Login here</Link></p>
      </div>
    </main>
  );
}
