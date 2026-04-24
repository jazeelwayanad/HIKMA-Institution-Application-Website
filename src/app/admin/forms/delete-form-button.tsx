"use client";

import { Trash2 } from "lucide-react";
import { deleteFormTemplate } from "@/app/actions/adminForms";
import { useState } from "react";

export function DeleteFormButton({ formId, formName }: { formId: string, formName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the Link
    e.stopPropagation();

    if (confirm(`Are you sure you want to delete the form "${formName}"?\nAny courses using this form will be disconnected.`)) {
      setIsDeleting(true);
      await deleteFormTemplate(formId);
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 ml-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
      title="Delete Form"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
