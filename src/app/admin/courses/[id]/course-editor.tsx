"use client";

import { useState } from "react";
import { updateCourseDetails } from "@/app/actions/adminCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

type CourseEditorProps = {
  courseId: string;
  currentStatus: string;
  title: string;
  description?: string | null;
  fee?: number | null;
  formTemplateId?: string | null;
  availableForms: { id: string; name: string }[];
};

export function CourseEditorClient({
  courseId,
  currentStatus,
  title,
  description,
  fee,
  formTemplateId,
  availableForms,
}: CourseEditorProps) {
  const router = useRouter();
  const [courseTitle, setCourseTitle] = useState(title);
  const [courseDesc, setCourseDesc] = useState(description ?? "");
  const [courseFee, setCourseFee] = useState(String(fee ?? 0));
  const initialForm = availableForms.some(f => f.id === formTemplateId) ? (formTemplateId || "none") : "none";
  const [selectedForm, setSelectedForm] = useState(initialForm);
  const [status, setStatus] = useState<string>(currentStatus);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleSave = async () => {
    setSaveState("saving");
    // Merge update details and update status into a single call logically, 
    // but right now they are separate. We can just use updateCourseDetails
    // wait, adminCourses.ts has updateCourseDetails.
    const result = await updateCourseDetails(courseId, {
      title: courseTitle,
      description: courseDesc,
      fee: parseFloat(courseFee) || 0,
      formTemplateId: selectedForm === "none" ? "" : selectedForm
    });

    if (result.success) {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
      router.refresh();
    } else {
      setSaveState("error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-slate-700">Course Name</Label>
        <Input 
          value={courseTitle} 
          onChange={e => setCourseTitle(e.target.value)} 
          className="text-base font-medium h-11 border-slate-200" 
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Description (Optional)</Label>
        <textarea
          value={courseDesc}
          onChange={e => setCourseDesc(e.target.value)}
          rows={4}
          className="flex w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 resize-none"
        />
      </div>

      <div className="space-y-2">
         <Label className="text-slate-700 font-semibold flex items-center gap-2">
           <svg className="w-4 h-4 text-slate-400 font-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           Attach Application Form
         </Label>
         <Select value={selectedForm} onValueChange={setSelectedForm}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-11 px-4 text-slate-700">
               <SelectValue placeholder="No form attached - select one..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-slate-500 italic">No Form Attached (Registration Disabled)</SelectItem>
              {availableForms.map((f: typeof availableForms[0]) => (
                <SelectItem key={f.id} value={f.id} className="font-medium">
                  {f.name || "Untitled Form template"}
                </SelectItem>
              ))}
            </SelectContent>
         </Select>
         <p className="text-xs text-slate-500 font-medium bg-slate-100/50 p-2 rounded-md border border-slate-100 flex items-center gap-2 mt-2">
           <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
           Pick a pre-built form template from the Form Builder library to enable applications.
         </p>
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saveState === "saving"} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-10 h-11"
        >
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "✓ Saved!" : "Save Course"}
        </Button>
      </div>
    </div>
  );
}
