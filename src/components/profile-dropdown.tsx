"use client";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";

export default function ProfileDropdown() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log(user);
      if (user?.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name);
      }
      if (user?.email) {
        setEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto px-3 hover:bg-transparent">
            <div className="h-8 w-8 rounded-full bg-emerald-900 flex items-center justify-center text-white">
              {fullName.charAt(0)}
            </div>
            <ChevronDownIcon
              size={16}
              className="opacity-60"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-64">
          <DropdownMenuLabel className="flex min-w-0 flex-col">
            <span className="text-foreground truncate text-sm font-medium">
              {fullName}
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              {email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
