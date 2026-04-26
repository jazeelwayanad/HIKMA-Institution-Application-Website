import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { PrintButton } from "./PrintButton";
import Link from "next/link";

export default async function ApplicationSuccessPage({ searchParams }: { searchParams: Promise<{ appNo?: string; appId?: string; mode?: string }> }) {
  const resolvedParams = await searchParams;
  const { appNo, appId, mode } = resolvedParams;

  const isEdit = mode === 'edit';

  if (!appNo) {
    redirect("/apply");
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 overflow-hidden bg-slate-50/50">
      {/* Premium Background Effects */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isEdit ? 'bg-blue-200/40' : 'bg-emerald-200/40'} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse`}></div>
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isEdit ? 'bg-indigo-200/40' : 'bg-indigo-200/40'} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse`} style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 mx-auto w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
        
        {/* Success Icon */}
        <div className={`mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${isEdit ? 'from-blue-500 to-indigo-600' : 'from-emerald-400 to-green-500'} shadow-xl ${isEdit ? 'shadow-blue-500/30' : 'shadow-emerald-500/30'} ring-8 ${isEdit ? 'ring-blue-50/50' : 'ring-green-50/50'}`}>
          <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm">
          {isEdit ? "Application Updated!" : "Application Submitted!"}
        </h1>
        <p className="mb-10 text-lg font-medium text-slate-500">
          {isEdit 
            ? "Your application has been updated successfully. Please print the latest version of your application form for your records." 
            : "Your application has been received successfully. Please save your application number below."
          }
        </p>
        
        {/* Application Number Box - Only show for new applications */}
        {!isEdit && (
          <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 shadow-2xl shadow-slate-900/20">
            {/* Decorative shapes inside ticket */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white opacity-5 blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500 opacity-10 blur-2xl"></div>
            
            <p className="relative z-10 mb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Application Number</p>
            <div className="relative z-10 flex items-center justify-center">
              <p className="text-5xl font-black tracking-widest text-white drop-shadow-md">{appNo}</p>
            </div>
          </div>
        )}

        {/* Info/Warning Box */}
        <div className={`mb-10 flex items-start gap-4 rounded-2xl border ${isEdit ? 'border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/50' : 'border-amber-200/60 bg-gradient-to-br from-amber-50 to-yellow-50/50'} p-5 text-left shadow-sm`}>
          <div className="flex-shrink-0 mt-0.5">
             <svg className={`h-6 w-6 ${isEdit ? 'text-blue-500' : 'text-amber-500'} drop-shadow-sm`} viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
             </svg>
          </div>
          <div>
            <h4 className={`mb-1 text-sm font-bold ${isEdit ? 'text-blue-900' : 'text-amber-900'}`}>
              {isEdit ? "Next Steps" : "Important Next Steps"}
            </h4>
            <p className={`text-sm leading-relaxed ${isEdit ? 'text-blue-800' : 'text-amber-800'}`}>
              {isEdit ? (
                <>
                  Please <strong className="font-extrabold text-blue-950">print your updated application form</strong> and keep it for your records. You can always access your dashboard to view your status or make further changes if allowed.
                </>
              ) : (
                <>
                  Please save your <strong className="font-extrabold text-amber-950">Application Number</strong> for future reference. 
                  You will need the <strong className="font-extrabold text-amber-950">Mobile Number</strong> and <strong className="font-extrabold text-amber-950">Date of Birth</strong> you used to check your application status or download your forms later.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
          <PrintButton 
            applicationId={appId} 
            className={`flex-1 bg-gradient-to-r ${isEdit ? 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 rounded-xl py-6 font-semibold text-base`} 
          />
          
          <Button asChild variant="outline" className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-xl py-6 font-semibold text-base">
             <Link href={isEdit ? "/status/dashboard" : "/status"}>
               {isEdit ? "Return to Dashboard" : "Check Status Portal"}
             </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
