import { getStudentSession, logoutStudent } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Download, 
  Edit, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User,
  LogOut
} from "lucide-react";
import { getGradientStyles } from "@/lib/colorUtils";

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

  // Determine Icon based on legacy mappings or hex logic
  let StatusIcon = Clock;
  if (statusMeta?.color === 'emerald' || application.status === 'APPROVED') StatusIcon = CheckCircle2;
  if (statusMeta?.color === 'red' || application.status === 'REJECTED') StatusIcon = XCircle;

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
            
            <form action={logoutStudent}>
              <Button type="submit" variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm">
                <LogOut className="w-4 h-4 mr-2 text-slate-400" />
                Check Another Status
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
          
          {/* Header Area */}
          <div 
            className="relative p-8 flex flex-col md:flex-row items-center gap-6"
            style={getGradientStyles(statusMeta?.color || 'indigo')}
          >
            {/* Photo */}
            <div className="w-32 h-40 bg-white rounded-lg shadow-md border-4 border-white overflow-hidden flex-shrink-0 flex items-center justify-center">
              {submittedData.photo ? (
                <img src={submittedData.photo as string} alt="Applicant" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}
            </div>
            
            <div className="flex-grow text-center md:text-left text-white">
              <h2 className="text-3xl font-extrabold mb-1">{submittedData.full_name || "Applicant"}</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm text-sm font-semibold mb-4 border border-white/20">
                <StatusIcon className="w-4 h-4" />
                {statusLabel}
              </div>
              <p className="text-white/90 text-sm max-w-lg mx-auto md:mx-0">
                {submittedData.adminNote ? submittedData.adminNote : (
                  statusMeta?.description ? statusMeta.description : (
                    application.status === 'PENDING' ? "We have received your application. Our admissions team is currently reviewing it. We will notify you once a decision is made." :
                    application.status === 'APPROVED' ? "Congratulations! Your application has been approved. Please check your email or proceed to enrollment." :
                    application.status === 'REJECTED' ? "Unfortunately, your application was not accepted at this time." :
                    "Your application status has been updated."
                  )
                )}
              </p>
            </div>
          </div>

          {/* Details Area */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Applicant Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Applicant ID</p>
                  <p className="font-bold text-slate-900 text-lg">{application.applicationNo}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Date of Birth</p>
                  <p className="font-bold text-slate-900 text-lg">
                    {submittedData.dob 
                      ? new Date(submittedData.dob as string).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                      : application.dob.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Mobile Number</p>
                  <p className="font-bold text-slate-900 text-lg">{submittedData.whatsapp_number || submittedData.mobile_number || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button asChild className="w-full justify-start h-12 bg-slate-900 text-white hover:bg-slate-800 shadow-sm text-base">
                  <a href={`/application/${application.id}/print`} target="_blank" rel="noopener noreferrer">
                    <Download className="w-5 h-5 mr-3" />
                    Print Application Form
                  </a>
                </Button>

                { (application.isEditable || settings?.globalEditSubmissions) && (
                  <Button asChild variant="outline" className="w-full justify-start h-12 border-slate-200 text-slate-700 hover:bg-slate-50 text-base">
                    <Link href={`/apply/${application.courseId}?edit=${application.id}`}>
                      <Edit className="w-5 h-5 mr-3 text-indigo-500" />
                      Edit Application
                    </Link>
                  </Button>
                )}

                <Button asChild variant="outline" className="w-full justify-start h-12 border-slate-200 text-slate-700 hover:bg-slate-50 text-base">
                  <Link href="/status/details">
                    <FileText className="w-5 h-5 mr-3 text-slate-400" />
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
