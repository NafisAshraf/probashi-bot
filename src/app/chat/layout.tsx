"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  ConversationProvider,
  useConversation,
} from "@/lib/contexts/conversation-context";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { ModeToggle } from "@/components/mode-toggle";
import { LogoutButton } from "@/components/logout-button";
import ProfileDropdown from "@/components/profile-dropdown";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import LanguageSwitcher from "@/components/language-switcher";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

// function LanguageSwitcher() {
//   const router = useRouter();
//   const locale = useLocale();

//   function setLocale(newLocale: string) {
//     document.cookie = `NEXT_LOCALE=${newLocale}; path=/`;
//     router.refresh();
//   }

//   return (
//     <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 rounded-full border px-1 py-1 text-xs">
//       <button
//         className={`hover:cursor-pointer px-4 py-2 rounded-full font-bold ${
//           locale === "en"
//             ? "bg-emerald-700 text-white"
//             : "text-gray-700 dark:text-gray-300"
//         }`}
//         onClick={() => setLocale("en")}
//       >
//         English
//       </button>
//       <button
//         className={`hover:cursor-pointer px-4 py-2 rounded-full font-bold ${
//           locale === "bn"
//             ? "bg-emerald-700 text-white"
//             : "text-gray-700 dark:text-gray-300"
//         }`}
//         onClick={() => setLocale("bn")}
//       >
//         বাংলা
//       </button>
//     </div>
//   );
// }

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { refreshTrigger } = useConversation();
  const supabase = createClient();

  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      setConversations(data || []);
    };

    fetchConversations();
  }, [refreshTrigger]);

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar conversations={conversations} />
        <SidebarInset className="dark:bg-neutral-900">
          <header className="sticky top-0 z-50 border-b bg-white dark:bg-neutral-900  dark: xl:border-none flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="mx-auto"></div>
            {/* <div className="ml-auto flex items-center gap-4">
              <LanguageSwitcher />
              <ModeToggle />
            </div> */}
            <div className="pe-3">
              <ProfileDropdown />
            </div>
          </header>
          <main className="h-full ">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConversationProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </ConversationProvider>
  );
}
