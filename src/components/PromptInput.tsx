import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const PROMPTS = [
  "সৌদি আরবে নির্মাণ কাজের চাকরি খুঁজুন...",
  "দুবাইএ আমার পাসপোর্ট হারিয়ে গেছে, কি করা উচিত?",
  "বাংলাদেশে নিরাপদে টাকা পাঠানোর উপায়...",
  "কাতারে চাকরির সুযোগ খুঁজুন...",
];

export function PromptInput({ className }: { className?: string }) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const cyclingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Typing animation
  useEffect(() => {
    setDisplayed("");
    setTyping(true);
    let i = 0;
    function typeChar() {
      setDisplayed(PROMPTS[promptIndex].slice(0, i));
      if (i < PROMPTS[promptIndex].length) {
        typingTimeout.current = setTimeout(() => {
          i++;
          typeChar();
        }, 40);
      } else {
        setTyping(false);
        cyclingTimeout.current = setTimeout(() => {
          setPromptIndex((idx) => (idx + 1) % PROMPTS.length);
        }, 1800);
      }
    }
    typeChar();
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (cyclingTimeout.current) clearTimeout(cyclingTimeout.current);
    };
  }, [promptIndex]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl min-h-[95vh] w-full mx-4 bg-gradient-to-b from-slate-900 to-emerald-400/60",
        className
      )}
    >
      <div className="text-white text-6xl font-bold bg-emerald-800 rounded-full px-5 py-2 mb-5">
        P
      </div>
      <div className="text-white text-4xl font-bold mb-6">প্রবাসি বট</div>

      <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 shadow-lg">
        <div className="flex items-center w-[400px] max-w-full">
          <Input
            className="bg-white/80 dark:bg-neutral-900/60 border-none shadow-none text-lg px-4 py-3 focus:ring-0 focus:outline-none placeholder:text-neutral-500"
            value={displayed}
            placeholder="Type your prompt..."
            readOnly
            tabIndex={-1}
            aria-label="Prompt input"
          />
          <button
            type="button"
            className="ml-2 flex items-center justify-center rounded-full bg-neutral-900 text-white w-10 h-10 hover:bg-neutral-800 transition-colors"
            tabIndex={-1}
            aria-label="Send (for show only)"
            disabled
          >
            <ArrowUp size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
