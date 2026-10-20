import Link from "next/link";
import { ArrowRight, Users, Target, HeartHandshake, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0B1120", color: "#F8FAFC", fontFamily: "sans-serif", overflowX: "hidden" }}>
      
      {/* NAVIGATION BAR */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, backgroundColor: "rgba(11, 17, 32, 0.9)", backdropFilter: "blur(10px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", border: "2px solid #FBBF24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold", color: "#FBBF24", boxShadow: "0 0 15px rgba(251, 191, 36, 0.4)" }}>A</div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "800", color: "#FBBF24", letterSpacing: "1px" }}>ALPHA YOUTH GROUP</h1>
            <p style={{ fontSize: "9px", color: "#94A3B8", fontStyle: "italic" }}>Together We Rise and Shine!</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/about" style={{ color: "#F8FAFC", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>About</Link>
          <Link href="/programs" style={{ color: "#F8FAFC", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Programs</Link>
          <Link href="/events" style={{ color: "#F8FAFC", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Events</Link>
          <Link href="/login" style={{ padding: "10px 24px", border: "1px solid #FBBF24", color: "#FBBF24", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}>Login</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ position: "relative", padding: "120px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", background: "radial-gradient(circle at top, rgba(147, 51, 234, 0.15) 0%, transparent 60%)" }}>
        <div style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: "20px", marginBottom: "24px" }}>
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#FBBF24", letterSpacing: "1px" }}>WELCOME TO ALPHA YOUTH GROUP</p>
        </div>
        <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: "900", lineHeight: "1.1", maxWidth: "900px", marginBottom: "24px" }}>
          Empowering the Next Generation of <span style={{ color: "#FBBF24", textShadow: "0 0 30px rgba(251, 191, 36, 0.5)" }}>Leaders</span>
        </h1>
        <p style={{ fontSize: "18px", color: "#94A3B8", maxWidth: "600px", marginBottom: "40px", lineHeight: "1.6" }}>
          We are a community-driven organization dedicated to youth empowerment, economic growth, and building a self-reliant, united community.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/register" style={{ padding: "16px 32px", backgroundColor: "#FBBF24", color: "#000", borderRadius: "50px", textDecoration: "none", fontWeight: "800", fontSize: "16px", boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)", display: "flex", alignItems: "center", gap: "8px" }}>
            Become a Member <ArrowRight size={18} />
          </Link>
          <Link href="/mission" style={{ padding: "16px 32px", border: "1px solid rgba(255,255,255,0.2)", color: "#F8FAFC", borderRadius: "50px", textDecoration: "none", fontWeight: "600", fontSize: "16px" }}>
            Learn More
          </Link>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section style={{ padding: "60px 20px", backgroundColor: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", textAlign: "center" }}>
          <div>
            <h2 style={{ fontSize: "48px", fontWeight: "900", color: "#FBBF24", marginBottom: "8px" }}>500+</h2>
            <p style={{ color: "#94A3B8", fontWeight: "600" }}>Active Members</p>
          </div>
          <div>
            <h2 style={{ fontSize: "48px", fontWeight: "900", color: "#FBBF24", marginBottom: "8px" }}>25+</h2>
            <p style={{ color: "#94A3B8", fontWeight: "600" }}>Community Projects</p>
          </div>
          <div>
            <h2 style={{ fontSize: "48px", fontWeight: "900", color: "#FBBF24", marginBottom: "8px" }}>10K+</h2>
            <p style={{ color: "#94A3B8", fontWeight: "600" }}>Lives Impacted</p>
          </div>
        </div>
      </section>

      {/* OUR PROGRAMS */}
      <section style={{ padding: "100px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "16px" }}>Our Key Programs</h2>
          <p style={{ color: "#94A3B8", maxWidth: "600px", margin: "0 auto" }}>We focus on practical initiatives that create real, lasting change in our community.</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {/* Card 1 */}
          <div style={{ backgroundColor: "#131C2E", padding: "32px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", backgroundColor: "rgba(147, 51, 234, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <Users size={30} color="#9333EA" />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>Youth Empowerment</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6" }}>Mentorship, leadership training, and workshops to help young people build confidence and skills.</p>
          </div>

          {/* Card 2 */}
          <div style={{ backgroundColor: "#131C2E", padding: "32px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", backgroundColor: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <Target size={30} color="#10B981" />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>Economic Growth</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6" }}>Financial literacy, savings groups (SACCO), and entrepreneurship support to build wealth.</p>
          </div>

          {/* Card 3 */}
          <div style={{ backgroundColor: "#131C2E", padding: "32px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", backgroundColor: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <HeartHandshake size={30} color="#3B82F6" />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>Community Projects</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6" }}>Clean-ups, charity drives, and local development projects that bring us closer together.</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ padding: "80px 20px", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderTop: "1px solid rgba(147, 51, 234, 0.3)", borderBottom: "1px solid rgba(147, 51, 234, 0.3)", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "16px" }}>Ready to Make a Difference?</h2>
        <p style={{ color: "#94A3B8", fontSize: "18px", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px auto" }}>Join Alpha Youth Group today. Pay the registration fee of KES 1,000 and become part of a movement that is changing lives.</p>
        <Link href="/register" style={{ padding: "16px 40px", backgroundColor: "#FBBF24", color: "#000", borderRadius: "50px", textDecoration: "none", fontWeight: "800", fontSize: "18px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          Apply Now <ArrowRight size={20} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#050810", padding: "60px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px" }}>
          
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #FBBF24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", color: "#FBBF24" }}>A</div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#FBBF24" }}>ALPHA YOUTH GROUP</h3>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: "1.6" }}>Together we grow, support one another, and build a brighter future.</p>
          </div>

          <div>
            <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#F8FAFC" }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href="/about" style={{ color: "#94A3B8", textDecoration: "none", fontSize: "14px" }}>About Us</Link>
              <Link href="/mission" style={{ color: "#94A3B8", textDecoration: "none", fontSize: "14px" }}>Our Mission</Link>
              <Link href="/programs" style={{ color: "#94A3B8", textDecoration: "none", fontSize: "14px" }}>Programs</Link>
              <Link href="/register" style={{ color: "#94A3B8", textDecoration: "none", fontSize: "14px" }}>Join Us</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#F8FAFC" }}>Contact Us</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ color: "#94A3B8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><Phone size={16} /> 0704785116</p>
              <p style={{ color: "#94A3B8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><Mail size={16} /> info@alphayouthgroup.com</p>
              <p style={{ color: "#94A3B8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={16} /> Nairobi, Kenya</p>
            </div>
          </div>

        </div>
        <div style={{ maxWidth: "1200px", margin: "40px auto 0 auto", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <p style={{ color: "#64748B", fontSize: "12px" }}>© {new Date().getFullYear()} Alpha Youth Group. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
