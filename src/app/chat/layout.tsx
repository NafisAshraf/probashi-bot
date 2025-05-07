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

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

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
      <div className="flex h-screen w-full">
        <AppSidebar conversations={conversations} />
        <SidebarInset className="dark:bg-neutral-900">
          <header className="sticky top-0 z-50 border-b bg-white dark:bg-neutral-900 dark:xl:bg-transparent dark: xl:border-none flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="ml-auto ">
              <ModeToggle />
            </div>
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
