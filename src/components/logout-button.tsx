"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div onClick={logout} className="flex items-center w-full">
      <LogOutIcon size={16} className="opacity-60 mr-2" aria-hidden="true" />
      Logout
    </div>
  );
}
