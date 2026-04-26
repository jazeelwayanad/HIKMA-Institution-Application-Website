"use client";

import { Button } from "@/components/ui/button";

export function PrintButton({ applicationId, className }: { applicationId?: string, className?: string }) {
  const handleDownload = () => {
    if (!applicationId) {
      window.print();
      return;
    }
    window.open(`/application/${applicationId}/print`, '_blank');
  };

  return (
    <Button
      onClick={handleDownload}
      className={className || "bg-slate-900 hover:bg-slate-800 text-white rounded-md"}
    >
      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Print Application Form
    </Button>
  );
}
