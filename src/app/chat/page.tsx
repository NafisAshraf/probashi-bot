"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useConversation } from "@/lib/contexts/conversation-context";

export default function ChatPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { triggerRefresh } = useConversation();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      // Store the first message in sessionStorage
      sessionStorage.setItem("firstMessage", message);

      // Send request to create-chat API endpoint
      const response = await fetch("/api/create-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const data = await response.json();

      // Trigger sidebar refresh
      triggerRefresh();

      // Redirect to the new conversation page
      if (data && data.conversationId) {
        router.push(`/chat/${data.conversationId}`);
      } else {
        console.error("No conversation ID returned from API");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full w-full pb-32">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          What can I help with?
        </h1>

        <div className="flex items-center justify-center md:max-w-2xl px-8 md:px-10 lg:px-4 mx-auto my-10 w-full gap-2">
          <Input
            className="flex-1 bg-background dark:bg-background border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base shadow-sm dark:shadow-white/10"
            placeholder="Ask anything"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            disabled={isLoading}
            autoFocus
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="rounded-full"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
