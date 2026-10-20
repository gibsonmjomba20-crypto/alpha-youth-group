"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      alert("Error updating password: " + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-[#18181B] border border-white/10 rounded-3xl p-8">
        {success ? (
          <div className="text-center">
            <CheckCircle2 size={48} className="mx-auto text-[#10B981] mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Password Updated!</h2>
            <p className="text-gray-400 text-sm">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white text-center mb-6">Set New Password</h1>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input type="password" placeholder="New Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#9333EA]" />
              </div>
              <Button type="submit" disabled={loading} className="w-full py-4 mt-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
