"use client";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LogoutButton } from "./logout-button";

export default function ProfileDropdown() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();

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
        setEmail(user.email.split("@")[0]);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  function setLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`;
    router.refresh();
  }

  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto px-3 hover:bg-transparent">
            <div className="h-8 w-8 rounded-full bg-emerald-900 flex items-center justify-center text-white pb-[2px]">
              {fullName.charAt(0)}
            </div>
            <ChevronDownIcon
              size={16}
              className="opacity-60"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-w-64">
          <DropdownMenuLabel className="flex min-w-0 flex-col">
            <span className="text-foreground truncate text-sm font-medium">
              {fullName}
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              {email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
          >
            {/* <div className="flex items-center justify-between w-full">
              <div
                className={`${
                  locale === "en" ? "bg-emerald-700 px-1 rounded-full" : ""
                }
                px-3 py-1`}
              >
                English
              </div>
              <div
                className={`${
                  locale === "bn" ? "bg-emerald-700 px-1 rounded-full" : ""
                }
              px-3 py-1`}
              >
                Bangla
              </div>
            </div> */}

            <div className="flex items-center justify-between w-full px-1">
              <div>Language: </div>
              <div className="pe-2"> {locale === "en" ? "EN" : "BD"}</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between w-full px-1">
              <div>Dark Mode</div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
