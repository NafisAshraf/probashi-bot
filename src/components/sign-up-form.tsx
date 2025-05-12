"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import { MessageSquare } from "lucide-react";
// import MultiSelect from "./multi-select";
import SelectSearch from "./select-search";
import CountrySelect from "./country-select";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: phoneNumber + "@probashibot.com",
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            country_choice: country,
            job_choice: industry,
          },
        },
      });

      if (authError) throw authError;
      console.log(authError);

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            full_name: fullName,
            phone_number: phoneNumber,
            country_choice: country,
            job_choice: industry,
          });

        if (profileError) throw profileError;
      }

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
        {/* <Link href="/login">
          <MessageSquare className="bg-emerald-800 px-2 w-10 h-10 mb-3 rounded-xl" />
        </Link> */}
        <h2 className="text-3xl font-bold">সাইন আপ</h2>
        <p className="text-muted-foreground">নতুন একাউন্ট খুলুন</p>
      </div>
      <form onSubmit={handleSignUp}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="full-name">পুরো নাম</Label>
            <Input
              id="full-name"
              type="text"
              placeholder="পুরো নাম"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone-number">ফোন নম্বর</Label>
            <Input
              id="phone-number"
              type="text"
              placeholder="ফোন নম্বর"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">আপনি কোন দেশে কাজ করতে চান?</Label>
            <CountrySelect
              id="country"
              // placeholder="Select a country"
              required
              value={country}
              onChange={(value) => setCountry(value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="industry">আপনি কোন ক্ষেত্রে কাজ করতে চান?</Label>
            <SelectSearch
              id="industry"
              required
              value={industry}
              onChange={(value) => setIndustry(value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="পাসওয়ার্ড"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "একাউন্ট তৈরি করা হচ্ছে..." : "সাইন আপ"}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          একাউন্ট আছে?{" "}
          <Link href="/login" className="underline underline-offset-4">
            লগইন করুন
          </Link>
        </div>
      </form>
    </div>
  );
}
