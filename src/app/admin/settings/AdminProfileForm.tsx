"use client";

import { useState } from "react";
import { updateAdminProfile } from "@/app/actions/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

interface AdminProfileFormProps {
  adminId: string;
  email: string;
}

export function AdminProfileForm({ adminId, email }: AdminProfileFormProps) {
  const [newEmail, setNewEmail] = useState(email);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (!newEmail.trim()) {
      setMessage({ type: "error", text: "Email is required" });
      return;
    }

    if (!newPassword && newEmail === email) {
      setMessage({ type: "error", text: "No changes made" });
      return;
    }

    setLoading(true);

    const updateData: { email?: string; password?: string } = {};
    if (newEmail !== email) updateData.email = newEmail;
    if (newPassword) updateData.password = newPassword;

    const result = await updateAdminProfile(adminId, updateData);

    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update profile" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700 font-semibold">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="h-11"
          required
        />
        <p className="text-xs text-slate-400">Current: {email}</p>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h3 className="font-semibold text-slate-700">Change Password (Optional)</h3>

        <div className="relative">
          <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
            New Password
          </Label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 pr-10"
              placeholder="Leave blank to keep current password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="relative">
          <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-sm">
            Confirm Password
          </Label>
          <div className="relative mt-2">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 pr-10"
              placeholder="Re-enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-slate-900 text-white hover:bg-slate-800 h-11 px-8 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
