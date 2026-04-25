"use client";

import { useState } from "react";
import { updateCourseStatus } from "@/app/actions/adminCourses";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function CourseStatusSelector({ courseId, initialStatus }: { courseId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return;
    setStatus(newStatus);
    setLoading(true);
    await updateCourseStatus(courseId, newStatus as any);
    setLoading(false);
  };

  // We style the SelectTrigger to resemble the Badges we previously had
  let triggerClasses = "h-7 text-xs font-semibold px-2.5 py-0.5 border w-[110px] shadow-sm";
  if (status === 'OPEN') {
    triggerClasses += " bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-transparent";
  } else if (status === 'DRAFT') {
    triggerClasses += " bg-transparent text-slate-500 border-slate-300";
  } else if (status === 'CLOSED') {
    triggerClasses += " bg-red-50 text-red-700 border-red-200";
  }

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
      <SelectTrigger className={triggerClasses}>
        <SelectValue>
          {status === "OPEN" ? "Open" : status === "DRAFT" ? "Draft" : "Closed"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DRAFT" className="text-xs font-medium">Draft</SelectItem>
        <SelectItem value="OPEN" className="text-xs font-medium">Open</SelectItem>
        <SelectItem value="CLOSED" className="text-xs font-medium">Closed</SelectItem>
      </SelectContent>
    </Select>
  );
}
