import Link from "next/link";
import { ArrowRight, Users, Target, HeartHandshake, MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0B1120", color: "#F8FAFC", fontFamily: "sans-serif", overflowX: "hidden" }}>
      
      {/* NAVIGATION BAR */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, backgroundColor: "rgba(11, 17, 32, 0.9)", backdropFilter: "blur(10px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", border: "2px solid #FBBF24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold", color: "#FBBF24", boxShadow: "0 0 15px rgba(251, 191, 36, 0.4)" }}>A</div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "800", color: "#FBBF24", letterSpacing: "1px" }}>ALPHA YOUTH GROUP</h1>
            <p style={{ fontSize: "9px", color: "#94A3B8", fontStyle: "italic" }}>Taita Taveta • Together We Rise and Shine!</p>
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
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: "20px", marginBottom: "24px" }}>
          <MapPin size={14} color="#FBBF24" />
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#FBBF24", letterSpacing: "1px" }}>PROUDLY BASED IN TAITA TAVETA, KENYA</p>
        </div>
        
        <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: "900", lineHeight: "1.1", maxWidth: "900px", marginBottom: "24px" }}>
          Empowering the Youth of <span style={{ color: "#FBBF24", textShadow: "0 0 30px rgba(251, 191, 36, 0.5)" }}>Taita Taveta</span>
        </h1>
        
        <p style={{ fontSize: "18px", color: "#94A3B8", maxWidth: "600px", marginBottom: "40px", lineHeight: "1.6" }}>
          We are a community-driven organization dedicated to youth empowerment, economic growth, and building a self-reliant community right here in Taita Taveta County.
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

      {/* WHY TAITA TAVETA SECTION */}
      <section style={{ padding: "80px 20px", backgroundColor: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 400px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "20px" }}>Rooted in <span style={{ color: "#FBBF24" }}>Taita Taveta</span></h2>
            <p style={{ color: "#94A3B8", lineHeight: "1.8", marginBottom: "16px" }}>
              From the beautiful hills of Taita to the vast plains of Taveta, our mission is to uplift the young people of our county. We believe in the potential of our local youth and are committed to providing them with the tools, mentorship, and financial literacy they need to succeed.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
              <p style={{ display: "flex", alignItems: "center", gap: "10px", color: "#F8FAFC" }}><CheckCircle2 size={18} color="#10B981" /> Local Community Projects</p>
              <p style={{ display: "flex", alignItems: "center", gap: "10px", color: "#F8FAFC" }}><CheckCircle2 size={18} color="#10B981" /> Youth Empowerment Workshops</p>
              <p style={{ display: "flex", alignItems: "center", gap: "10px", color: "#F8FAFC" }}><CheckCircle2 size={18} color="#10B981" /> Local SACCO & Savings Groups</p>
            </div>
          </div>
          <div style={{ flex: "1 1 300px", backgroundColor: "#131C2E", padding: "40px", borderRadius: "20px", border: "1px solid #FBBF24", textAlign: "center" }}>
            <MapPin size={48} color="#FBBF24" style={{ margin: "0 auto 16px auto" }} />
            <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px" }}>Taita Taveta County</h3>
            <p style={{ color: "#94A3B8" }}>Kenya</p>
          </div>
        </div>
      </section>

      {/* OUR PROGRAMS */}
      <section style={{ padding: "100px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "16px" }}>Our Key Programs</h2>
          <p style={{ color: "#94A3B8", maxWidth: "600px", margin: "0 auto" }}>We focus on practical initiatives that create real, lasting change in Taita Taveta.</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          <div style={{ backgroundColor: "#131C2E", padding: "32px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", backgroundColor: "rgba(147, 51, 234, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}><Users size={30} color="#9333EA" /></div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>Youth Empowerment</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6" }}>Mentorship, leadership training, and workshops for the youth of Taita Taveta.</p>
          </div>

          <div style={{ backgroundColor: "#131C2E", padding: "32px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", backgroundColor: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}><Target size={30} color="#10B981" /></div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>Economic Growth</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6" }}>Financial literacy, savings groups, and entrepreneurship support to build local wealth.</p>
          </div>

          <div style={{ backgroundColor: "#131C2E", padding: "32px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", backgroundColor: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}><HeartHandshake size={30} color="#3B82F6" /></div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>Community Projects</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6" }}>Clean-ups, charity drives, and development projects across the county.</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ padding: "80px 20px", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderTop: "1px solid rgba(147, 51, 234, 0.3)", borderBottom: "1px solid rgba(147, 51, 234, 0.3)", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "16px" }}>Ready to Make a Difference?</h2>
        <p style={{ color: "#94A3B8", fontSize: "18px", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px auto" }}>Join Alpha Youth Group today. Pay the registration fee of KES 1,000 and become part of a movement that is changing lives in Taita Taveta.</p>
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
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: "1.6" }}>Together we grow, support one another, and build a brighter future in Taita Taveta.</p>
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
              <p style={{ color: "#94A3B8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={16} /> Voi, Taita Taveta, Kenya</p>
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
