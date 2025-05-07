"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChatInterface } from "@/components/chat-interface";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const supabase = createClient();

  // Fetch messages from DB
  const fetchMessages = async () => {
    try {
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (messagesError) throw messagesError;
      const formattedMessages = messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
      setMessages(formattedMessages);
      // Fetch conversation title
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .select("title")
        .eq("id", id)
        .single();
      if (conversationError) throw conversationError;
      setConversationTitle(conversation?.title || "New Chat");
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      // Add user message to the chat
      setMessages((prev) => [...prev, { role: "user", content: message }]);

      // Save user message to database
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: id,
        role: "user",
        content: message,
      });
      if (messageError) throw messageError;

      // Get response from ChatGPT API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: message }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        // Update the last message with the new chunk
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = assistantMessage;
          } else {
            newMessages.push({ role: "assistant", content: assistantMessage });
          }
          return newMessages;
        });
      }

      // Save assistant message to database
      const { error: assistantMessageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: id,
          role: "assistant",
          content: assistantMessage,
        });
      if (assistantMessageError) throw assistantMessageError;
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle first message from router state
  useEffect(() => {
    const handleFirstMessage = async () => {
      if (hasInitialized) return;

      // Get the first message from sessionStorage
      const firstMessage = sessionStorage.getItem("firstMessage");
      if (firstMessage) {
        // Clear it from sessionStorage
        sessionStorage.removeItem("firstMessage");
        // Process the first message
        await handleSendMessage(firstMessage);
      }
      setHasInitialized(true);
    };

    handleFirstMessage();
  }, [hasInitialized]);

  // Initial fetch of messages
  useEffect(() => {
    if (id) {
      fetchMessages();
    }
  }, [id]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
