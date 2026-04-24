import { requireAdminRoute } from "@/app/actions/adminAuth";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminRoute();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar renders itself — fixed on desktop, drawer on mobile */}
      <AdminSidebar />

      {/* Main content — offset for fixed sidebar on desktop, offset for top bar on mobile */}
      <main className="md:pl-72 pt-16 md:pt-0 min-h-screen flex flex-col">
        <div className="flex-1 p-5 md:p-10 relative overflow-x-hidden">
          {/* Subtle background gradient */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-indigo-100/40 via-purple-50/20 to-transparent blur-[80px] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
