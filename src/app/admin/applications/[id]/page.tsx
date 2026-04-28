import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplicationsClientAction } from "../client-actions";
import { InlineStatusDropdown } from "../inline-status";
import { Calendar, Mail, Phone, User, FileText, ArrowLeft, Edit } from "lucide-react";
import { ApplicationDataClient } from "@/components/application-data-client";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const application = await prisma.application.findUnique({
    where: { id: resolvedParams.id },
    include: { course: true }
  });

  if (!application) notFound();

  const statuses = await prisma.applicationStatus.findMany({
    orderBy: { createdAt: "asc" }
  });

  const statusMeta = statuses.find((s: typeof statuses[0]) => s.value === application.status);
  const formData = { ...(application.data as Record<string, any>) };
  if (application.course) {
    formData.course_selected = application.course.title;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/applications" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{application.applicationNo}</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">Applied on {application.createdAt.toLocaleDateString()} for <span className="font-semibold text-slate-700">{application.course.title}</span></p>
          </div>
        </div>

        <ApplicationsClientAction
          applicationId={application.id}
          currentStatus={application.status}
          allStatuses={statuses.map((s: typeof statuses[0]) => ({ label: s.label, value: s.value }))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Quick Insights</h3>
            {/* Profile picture from form data */}
            {(() => {
              const picEntry = Object.entries(formData).find(([k, v]) => {
                const lk = k.toLowerCase();
                return (lk.includes('photo') || lk.includes('pic') || lk.includes('image')) &&
                  typeof v === 'string' && v.startsWith('http');
              });
              return picEntry ? (
                <div className="flex justify-center mb-5">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md bg-slate-50">
                    <img src={picEntry[1] as string} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : null;
            })()}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Date of Birth</p>
                  <p className="font-semibold text-slate-700">{application.dob.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Program</p>
                  <p className="font-semibold text-slate-700">
                    {application.course.title}
                    {formData.sub_course && (
                      <span className="block text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
                        {formData.sub_course}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
              <Link href={`/admin/applications/${application.id}/edit`} className="w-full">
                <Button variant="outline" className="w-full justify-center border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 h-11">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Application Details
                </Button>
              </Link>

              <div className="w-full flex justify-center">
                <InlineStatusDropdown
                  applicationId={application.id}
                  currentStatus={application.status}
                  statusMeta={statusMeta}
                  allStatuses={statuses.map((s: typeof statuses[0]) => ({ label: s.label, value: s.value, color: s.color }))}
                  className="w-full h-11 rounded-xl"
                />
              </div>

              <a href={`/application/${application.id}/print`} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-4 h-11 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors font-semibold">
                <FileText className="w-4 h-4" />
                Print Application
              </a>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
            <h3 className="font-bold text-indigo-200 text-xs uppercase tracking-widest mb-4">Status Information</h3>
            <p className="text-sm leading-relaxed mb-4">
              This application is currently <span className="font-bold border-b border-indigo-400">{statusMeta?.label.toLowerCase()}</span>.
              {application.status === 'PENDING' ? ' Review the submitted data and files before approving.' : ' Actions taken on this status are reflected immediately to the student.'}
            </p>

            {formData.adminNote && (
              <div className="mt-4 p-4 bg-indigo-800/50 rounded-xl border border-indigo-700/50">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Custom Note</h4>
                <p className="text-sm italic text-indigo-100 leading-relaxed whitespace-pre-wrap">"{formData.adminNote}"</p>
              </div>
            )}

            {application.status === 'PENDING' && (
              <div className="pt-2">
                <div className="inline-block px-2 py-1 bg-indigo-800 rounded font-mono text-[10px] text-indigo-300">Awaiting Decision</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Data Sections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Application Data
              </h2>
            </div>

            <div className="p-6">
              <ApplicationDataClient 
                formData={formData} 
                applicantName={formData.full_name || "Applicant"} 
                appNo={application.applicationNo} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
