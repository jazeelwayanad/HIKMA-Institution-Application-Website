import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, FileText, CheckCircle, GraduationCap, ArrowUpRight, TrendingUp, Clock, FileBadge } from "lucide-react";

export default async function AdminDashboard() {
  // Aggregate Stats
  const [totalApps, pendingApps, totalCourses, openCourses] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: "OPEN" } })
  ]);

  const recentSubmissions = await prisma.application.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { course: true }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Overview Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-lg">Key metrics and recent application activity.</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm font-semibold text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          System Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        
        {/* Total Apps Card */}
        <div className="relative group overflow-hidden bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-16 h-16 text-indigo-600" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <FileBadge className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Apps</h3>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <div className="text-3xl font-black text-slate-800">{totalApps}</div>
            <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> All Time
            </div>
          </div>
        </div>
        
        {/* Pending Review Card */}
        <div className="relative group overflow-hidden bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-amber-600" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</h3>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <div className="text-3xl font-black text-amber-600">{pendingApps}</div>
            <div className="text-xs font-bold text-amber-700/60 bg-amber-50 px-2 py-1 rounded-lg">Action Needed</div>
          </div>
        </div>

        {/* Active Courses Card */}
        <div className="relative group overflow-hidden bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 sm:col-span-2 xl:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 group-hover:opacity-70 transition-opacity" />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Course Availability</h3>
          </div>
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-end gap-2">
              <div className="text-3xl font-black text-slate-800">{openCourses}</div>
              <div className="text-base font-bold text-slate-400 mb-0.5">/ {totalCourses} Open</div>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-emerald-500 rounded-full relative"
                  style={{ width: `${totalCourses > 0 ? (openCourses / totalCourses) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions List */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            Recent Submissions
            {recentSubmissions.length > 0 && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold ml-2">New</span>}
          </h2>
          <Link href="/admin/applications" className="group flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-bold transition-all bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg">
            View All 
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        
        <div className="p-0">
          {recentSubmissions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                 <FileText className="w-8 h-8" />
               </div>
               <p className="text-slate-500 font-medium">No applications received yet.</p>
               <p className="text-slate-400 text-sm mt-1">When students apply, their submissions will appear here.</p>
            </div>
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Application No</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Program</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentSubmissions.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <Link href={`/admin/applications?search=${app.applicationNo}`} className="font-mono font-bold text-indigo-600 group-hover:text-indigo-800 group-hover:underline">
                            {app.applicationNo}
                          </Link>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-xs uppercase shadow-sm">
                              {app.course.title.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800">{app.course.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                             app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                             app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                             'bg-amber-50 text-amber-700 border-amber-200'
                           }`}>
                             {app.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                             {app.status === 'PENDING' && <Clock className="w-3 h-3" />}
                             {app.status}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-slate-500 font-medium text-right">
                           {app.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
