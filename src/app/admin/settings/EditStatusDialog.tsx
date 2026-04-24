"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { updateStatus, deleteStatus } from "@/app/actions/adminSettings";
import { ApplicationStatus } from "@prisma/client";

export function EditStatusDialog({ status }: { status: ApplicationStatus }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isCore = ['PENDING', 'APPROVED', 'REJECTED'].includes(status.value);

  async function handleUpdate(fd: FormData) {
    setLoading(true);
    const label = fd.get("label") as string;
    const color = fd.get("color") as string;
    const description = fd.get("description") as string;
    await updateStatus(status.id, label, color, description);
    setLoading(false);
    setOpen(false);
  }

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this status?")) {
      await deleteStatus(status.id);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Badge 
          variant="outline" 
          className={`px-4 py-1.5 text-sm font-medium border-2 rounded-full transition-colors hover:opacity-80 cursor-pointer
            ${status.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
              status.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
              status.color === 'red' ? 'bg-red-50 text-red-700 border-red-200' : 
              'bg-indigo-50 text-indigo-700 border-indigo-200'}`}
        >
          {status.label}
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Status: {status.label}</DialogTitle>
        </DialogHeader>
        <form action={handleUpdate} className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-semibold">Status Label</Label>
              <Input name="label" defaultValue={status.label} required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-semibold">Color Theme</Label>
              <select name="color" defaultValue={status.color} className="w-full h-10 border border-slate-200 rounded-md bg-white text-sm px-2 focus:ring-1 focus:ring-slate-900 outline-none">
                <option value="indigo">Indigo</option>
                <option value="amber">Amber</option>
                <option value="rose">Rose</option>
                <option value="emerald">Emerald</option>
                <option value="slate">Slate</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-semibold">Client-facing Description</Label>
              <Input name="description" defaultValue={status.description || ""} placeholder="A friendly description shown to applicants..." />
            </div>
          </div>
          <div className="flex justify-between pt-4 gap-2">
            {!isCore ? (
              <Button type="button" variant="destructive" onClick={handleDelete} className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">Delete</Button>
            ) : (
              <div /> // Core status spacer
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
