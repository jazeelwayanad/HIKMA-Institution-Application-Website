"use client";

import { Navbar } from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isDashboard = pathname === "/status/dashboard";

  return (
    <>
      {!isHomePage && !isDashboard && <Navbar />}
      <main className="flex-1 shrink-0">
        {children}
      </main>
    </>
  );
}

