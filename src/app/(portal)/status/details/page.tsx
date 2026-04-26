import { getStudentSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User, Edit } from "lucide-react";

export default async function ApplicationDetailsPage() {
  const session = await getStudentSession();
  
  if (!session || !session.sub) {
    redirect("/status");
  }

  const application = await prisma.application.findUnique({
    where: { id: session.sub as string },
    include: {
      course: true,
    }
  });

  if (!application) {
    redirect("/status");
  }

  const settings = await prisma.systemSettings.findFirst();
  const canEdit = application.isEditable || settings?.globalEditSubmissions;

  const submittedData = typeof application.data === 'object' && application.data !== null 
    ? (application.data as Record<string, any>) 
    : {};

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <Link href="/status/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Application Details
              </h2>
              <p className="text-sm text-slate-500 mt-1">Full submitted information for Application No. {application.applicationNo || "Pending"}</p>
            </div>
            <div className="flex items-center gap-3">
              {canEdit && (
                <Button asChild variant="outline" className="hidden sm:flex border-slate-200 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  <Link href={`/apply/${application.courseId}?edit=${application.id}`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Application
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="hidden sm:flex border-slate-200">
                <a href={`/application/${application.id}/print`} target="_blank" rel="noopener noreferrer">
                  Print PDF
                </a>
              </Button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {Object.entries(submittedData).map(([key, value]) => {
                // Formatting
                const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
                const lowerKey = key.toLowerCase();
                const isUrl = typeof value === 'string' && (value.startsWith('/uploads/') || (value as string).includes('http'));
                const isImage = isUrl && (
                  /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(value as string) ||
                  lowerKey.includes('photo') || lowerKey.includes('pic') || lowerKey.includes('image')
                );

                return (
                  <div key={key} className={`rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-4 relative overflow-hidden group hover:border-indigo-200 transition-colors ${isUrl ? 'md:col-span-2' : ''}`}>
                    <div className="absolute left-0 top-0 h-full w-1 bg-slate-100 group-hover:bg-indigo-400 transition-colors"></div>
                    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-3">{label}</dt>
                    <dd className="pl-3 text-slate-900 font-medium">
                      {isImage ? (
                        <div className="flex items-start gap-4 mt-2">
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm flex-shrink-0 bg-slate-50">
                            <img src={value as string} alt={label} className="w-full h-full object-cover" />
                          </div>
                          {/* <div className="flex flex-col gap-2 justify-center">
                            <a href={value as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors text-xs font-semibold">
                              View Full Size
                            </a>
                          </div> */}
                        </div>
                      ) : isUrl ? (
                        <a href={value as string} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline break-all">
                          {value as string}
                        </a>
                      ) : (
                        <span className="whitespace-pre-wrap">{String(value)}</span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
