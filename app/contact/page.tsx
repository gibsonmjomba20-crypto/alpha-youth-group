import Link from "next/link";
export default function Contact() {
  return (<main style={{ minHeight: "100vh", backgroundColor: "#020617", color: "white", padding: "40px 20px", fontFamily: "sans-serif" }}><div style={{ maxWidth: "800px", margin: "0 auto" }}><Link href="/" style={{ color: "#eab308", textDecoration: "none" }}>← Back Home</Link><h1 style={{ color: "#eab308", fontSize: "36px", margin: "20px 0" }}>Contact Us</h1><p style={{ color: "#94a3b8" }}>Email: info@alphayouthgroup.com</p><p style={{ color: "#94a3b8" }}>Phone: +254 700 000 000</p></div></main>);
}
