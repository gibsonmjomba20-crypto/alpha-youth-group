"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function Payment() {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Defaults to TODAY
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    // 1. Validate M-Pesa Code Format (10 alphanumeric characters)
    const mpesaRegex = /^[A-Z0-9]{10}$/i;
    if (!mpesaRegex.test(code)) {
      setMsg("Error: Invalid M-Pesa code. A real M-Pesa code is exactly 10 characters long (e.g. UJK94AWD3A).");
      setLoading(false);
      return;
    }

    // 2. Prevent future dates (Strict "Today" rule)
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) {
      setMsg("Error: You can only submit a payment made TODAY.");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    // 3. Insert payment (Database will block it if the code was already used)
    const { error } = await supabase.from("payments").insert({
      user_id: user.id, 
      mpesa_code: code.toUpperCase(), 
      amount: parseFloat(amount), 
      payment_date: date, 
      paid_to: phone, 
      status: "pending",
      is_registration_fee: false // This is a savings payment, not a new registration
    });

    if (error) {
      if (error.code === '23505') { 
        setMsg("❌ ERROR: This M-Pesa code has ALREADY been used. Do not cheat!");
      } else {
        setMsg(`Error: ${error.message}`);
      }
    } else {
      setMsg("✅ Submitted! Admin will verify your code against the official M-Pesa statement.");
      setCode(""); setAmount(""); setPhone("");
    }
    setLoading(false);
  };

  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "white", marginBottom: "12px", outline: "none" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0B1120", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "#131C2E", padding: "32px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
        
        <button onClick={() => router.push('/dashboard')} style={{ background: "transparent", border: "none", color: "#94A3B8", display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px", cursor: "pointer" }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h2 style={{ color: "#FBBF24", textAlign: "center", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <ShieldCheck /> Secure Payment
        </h2>
        <p style={{ fontSize: "12px", color: "#94A3B8", textAlign: "center", marginBottom: "24px" }}>Enter the exact details from your M-Pesa SMS.</p>

        {msg && (
          <div style={{ padding: "12px", marginBottom: "16px", fontSize: "12px", borderRadius: "8px", backgroundColor: msg.includes("Error") || msg.includes("ERROR") ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)", color: msg.includes("Error") || msg.includes("ERROR") ? "#EF4444" : "#10B981", border: `1px solid ${msg.includes("Error") || msg.includes("ERROR") ? "#EF4444" : "#10B981"}` }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>M-Pesa Transaction Code</label>
          <input type="text" placeholder="e.g. UJK94AWD3A" required value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={inputStyle} />
          
          <label style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Amount Sent (KES)</label>
          <input type="number" placeholder="e.g. 500" required value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />

          <label style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Account/Phone You Sent To</label>
          <input type="tel" placeholder="e.g. 0704785116" required value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />

          <label style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Date of Payment (Must be Today)</label>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", color: "#000", borderRadius: "8px", border: "none", fontWeight: "800", cursor: loading ? "not-allowed" : "pointer", marginTop: "12px" }}>
            {loading ? "Verifying..." : "SUBMIT FOR VERIFICATION"}
          </button>
        </form>
      </div>
    </main>
  );
}
