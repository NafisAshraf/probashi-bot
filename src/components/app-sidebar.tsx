"use client";

import * as React from "react";
import {
  MessagesSquare,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useConversation } from "@/lib/contexts/conversation-context";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  items?: {
    title: string;
    url: string;
    isActive?: boolean;
  }[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  conversations: Conversation[];
}
export function AppSidebar({ conversations, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { triggerRefresh } = useConversation();

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/delete?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      // If current route matches deleted conversation, redirect to /chat
      if (pathname === `/chat/${id}`) {
        router.push("/chat");
      }

      // Trigger sidebar refresh to update the list
      triggerRefresh();
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const t = useTranslations();
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link className="flex items-center " href="/chat">
                <div className="bg-sidebar-primary dark:bg-emerald-700 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <MessageSquare className="size-4" />
                </div>
                <div className="text-2xl font-bold ">{t("logo")}</div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="">
        <SidebarGroup className="px-0 mx-0">
          <SidebarMenu>
            <SidebarMenuItem className="px-3">
              <SidebarMenuButton
                variant="outline"
                className="w-full bg-emerald-700 hover:bg-emerald-600 hover:text-white text-white  pe-6 my-4 rounded-md transition-colors duration-200 ease-in-out"
                asChild
              >
                <Link
                  href="/chat"
                  className="flex items-center justify-center gap-2 px-4 py-1 w-full"
                >
                  <span className="flex items-center justify-center">
                    <Plus className="size-4 stroke-[1.5]" />
                  </span>
                  <span className="font-semibold text-sm">New Chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {conversations.map((item) => (
              <SidebarMenuItem key={item.id} className="px-3">
                <div className="flex items-center w-full relative">
                  <SidebarMenuButton
                    asChild
                    className={
                      pathname === `/chat/${item.id}` ? "bg-sidebar-accent" : ""
                    }
                  >
                    <Link href={`/chat/${item.id}`} className="h-full flex-1">
                      <div>
                        <div className="font-semibold">
                          {(
                            item.title.charAt(0).toUpperCase() +
                            item.title.slice(1)
                          ).length > 30
                            ? (
                                item.title.charAt(0).toUpperCase() +
                                item.title.slice(1)
                              ).substring(0, 27) + "..."
                            : item.title.charAt(0).toUpperCase() +
                              item.title.slice(1)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(item.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>
                      <div className="ml-auto opacity-0 hover:opacity-100 transition-opacity absolute right-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="p-2 hover:bg-sidebar-accent rounded-md"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/chat/${item.id}`)}
                            >
                              <Eye className="size-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <Link href="/forum">
          <Button variant="ghost" className="w-full border-t rounded-none">
            <MessagesSquare className="size-4 " />
            <p>Visit Forum</p>
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
