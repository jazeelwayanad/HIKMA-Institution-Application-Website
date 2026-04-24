import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireAdminRoute } from "@/app/actions/adminAuth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormBuilderClient } from "./client-builder";

export default async function AdminFormDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminRoute();

  const resolvedParams = await params;
  const form = await prisma.formTemplate.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!form) return notFound();

  return (
    <div className="space-y-6 max-w-5xl">
       <Link href="/admin/forms" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
         <ArrowLeft className="w-4 h-4 mr-1" /> Back to Library
       </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <FormBuilderClient 
          formId={form.id} 
          initialSchema={form.formSchema as any[] || []} 
          pdfTemplateUrl={form.pdfTemplateUrl}
          name={form.name}
          description={form.description}
        />
      </div>
    </div>
  );
}
