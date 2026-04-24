import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DynamicFormClient } from "./client-form";

export default async function CourseApplyPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  const { courseId } = resolvedParams;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { formTemplate: true }
  });

  if (!course || course.status !== "OPEN") {
    redirect("/apply");
  }

  if (!course.formTemplate) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">Application Form Unavailable</h1>
        <p className="text-slate-500">The administration has not attached an application form to this course yet. Please check back later.</p>
      </div>
    );
  }

  const schema = course.formTemplate.formSchema as any[] || [];

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Apply for {course.title}</h1>
        <p className="text-slate-600">Please fill out all required fields below to complete your application.</p>
        {/* <div className="mt-4 inline-flex items-center rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
          Application Fee: {course.fee && course.fee > 0 ? `$${course.fee}` : "Free"}
        </div> */}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <DynamicFormClient courseId={course.id} schema={schema} />
      </div>
    </div>
  );
}
