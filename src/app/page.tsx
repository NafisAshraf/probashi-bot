import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
  return (
    <div>
      <h1>Landing Page</h1>
      <Button variant="outline" asChild>
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </div>
  );
}
