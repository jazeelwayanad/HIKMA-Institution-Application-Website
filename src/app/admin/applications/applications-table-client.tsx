"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InlineStatusDropdown } from "./inline-status";
import { ApplicationsClientAction } from "./client-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { bulkUpdateApplicationStatuses, bulkDeleteApplications } from "@/app/actions/adminApplications";
import { Check, X, Trash2, Loader2, ChevronUp } from "lucide-react";
import { getHexColor } from "@/lib/colorUtils";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function ApplicationsTableClient({
  applications,
  availableStatuses,
}: {
  applications: any[];
  availableStatuses: { id: string; label: string; value: string; color: string }[];
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const toggleAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map((app: typeof applications[0]) => app.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter((x: string) => x !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedIds.length === 0) return;
    setIsUpdating(true);
    await bulkUpdateApplicationStatuses(selectedIds, status);
    setSelectedIds([]);
    setIsUpdating(false);
    router.refresh(); // Request Next.js to re-fetch Server Components with new data
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsUpdating(true);
    await bulkDeleteApplications(selectedIds);
    setSelectedIds([]);
    setIsUpdating(false);
    setDeleteDialogOpen(false);
    router.refresh(); // Request Next.js to re-fetch Server Components with new data
  };

  if (applications.length === 0) {
    return <div className="p-12 text-center text-slate-500">No applications match your filter.</div>;
  }

  return (
    <div className="relative overflow-x-auto pb-24">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
          <tr>
            <th className="px-6 py-4 w-12 text-center">
              <Checkbox
                checked={selectedIds.length === applications.length && applications.length > 0}
                onCheckedChange={toggleAll}
              />
            </th>
            <th className="px-6 py-4">App ID</th>
            <th className="px-6 py-4">Applicant</th>
            <th className="px-6 py-4">Program</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((app: typeof applications[0]) => {
            const statusMeta = availableStatuses.find((s: typeof availableStatuses[0]) => s.value === app.status);
            const isSelected = selectedIds.includes(app.id);

            // Extract applicant name flexibly
            const applicantName =
              app.data?.full_name ||
              app.data?.name ||
              app.data?.applicant_name ||
              app.data?.firstName ||
              "Student";

            return (
              <tr key={app.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-indigo-50/50" : ""}`}>
                <td className="px-6 py-4 align-middle text-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleOne(app.id)}
                  />
                </td>
                <td className="px-6 py-4 align-middle whitespace-nowrap">
                  <Link href={`/admin/applications/${app.id}`} className="block">
                    <span className="font-mono text-indigo-600 font-bold hover:underline">{app.applicationNo}</span>
                    <p className="text-xs text-slate-400 mt-1">{new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </Link>
                </td>
                <td className="px-6 py-4 align-middle text-slate-900 font-medium">
                  {applicantName}
                </td>
                <td className="px-6 py-4 align-middle text-slate-700 font-medium">
                  {app.course.title}
                  {app.data?.sub_course && (
                    <p className="text-[10px] text-indigo-500 font-bold uppercase mt-0.5 tracking-wider">
                      {app.data.sub_course}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 align-middle">
                  <InlineStatusDropdown
                    applicationId={app.id}
                    currentStatus={app.status}
                    statusMeta={statusMeta}
                    allStatuses={availableStatuses.map((s: typeof availableStatuses[0]) => ({ label: s.label, value: s.value, color: s.color }))}
                  />
                </td>
                <td className="px-6 py-4 align-middle text-right">
                  <ApplicationsClientAction
                    applicationId={app.id}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-indigo-900/20 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-indigo-600 font-bold text-white w-6 h-6 rounded-full text-xs">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium text-slate-300">Selected</span>
          </div>

          <div className="w-px h-6 bg-slate-700 mx-2"></div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                Change Status <ChevronUp className="w-4 h-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl shadow-slate-900 border-slate-200">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">
                  Set Status to...
                </div>
                {availableStatuses.map((status: typeof availableStatuses[0]) => {
                  const hex = getHexColor(status.color);
                  return (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => handleBulkUpdate(status.value)}
                      className="cursor-pointer font-medium mb-1 last:mb-0 rounded-md px-3 py-2 transition-colors"
                      style={{ color: hex }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${hex}15`}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {status.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors rounded-lg text-sm font-semibold ml-2 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.length} application{selectedIds.length > 1 ? "s" : ""}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The selected application{selectedIds.length > 1 ? "s" : ""} will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="w-px h-6 bg-slate-700 mx-2" />

          <button
            onClick={() => setSelectedIds([])}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white transition-colors rounded-lg text-sm font-medium"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        </div>
      )}
    </div>
  );
}
