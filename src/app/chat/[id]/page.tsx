"use client";

import { useEffect, useState, useRef } from "react";
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
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const supabase = createClient();

  // Fetch messages from DB
  const fetchMessages = async () => {
    try {
      // First check if conversation exists
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .select("title")
        .eq("id", id)
        .single();

      if (conversationError || !conversation) {
        // If conversation doesn't exist, redirect to /chat
        router.push("/chat");
        return;
      }

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
      setConversationTitle(conversation.title || "New Chat");
    } catch (error) {
      console.error("Error fetching messages:", error);
      // If there's an error, redirect to /chat
      router.push("/chat");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
          const response = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Failed to convert speech to text");
          }

          const data = await response.json();
          if (data.text) {
            // Instead of setting input directly, we'll call handleSendMessage
            // or update a shared input state if ChatInterface handles it.
            // For now, let's assume ChatInterface will have an input field
            // and a way to update it.
            // This part will need adjustment based on ChatInterface's props.
            setTranscribedText(data.text);
            // We need a way to get this text into the ChatInterface input
            // This might involve lifting state up or passing a setter down.
            // For now, I'll pass it to handleSendMessage.
            // Or, if ChatInterface has its own input, we'd call a prop to set its value.
            // Let's assume for now we want to send it as a message:
            // await handleSendMessage(data.text); // Or update an input field.
          }
        } catch (error) {
          console.error("Error converting speech to text:", error);
        } finally {
          setIsTranscribing(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        }
      };

      setTimeout(() => {
        mediaRecorder.start(100);
        setIsRecording(true);
      }, 100);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
      }, 500);
    }
  };

  const handleSendMessage = async (message: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userMetadata = user?.user_metadata;
    console.log(userMetadata);

    if (!message.trim()) return;
    setIsLoading(true);
    try {
      // Get user country if not already set
      let country = userCountry;
      if (!userCountry) {
        try {
          const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
          const data = await res.json();
          country = data.country || "Bangladesh";
          setUserCountry(country);
        } catch (err) {
          console.error("Error fetching country:", err);
          country = "Bangladesh";
          setUserCountry(country);
        }
      }

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
          country,
          country_choice: userMetadata?.country_choice,
          job_choice: userMetadata?.job_choice,
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
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          startRecording={startRecording}
          stopRecording={stopRecording}
          transcribedText={transcribedText}
          clearTranscribedText={() => setTranscribedText("")}
        />
      </div>
    </div>
  );
}
