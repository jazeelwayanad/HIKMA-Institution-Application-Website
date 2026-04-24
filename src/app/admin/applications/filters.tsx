"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function ApplicationsFilters({
  currentSearch,
  selectedCourses,
  courses,
  selectedStatuses,
  statuses,
}: {
  currentSearch: string;
  selectedCourses: string[];
  courses: { id: string; title: string }[];
  selectedStatuses: string[];
  statuses: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentSearch);
  const [selected, setSelected] = useState<string[]>(selectedCourses);
  const [selectedStatusArr, setSelectedStatusArr] = useState<string[]>(selectedStatuses);

  // Debounced search update
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrl(search, selected, selectedStatusArr);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, selected, selectedStatusArr]); // trigger when either search or selected arrays change

  const updateUrl = (searchValue: string, selectedCoursesValue: string[], selectedStatusValue: string[]) => {
    const params = new URLSearchParams(searchParams);
    
    // Update search
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }

    // Update courses
    if (selectedCoursesValue.length > 0) {
      params.set("courses", selectedCoursesValue.join(","));
    } else {
      params.delete("courses");
    }

    // Update statuses
    if (selectedStatusValue.length > 0) {
      params.set("status", selectedStatusValue.join(","));
    } else {
      params.delete("status");
    }
    
    // Reset page to 1 when filters change (we'll read this later)
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleCourse = (courseId: string) => {
    setSelected(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const toggleStatus = (statusValue: string) => {
    setSelectedStatusArr(prev => 
      prev.includes(statusValue) ? prev.filter(val => val !== statusValue) : [...prev, statusValue]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelected([]);
    setSelectedStatusArr([]);
  };

  const activeFiltersCount = selected.length + selectedStatusArr.length + (search ? 1 : 0);

  return (
    <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2"
            placeholder="Search Application ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />
            Programs
            {selected.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                {selected.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl shadow-lg border-slate-200 max-h-80 overflow-y-auto">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">
               Filter by Program
             </div>
             <DropdownMenuSeparator className="my-1" />
             {courses.map(course => (
               <DropdownMenuCheckboxItem
                 key={course.id}
                 checked={selected.includes(course.id)}
                 onCheckedChange={() => toggleCourse(course.id)}
                 className="text-sm cursor-pointer"
               >
                 {course.title}
               </DropdownMenuCheckboxItem>
             ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />
            Statuses
            {selectedStatusArr.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                {selectedStatusArr.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl shadow-lg border-slate-200 max-h-80 overflow-y-auto">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">
               Filter by Status
             </div>
             <DropdownMenuSeparator className="my-1" />
             {statuses.map(s => (
               <DropdownMenuCheckboxItem
                 key={s.value}
                 checked={selectedStatusArr.includes(s.value)}
                 onCheckedChange={() => toggleStatus(s.value)}
                 className="text-sm cursor-pointer"
               >
                 {s.label}
               </DropdownMenuCheckboxItem>
             ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-200"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
