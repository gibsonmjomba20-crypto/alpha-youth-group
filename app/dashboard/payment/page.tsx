"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Payment() {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("payments").insert({
      user_id: user.id, mpesa_code: code.toUpperCase(), amount: parseFloat(amount), payment_date: date, status: "pending"
    });

    if (error) setMsg(`Error: ${error.message}`);
    else setMsg("Submitted! Awaiting Treasurer verification.");
  };

  const inputStyle = { width: "100%", padding: "12px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "8px", color: "white", marginBottom: "16px" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "#0f172a", padding: "32px", borderRadius: "16px", border: "1px solid rgba(234, 179, 8, 0.3)" }}>
        <h2 style={{ color: "#eab308", textAlign: "center", marginBottom: "24px" }}>Submit M-Pesa</h2>
        {msg && <p style={{ color: msg.includes("Error") ? "#fca5a5" : "#86efac", textAlign: "center", marginBottom: "16px" }}>{msg}</p>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column" }}>
          <input type="text" placeholder="M-Pesa Code (e.g. QK123)" required style={inputStyle} onChange={e => setCode(e.target.value)} />
          <input type="number" placeholder="Amount (KES)" required style={inputStyle} onChange={e => setAmount(e.target.value)} />
          <input type="date" required style={inputStyle} onChange={e => setDate(e.target.value)} />
          <button type="submit" style={{ backgroundColor: "#eab308", color: "#020617", fontWeight: "bold", padding: "14px", borderRadius: "8px", border: "none" }}>Submit</button>
          <button type="button" onClick={() => router.push("/dashboard")} style={{ marginTop: "16px", color: "#94a3b8", background: "transparent", border: "none" }}>Back</button>
        </form>
      </div>
    </main>
  );
}
