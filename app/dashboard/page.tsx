"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const MASTER_ADMIN_EMAIL = "gibsonmjomba20@gmail.com";

export default function DashboardRouter() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const routeUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", user.id).single();

      if (profile) {
        if (profile.email === MASTER_ADMIN_EMAIL || profile.role === 'admin') {
          router.push("/dashboard/admin");
        } else if (profile.role === 'treasurer') {
          router.push("/dashboard/treasurer");
        } else {
          router.push("/dashboard/member");
        }
      } else {
        router.push("/login");
      }
    };
    routeUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center text-[#9333EA]">
      <RefreshCw className="animate-spin mb-4" size={40} />
      <p className="font-bold">Routing to your portal...</p>
    </div>
  );
}
