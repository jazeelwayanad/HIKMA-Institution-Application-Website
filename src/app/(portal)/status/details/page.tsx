import { getStudentSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User, Edit } from "lucide-react";
import { ApplicationDataClient } from "@/components/application-data-client";

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
    ? { ...(application.data as Record<string, any>) } 
    : {};

  if (application.course) {
    submittedData.course_selected = application.course.title;
  }

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
            <ApplicationDataClient 
              formData={submittedData} 
              applicantName={submittedData.full_name || "Applicant"} 
              appNo={application.applicationNo}
              variant="student"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
