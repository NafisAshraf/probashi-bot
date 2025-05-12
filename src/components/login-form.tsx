"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email + "@probashibot.com",
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/chat");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "একটি ত্রুটি ঘটেছে");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold">লগইন</h2>
        <p className="text-muted-foreground">
          লগইন করতে নিচে আপনার ফোন নম্বর দিন
        </p>
      </div>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">ফোন নম্বর</Label>
            <Input
              id="email"
              type="text"
              placeholder="01987654321"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              {/* <Link
                href="/auth/forgot-password"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </Link> */}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "লগইন হচ্ছে..." : "লগইন"}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/sign-up" className="underline underline-offset-4">
            সাইন আপ
          </Link>
        </div>
      </form>
    </div>
  );
}
