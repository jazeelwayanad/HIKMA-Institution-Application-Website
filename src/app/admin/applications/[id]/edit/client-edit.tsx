"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateApplicationData } from "@/app/actions/adminApplications";
import { Loader2, Save } from "lucide-react";

export function ApplicationEditClient({ 
  application
}: { 
  application: any; 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(
    typeof application.data === 'object' && application.data !== null ? application.data : {}
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function handleSave() {
    setIsSubmitting(true);
    setError(null);

    const result = await updateApplicationData(application.id, formData);

    if (result.success) {
      router.push(`/admin/applications/${application.id}`);
      router.refresh();
    } else {
      setError(result.error || "Failed to update application.");
      setIsSubmitting(false);
    }
  }

  const fields = Object.keys(formData);

  return (
    <div className="space-y-8">
      <div className="space-y-7">
        {fields.map((key) => {
          const value = formData[key];
          
          // Determine if it's a file
          const isFile = typeof value === 'string' && (value.startsWith('/uploads/') || value.startsWith('http'));

          const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());

          if (isFile) {
             return (
               <div key={key} className="space-y-2">
                 <Label className="text-sm font-semibold text-slate-700">{label}</Label>
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono overflow-hidden text-ellipsis max-w-md">
                       {value || "No file uploaded"}
                    </span>
                    {value && (
                       <a href={value} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">View Current</a>
                    )}
                 </div>
                 <p className="text-[10px] text-slate-400">File uploads cannot be modified from the admin edit screen presently.</p>
               </div>
             );
          }

          return (
            <div key={key} className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {label}
              </Label>
              <Input
                type="text"
                value={value || ""}
                onChange={e => handleChange(key, e.target.value)}
                className="h-10"
              />
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
        <Button variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl h-11 font-bold shadow-md shadow-indigo-100"
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>
    </div>
  );
}
