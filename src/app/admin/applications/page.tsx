import { prisma } from "@/lib/prisma";
import { ApplicationsTableClient } from "./applications-table-client";
import { ApplicationsPagination } from "./applications-pagination";
import { ApplicationsFilters } from "./filters";

export default async function ApplicationsManager({ searchParams }: { searchParams: Promise<{ status?: string, search?: string, courses?: string, page?: string, limit?: string }> }) {
  const resolvedParams = await searchParams;
  
  const statusesFilter = resolvedParams.status ? (resolvedParams.status as string).toUpperCase().split(",") : undefined;
  const searchFilter = resolvedParams.search ? (resolvedParams.search as string) : undefined;
  const coursesFilter = resolvedParams.courses ? (resolvedParams.courses as string).split(",") : undefined;
  
  const page = resolvedParams.page ? parseInt(resolvedParams.page as string) : 1;
  const limit = resolvedParams.limit ? parseInt(resolvedParams.limit as string) : 20;

  const whereClause = {
    status: statusesFilter && statusesFilter.length > 0 ? { in: statusesFilter } : undefined,
    deletedAt: null,
    courseId: coursesFilter && coursesFilter.length > 0 ? { in: coursesFilter } : undefined,
    applicationNo: searchFilter ? { contains: searchFilter, mode: 'insensitive' as const } : undefined,
  };

  const applications = await prisma.application.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { course: true },
    skip: (page - 1) * limit,
    take: limit,
  });

  const totalItems = await prisma.application.count({ where: whereClause });

  const allCourses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" }
  });

  const availableStatuses = await prisma.applicationStatus.findMany({
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Applications Manager</h1>
          <p className="text-slate-500 mt-1">Review and update student applications.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={`/api/admin/export?format=excel${statusesFilter && statusesFilter.length > 0 ? `&status=${statusesFilter.join(",").toLowerCase()}` : ""}`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2 transition-colors"
          >
            <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="hidden sm:inline">Export Excel</span>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <ApplicationsFilters 
          currentSearch={searchFilter || ""} 
          selectedCourses={coursesFilter || []} 
          courses={allCourses} 
          selectedStatuses={statusesFilter || []}
          statuses={availableStatuses.map((s: typeof availableStatuses[0]) => ({ value: s.value, label: s.label }))}
        />

        <ApplicationsTableClient 
          applications={applications} 
          availableStatuses={availableStatuses.map((s: typeof availableStatuses[0]) => ({ id: s.id, label: s.label, value: s.value, color: s.color }))} 
        />
        <ApplicationsPagination 
          currentPage={page} 
          totalItems={totalItems} 
          itemsPerPage={limit} 
        />
      </div>
    </div>
  );
}
