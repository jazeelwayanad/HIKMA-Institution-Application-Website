import Link from "next/link";
import { ArrowRight, FileText, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4 py-20">
      {/* Header Section */}
      <div className="text-center mb-16 max-w-2xl">
        <h1 className="text-6xl md:text-7xl font-medium tracking-tight text-slate-900 mb-6">
          Admissions <span className="font-bold text-black">2026</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl leading-relaxed">
          Welcome to the official online application portal. Start your journey or check your current application status.
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* New Application Card */}
        <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] group">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-blue-600 transition-colors group-hover:bg-blue-100">
            <FileText size={32} />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-4">New Application</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-10 flex-grow">
            Start a new application for the upcoming academic year. Choose your preferred course and submit your details.
          </p>
          
          <Link 
            href="/apply" 
            className="w-full bg-[#18181B] text-white rounded-2xl py-5 px-6 font-semibold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98]"
          >
            Start Application
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Check Status Card */}
        <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] group">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-slate-800 transition-colors group-hover:bg-slate-100">
            <Search size={32} />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Check Status</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-10 flex-grow">
            Already applied? Log in with your application number and date of birth to track your progress.
          </p>
          
          <Link 
            href="/status" 
            className="w-fit self-center md:self-end mt-auto text-slate-900 font-semibold text-lg flex items-center gap-2 hover:gap-3 transition-all py-2"
          >
            Check Status
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Simple Footer */}
      <div className="mt-24 text-slate-400 text-sm">
        © 2026 AL-WARDA WOMEN'S COLLEGE. All rights reserved.
      </div>
    </div>
  );
}

