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
  appNumberPrefix: string;
  currentAppCounter: number;
};

export function CourseEditorClient({
  courseId,
  currentStatus,
  title,
  description,
  fee,
  appNumberPrefix,
  currentAppCounter,
}: CourseEditorProps) {
  const router = useRouter();
  const [courseTitle, setCourseTitle] = useState(title);
  const [courseDesc, setCourseDesc] = useState(description ?? "");
  const [courseFee, setCourseFee] = useState(String(fee ?? 0));
  const [prefix, setPrefix] = useState(appNumberPrefix);
  const [counter, setCounter] = useState(String(currentAppCounter));
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
      status: status,
      appNumberPrefix: prefix,
      currentAppCounter: parseInt(counter) || 0
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
           <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           Course Status
         </Label>
         <Select value={status} onValueChange={(val) => setStatus(val || "DRAFT")}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-11 px-4 text-slate-700">
               <SelectValue placeholder="Select course status...">
                 {status === "DRAFT" ? "Draft (Hidden)" : status === "OPEN" ? "Open (Accepting Applications)" : "Closed (Not Accepting Applications)"}
               </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT" className="font-medium">Draft (Hidden)</SelectItem>
              <SelectItem value="OPEN" className="font-medium">Open (Accepting Applications)</SelectItem>
              <SelectItem value="CLOSED" className="font-medium">Closed (Not Accepting Applications)</SelectItem>
            </SelectContent>
         </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div className="space-y-2">
          <Label className="text-slate-700">Application Number Prefix</Label>
          <Input 
            value={prefix} 
            onChange={e => setPrefix(e.target.value)} 
            className="text-base font-medium h-11 border-slate-200"
            placeholder="e.g. APP-"
          />
          <p className="text-xs text-slate-500">Prefix for applications (e.g. TTC-1001)</p>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700">Current Application Counter</Label>
          <Input 
            type="number"
            value={counter} 
            onChange={e => setCounter(e.target.value)} 
            className="text-base font-medium h-11 border-slate-200" 
          />
          <p className="text-xs text-slate-500">The next application will be {(parseInt(counter) || 0) + 1}</p>
        </div>
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
