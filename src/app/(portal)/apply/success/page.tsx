import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { PrintButton } from "./PrintButton";
import Link from "next/link";

export default async function ApplicationSuccessPage({ searchParams }: { searchParams: Promise<{ appNo?: string; appId?: string }> }) {
  const resolvedParams = await searchParams;
  const { appNo, appId } = resolvedParams;

  if (!appNo) {
    redirect("/apply");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="mb-2 text-3xl font-extrabold text-slate-900">Application Submitted!</h1>
        <p className="mb-8 text-slate-600">Your application has been received successfully. Please save your application number below.</p>
        
        <div className="mb-8 rounded-lg bg-indigo-50 p-6 border border-indigo-100">
          <p className="text-sm font-semibold uppercase text-indigo-800 tracking-wider mb-2">Application Number</p>
          <p className="text-4xl font-black text-indigo-900 tracking-widest">{appNo}</p>
        </div>

        <div className="rounded-md border-l-4 border-amber-400 bg-amber-50 p-4 mb-8 text-left">
          <div className="flex">
            <div className="flex-shrink-0">
               <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                 Important: Save your <strong>Application Number</strong> and the <strong>Date of Birth</strong> you used. 
                 You will need both to check your application status or download your forms later.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 justify-center">
          <PrintButton applicationId={appId} />
          <Button asChild variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-md">
             <Link href="/status">Check Status Portal</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
