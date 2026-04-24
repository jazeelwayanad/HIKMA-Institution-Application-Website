import { prisma } from "@/lib/prisma";
import { requireAdminRoute } from "@/app/actions/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revalidatePath } from "next/cache";
import { createStatus, deleteStatus, initializeDefaultStatuses } from "@/app/actions/adminSettings";
import { Badge } from "@/components/ui/badge";
import { EditStatusDialog } from "./EditStatusDialog";
import { AdminProfileForm } from "./AdminProfileForm";

export default async function SettingsManager() {
  const admin = await requireAdminRoute();

  let settings = await prisma.systemSettings.findFirst();
  if (!settings) settings = await prisma.systemSettings.create({ data: {} });

  // Ensure default statuses exist
  await initializeDefaultStatuses();
  const statuses = await prisma.applicationStatus.findMany({
    orderBy: { createdAt: "asc" }
  });

  // Fetch current admin info
  const currentAdmin = await prisma.admin.findUnique({
    where: { id: admin.sub },
    select: { id: true, email: true }
  });

  async function updateSettings(formData: FormData) {
    "use server";
    const appNumberPrefix = formData.get("appNumberPrefix") as string;
    const currentAppCounter = parseInt(formData.get("currentAppCounter") as string, 10);
    const idStr = formData.get("id") as string;
    const globalEditSubmissions = formData.get("globalEditSubmissions") === "on";

    await prisma.systemSettings.update({
      where: { id: parseInt(idStr, 10) },
      data: {
        appNumberPrefix,
        currentAppCounter: isNaN(currentAppCounter) ? undefined : currentAppCounter,
        globalEditSubmissions,
      }
    });

    revalidatePath("/admin/settings");
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage admin profile, system settings, and application configurations.</p>
      </div>

      {/* Admin Profile Section */}
      {currentAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="space-y-2 pb-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Admin Profile</h2>
            <p className="text-sm text-slate-500">Update your email and password.</p>
          </div>
          <div className="pt-6">
            <AdminProfileForm adminId={currentAdmin.id} email={currentAdmin.email} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Identifiers Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col">
           <form action={updateSettings} className="space-y-6 flex-1">
              <input type="hidden" name="id" value={settings.id} />
              
              <div className="space-y-2 pb-6">
                 <h2 className="text-xl font-bold text-slate-900">Application Numbering</h2>
                 <p className="text-sm text-slate-500 mb-4">Control the prefix and sequence for new applications.</p>
                 
                 <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Application Prefix</Label>
                      <Input name="appNumberPrefix" defaultValue={settings.appNumberPrefix} className="h-11" />
                      <p className="text-xs text-slate-400">E.g., APP- or 2026-</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Next ID Value</Label>
                      <Input name="currentAppCounter" type="number" defaultValue={settings.currentAppCounter} className="h-11" />
                    </div>
                 </div>
                 <div className="mt-6 p-4 bg-slate-50 text-slate-600 rounded-xl text-sm font-mono border border-slate-200/50 flex items-center justify-between">
                   <span>Next generated ID will be:</span>
                   <span className="font-bold text-indigo-600 text-base">{settings.appNumberPrefix}{settings.currentAppCounter + 1}</span>
                 </div>

                 <div className="mt-6 pt-6 border-t border-slate-100 flex items-start gap-4">
                    <div className="flex items-center h-6">
                      <input 
                        id="globalEdit" 
                        name="globalEditSubmissions" 
                        type="checkbox" 
                        defaultChecked={settings.globalEditSubmissions}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="globalEdit" className="text-slate-700 font-semibold cursor-pointer text-base">Allow Application Edits</Label>
                      <p className="text-sm text-slate-500 mt-1">When enabled, clients can edit their submitted applications from the portal.</p>
                    </div>
                 </div>
              </div>

              <div className="pt-4 mt-auto flex justify-end">
                 <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 h-11 px-8 rounded-xl font-semibold">
                   Save Application Config
                 </Button>
              </div>
           </form>
        </div>

        {/* Status Manager */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col">
           <div className="space-y-2 pb-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Application Statuses</h2>
              <p className="text-sm text-slate-500">Add or remove custom statuses for the application workflow.</p>
           </div>

           <div className="py-6 flex flex-wrap gap-3">
              {statuses.map((s: typeof statuses[0]) => (
                <EditStatusDialog key={s.id} status={s} />
              ))}
           </div>

           <div className="mt-auto pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Add Custom Status</h3>
              <form action={async (fd: FormData) => { 
                "use server"; 
                const label = fd.get("label") as string;
                const color = fd.get("color") as string;
                const description = fd.get("description") as string;
                if (label) await createStatus(label, color, description);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="md:col-span-2 space-y-2">
                     <Label className="text-slate-600 text-xs">Status Label</Label>
                     <Input name="label" placeholder="e.g. Under Review" className="h-10" required />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-slate-600 text-xs">Color Theme</Label>
                     <select name="color" className="w-full h-10 border border-slate-200 rounded-md bg-white text-sm px-2 focus:ring-1 focus:ring-slate-900 outline-none">
                        <option value="indigo">Indigo</option>
                        <option value="amber">Amber</option>
                        <option value="rose">Rose</option>
                        <option value="emerald">Emerald</option>
                        <option value="slate">Slate</option>
                     </select>
                   </div>
                   <div className="md:col-span-3 space-y-2">
                     <Label className="text-slate-600 text-xs">Client-facing Description</Label>
                     <Input name="description" placeholder="A friendly description shown to applicants..." className="h-10" />
                   </div>
                </div>
                <Button type="submit" variant="outline" className="w-full h-10 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg">
                  Add Status
                </Button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
}

