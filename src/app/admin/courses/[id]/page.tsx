import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CourseEditorClient } from "./course-editor";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import { deleteCourse } from "@/app/actions/adminCourses";

export default async function CourseBuilder({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const course = await prisma.course.findUnique({
    where: { id: resolvedParams.id },
    include: {
      _count: { select: { applications: true } }
    }
  });

  if (!course) notFound();

  const forms = await prisma.formTemplate.findMany({
    select: { id: true, name: true }
  });

  const hasApplications = course._count.applications > 0;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin/courses" className="text-slate-400 hover:text-slate-600 flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">{course.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{course._count.applications} application(s) received</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" asChild className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1.5">
            <Link href={`/apply/${course.id}`} target="_blank">
              <Eye className="w-4 h-4" />
              Public View
            </Link>
          </Button>

          <form action={async () => {
            "use server";
            const result = await deleteCourse(resolvedParams.id);
            if (result.success) {
              redirect("/admin/courses");
            }
          }}>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={hasApplications}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-1.5 disabled:opacity-40"
              title={hasApplications ? `Cannot delete: ${course._count.applications} application(s) exist` : "Delete this course"}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      {hasApplications && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          <span>This course has existing applications and cannot be deleted. You can still edit its details or close it.</span>
        </div>
      )}

      {/* Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <CourseEditorClient 
          courseId={course.id} 
          currentStatus={course.status}
          title={course.title}
          description={course.description}
          fee={course.fee}
          formTemplateId={course.formTemplateId}
          availableForms={forms}
        />
      </div>
    </div>
  );
}
