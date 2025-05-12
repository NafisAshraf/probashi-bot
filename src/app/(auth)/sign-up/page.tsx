"use client";
import { SignUpForm } from "@/components/sign-up-form";
import { PromptInput } from "@/components/PromptInput";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
export default function Page() {
  return (
    <div className="flex dark:bg-neutral-900 relative">
      <Link
        href="/login"
        className="flex items-center gap-2 absolute top-0 left-0 mt-5 ms-5"
      >
        <MessageSquare className="bg-emerald-800 px-2 w-10 h-10 rounded-xl text-white" />
        {/* <p className="text-2xl font-semibold pb-1">Probashi Bot</p> */}
      </Link>
      <div className="flex min-h-svh w-full xl:w-1/2 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
      <div className="w-1/2 hidden xl:flex items-center justify-center">
        <PromptInput />
      </div>
    </div>
  );
}
