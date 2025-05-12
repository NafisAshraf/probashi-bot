"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-neutral-900 ">
      <div className="flex-1 overflow-y-auto max-w-full mx-auto w-full md:max-w-3xl xl:max-w-4xl space-y-5 px-6 py-5 xl:py-0">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3  ${
                message.role === "user"
                  ? "bg-emerald-700 dark:bg-emerald-800 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 py-5 px-7"
              }`}
            >
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content.split("\n").join("\n\n")}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className=" w-full py-5 border-t dark:border-neutral-800 sticky bottom-0 bg-white dark:bg-neutral-900 px-5"
      >
        <div className="flex space-x-2 max-w-full md:max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 ring-emerald-700 dark:ring-emerald-800 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ring-emerald-700 dark:ring-emerald-800 ${
              isLoading
                ? "bg-neutral-400 dark:bg-neutral-600 cursor-not-allowed"
                : "bg-emerald-700 dark:bg-emerald-800 hover:bg-emerald-800 dark:hover:bg-emerald-900 text-white"
            }`}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
