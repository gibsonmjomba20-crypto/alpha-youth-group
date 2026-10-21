"use client";
import Link from "next/link";
import { 
  ArrowRight, UserCheck, Menu, X, Wallet, HeartHandshake, ShieldCheck, 
  TrendingUp, Users, Folder, Calendar, Smartphone, Gift, UserPlus, 
  MapPin, Lock, CheckCircle2, MessageCircle, Handshake, Award, Target, Eye, Phone,
  Lightbulb, Briefcase, BookOpen, Globe, Network, Flag
} from "lucide-react";
import { useState } from "react";
import AIChat from "./components/AIChat";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans overflow-x-hidden selection:bg-[#9333EA] selection:text-white relative">
      
      {/* FLOATING AI BOT */}
      <AIChat />

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href="https://wa.me/254704785116" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform flex items-center justify-center"
      >
        <MessageCircle size={32} />
      </a>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000&auto=format&fit=crop" 
            alt="Youth Community" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-[#9333EA]/40"></div>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* NAVBAR */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#B45309] flex items-center justify-center font-black italic text-black border-2 border-[#FBBF24]">A</div>
              <div>
                <h1 className="font-black text-sm tracking-widest text-[#FBBF24]">ALPHA YOUTH</h1>
                <p className="text-[9px] text-gray-300 italic">Together We Rise and Shine!</p>
              </div>
            </div>
            
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-sm font-bold text-gray-300 hover:text-white">About</a>
              <a href="#future" className="text-sm font-bold text-gray-300 hover:text-white">Our Future</a>
              <a href="#values" className="text-sm font-bold text-gray-300 hover:text-white">Values</a>
              <a href="#contact" className="text-sm font-bold text-gray-300 hover:text-white">Contact</a>
              <Link href="/login" className="px-5 py-2.5 rounded-full bg-[#9333EA] text-white text-sm font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:bg-[#7e22ce] transition">Member Login</Link>
            </div>
          </div>
          
          {isMenuOpen && (
            <div className="md:hidden bg-black/90 p-5 border-b border-white/10 flex flex-col gap-4">
              <a href="#about" className="text-white font-bold">About Us</a>
              <a href="#future" className="text-white font-bold">Our Future</a>
              <a href="#values" className="text-white font-bold">Values</a>
              <a href="#contact" className="text-white font-bold">Contact Us</a>
              <Link href="/login" className="block text-center w-full py-3 rounded-xl bg-[#9333EA] text-white font-bold">Member Login</Link>
            </div>
          )}
        </nav>

        {/* HERO CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 pt-32 pb-20 flex flex-col items-start justify-center w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9333EA]/20 border border-[#9333EA]/50 text-[#D946EF] text-xs font-bold mb-8 backdrop-blur-sm">
            <MapPin size={14} /> Voi, Taita Taveta County • 18+ Only
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-4">
            ALPHA YOUTH GROUP
          </h1>
          <p className="text-3xl md:text-5xl font-serif italic text-[#FBBF24] mb-6 drop-shadow-lg">
            Together We Rise and Shine!
          </p>
          <p className="text-xl md:text-2xl text-gray-200 font-bold mb-4">
            Building Today's Youth. Shaping Tomorrow's Future.
          </p>
          <p className="text-sm md:text-base text-gray-300 italic mb-10 drop-shadow-md">
            Founded on unity. Driven by purpose. Built for generations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#9333EA] text-white font-bold text-lg shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:bg-[#7e22ce] transition-transform hover:scale-105">
              Start Your Journey <ArrowRight size={20} />
            </Link>
            <a href="#about" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white font-bold text-lg hover:bg-black/60 transition">
              Read Our Story
            </a>
          </div>
        </div>
      </section>

      {/* ================= WELCOME & ABOUT ================= */}
      <section id="about" className="py-24 bg-[#09090B] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-8">Welcome to <span className="text-[#9333EA]">Alpha</span></h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>Welcome to Alpha Youth Group, a youth empowerment movement based in Voi, Taita Taveta County, Kenya, with a vision to create meaningful opportunities for young people and contribute to the social and economic development of our communities.</p>
            <p>We believe that young people are not simply the leaders of tomorrow—they are innovators, entrepreneurs, volunteers, problem-solvers, and community builders today.</p>
            <p>Alpha Youth Group exists to bring young people together around a shared purpose: creating opportunities, developing potential, strengthening communities, and building a future in which every young person has the chance to contribute and grow.</p>
            <p>Our ambition goes beyond building a membership organisation. We envision Alpha becoming a trusted platform where young people can connect, exchange ideas, develop skills, organise community initiatives, and work together to solve challenges affecting their generation.</p>
            <p className="font-bold text-white text-xl">Our home is Voi. Our roots are in Taita Taveta. Our vision reaches across the Coast Region and, ultimately, throughout Kenya.</p>
          </div>
        </div>
      </section>

      {/* ================= VISION & MISSION ================= */}
      <section className="py-24 bg-[#000000] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-8">
          <div className="bg-[#18181B] p-10 rounded-3xl border border-[#9333EA]/30 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-[#9333EA]/20 text-[#9333EA] flex items-center justify-center mb-6"><Eye size={32}/></div>
            <h3 className="text-2xl font-black mb-4">Our Vision</h3>
            <p className="text-gray-400 leading-relaxed">To become a recognised, trusted, and impactful youth movement that connects, empowers, and inspires young people across Kenya to create sustainable opportunities and contribute to national development.</p>
            <p className="text-gray-400 leading-relaxed mt-4">We envision a future where young people from different communities, backgrounds, and professions can come together through Alpha to learn from one another, build meaningful relationships, develop solutions, and create lasting change.</p>
            <p className="text-white font-bold leading-relaxed mt-4">We want Alpha to stand for more than membership. We want it to represent opportunity, responsibility, innovation, unity, and hope.</p>
          </div>
          <div className="bg-[#18181B] p-10 rounded-3xl border border-[#D946EF]/30 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-[#D946EF]/20 text-[#D946EF] flex items-center justify-center mb-6"><Target size={32}/></div>
            <h3 className="text-2xl font-black mb-4">Our Mission</h3>
            <p className="text-gray-400 leading-relaxed">Our mission is to empower young people through financial literacy, entrepreneurship, education, leadership development, community service, innovation, and member welfare initiatives.</p>
            <p className="text-gray-400 leading-relaxed mt-4">We aim to create a supportive environment where members can discover their strengths, share their ideas, develop practical skills, and participate in initiatives that improve their lives and communities.</p>
            <p className="text-gray-400 leading-relaxed mt-4">Through responsible leadership, partnerships, volunteerism, and transparent management, we intend to build an organisation that can grow sustainably and serve its members with integrity.</p>
          </div>
        </div>
      </section>

      {/* ================= WHY ALPHA MATTERS & 500 DREAM ================= */}
      <section className="py-24 bg-[#09090B] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Why Alpha Matters to <span className="text-[#9333EA]">the Coast Region</span></h2>
            <p>The Coast Region has young people with talent, creativity, ambition, and ideas capable of creating positive change. However, opportunities to connect, learn, collaborate, and develop those ideas may not always be easy to access. Alpha Youth Group wants to help bridge that gap.</p>
            <p>Beginning in Voi, we aim to build a strong foundation in Taita Taveta and gradually develop connections with young people in other parts of the Coast Region, including Mombasa, Kilifi, Kwale, Tana River, and Lamu, as our capacity grows.</p>
            <p>Our long-term ambition is to establish connections with young people throughout Kenya, creating a network through which members can share knowledge, identify opportunities, support community initiatives, and collaborate across counties.</p>
            <p className="font-bold text-white">We believe that when young people work together, local ideas can grow into regional opportunities, and regional cooperation can contribute to national development.</p>
          </div>
          
          <div className="bg-gradient-to-br from-[#9333EA] to-[#4C1D95] p-10 rounded-3xl text-center shadow-[0_0_50px_rgba(147,51,234,0.2)]">
            <Users size={64} className="mx-auto text-white mb-6 opacity-80"/>
            <h3 className="text-2xl font-black text-white mb-4">Our Dream: 500 Members & Beyond</h3>
            <p className="text-white/90 text-sm leading-relaxed mb-6">Every great movement begins with people who believe in a common vision. Alpha Youth Group aims to build a community of 500 members and continue growing from there.</p>
            <p className="text-white/90 text-sm leading-relaxed mb-6">We want members to have opportunities to participate, contribute ideas, learn, volunteer, and help shape the organisation's future.</p>
            <div className="text-4xl font-black text-white bg-black/20 p-4 rounded-xl inline-block">500</div>
            <p className="text-white/80 text-xs mt-2 uppercase tracking-widest font-bold">The Beginning</p>
          </div>
        </div>
      </section>

      {/* ================= THE FUTURE WE WANT TO BUILD ================= */}
      <section id="future" className="py-24 bg-[#000000] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">The Future We <span className="text-[#9333EA]">Want to Build</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Eight pillars designed to empower, connect, and elevate our members.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Briefcase />, title: "Alpha Enterprise", desc: "Encouraging entrepreneurship, business education, and responsible financial planning." },
              { icon: <Smartphone />, title: "Skills & Digital", desc: "Training in digital skills, technology, communication, and leadership." },
              { icon: <Globe />, title: "Community Dev", desc: "Environmental conservation, tree planting, clean-up campaigns, and education support." },
              { icon: <Network />, title: "Alpha Connect", desc: "Connecting young people from different counties through networking and forums." },
              { icon: <HeartHandshake />, title: "Alpha Care", desc: "Responsible welfare initiative to help eligible members facing approved emergencies." },
              { icon: <Award />, title: "Leadership Academy", desc: "Mentorship, public speaking, teamwork, and ethical leadership." },
              { icon: <Folder />, title: "Opportunities", desc: "Building relationships with institutions, businesses, and development partners." },
              { icon: <Flag />, title: "Annual Youth Forum", desc: "Meeting to discuss challenges, share ideas, showcase projects, and celebrate." },
            ].map((item, i) => (
              <div key={i} className="bg-[#18181B] p-6 rounded-2xl border border-white/5 hover:border-[#9333EA]/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#9333EA]/20 text-[#9333EA] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OUR VALUES ================= */}
      <section id="values" className="py-24 bg-[#09090B] border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Our <span className="text-[#D946EF]">Values</span></h2>
            <p className="text-gray-400">The principles that guide everything we do.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Unity", desc: "We believe that cooperation makes us stronger." },
              { title: "Integrity", desc: "We aim to act honestly, responsibly, and transparently." },
              { title: "Empowerment", desc: "We help young people develop their abilities and confidence." },
              { title: "Innovation", desc: "We encourage ideas, creativity, and practical solutions." },
              { title: "Service", desc: "Positive change begins when people contribute to their communities." },
              { title: "Accountability", desc: "We use our resources responsibly and communicate openly." },
              { title: "Inclusivity", desc: "A respectful environment where eligible members can contribute." },
            ].map((val, i) => (
              <div key={i} className="flex gap-4 p-4">
                <CheckCircle2 className="text-[#10B981] shrink-0" size={24}/>
                <div>
                  <h4 className="font-bold text-white">{val.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COMMITMENT & CALL TO ACTION ================= */}
      <section className="py-24 bg-[#000000] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-8">Our Commitment to the Future</h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed mb-12">
            <p>We recognise that a meaningful future cannot be built through words alone. It requires planning, committed leadership, active members, sound financial management, responsible partnerships, and projects that respond to real community needs.</p>
            <p>As Alpha Youth Group grows, we aim to establish clear governance procedures, publish appropriate activity and financial reports, measure the impact of our projects, and build partnerships based on trust.</p>
            <p className="text-white font-bold">We want our achievements to speak for us. We want our members to take pride in their contribution. We want our communities to see the value of young people working together for a common purpose.</p>
            <p className="text-[#FBBF24] font-bold text-2xl italic">Our journey begins in Voi, but our aspirations are not limited by geography.</p>
          </div>

          <div className="bg-[#18181B] border border-[#9333EA] p-10 rounded-3xl">
            <h3 className="text-2xl font-black text-white mb-4">A Call to Young People Across Kenya</h3>
            <p className="text-gray-400 mb-6">To every young person with a dream, an idea, a skill, or a desire to make a difference: there is a place for your ambition in the future we want to build.</p>
            <Link href="/login" className="inline-block px-8 py-4 rounded-full bg-[#9333EA] text-white font-black text-lg shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:scale-105 transition-transform">
              Join the Movement Today
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CONTACT US ================= */}
      <section id="contact" className="py-24 bg-[#09090B] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Get In Touch</h2>
          <p className="text-gray-400 mb-10">Based in Voi, Taita Taveta County, Kenya.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="https://wa.me/254704785116" target="_blank" rel="noopener noreferrer" className="bg-[#18181B] p-8 rounded-3xl border border-[#25D366]/30 flex flex-col items-center hover:bg-white/5 transition">
              <MessageCircle size={40} className="text-[#25D366] mb-4" />
              <p className="font-bold text-lg">WhatsApp (Joy)</p>
              <p className="text-sm text-gray-400">+254 704 785 116</p>
            </a>
            <a href="tel:0704785116" className="bg-[#18181B] p-8 rounded-3xl border border-[#9333EA]/30 flex flex-col items-center hover:bg-white/5 transition">
              <Phone size={40} className="text-[#9333EA] mb-4" />
              <p className="font-bold text-lg">Call Us</p>
              <p className="text-sm text-gray-400">0704 785 116</p>
            </a>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 bg-[#000000] border-t border-white/10 text-center relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9333EA] to-[#4C1D95] flex items-center justify-center font-black italic text-white text-xl mx-auto mb-6 shadow-lg">A</div>
        <p className="text-sm font-bold text-white mb-2">ALPHA YOUTH GROUP</p>
        <p className="text-xs text-[#9333EA] font-bold mb-1">Together We Rise and Shine!</p>
        <p className="text-[10px] text-gray-500 mb-8">Voi, Taita Taveta County, Kenya</p>
        <p className="text-[10px] text-gray-600">© {new Date().getFullYear()} Alpha Youth Group. All rights reserved.</p>
      </footer>
    </div>
  );
}
