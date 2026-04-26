"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteApplication } from "@/app/actions/adminApplications";
import { Eye, Pencil, Trash2 } from "lucide-react";
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

export function ApplicationsClientAction({ 
  applicationId,
}: { 
  applicationId: string,
  currentStatus?: string,
  allStatuses?: { label: string, value: string }[]
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteApplication(applicationId);
    setIsDeleting(false);
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => router.push(`/admin/applications/${applicationId}`)}
        title="View Details"
        className="px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center justify-center text-slate-600 border border-slate-200 bg-white hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm"
      >
        <Eye className="h-3.5 w-3.5 mr-1.5" />
        View
      </button>

      <button
        onClick={() => router.push(`/admin/applications/${applicationId}/edit`)}
        title="Edit Responses"
        className="px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center justify-center text-slate-600 border border-slate-200 bg-white hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors shadow-sm"
      >
        <Pencil className="h-3.5 w-3.5 mr-1.5" />
        Edit
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          className="px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center justify-center text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm disabled:opacity-50"
          disabled={isDeleting}
          title="Delete Application"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          {isDeleting ? "Deleting..." : "Delete"}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete Application</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
