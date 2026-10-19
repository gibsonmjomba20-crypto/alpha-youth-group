import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#020617", color: "#f8fafc", fontFamily: "sans-serif" }}>
      
      {/* Navigation */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", borderBottom: "1px solid #854d0e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid #eab308", display: "flex", alignItems: "center", justifyContent: "center", color: "#eab308", fontSize: "24px", fontWeight: "bold", boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)" }}>
            A
          </div>
          <span style={{ fontSize: "20px", fontWeight: "bold", color: "#eab308", letterSpacing: "2px" }}>ALPHA YOUTH</span>
        </div>
        <div style={{ display: "flex", gap: "20px", fontWeight: "600" }}>
          <Link href="/login" style={{ color: "#eab308", textDecoration: "none", border: "1px solid #eab308", padding: "8px 24px", borderRadius: "8px" }}>
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: "900", marginBottom: "24px", color: "#eab308", textShadow: "0 0 20px rgba(234, 179, 8, 0.4)", lineHeight: "1.2" }}>
          Together We Rise <br /> and Shine!
        </h1>
        
        <p style={{ fontSize: "18px", color: "#94a3b8", maxWidth: "600px", marginBottom: "48px", lineHeight: "1.6" }}>
          Empowering young people, supporting community development, encouraging economic empowerment, and building a united, responsible, self-reliant community.
        </p>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/register" style={{ backgroundColor: "#eab308", color: "#020617", padding: "16px 32px", borderRadius: "50px", fontWeight: "bold", fontSize: "18px", textDecoration: "none", boxShadow: "0 0 20px rgba(234, 179, 8, 0.4)" }}>
            Become a Member
          </Link>
          
          <button style={{ backgroundColor: "transparent", border: "1px solid #334155", color: "#cbd5e1", padding: "16px 32px", borderRadius: "50px", fontWeight: "bold", fontSize: "18px", cursor: "pointer" }}>
            Our Mission
          </button>
        </div>
      </section>

    </main>
  );
}
