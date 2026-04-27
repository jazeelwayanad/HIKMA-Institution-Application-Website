"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FileEdit, Users, Settings, ShieldCheck, LogOut, Menu, X, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { logoutAdmin } from "@/app/actions/adminAuth";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Course Manager", icon: BookOpen },
  { href: "/admin/applications", label: "Applications", icon: Users },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "System Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex-shrink-0">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>
        <span className="text-xl font-black text-white tracking-tight">Admin Portal</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link: typeof navLinks[0]) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold group ${
                isActive
                  ? "bg-indigo-600 shadow-md shadow-indigo-500/20 text-white"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-indigo-200" : "text-slate-500 group-hover:text-indigo-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800/60">
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group text-sm font-semibold"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
            <span>Secure Logout</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* ─── Mobile Top Bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[#0B0F19] border-b border-slate-800 flex items-center px-4 gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-base font-black text-white tracking-tight">Admin Portal</span>
        </div>
      </div>

      {/* ─── Mobile Backdrop ─── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Mobile Drawer ─── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 z-50 bg-[#0B0F19] flex flex-col transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
          <NavContent />
        </div>
      </aside>

      {/* ─── Desktop Fixed Sidebar ─── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-72 z-30 bg-[#0B0F19] border-r border-slate-800 flex-col overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
          <NavContent />
        </div>
      </aside>
    </>
  );
}
