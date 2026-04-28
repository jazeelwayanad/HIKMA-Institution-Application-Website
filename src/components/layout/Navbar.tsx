import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
        {/* Logo + Name */}
        <div className="mr-4 flex flex-1">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 shadow-sm">
              <Image
                src="/logo.webp"
                alt="Al-Warda Women's College Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-slate-800 leading-tight hidden sm:block group-hover:text-slate-900 transition-colors">
              Al-Warda Women's College
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-3">
          <Link
            href="/status"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 hidden sm:inline-block px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            Check Status
          </Link>
          <Button asChild className="rounded-full px-5">
            <Link href="/apply">Apply Now</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
