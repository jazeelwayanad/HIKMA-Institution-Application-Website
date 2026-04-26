import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicationFormClient } from "./client-form";
import { getStudentSession } from "@/app/actions/auth";

export default async function CourseApplyPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ courseId: string }>,
  searchParams: Promise<{ edit?: string }>
}) {
  const resolvedParams = await params;
  const { courseId } = resolvedParams;
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams.edit;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.status !== "OPEN") {
    redirect("/apply");
  }

  let initialData = undefined;
  if (editId) {
    const session = await getStudentSession();
    // Only allow editing if logged in student matches the editId
    if (!session || session.sub !== editId) {
      redirect(`/apply/${courseId}`);
    }

    const application = await prisma.application.findUnique({
      where: { id: editId }
    });

    const settings = await prisma.systemSettings.findFirst();

    if (application && (application.isEditable || settings?.globalEditSubmissions)) {
      initialData = {
        ...(typeof application.data === 'object' && application.data !== null ? application.data : {}),
        dob: application.dob.toISOString().split('T')[0]
      };
    } else {
      // Not allowed to edit
      redirect(`/apply/${courseId}`);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {editId ? `Edit Application for ${course.title}` : `Application for ${course.title}`}
        </h1>
        <p className="text-slate-600">Please fill out all required fields below to complete your application.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <ApplicationFormClient 
          courseId={course.id} 
          courseTitle={course.title} 
          initialData={initialData}
          editId={editId}
        />
      </div>
    </div>
  );
}
