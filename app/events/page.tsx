import Link from "next/link";
export default function Events() {
  return (<main style={{ minHeight: "100vh", backgroundColor: "#020617", color: "white", padding: "40px 20px", fontFamily: "sans-serif" }}><div style={{ maxWidth: "800px", margin: "0 auto" }}><Link href="/" style={{ color: "#eab308", textDecoration: "none" }}>← Back Home</Link><h1 style={{ color: "#eab308", fontSize: "36px", margin: "20px 0" }}>Upcoming Events</h1><p style={{ color: "#94a3b8" }}>Check back soon for our next community event!</p></div></main>);
}
