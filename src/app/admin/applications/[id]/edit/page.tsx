import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ApplicationEditClient } from "./client-edit";

export default async function ApplicationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const application = await prisma.application.findUnique({
    where: { id: resolvedParams.id },
    include: { course: { include: { formTemplate: true } } }
  });

  if (!application) notFound();

  // If the course doesn't have a template anymore, we can't easily edit dynamically 
  // but we should fall back to the existing data keys.
  const schema = (application.course.formTemplate?.formSchema as any[]) || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href={`/admin/applications/${application.id}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Application: {application.applicationNo}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Modify student data for {application.course.title}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <ApplicationEditClient 
          application={application} 
          schema={schema}
        />
      </div>
    </div>
  );
}
