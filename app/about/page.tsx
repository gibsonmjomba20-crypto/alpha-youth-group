import Link from "next/link";
export default function About() {
  return (<main style={{ minHeight: "100vh", backgroundColor: "#020617", color: "white", padding: "40px 20px", fontFamily: "sans-serif" }}><div style={{ maxWidth: "800px", margin: "0 auto" }}><Link href="/" style={{ color: "#eab308", textDecoration: "none" }}>← Back Home</Link><h1 style={{ color: "#eab308", fontSize: "36px", margin: "20px 0" }}>About Alpha Youth Group</h1><p style={{ color: "#94a3b8", fontSize: "18px", lineHeight: "1.8" }}>Alpha Youth Group is a community-based organization dedicated to empowering young people, supporting community development, encouraging economic empowerment, and building a united, responsible, self-reliant community.</p></div></main>);
}
