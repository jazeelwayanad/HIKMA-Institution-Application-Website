"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitApplication } from "@/app/actions/application";
import { adminSubmitApplication } from "@/app/actions/adminApplications";

export function ApplicationFormClient({ courseId, courseTitle, initialData, editId, isAdmin, availableCourses }: {
  courseId: string,
  courseTitle?: string,
  initialData?: Record<string, any>,
  editId?: string,
  isAdmin?: boolean,
  availableCourses?: { id: string; title: string }[]
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo || null);
  const [activeCourseId, setActiveCourseId] = useState(courseId);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorDetails(null);

    const formData = new FormData(event.currentTarget);
    formData.append("courseId", activeCourseId);

    const result = isAdmin
      ? await adminSubmitApplication(formData)
      : await submitApplication(formData);

    if (result.success) {
      if (isAdmin && editId) {
        router.push(`/admin/applications/${editId}`);
        router.refresh();
      } else {
        router.push(`/apply/success?appNo=${result.appNo}&appId=${result.applicationId}`);
      }
    } else {
      setErrorDetails(result.error || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white">
      {editId && <input type="hidden" name="editId" value={editId} />}
      
      {/* Back to Dashboard — student only */}
      {editId && !isAdmin && (
        <div className="px-6 md:px-12 pt-6">
          <Link href="/status/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* Form Header mimicking the design */}
      <div className="bg-[#DAB31B] text-slate-900 font-bold text-center py-2 text-lg border-y-2 border-white shadow-sm mb-6 mx-4 mt-4 rounded-md">
        APPLICATION FOR ADMISSION
      </div>

      <div className="px-6 md:px-12 pb-8 space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-start gap-2">
          <Label htmlFor="photo" className="text-slate-700 font-medium mt-2">Passport Size Photo</Label>
          <div className="relative w-32 h-40">
             <label htmlFor="photo" className="cursor-pointer flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 bg-slate-50 transition-colors overflow-hidden group">
               {photoPreview ? (
                 <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-500">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-xs font-semibold">Upload Photo</span>
                 </div>
               )}
             </label>
             <input 
              type="file" 
              id="photo" 
              name="photo" 
              accept="image/*" 
              required={!photoPreview} 
              onChange={handlePhotoChange}
              className="hidden" 
            />
            {photoPreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setPhotoPreview(null);
                  const fileInput = document.getElementById('photo') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center hover:bg-red-600 shadow-md z-10"
                title="Remove photo"
              >✕</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="full_name" className="text-slate-700 font-medium">Full Name</Label>
          <Input type="text" id="full_name" name="full_name" required defaultValue={initialData?.full_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="dob" className="text-slate-700 font-medium">Date of Birth</Label>
          <Input type="date" id="dob" name="dob" required defaultValue={initialData?.dob || ""} className="border-slate-300 rounded-md h-9 max-w-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="father_name" className="text-slate-700 font-medium">Name of Father</Label>
          <Input type="text" id="father_name" name="father_name" defaultValue={initialData?.father_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="mother_name" className="text-slate-700 font-medium">Name of Mother</Label>
          <Input type="text" id="mother_name" name="mother_name" required defaultValue={initialData?.mother_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="mother_mobile" className="text-slate-700 font-medium">Mobile Number (Mother)</Label>
          <Input type="tel" id="mother_mobile" name="mother_mobile" defaultValue={initialData?.mother_mobile || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="guardian_name" className="text-slate-700 font-medium">Name of Guardian</Label>
          <Input type="text" id="guardian_name" name="guardian_name" required defaultValue={initialData?.guardian_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="guardian_relation" className="text-slate-700 font-medium">Relation with Guardian</Label>
          <Input type="text" id="guardian_relation" name="guardian_relation" required defaultValue={initialData?.guardian_relation || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="guardian_mobile" className="text-slate-700 font-medium">Guardian's Mobile Number</Label>
          <Input type="tel" id="guardian_mobile" name="guardian_mobile" required defaultValue={initialData?.guardian_mobile || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="house_name" className="text-slate-700 font-medium">House Name of Student</Label>
          <Input type="text" id="house_name" name="house_name" required defaultValue={initialData?.house_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="place" className="text-slate-700 font-medium">Place</Label>
          <Input type="text" id="place" name="place" required defaultValue={initialData?.place || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="post_office" className="text-slate-700 font-medium">Post Office</Label>
          <Input type="text" id="post_office" name="post_office" required defaultValue={initialData?.post_office || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="district" className="text-slate-700 font-medium">District</Label>
          <SearchableSelect 
            name="district" 
            defaultValue={initialData?.district} 
            placeholder="Search or select district..." 
            options={[
              "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", 
              "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", 
              "Thrissur", "Wayanad"
            ]} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="whatsapp_number" className="text-slate-700 font-medium">Whatsapp Number</Label>
          <Input type="tel" id="whatsapp_number" name="whatsapp_number" required defaultValue={initialData?.whatsapp_number || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="marital_status" className="text-slate-700 font-medium">Marital Status</Label>
          <select id="marital_status" name="marital_status" required defaultValue={initialData?.marital_status || ""} className="flex h-9 w-full rounded-md border border-slate-300 bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option value="" disabled>Select status...</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>

        {/* Academic Background Banner */}
        <div className="bg-[#DAB31B] text-slate-900 font-bold text-center py-2 text-lg border-y-2 border-white shadow-sm my-6 rounded-md -mx-2 md:-mx-4">
          Academic Background
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="madrasa_qualification" className="text-slate-700 font-medium">Madrasa Qualification</Label>
          <Input type="text" id="madrasa_qualification" name="madrasa_qualification" defaultValue={initialData?.madrasa_qualification || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="last_school_name" className="text-slate-700 font-medium">Last School Name</Label>
          <Input type="text" id="last_school_name" name="last_school_name" required defaultValue={initialData?.last_school_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="sslc_hse_reg_number" className="text-slate-700 font-medium">SSLC/HSE Reg. Number</Label>
          <Input type="text" id="sslc_hse_reg_number" name="sslc_hse_reg_number" required defaultValue={initialData?.sslc_hse_reg_number || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="course_selected" className="text-slate-700 font-medium">Course Selected</Label>
          {isAdmin && availableCourses && availableCourses.length > 0 ? (
            <select
              id="course_selected"
              name="course_selected"
              value={activeCourseId}
              onChange={(e) => {
                const selected = availableCourses.find(c => c.id === e.target.value);
                setActiveCourseId(e.target.value);
                // update the visible value too
                (e.target as HTMLSelectElement).setAttribute('data-title', selected?.title || '');
              }}
              className="flex h-9 w-full rounded-md border border-slate-300 bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          ) : (
            <Input type="text" id="course_selected" name="course_selected" defaultValue={courseTitle || ""} readOnly required className="border-slate-300 rounded-md h-9 bg-slate-50 cursor-not-allowed text-slate-600 font-medium" />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="remarks" className="text-slate-700 font-medium">Remarks</Label>
          <Input type="text" id="remarks" name="remarks" defaultValue={initialData?.remarks || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        {/* Note — student-facing only, hidden for admin */}
        {!isAdmin && (
          <div className="mt-8 p-4 bg-red-50/50 rounded-lg border border-red-100 text-red-600 text-sm italic font-medium text-center">
            Note: Candidate have to appear in person at the institution intending to take admission and confirm the admission along with the PDF printout of the application form, along with the eligibility certificates and admission fee.
          </div>
        )}
        
        {/* Rules & Regulations Checkbox — hidden for admin edits */}
        {!isAdmin && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="declaration" 
                name="declaration_agreed" 
                value="yes"
                required 
                className="mt-1 w-5 h-5 text-blue-600 rounded border-slate-300" 
              />
              <Label htmlFor="declaration" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
                മേൽ പ്രസ്താവിച്ച നിയമങ്ങൾ അംഗീകരിച്ച് ഇവിടെ പഠിക്കാൻ തയ്യാറാണ് 
                (I agree to the above stated rules and am ready to study here.)
              </Label>
            </div>
          </div>
        )}

        {errorDetails && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {errorDetails}
          </div>
        )}

        <div className="mt-8 pt-4 flex flex-col md:flex-row justify-end items-center gap-4 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (isAdmin && editId) router.push(`/admin/applications/${editId}`);
              else router.push(editId ? '/status/dashboard' : '/');
            }}
            disabled={isSubmitting}
            className="w-full md:w-auto h-11 px-8 text-slate-600 hover:text-slate-900"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#2B4B8A] hover:bg-[#1E3A70] text-white rounded-md px-10 h-11 text-base font-semibold w-full md:w-auto"
          >
            {isSubmitting ? (isAdmin ? "Saving…" : "Submitting…") : (isAdmin ? "Save Changes" : "Submit Application")}
          </Button>
        </div>
      </div>
    </form>
  );
}

function SearchableSelect({ name, options, placeholder, defaultValue }: { name: string, options: string[], placeholder: string, defaultValue?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      {/* Hidden input to hold the actual form value */}
      <input type="text" name={name} value={selected} required className="absolute opacity-0 w-full h-full -z-10 pointer-events-none" onChange={() => {}} />
      
      <div 
        className="flex h-9 w-full items-center justify-between rounded-md border border-slate-300 bg-background px-3 py-1 text-sm shadow-sm cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className={selected ? "text-slate-900 font-medium" : "text-slate-500"}>{selected || placeholder}</span>
        <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <input 
              type="text" 
              className="w-full h-8 px-3 text-sm border border-slate-300 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
              placeholder="Search district..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto py-1 max-h-48">
            {filtered.length === 0 ? (
               <div className="px-3 py-3 text-sm text-slate-500 text-center">No districts found.</div>
            ) : filtered.map(opt => (
              <div 
                key={opt} 
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${selected === opt ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-100'}`}
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {opt}
                {selected === opt && (
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
