import { getStudentSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Edit, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Calendar,
  User,
  MapPin,
  Phone,
  FileBadge,
  Search
} from "lucide-react";

export default async function StatusDashboard() {
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
    // Session exists but app doesn't
    redirect("/status");
  }

  const settings = await prisma.systemSettings.findFirst();
  const statuses = await prisma.applicationStatus.findMany();
  const statusMeta = statuses.find((s: typeof statuses[0]) => s.value === application.status);

  // Map status to a rich gradient / icon profile
  let StatusIcon = Clock;
  let statusGradient = "from-slate-400 to-slate-500";
  let statusBg = "bg-slate-50";
  let statusText = "text-slate-700";

  switch (statusMeta?.color) {
    case 'emerald':
      StatusIcon = CheckCircle2;
      statusGradient = "from-emerald-400 to-teal-500";
      statusBg = "bg-emerald-50";
      statusText = "text-emerald-700";
      break;
    case 'red':
      StatusIcon = XCircle;
      statusGradient = "from-rose-400 to-red-500";
      statusBg = "bg-rose-50";
      statusText = "text-rose-700";
      break;
    case 'amber':
      StatusIcon = Clock;
      statusGradient = "from-amber-400 to-orange-500";
      statusBg = "bg-amber-50";
      statusText = "text-amber-700";
      break;
    case 'blue':
    default:
      StatusIcon = Clock; // fallback mapping
      statusGradient = "from-indigo-400 to-blue-500";
      statusBg = "bg-indigo-50";
      statusText = "text-indigo-700";
      break;
  }

  const statusLabel = statusMeta?.label || application.status;

  // Prepare a nicely formatted list of submitted data
  const submittedData = typeof application.data === 'object' && application.data !== null 
    ? (application.data as Record<string, any>) 
    : {};

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Hero Banner */}
      <div className="relative bg-white border-b border-slate-200/60 shadow-sm overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-100/50 to-blue-50/50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-gradient-to-tr from-violet-100/40 to-fuchsia-50/40 blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto max-w-5xl px-4 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide uppercase mb-2">
                <span>Application Portal</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Applicant Dashboard</h1>
              <p className="text-slate-500 text-lg">Manage and track your application seamlessly.</p>
            </div>
            <Button asChild variant="outline" className="bg-white hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-slate-700 shadow-sm rounded-xl font-medium transition-all group border-slate-200">
              <Link href="/status">
                <Search className="w-4 h-4 mr-2 text-slate-400 group-hover:text-white transition-colors" />
                Check Other Status
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Status & Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Status Card */}
            <div className={`relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-6 overflow-hidden transform transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group`}>
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${statusGradient}`}></div>
              
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-xl ${statusBg} ${statusText} inline-flex shadow-sm`}>
                  <StatusIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Status</h2>
                  <div className={`text-xl font-black tracking-tight ${statusText}`}>
                    {statusLabel}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-1 rounded-full bg-slate-100">
                  <div className={`absolute top-0 left-0 w-full rounded-full bg-gradient-to-b ${statusGradient}`} style={{ height: application.status === 'APPROVED' ? '100%' : '50%' }}></div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-5">
                  {statusMeta?.description ? statusMeta.description : (
                    application.status === 'PENDING' ? "We have received your application. Our admissions team is currently reviewing it. We will notify you once a decision is made." :
                    application.status === 'APPROVED' ? "Congratulations! Your application has been approved. Please check your email or proceed to enrollment." :
                    application.status === 'REJECTED' ? "Unfortunately, your application was not accepted at this time." :
                    "Your application status has been updated."
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-6">
               <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                 Quick Actions
               </h2>
               <div className="space-y-3">
                 <Button asChild className="w-full justify-between h-auto py-3 group bg-slate-900 text-white hover:bg-indigo-600 transition-all duration-300 rounded-xl shadow-md hover:shadow-indigo-500/25">
                   <a href={`/api/pdf/${application.id}`} target="_blank" rel="noopener noreferrer">
                     <span className="flex items-center gap-2">
                       <Download className="w-4 h-4 text-slate-300 group-hover:text-indigo-200" />
                       <span className="font-semibold">Download Application Form</span>
                     </span>
                     <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                   </a>
                 </Button>
                 
                 { (application.isEditable || settings?.globalEditSubmissions) && (
                   <Button asChild variant="outline" className="w-full justify-between h-auto py-3 group border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-300 rounded-xl shadow-sm">
                     <Link href={`/apply/${application.courseId}?edit=${application.id}`}>
                       <span className="flex items-center gap-2">
                         <Edit className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                         <span className="font-semibold">Edit Application</span>
                       </span>
                       <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                     </Link>
                   </Button>
                 )}
               </div>
            </div>

          </div>

          {/* Right Column: Submission Details */}
          <div className="lg:col-span-8">
             <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden flex flex-col h-full">
               
               {/* Summary Header */}
               <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     <FileText className="w-5 h-5 text-indigo-500" />
                     Application Summary
                   </h2>
                 </div>
                 <div className="flex flex-wrap items-center gap-3">
                   <Badge variant="secondary" className="bg-white border hover:bg-white border-slate-200 text-slate-600 shadow-sm font-mono text-xs px-3 py-1">
                     {application.applicationNo}
                   </Badge>
                   <Badge variant="outline" className="border-indigo-100 hover:bg-indigo-50/50 text-indigo-700 bg-indigo-50/50 shadow-sm text-xs px-3 py-1 font-medium flex items-center gap-1.5">
                     <Calendar className="w-3 h-3" />
                     {application.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                   </Badge>
                 </div>
               </div>
               
               <div className="p-6 space-y-8 flex-grow">
                 
                 {/* Program Details */}
                 <div>
                   <div className="flex items-center gap-2 mb-4">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Program Details</h3>
                     <div className="h-px bg-slate-100 flex-grow"></div>
                   </div>
                   
                   <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 via-white to-slate-50 border border-indigo-100/50 p-6 shadow-sm transition-all hover:shadow-md">
                     <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100/50 rounded-full blur-2xl group-hover:bg-indigo-200/50 transition-colors"></div>
                     <FileBadge className="w-8 h-8 text-indigo-400 mb-3 relative z-10" />
                     <p className="font-extrabold text-slate-900 text-2xl tracking-tight mb-2 relative z-10">{application.course.title}</p>
                     <p className="text-sm text-slate-600 leading-relaxed relative z-10 line-clamp-2 max-w-2xl">{application.course.description}</p>
                   </div>
                 </div>

                 {/* Submitted Responses */}
                 <div>
                   <div className="flex items-center gap-2 mb-5">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Submitted Responses</h3>
                     <div className="h-px bg-slate-100 flex-grow"></div>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {Object.keys(submittedData).map((key) => {
                       const val = submittedData[key];
                       let displayVal = String(val);
                       const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
                       
                       // Formatter for visual flair
                       let FieldIcon = FileText;
                       const lowerKey = key.toLowerCase();
                       if (lowerKey.includes('name')) FieldIcon = User;
                       else if (lowerKey.includes('date') || lowerKey.includes('dob')) FieldIcon = Calendar;
                       else if (lowerKey.includes('phone') || lowerKey.includes('mobile')) FieldIcon = Phone;
                       else if (lowerKey.includes('address') || lowerKey.includes('city') || lowerKey.includes('pin') || lowerKey.includes('state')) FieldIcon = MapPin;
                       
                       // Determine if value is a URL (uploaded file)
                       const isUrl = typeof val === 'string' && (val.startsWith('/uploads/') || val.startsWith('http'));
                       // Determine if it's an image URL
                       const isImage = isUrl && (
                         /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(val) ||
                         lowerKey.includes('photo') || lowerKey.includes('pic') || lowerKey.includes('image')
                       );

                       // Image preview rendering
                       if (isImage) {
                          return (
                            <div key={key} className="sm:col-span-2 rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-4 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                              <div className="absolute left-0 top-0 h-full w-1 bg-slate-100 group-hover:bg-indigo-400 transition-colors"></div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3 pl-3">
                                <FieldIcon className="w-3.5 h-3.5 opacity-70" />
                                {formattedKey}
                              </span>
                              <div className="pl-3 flex items-start gap-4">
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm flex-shrink-0 bg-slate-50">
                                  <img src={val} alt={formattedKey} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col gap-2 justify-center">
                                  <a href={val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-indigo-100">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    View Full Size
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                       }

                       // Non-image file rendering  
                       if (isUrl) {
                          return (
                            <div key={key} className="sm:col-span-1 rounded-xl bg-slate-50 border border-slate-100 p-4 transition-colors hover:bg-slate-100 hover:border-slate-200 group">
                              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                                <FieldIcon className="w-3.5 h-3.5 text-slate-400" />
                                {formattedKey}
                              </span>
                              <a href={val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg text-sm transition-colors group-hover:bg-indigo-100 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                View Document
                              </a>
                            </div>
                          );
                       }

                       return (
                         <div key={key} className="sm:col-span-1 rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-4 relative overflow-hidden group hover:border-slate-300 transition-colors">
                           <div className="absolute left-0 top-0 h-full w-1 bg-slate-100 group-hover:bg-indigo-400 transition-colors"></div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2 pl-3">
                             <FieldIcon className="w-3.5 h-3.5 opacity-70" />
                             {formattedKey}
                           </span>
                           <span className="text-sm font-semibold text-slate-900 break-words pl-3 block">
                             {displayVal}
                           </span>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
