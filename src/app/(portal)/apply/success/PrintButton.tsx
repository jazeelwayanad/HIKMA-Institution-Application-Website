"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PrintButton({ applicationId }: { applicationId?: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!applicationId) {
      // Fallback: if no applicationId is in URL (e.g. old link), use browser print
      window.print();
      return;
    }

    setIsDownloading(true);
    try {
      const res = await fetch(`/api/pdf/${applicationId}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Trigger browser download
      const a = document.createElement("a");
      a.href = url;
      a.download = `Application_${applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Could not download the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className="bg-slate-900 hover:bg-slate-800 text-white rounded-md"
    >
      {isDownloading ? "Generating PDF…" : "Print Application"}
    </Button>
  );
}
