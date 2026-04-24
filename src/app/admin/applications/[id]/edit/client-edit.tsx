"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateApplicationData } from "@/app/actions/adminApplications";
import { Loader2, Save } from "lucide-react";

export function ApplicationEditClient({ 
  application, 
  schema 
}: { 
  application: any; 
  schema: any[] 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(application.data as Record<string, any>);
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

  return (
    <div className="space-y-8">
      <div className="space-y-7">
        {schema.map((field) => {
          const value = formData[field.name];
          const isFile = field.type === "file";

          if (isFile) {
             return (
               <div key={field.id} className="space-y-2">
                 <Label className="text-sm font-semibold text-slate-700">{field.label}</Label>
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
            <div key={field.id} className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === "textarea" ? (
                <textarea
                  value={value || ""}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : field.type === "select" && field.options ? (
                <select
                  value={value || ""}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select option...</option>
                  {field.options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "radio" && field.options ? (
                <div className="space-y-2 mt-1">
                  {field.options.map((opt: string) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={value === opt}
                        onChange={() => handleChange(field.name, opt)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm text-slate-600">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <Input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  value={value || ""}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-10"
                />
              )}
              {field.helperText && <p className="text-xs text-slate-400">{field.helperText}</p>}
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
