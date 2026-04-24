import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header"; // Assuming this exists or I'll just use raw HTML
import { Button } from "@/components/ui/button";
import { ApplicationsClientAction } from "../client-actions";
import { Calendar, Mail, Phone, User, FileText, ArrowLeft } from "lucide-react";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const application = await prisma.application.findUnique({
    where: { id: resolvedParams.id },
    include: { course: { include: { formTemplate: true } } }
  });

  if (!application) notFound();

  const statuses = await prisma.applicationStatus.findMany({
    orderBy: { createdAt: "asc" }
  });
  
  const statusMeta = statuses.find(s => s.value === application.status);
  const formData = application.data as Record<string, any>;

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
              <Badge 
                variant="outline" 
                className={`px-3 py-0.5 rounded-full border-2 font-bold
                  ${statusMeta?.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    statusMeta?.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    statusMeta?.color === 'red' ? 'bg-red-50 text-red-700 border-red-200' : 
                    'bg-indigo-50 text-indigo-700 border-indigo-200'}`}
              >
                {statusMeta?.label || application.status}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-1">Applied on {application.createdAt.toLocaleDateString()} for <span className="font-semibold text-slate-700">{application.course.title}</span></p>
          </div>
        </div>

        <ApplicationsClientAction 
          applicationId={application.id} 
          currentStatus={application.status} 
          allStatuses={statuses.map(s => ({ label: s.label, value: s.value }))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Sections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Application Data
              </h2>
              <Link href={`/admin/applications/${application.id}/edit`}>
                <Button variant="ghost" size="sm" className="text-xs h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  Edit Details
                </Button>
              </Link>
            </div>
          <div className="p-6">
              {(() => {
                // Build a map from field name (ID) → label using the form schema
                const schema = application.course.formTemplate?.formSchema as any;
                const fields: any[] = schema?.fields ?? schema?.sections?.flatMap((s: any) => s.fields ?? []) ?? [];
                const labelMap: Record<string, string> = {};
                for (const field of fields) {
                  if (field.name && field.label) labelMap[field.name] = field.label;
                }

                return (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {Object.entries(formData).map(([key, value]) => {
                      const label = labelMap[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
                      const lowerKey = key.toLowerCase();
                      const isUrl = typeof value === 'string' && (value.startsWith('/uploads/') || (value as string).includes('http'));
                      const isImage = isUrl && (
                        /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(value as string) ||
                        lowerKey.includes('photo') || lowerKey.includes('pic') || lowerKey.includes('image')
                      );
                      return (
                        <div key={key} className={isUrl ? "md:col-span-2" : ""}>
                          <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</dt>
                          <dd className="text-slate-900 font-medium whitespace-pre-wrap">
                            {isImage ? (
                              <div className="flex items-start gap-4">
                                <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm bg-slate-50 flex-shrink-0">
                                  <img src={value as string} alt={label} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col gap-2 justify-center">
                                  <a href={value as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors text-sm font-semibold">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    View Full Size
                                  </a>
                                </div>
                              </div>
                            ) : isUrl ? (
                              <a href={value as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                <FileText className="w-4 h-4" />
                                View File
                              </a>
                            ) : (
                              String(value) || <span className="text-slate-300 italic">Not provided</span>
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                );
              })()}
          </div>

          </div>
        </div>

        {/* Right Column: Sidebar info */}
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
                       <p className="font-semibold text-slate-700">{application.course.title}</p>
                    </div>
                 </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                 <a href={`/api/pdf/${application.id}`} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-semibold">
                    <FileText className="w-4 h-4" />
                    Download Generated PDF
                 </a>
              </div>
           </div>

           <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
              <h3 className="font-bold text-indigo-200 text-xs uppercase tracking-widest mb-4">Admin Note</h3>
              <p className="text-sm leading-relaxed mb-4">
                This application is currently <span className="font-bold border-b border-indigo-400">{statusMeta?.label.toLowerCase()}</span>. 
                {application.status === 'PENDING' ? ' Review the submitted data and files before approving.' : ' Actions taken on this status are reflected immediately to the student.'}
              </p>
              {application.status === 'PENDING' && (
                <div className="pt-2">
                   <div className="inline-block px-2 py-1 bg-indigo-800 rounded font-mono text-[10px] text-indigo-300">Awaiting Decision</div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
