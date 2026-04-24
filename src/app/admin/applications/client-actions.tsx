"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteApplication } from "@/app/actions/adminApplications";
import { Eye, Pencil, Trash2 } from "lucide-react";

export function ApplicationsClientAction({ 
  applicationId,
}: { 
  applicationId: string,
  currentStatus?: string,
  allStatuses?: { label: string, value: string }[]
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this application?")) {
      setIsDeleting(true);
      await deleteApplication(applicationId);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => router.push(`/admin/applications/${applicationId}`)}
        title="View Details"
        className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <Eye className="h-4 w-4" />
      </button>

      <button
        onClick={() => router.push(`/admin/applications/${applicationId}/edit`)}
        title="Edit Responses"
        className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        title="Delete Application"
        className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
