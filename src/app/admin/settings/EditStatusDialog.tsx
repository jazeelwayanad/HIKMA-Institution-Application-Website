"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { updateStatus, deleteStatus } from "@/app/actions/adminSettings";
import { ApplicationStatus } from "@prisma/client";
import { getBadgeStyles, getHexColor } from "@/lib/colorUtils";

export function EditStatusDialog({ status }: { status: ApplicationStatus }) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    setLoading(true);
    await deleteStatus(status.id);
    setLoading(false);
    setDeleteDialogOpen(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Badge 
          variant="outline" 
          className="px-4 py-1.5 text-sm font-medium border-2 rounded-full transition-colors hover:opacity-80 cursor-pointer"
          style={getBadgeStyles(status.color)}
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
              <div className="flex items-center gap-2">
                <Input type="color" name="color" defaultValue={getHexColor(status.color)} className="w-12 h-10 p-1 cursor-pointer" />
                <span className="text-xs text-slate-500">Pick a color</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-semibold">Client-facing Description</Label>
              <Input name="description" defaultValue={status.description || ""} placeholder="A friendly description shown to applicants..." />
            </div>
          </div>
          <div className="flex justify-between pt-4 gap-2">
            {!isCore ? (
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 transition-colors">Delete</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this status?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This status will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete Status</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
