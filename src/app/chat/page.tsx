"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Mic, MicOff, Loader2 } from "lucide-react";
import { useConversation } from "@/lib/contexts/conversation-context";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ChatPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { triggerRefresh } = useConversation();
  const t = useTranslations();

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
            setInput(data.text);
          }
        } catch (error) {
          console.error("Error converting speech to text:", error);
        } finally {
          setIsTranscribing(false);
          // Stop all audio tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        }
      };

      // Start recording with a small delay to ensure we capture the beginning
      setTimeout(() => {
        mediaRecorder.start(100); // Collect data every 100ms
        setIsRecording(true);
      }, 100);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Add a small delay before stopping to capture the last words
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
      }, 500);
    }
  };

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
        {/* Welcome Section */}
        <div className="flex flex-col items-center justify-center w-full ">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full  bg-emerald-700 w-18 h-18 flex items-center justify-center">
              <span className="text-white text-5xl font-bold">
                {/* <MessageSquare /> */}P
              </span>
            </div>
          </div>
          <h1 className="text-2xl xl:text-3xl font-bold text-center mb-2">
            {t("welcome")}
          </h1>
          <p className="px-12 xl:px-0 text-lg text-center text-muted-foreground mb-8">
            {t("subtitle")}
          </p>
          <div className="hidden xl:flex xl:flex-row gap-6 w-full max-w-4xl justify-center">
            {[
              {
                icon: "🛂",
                title: t("cards.visa.title"),
                description: t("cards.visa.description"),
              },
              {
                icon: "💼",
                title: t("cards.jobs.title"),
                description: t("cards.jobs.description"),
              },
              {
                icon: "💰",
                title: t("cards.finance.title"),
                description: t("cards.finance.description"),
              },
            ].map((card, idx) => (
              <div
                key={card.title}
                className="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-md p-8 flex flex-col items-center text-center transition hover:shadow-lg"
              >
                <div className="mb-4 text-3xl">{card.icon}</div>
                <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center md:max-w-2xl px-8 md:px-10 lg:px-4 mx-auto mt-12 w-full gap-2">
          <Input
            className="flex-1 py-5 rounded-2xl px-5 bg-background dark:bg-neutral-950 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base shadow-sm dark:shadow-white/10"
            placeholder={
              isTranscribing ? "Transcribing..." : t("askPlaceholder")
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            disabled={isLoading || isTranscribing}
            autoFocus
          />
          <Button
            size="icon"
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            className={`rounded-full ${
              isRecording ? "bg-red-500 hover:bg-red-600" : ""
            }`}
            disabled={isTranscribing}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isTranscribing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>
          <Button
            size="icon"
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim() || isTranscribing}
            className="rounded-full"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        {/* <p className="text-muted-foreground text-sm pt-4">
          You can also visit our{" "}
          <Link href="/forum" className="text-primary">
            Forum
          </Link>{" "}
        </p> */}
      </div>
    </>
  );
}
