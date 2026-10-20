"use client";
import Link from "next/link";
import { Search, ArrowRight, Users, Globe, TrendingUp, Heart, Calendar, UserCheck, Target, Eye, Mail, MapPin, Phone, Crown, Menu, X, MessageCircle, Camera, Briefcase, Share2 } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090B]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* LOGO IMAGE ADDED HERE */}
            <img src="/logo.png" alt="Alpha Youth Group Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
            <div className="hidden sm:block">
              <h1 className="font-black text-lg tracking-wider text-[#FBBF24] leading-tight">ALPHA YOUTH GROUP</h1>
              <p className="text-[10px] text-gray-400 italic">Together We Rise and Shine!</p>
            </div>
          </div>
          
          <div className="hidden lg:flex gap-6 text-sm font-semibold text-gray-300">
            <a href="#" className="text-white border-b-2 border-[#9333EA] pb-1">Home</a>
            <a href="#about" className="hover:text-white transition">About Us</a>
            <a href="#programs" className="hover:text-white transition">Programs</a>
            <a href="#events" className="hover:text-white transition">Events</a>
            <a href="#" className="hover:text-white transition">Gallery</a>
            <a href="#" className="hover:text-white transition">Join</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Search size={18} className="text-gray-400 cursor-pointer hover:text-white" />
            <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition">Member Login</Link>
            <Link href="/login" className="bg-[#9333EA] text-white px-5 py-2 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:bg-[#7e22ce] transition">Join Alpha</Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-[#09090B] border-b border-white/10 p-5 flex flex-col gap-4">
            <a href="#" className="text-white font-bold">Home</a>
            <a href="#about" className="text-gray-300 font-bold">About Us</a>
            <a href="#programs" className="text-gray-300 font-bold">Programs</a>
            <Link href="/login" className="text-[#9333EA] font-bold">Member Login</Link>
            <Link href="/login" className="bg-[#9333EA] text-white text-center py-2 rounded-lg font-bold">Join Alpha</Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-20 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-[#9333EA]/40"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-5 w-full py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9333EA]/20 border border-[#9333EA]/50 text-[#D946EF] text-xs font-bold mb-6 backdrop-blur-sm">
              <span>Empowering Youth</span> • <span>Building Communities</span> • <span>Creating Opportunities</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-2">
              WELCOME TO
            </h1>
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tighter mb-4">
              ALPHA YOUTH GROUP
            </h2>
            <p className="text-3xl md:text-4xl font-serif italic text-[#FBBF24] mb-6">
              Together We Rise and Shine!
            </p>

            <p className="text-gray-300 text-sm md:text-base max-w-xl mb-8 leading-relaxed">
              We are a community of young people united by a shared vision to grow, learn, support one another and build a brighter future. At Alpha Youth Group, we believe every young person has potential. Together, we create opportunities for personal growth, leadership, community development, economic empowerment and meaningful friendships.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/login" className="bg-[#9333EA] text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-[#7e22ce] transition flex items-center gap-2">
                Join Alpha Today <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition flex items-center gap-2">
                <UserCheck size={18} /> Member Login
              </Link>
              <a href="#programs" className="bg-transparent border border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition flex items-center gap-2">
                Explore Our Programs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6 FEATURE GRID */}
      <section className="bg-[#0B1120] py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { icon: <Users size={24} />, title: "Youth Empowerment", desc: "Build skills, confidence and leadership." },
            { icon: <Globe size={24} />, title: "Community Development", desc: "Join projects that improve our communities." },
            { icon: <TrendingUp size={24} />, title: "Economic Empowerment", desc: "Explore savings, teamwork and income opportunities." },
            { icon: <Heart size={24} />, title: "Alpha Care", desc: "Support when you need it most." },
            { icon: <Calendar size={24} />, title: "Events & Activities", desc: "Connect, participate and have fun." },
            { icon: <UserCheck size={24} />, title: "Membership Community", desc: "Build friendships, share ideas, grow together." },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-[#9333EA]/20 flex items-center justify-center text-[#D946EF] mb-4 group-hover:bg-[#9333EA] group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <h4 className="font-bold text-sm mb-2">{item.title}</h4>
              <p className="text-[10px] text-gray-400 mb-3">{item.desc}</p>
              <span className="text-[10px] text-[#9333EA] font-bold group-hover:underline flex items-center gap-1">Learn More <ArrowRight size={10} /></span>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION & VISION */}
      <section id="about" className="py-20 bg-[#09090B]">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden h-[400px]">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-[#9333EA]/80 to-transparent"></div>
          </div>
          <div>
            <h2 className="text-3xl font-black mb-6">Our Mission & Vision</h2>
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#9333EA]/20 flex items-center justify-center text-[#D946EF] shrink-0"><Target size={24} /></div>
              <div>
                <h4 className="font-bold text-lg mb-1">Our Mission</h4>
                <p className="text-sm text-gray-400">To empower young people through education, mentorship, and community initiatives, creating opportunities for sustainable development and positive change.</p>
              </div>
            </div>
            <div className="flex gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#9333EA]/20 flex items-center justify-center text-[#D946EF] shrink-0"><Eye size={24} /></div>
              <div>
                <h4 className="font-bold text-lg mb-1">Our Vision</h4>
                <p className="text-sm text-gray-400">A united, empowered and prosperous youth driven by purpose, innovation, and community transformation.</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#9333EA]/20 to-transparent border border-[#9333EA]/30 p-4 rounded-xl flex items-center gap-3">
              <Crown className="text-[#FBBF24]" size={24} />
              <p className="text-sm font-bold text-white">Your journey to growth, opportunity and positive change starts here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT & CTA */}
      <section className="py-20 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-black mb-2">Our Impact</h2>
            <p className="text-sm text-gray-400 mb-8">Together, we make a difference.</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-4xl font-black text-white">7+</h3>
                <p className="text-xs text-[#D946EF] uppercase font-bold mt-1">Active Members</p>
              </div>
              <div>
                <h3 className="text-4xl font-black text-white">5+</h3>
                <p className="text-xs text-[#D946EF] uppercase font-bold mt-1">Community Projects</p>
              </div>
              <div>
                <h3 className="text-4xl font-black text-white">3+</h3>
                <p className="text-xs text-[#D946EF] uppercase font-bold mt-1">Annual Events</p>
              </div>
              <div>
                <h3 className="text-4xl font-black text-white">1</h3>
                <p className="text-xs text-[#D946EF] uppercase font-bold mt-1">Mission</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#9333EA] to-[#4C1D95] p-10 rounded-3xl relative overflow-hidden flex flex-col justify-center">
            <h2 className="text-3xl font-black text-white mb-4 relative z-10">Be Part of Something Bigger</h2>
            <p className="text-white/80 text-sm mb-8 max-w-sm relative z-10">Join Alpha Youth Group and become part of a supportive, ambitious and loving community.</p>
            <Link href="/login" className="bg-white text-[#9333EA] px-6 py-3 rounded-full font-bold w-fit hover:bg-gray-100 transition flex items-center gap-2 relative z-10">
              Join Now <ArrowRight size={18} />
            </Link>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#09090B] border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* LOGO IMAGE ADDED TO FOOTER */}
              <img src="/logo.png" alt="Alpha Youth Group Logo" className="w-10 h-10 object-contain" />
              <div><h3 className="font-black text-sm text-[#FBBF24]">ALPHA YOUTH GROUP</h3><p className="text-[9px] text-gray-400 italic">Together We Rise and Shine!</p></div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">Empowering young people, building communities, and creating opportunities for a better tomorrow.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-sm mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-400">
              <li><a href="#" className="hover:text-white">Home</a></li>
              <li><a href="#about" className="hover:text-white">About Us</a></li>
              <li><a href="#programs" className="hover:text-white">Programs</a></li>
              <li><a href="#" className="hover:text-white">Events</a></li>
              <li><a href="#" className="hover:text-white">Join Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">Our Programs</h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-400">
              <li><a href="#" className="hover:text-white">Youth Empowerment</a></li>
              <li><a href="#" className="hover:text-white">Community Development</a></li>
              <li><a href="#" className="hover:text-white">Economic Empowerment</a></li>
              <li><a href="#" className="hover:text-white">Alpha Care</a></li>
              <li><a href="#" className="hover:text-white">Events & Activities</a></li>
              <li><a href="#" className="hover:text-white">Membership</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4">Get In Touch</h4>
            <ul className="flex flex-col gap-3 text-xs text-gray-400 mb-6">
              <li className="flex items-center gap-2"><MapPin size={14} className="text-[#9333EA]" /> Nairobi, Kenya</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-[#9333EA]" /> +254 700 000 000</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-[#9333EA]" /> info@alphayouthgroup.org</li>
            </ul>
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#9333EA] cursor-pointer transition"><Share2 size={14} /></div>
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#9333EA] cursor-pointer transition"><MessageCircle size={14} /></div>
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#9333EA] cursor-pointer transition"><Camera size={14} /></div>
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#9333EA] cursor-pointer transition"><Briefcase size={14} /></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-5 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500">© 2025 Alpha Youth Group. All rights reserved.</p>
          <p className="text-[10px] text-[#9333EA] font-bold flex items-center gap-1">Together We Rise and Shine! <Crown size={12} /></p>
        </div>
      </footer>
    </div>
  );
}
