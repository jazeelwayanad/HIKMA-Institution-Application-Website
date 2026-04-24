"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ApplicationsPagination({
  currentPage,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const updatePagination = (newPage: number, newLimit?: number) => {
    const params = new URLSearchParams(searchParams);
    
    if (newLimit && newLimit !== 20) {
      params.set("limit", newLimit.toString());
      params.delete("page"); // Reset page to 1 when limit changes
    } else if (newLimit === 20) {
      params.delete("limit");
      params.delete("page");
    } else if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-white gap-4">
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span className="whitespace-nowrap">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
          <strong>{totalItems}</strong> entries
        </span>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <span>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => updatePagination(1, parseInt(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 cursor-pointer outline-none"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updatePagination(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-medium text-slate-700 px-2">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => updatePagination(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
