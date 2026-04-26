import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ApplicationFormClient } from "@/app/(portal)/apply/[courseId]/client-form";

export default async function ApplicationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [application, allCourses] = await Promise.all([
    prisma.application.findUnique({
      where: { id: resolvedParams.id },
      include: { course: true }
    }),
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" }
    })
  ]);

  if (!application) notFound();

  const submittedData = typeof application.data === 'object' && application.data !== null
    ? (application.data as Record<string, any>)
    : {};

  const initialData = {
    ...submittedData,
    dob: application.dob ? application.dob.toISOString().split('T')[0] : undefined,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href={`/admin/applications/${application.id}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Application: {application.applicationNo}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Modifying student data for {application.course.title}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <ApplicationFormClient
          courseId={application.courseId}
          courseTitle={application.course.title}
          initialData={initialData}
          editId={application.id}
          isAdmin={true}
          availableCourses={allCourses}
        />
      </div>
    </div>
  );
}
