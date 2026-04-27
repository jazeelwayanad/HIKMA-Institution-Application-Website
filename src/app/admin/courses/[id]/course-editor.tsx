"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCourseDetails } from "@/app/actions/adminCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

type CourseEditorProps = {
  courseId: string;
  currentStatus: string;
  title: string;
  description?: string | null;
  fee?: number | null;
  appNumberPrefix: string;
  currentAppCounter: number;
  requiredDocuments?: any;
  subCourses?: any;
};

export function CourseEditorClient({
  courseId,
  currentStatus,
  title,
  description,
  fee,
  appNumberPrefix,
  currentAppCounter,
  requiredDocuments,
  subCourses: initialSubCourses,
}: CourseEditorProps) {
  const router = useRouter();
  const [courseTitle, setCourseTitle] = useState(title);
  const [courseDesc, setCourseDesc] = useState(description ?? "");
  const [courseFee, setCourseFee] = useState(String(fee ?? 0));
  const [prefix, setPrefix] = useState(appNumberPrefix);
  const [counter, setCounter] = useState(String(currentAppCounter));
  const [status, setStatus] = useState<string>(currentStatus);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Documents state
  const [docs, setDocs] = useState<{name: string, required: boolean}[]>(
    Array.isArray(requiredDocuments) ? requiredDocuments : []
  );
  // Subcourses state
  const [subCourses, setSubCourses] = useState<string[]>(
    Array.isArray(initialSubCourses) ? initialSubCourses : []
  );

  const [newSubCourse, setNewSubCourse] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [newDocRequired, setNewDocRequired] = useState(true);

  const addSubCourse = () => {
    if (newSubCourse.trim()) {
      setSubCourses([...subCourses, newSubCourse.trim()]);
      setNewSubCourse("");
    }
  };

  const removeSubCourse = (index: number) => {
    setSubCourses(subCourses.filter((_, i) => i !== index));
  };

  const addDoc = () => {
    if (newDocName.trim()) {
      setDocs([...docs, { name: newDocName.trim(), required: newDocRequired }]);
      setNewDocName("");
      setNewDocRequired(true);
    }
  };

  const removeDoc = (index: number) => {
    setDocs(docs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaveState("saving");
    const result = await updateCourseDetails(courseId, {
      title: courseTitle,
      description: courseDesc,
      fee: parseFloat(courseFee) || 0,
      status: status,
      appNumberPrefix: prefix,
      currentAppCounter: parseInt(counter) || 0,
      requiredDocuments: docs,
      subCourses: subCourses
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
    <div className="space-y-8">
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

        {/* Subcourses Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Label className="text-slate-700 font-bold text-base">Subcourses</Label>
          <div className="flex gap-2">
            <Input 
              value={newSubCourse} 
              onChange={e => setNewSubCourse(e.target.value)} 
              placeholder="Enter subcourse name (e.g. Science)" 
              className="h-11"
              onKeyDown={e => e.key === 'Enter' && addSubCourse()}
            />
            <Button type="button" onClick={addSubCourse} variant="secondary" className="h-11">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subCourses.map((sc, i) => (
              <div key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 border border-indigo-100">
                {sc}
                <button onClick={() => removeSubCourse(i)} className="text-indigo-400 hover:text-indigo-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {subCourses.length === 0 && <p className="text-xs text-slate-400 italic">No subcourses added. If empty, applicants will only select the main course.</p>}
          </div>
        </div>

        {/* Required Documents Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Label className="text-slate-700 font-bold text-base">Required Documents</Label>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
            <Input 
              value={newDocName} 
              onChange={e => setNewDocName(e.target.value)} 
              placeholder="e.g. SSLC Certificate" 
              className="h-11"
              onKeyDown={e => e.key === 'Enter' && addDoc()}
            />
            <div className="flex items-center gap-2 px-3 h-11 border border-slate-200 rounded-md bg-slate-50 cursor-pointer" onClick={() => setNewDocRequired(!newDocRequired)}>
              {newDocRequired ? <CheckCircle2 className="w-4 h-4 text-indigo-600" /> : <Circle className="w-4 h-4 text-slate-300" />}
              <span className="text-sm font-medium text-slate-700">Required</span>
            </div>
            <Button type="button" onClick={addDoc} variant="secondary" className="h-11">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {docs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">{doc.name}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${doc.required ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                    {doc.required ? 'Required' : 'Optional'}
                  </span>
                </div>
                <button onClick={() => removeDoc(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {docs.length === 0 && <p className="text-xs text-slate-400 italic">No document requirements added.</p>}
          </div>
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
      </div>

      <div className="pt-4 flex justify-end border-t border-slate-100">
        <Button 
          onClick={handleSave} 
          disabled={saveState === "saving"} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-10 h-11"
        >
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "✓ Saved!" : "Save Course Settings"}
        </Button>
      </div>
    </div>
  );
}
