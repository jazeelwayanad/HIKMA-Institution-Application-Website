"use client";

import { useState } from "react";
import { loginStudent } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function StatusLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const mobile = formData.get("mobileNumber") as string;
    const dob = formData.get("dob") as string;

    const result = await loginStudent(mobile, dob);

    if (result.success) {
      router.push("/status/dashboard");
    } else {
      setError(result.error || "Login failed");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      
      <div className="relative w-full max-w-md rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Check Application Status</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to view your application progress or download forms.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="text-slate-700">Mobile Number</Label>
            <Input 
              id="mobileNumber" 
              name="mobileNumber" 
              placeholder="e.g. +1 234 567 8900" 
              required 
              className="bg-white/50 border-slate-200 focus:border-indigo-500 font-medium tracking-wide"
            />
            <p className="text-[10px] text-slate-400 italic">
              Note: Use any mobile number registered in your application (WhatsApp, Mother, or Guardian).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="text-slate-700">Date of Birth</Label>
            <Input 
              id="dob" 
              name="dob" 
              type="date" 
              required 
              className="bg-white/50 border-slate-200 focus:border-indigo-500 text-slate-600"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-200 transition-all active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "View Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
