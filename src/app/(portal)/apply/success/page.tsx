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
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 overflow-hidden bg-slate-50/50">
      {/* Premium Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 mx-auto w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
        
        {/* Success Icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-xl shadow-emerald-500/30 ring-8 ring-green-50/50">
          <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm">Application Submitted!</h1>
        <p className="mb-10 text-lg font-medium text-slate-500">Your application has been received successfully. Please save your application number below.</p>
        
        {/* Application Number Box */}
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 shadow-2xl shadow-slate-900/20">
          {/* Decorative shapes inside ticket */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white opacity-5 blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500 opacity-10 blur-2xl"></div>
          
          <p className="relative z-10 mb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Application Number</p>
          <div className="relative z-10 flex items-center justify-center">
            <p className="text-5xl font-black tracking-widest text-white drop-shadow-md">{appNo}</p>
          </div>
        </div>

        {/* Warning Box */}
        <div className="mb-10 flex items-start gap-4 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-yellow-50/50 p-5 text-left shadow-sm">
          <div className="flex-shrink-0 mt-0.5">
             <svg className="h-6 w-6 text-amber-500 drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-bold text-amber-900">Important Next Steps</h4>
            <p className="text-sm leading-relaxed text-amber-800">
               Please save your <strong className="font-extrabold text-amber-950">Application Number</strong> for future reference. 
               You will need the <strong className="font-extrabold text-amber-950">Mobile Number</strong> and <strong className="font-extrabold text-amber-950">Date of Birth</strong> you used to check your application status or download your forms later.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
          <PrintButton 
            applicationId={appId} 
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 rounded-xl py-6 font-semibold text-base" 
          />
          
          <Button asChild variant="outline" className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-xl py-6 font-semibold text-base">
             <Link href="/status">Check Status Portal</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
