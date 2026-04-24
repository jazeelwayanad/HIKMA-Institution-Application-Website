import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, ArrowRight } from "lucide-react";
import { createFormTemplate } from "@/app/actions/adminForms";
import { redirect } from "next/navigation";
import { DeleteFormButton } from "./delete-form-button";

export default async function AdminFormsPage() {
  const forms = await prisma.formTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { courses: true }
      }
    }
  });

  async function handleCreate(formData: FormData) {
    "use server";
    const res = await createFormTemplate(formData);
    if (res.success && res.id) {
      redirect(`/admin/forms/${res.id}`);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Form Library</h1>
          <p className="text-slate-500">Create and manage reusable application forms for your programs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-wrap">

        {/* Create Form Card */}
        <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Create New Form</h3>
          <p className="text-sm text-slate-500 mb-6">Build a standalone form template with fields and attach a PDF.</p>

          <form action={handleCreate} className="w-full flex flex-col gap-2">
            <input type="hidden" name="description" value="" />
            <input
              type="text"
              name="name"
              placeholder="e.g. 2026 Generic Admissions"
              required
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 px-4">
              Create
            </Button>
          </form>
        </div>

        {forms.map(form => (
          <Link href={`/admin/forms/${form.id}`} key={form.id}>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all h-full flex flex-col group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center">
                  {form.pdfTemplateUrl ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">Has PDF</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-100 text-slate-500 rounded-md">No PDF</span>
                  )}
                  <DeleteFormButton formId={form.id} formName={form.name} />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{form.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{form.description || "No description provided."}</p>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500 tabular-nums font-medium">Used in <span className="text-slate-900">{form._count.courses}</span> courses</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}

      </div>
    </div>
  );
}
