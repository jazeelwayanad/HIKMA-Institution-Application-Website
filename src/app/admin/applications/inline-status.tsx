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

type StatusMeta = { label: string; value: string; color: string } | undefined;

const colorClasses = {
  amber:   { badge: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-400" },
  emerald: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  red:     { badge: "bg-red-50 text-red-700 border-red-200",         dot: "bg-red-400" },
  rose:    { badge: "bg-rose-50 text-rose-700 border-rose-200",       dot: "bg-rose-400" },
  slate:   { badge: "bg-slate-100 text-slate-700 border-slate-200",  dot: "bg-slate-400" },
  indigo:  { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
};

function getBadgeClass(color: string) {
  return (colorClasses as any)[color]?.badge ?? colorClasses.indigo.badge;
}
function getDotClass(color: string) {
  return (colorClasses as any)[color]?.dot ?? colorClasses.indigo.dot;
}

export function InlineStatusDropdown({
  applicationId,
  currentStatus,
  statusMeta,
  allStatuses,
}: {
  applicationId: string;
  currentStatus: string;
  statusMeta: StatusMeta;
  allStatuses: { label: string; value: string; color: string }[];
}) {
  const [optimisticStatus, setOptimisticStatus] = useState<StatusMeta>(statusMeta);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state if it gets changed from the outside (like from Bulk Actions)
  useEffect(() => {
    setOptimisticStatus(statusMeta);
  }, [statusMeta]);

  const handleChange = async (status: { label: string; value: string; color: string }) => {
    setOptimisticStatus(status);
    setIsUpdating(true);
    await updateApplicationStatus(applicationId, status.value);
    setIsUpdating(false);
  };

  const displayed = optimisticStatus ?? { label: currentStatus, value: currentStatus, color: "indigo" };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isUpdating}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-xs font-bold transition-all outline-none cursor-pointer hover:opacity-80 disabled:opacity-60
          ${getBadgeClass(displayed.color)}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getDotClass(displayed.color)}`} />
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
            onClick={() => handleChange(s)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer"
            disabled={s.value === displayed.value}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getDotClass(s.color)}`} />
            <span className="flex-1 text-sm">{s.label}</span>
            {s.value === displayed.value && (
              <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
