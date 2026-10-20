"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else if (authMode === "register") {
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
          email, password, options: { data: { full_name: fullName } } 
        });
        if (authError) throw authError;
        router.push("/dashboard"); 
      } else if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        alert("Password reset link sent to your email!");
        setAuthMode("login");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-5 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#9333EA]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-[#D946EF]/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md bg-[#18181B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#9333EA] to-[#4C1D95] rounded-2xl flex items-center justify-center text-white font-black italic text-2xl shadow-lg shadow-[#9333EA]/20 mb-4">A</div>
          <h1 className="text-2xl font-black text-white tracking-tight">ALPHA YOUTH GROUP</h1>
        </div>
        
        {authMode !== "forgot" && (
          <div className="flex bg-black/40 p-1 rounded-xl mb-6">
            <button onClick={() => { setAuthMode("login"); setErrorMsg(""); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === "login" ? 'bg-[#9333EA] text-white shadow-lg' : 'text-gray-400'}`}>Login</button>
            <button onClick={() => { setAuthMode("register"); setErrorMsg(""); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === "register" ? 'bg-[#9333EA] text-white shadow-lg' : 'text-gray-400'}`}>Register</button>
          </div>
        )}

        {authMode === "forgot" && (
          <div className="flex items-center gap-2 mb-6 cursor-pointer text-gray-400 hover:text-white" onClick={() => setAuthMode("login")}>
            <ArrowLeft size={16} /> <span className="text-sm font-bold">Back to Login</span>
          </div>
        )}

        {errorMsg && (<div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg mb-4 text-center font-bold">{errorMsg}</div>)}
        
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {authMode === "register" && (
            <>
              <div className="relative"><User className="absolute left-4 top-3.5 text-gray-500" size={20} /><input type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#9333EA] transition-colors" /></div>
              <div className="relative"><Phone className="absolute left-4 top-3.5 text-gray-500" size={20} /><input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#9333EA] transition-colors" /></div>
            </>
          )}
          <div className="relative"><Mail className="absolute left-4 top-3.5 text-gray-500" size={20} /><input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#9333EA] transition-colors" /></div>
          {authMode !== "forgot" && (
            <div className="relative"><Lock className="absolute left-4 top-3.5 text-gray-500" size={20} /><input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#9333EA] transition-colors" /></div>
          )}
          {authMode === "login" && (<p className="text-right text-xs text-[#D946EF] cursor-pointer hover:underline font-bold" onClick={() => setAuthMode("forgot")}>Forgot Password?</p>)}
          
          <Button type="submit" disabled={loading} variant="primary" className="mt-2 w-full py-4 text-base">
            {loading ? <Loader2 className="animate-spin" size={20} /> : (authMode === "login" ? "Sign In" : authMode === "register" ? "Create Account" : "Send Reset Link")}
          </Button>
        </form>

        {authMode !== "forgot" && (
          <>
            <div className="flex items-center gap-4 my-6"><div className="h-px bg-white/10 flex-1"></div><span className="text-xs text-gray-500 font-bold">OR</span><div className="h-px bg-white/10 flex-1"></div></div>
            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
