import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              Al-Warda Women's College
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-4">
            <Link
              href="/status"
              className="text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block"
            >
              Check Status
            </Link>
            <Button asChild className="rounded-full">
              <Link href="/apply">Apply Now</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
