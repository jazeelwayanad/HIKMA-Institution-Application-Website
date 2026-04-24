"use client";

import { useState } from "react";
import { loginAdmin } from "@/app/actions/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const res = await loginAdmin(formData);
    if (!res.success) {
      setError(res.error || "Login failed");
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>
      
      <div className="w-full max-w-sm bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
        <p className="text-slate-400 text-sm mb-6">Sign in to manage courses and applications.</p>
        
        {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-md text-sm">{error}</div>}
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
            <Input id="email" name="email" type="email" required placeholder="Your Email Address" className="bg-slate-900 border-slate-700 text-slate-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" className="bg-slate-900 border-slate-700 text-slate-200" />
            {/* <p className="text-xs text-slate-500 mt-1">Default test credentials: admin@eduporta.com / password</p> */}
          </div>
          <Button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white border-0">Sign In</Button>
        </form>
      </div>
    </div>
  );
}
