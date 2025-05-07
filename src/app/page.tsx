import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
  return (
    <div>
      <h1>Landing Page</h1>
      <Button variant="outline" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    </div>
  );
}
