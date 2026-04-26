"use client";

import { useState, useEffect } from "react";
import { updateApplicationStatus } from "@/app/actions/adminApplications";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getBadgeStyles, getDotStyles } from "@/lib/colorUtils";

type StatusMeta = { label: string; value: string; color: string } | undefined;

// Removed legacy color classes in favor of dynamic hex styles

export function InlineStatusDropdown({
  applicationId,
  currentStatus,
  statusMeta,
  allStatuses,
  className,
}: {
  applicationId: string;
  currentStatus: string;
  statusMeta: StatusMeta;
  allStatuses: { label: string; value: string; color: string }[];
  className?: string;
}) {
  const [optimisticStatus, setOptimisticStatus] = useState<StatusMeta>(statusMeta);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<typeof allStatuses[0] | null>(null);
  const [note, setNote] = useState("");

  // Sync state if it gets changed from the outside (like from Bulk Actions)
  useEffect(() => {
    setOptimisticStatus(statusMeta);
  }, [statusMeta]);

  const handleSelectStatus = (status: { label: string; value: string; color: string }) => {
    setPendingStatus(status);
    setNote(""); // Clear previous note
    setDialogOpen(true);
  };

  const handleConfirmChange = async () => {
    if (!pendingStatus) return;
    setOptimisticStatus(pendingStatus);
    setIsUpdating(true);
    setDialogOpen(false);
    await updateApplicationStatus(applicationId, pendingStatus.value, note);
    setIsUpdating(false);
    setPendingStatus(null);
  };

  const displayed = optimisticStatus ?? { label: currentStatus, value: currentStatus, color: "indigo" };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isUpdating}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border-2 text-xs font-bold transition-all outline-none cursor-pointer hover:opacity-80 disabled:opacity-60 ${className || ''}`}
        style={getBadgeStyles(displayed.color)}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={getDotStyles(displayed.color)} />
        {displayed.label}
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52 p-1.5 rounded-xl shadow-lg">
        <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-2 py-1.5">
          Change Status
        </div>
        <DropdownMenuSeparator className="my-1" />
        {allStatuses.map((s: typeof allStatuses[0]) => (
          <DropdownMenuItem
            key={s.value}
            onClick={() => handleSelectStatus(s)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer"
            disabled={s.value === displayed.value}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={getDotStyles(s.color)} />
            <span className="flex-1 text-sm">{s.label}</span>
            {s.value === displayed.value && (
              <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Change status to <strong>{pendingStatus?.label}</strong>. You can optionally leave a note for the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              id="note"
              placeholder="Type your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3 min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleConfirmChange} disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isUpdating ? "Saving..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
