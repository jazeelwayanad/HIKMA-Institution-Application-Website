"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, Pencil, CheckCircle, FileText, Upload, X as CloseIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitApplication } from "@/app/actions/application";
import { adminSubmitApplication } from "@/app/actions/adminApplications";

export function ApplicationFormClient({ courseId, courseTitle, initialData, editId, isAdmin, availableCourses, requiredDocuments, subCourses, fileUploadSizeLimitMB }: {
  courseId: string,
  courseTitle?: string,
  initialData?: Record<string, any>,
  editId?: string,
  isAdmin?: boolean,
  availableCourses?: { id: string; title: string }[],
  requiredDocuments?: any,
  subCourses?: any,
  fileUploadSizeLimitMB?: number
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo || null);
  const [activeCourseId, setActiveCourseId] = useState(courseId);
  const [reviewData, setReviewData] = useState<Record<string, string> | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({});

  // Document previews/filenames for review
  const [docPreviews, setDocPreviews] = useState<Record<string, { name: string, url: string | null }>>({});

  useEffect(() => {
    // If editing, populate docPreviews with initial document URLs if they exist
    if (initialData) {
      const initialUrls: Record<string, string> = {};
      if (initialData.photo) initialUrls["photo"] = initialData.photo;

      if (Array.isArray(requiredDocuments)) {
        const initialPreviews: Record<string, { name: string, url: string | null }> = {};
        requiredDocuments.forEach((doc: any) => {
          const key = `doc_${doc.name.replace(/\s+/g, '_').toLowerCase()}`;
          if (initialData[key]) {
            initialPreviews[key] = { name: "Existing Document", url: initialData[key] };
            initialUrls[key] = initialData[key];
          }
        });
        setDocPreviews(initialPreviews);
      }
      setUploadedUrls(initialUrls);
    }
  }, [initialData, requiredDocuments]);

  const fieldLabels: Record<string, string> = {
    full_name: "Full Name", dob: "Date of Birth", father_name: "Name of Father",
    mother_name: "Name of Mother", mother_mobile: "Mobile (Mother)",
    guardian_name: "Guardian Name", guardian_relation: "Guardian Relation",
    guardian_mobile: "Guardian Mobile", house_name: "House Name",
    place: "Place", post_office: "Post Office", district: "District",
    whatsapp_number: "WhatsApp Number", marital_status: "Marital Status",
    madrasa_qualification: "Madrasa Qualification", last_school_name: "Last School",
    sslc_hse_reg_number: "SSLC/HSE Reg. No.", course_selected: "Course Selected",
    sub_course: "Sub Course",
    remarks: "Remarks",
  };

  const sections = [
    { title: "Personal Information", keys: ["full_name","dob","father_name","mother_name","mother_mobile","marital_status"] },
    { title: "Contact & Address", keys: ["guardian_name","guardian_relation","guardian_mobile","house_name","place","post_office","district","whatsapp_number"] },
    { title: "Academic Background", keys: ["madrasa_qualification","last_school_name","sslc_hse_reg_number","course_selected", ...(Array.isArray(subCourses) && subCourses.length > 0 ? ["sub_course"] : []), "remarks"] },
  ];

  function handleReviewClick() {
    if (!formRef.current) return;
    if (!formRef.current.reportValidity()) return;
    const fd = new FormData(formRef.current);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { if (typeof v === "string" && k !== "editId" && k !== "declaration_agreed") data[k] = v; });
    if (!isAdmin) data["course_selected"] = courseTitle || "";
    else if (availableCourses) {
      const c = availableCourses.find(x => x.id === activeCourseId);
      data["course_selected"] = c?.title || "";
    }
    setReviewData(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const MAX_FILE_SIZE_MB = fileUploadSizeLimitMB || 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const validateFileSize = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  async function handleBackgroundUpload(file: File, key: string) {
    if (!validateFileSize(file)) return;

    // Capture previous URL before starting new upload
    const previousUrl = uploadedUrls[key];

    setUploading(prev => ({ ...prev, [key]: true }));
    setErrorDetails(null);

    const formData = new FormData();
    formData.append("file", file);
    if (previousUrl) {
      formData.append("previousUrl", previousUrl);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      setUploadedUrls(prev => ({ ...prev, [key]: result.url }));
    } catch (err) {
      console.error("Background Upload Error:", err);
      setErrorDetails(`Failed to upload ${key.replace(/_/g, ' ')}. Please try again.`);
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        e.target.value = "";
        setPhotoPreview(null);
        return;
      }
      if (!validateFileSize(file)) {
        e.target.value = "";
        setPhotoPreview(null);
        return;
      }
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      handleBackgroundUpload(file, "photo");
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
        const mode = (!isAdmin && editId) ? "&mode=edit" : "";
        router.push(`/apply/success?appNo=${result.appNo}&appId=${result.applicationId}${mode}`);
      }
    } else {
      setErrorDetails(result.error || "An unexpected error occurred.");
      setIsSubmitting(false);
      setReviewData(null);
    }
  }

  const formatValue = (key: string, val: string) => {
    if (!val) return <span className="text-slate-400 italic">—</span>;
    if (key === "dob") {
      const d = new Date(val);
      return isNaN(d.getTime()) ? val : d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    }
    return val;
  };

  return (
    <>
    {reviewData && (
      <div className="bg-white">
        <div className="bg-[#DAB31B] text-slate-900 font-bold text-center py-2 text-lg border-y-2 border-white shadow-sm mb-6 mx-4 mt-4 rounded-md">
          REVIEW YOUR APPLICATION
        </div>
        <div className="px-6 md:px-12 pb-8 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            {photoPreview ? (
              <img src={photoPreview} alt="Photo" className="w-20 h-24 object-cover rounded-lg border-2 border-indigo-200 shadow" />
            ) : (
              <div className="w-20 h-24 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">No Photo</div>
            )}
            <div>
              <p className="text-xl font-bold text-slate-900">{reviewData.full_name || "—"}</p>
              <p className="text-sm text-indigo-600 font-medium mt-1">{reviewData.course_selected || ""}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <CheckCircle className="w-3.5 h-3.5" /> Ready to Submit
              </div>
            </div>
          </div>
          {sections.map(sec => (
            <div key={sec.title}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">{sec.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {sec.keys.map(k => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{fieldLabels[k] || k}</span>
                    <span className="text-sm font-medium text-slate-800">{formatValue(k, reviewData[k] || "")}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Documents Review */}
          {Array.isArray(requiredDocuments) && requiredDocuments.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Uploaded Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {requiredDocuments.map((doc: any, i: number) => {
                  const key = `doc_${doc.name.replace(/\s+/g, '_').toLowerCase()}`;
                  const preview = docPreviews[key];
                  return (
                    <div key={i} className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{doc.name}</span>
                      <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                        {preview ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            {preview.name.length > 30 ? preview.name.substring(0, 27) + '...' : preview.name}
                          </>
                        ) : (
                          <span className="text-slate-400 italic">— Not Uploaded —</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {errorDetails && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{errorDetails}</div>
          )}
          <div className="pt-4 flex flex-col md:flex-row justify-end items-center gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setReviewData(null)} disabled={isSubmitting || Object.values(uploading).some(v => v)} className="w-full md:w-auto h-11 px-8 gap-2">
              <Pencil className="w-4 h-4" /> Edit
            </Button>
            <Button type="button" disabled={isSubmitting || Object.values(uploading).some(v => v)} onClick={() => formRef.current?.requestSubmit()} className="bg-[#2B4B8A] hover:bg-[#1E3A70] text-white rounded-md px-10 h-11 text-base font-semibold w-full md:w-auto">
              {isSubmitting ? (isAdmin ? "Saving…" : "Submitting…") : Object.values(uploading).some(v => v) ? "Uploading Files…" : (isAdmin ? "Confirm & Save Changes" : "Confirm & Submit")}
            </Button>
          </div>
        </div>
      </div>
    )}
    <form ref={formRef} onSubmit={onSubmit} className={`bg-white${reviewData ? " hidden" : ""}`}>
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
          <div className="space-y-1">
            <Label htmlFor="photo" className="text-slate-700 font-medium">Passport Size Photo</Label>
            <p className="text-[10px] text-slate-400 leading-tight">Image format only. Max {MAX_FILE_SIZE_MB}MB.</p>
          </div>
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
               {uploading["photo"] && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                   <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                 </div>
               )}
             </label>
             <input 
              type="file" 
              id="photo" 
              accept="image/*" 
              required={!photoPreview} 
              onChange={handlePhotoChange}
              className="hidden" 
            />
            {/* Hidden input to submit the pre-uploaded URL */}
            <input type="hidden" name="photo" value={uploadedUrls["photo"] || ""} />
            {photoPreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setPhotoPreview(null);
                  setUploadedUrls(prev => {
                    const next = { ...prev };
                    delete next["photo"];
                    return next;
                  });
                  const fileInput = document.getElementById('photo') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="absolute -top-2.5 -right-2.5 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-[0_2px_10px_rgba(239,68,68,0.4)] z-30 transition-all active:scale-90 border-2 border-white"
                title="Remove photo"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="full_name" className="text-slate-700 font-medium">Full Name <span className="text-red-500">*</span></Label>
          <Input type="text" id="full_name" name="full_name" required defaultValue={initialData?.full_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="dob" className="text-slate-700 font-medium">Date of Birth <span className="text-red-500">*</span></Label>
          <Input type="date" id="dob" name="dob" required defaultValue={initialData?.dob || ""} className="border-slate-300 rounded-md h-9 max-w-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="father_name" className="text-slate-700 font-medium">Name of Father</Label>
          <Input type="text" id="father_name" name="father_name" defaultValue={initialData?.father_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="mother_name" className="text-slate-700 font-medium">Name of Mother <span className="text-red-500">*</span></Label>
          <Input type="text" id="mother_name" name="mother_name" required defaultValue={initialData?.mother_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="mother_mobile" className="text-slate-700 font-medium">Mobile Number (Mother)</Label>
          <Input type="tel" id="mother_mobile" name="mother_mobile" defaultValue={initialData?.mother_mobile || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="guardian_name" className="text-slate-700 font-medium">Name of Guardian <span className="text-red-500">*</span></Label>
          <Input type="text" id="guardian_name" name="guardian_name" required defaultValue={initialData?.guardian_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="guardian_relation" className="text-slate-700 font-medium">Relation with Guardian <span className="text-red-500">*</span></Label>
          <Input type="text" id="guardian_relation" name="guardian_relation" required defaultValue={initialData?.guardian_relation || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="guardian_mobile" className="text-slate-700 font-medium">Guardian's Mobile Number <span className="text-red-500">*</span></Label>
          <Input type="tel" id="guardian_mobile" name="guardian_mobile" required defaultValue={initialData?.guardian_mobile || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="house_name" className="text-slate-700 font-medium">House Name of Student <span className="text-red-500">*</span></Label>
          <Input type="text" id="house_name" name="house_name" required defaultValue={initialData?.house_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="place" className="text-slate-700 font-medium">Place <span className="text-red-500">*</span></Label>
          <Input type="text" id="place" name="place" required defaultValue={initialData?.place || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="post_office" className="text-slate-700 font-medium">Post Office <span className="text-red-500">*</span></Label>
          <Input type="text" id="post_office" name="post_office" required defaultValue={initialData?.post_office || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="district" className="text-slate-700 font-medium">District <span className="text-red-500">*</span></Label>
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
          <Label htmlFor="whatsapp_number" className="text-slate-700 font-medium">Whatsapp Number <span className="text-red-500">*</span></Label>
          <Input type="tel" id="whatsapp_number" name="whatsapp_number" required defaultValue={initialData?.whatsapp_number || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="marital_status" className="text-slate-700 font-medium">Marital Status <span className="text-red-500">*</span></Label>
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
          <Label htmlFor="last_school_name" className="text-slate-700 font-medium">Last School Name <span className="text-red-500">*</span></Label>
          <Input type="text" id="last_school_name" name="last_school_name" required defaultValue={initialData?.last_school_name || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="sslc_hse_reg_number" className="text-slate-700 font-medium">SSLC/HSE Reg. Number <span className="text-red-500">*</span></Label>
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

        {Array.isArray(subCourses) && subCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
            <Label htmlFor="sub_course" className="text-slate-700 font-medium">Sub Course</Label>
            <select
              id="sub_course"
              name="sub_course"
              required
              defaultValue={initialData?.sub_course || ""}
              className="flex h-9 w-full rounded-md border border-slate-300 bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" disabled>Select sub course...</option>
              {subCourses.map((sc: string) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-2">
          <Label htmlFor="remarks" className="text-slate-700 font-medium">Remarks</Label>
          <Input type="text" id="remarks" name="remarks" defaultValue={initialData?.remarks || ""} className="border-slate-300 rounded-md h-9" />
        </div>

        {/* Documents Section */}
        {Array.isArray(requiredDocuments) && requiredDocuments.length > 0 && (
          <>
            <div className="bg-[#DAB31B] text-slate-900 font-bold text-center py-2 text-lg border-y-2 border-white shadow-sm my-6 rounded-md -mx-2 md:-mx-4">
              Documents Upload
            </div>
            <div className="space-y-4">
              {requiredDocuments.map((doc: any, idx: number) => {
                const key = `doc_${doc.name.replace(/\s+/g, '_').toLowerCase()}`;
                const preview = docPreviews[key];
                const isUploading = uploading[key];
                const isUploaded = !!uploadedUrls[key];

                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-start gap-2">
                    <Label className="text-slate-700 font-medium mt-2">
                      {doc.name} {doc.required && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="space-y-2">
                      <div className="relative">
                        <label className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isUploaded ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'}`}>
                          <div className={`p-2 rounded-full ${isUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {isUploading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isUploaded ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Upload className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isUploaded ? 'text-emerald-700' : 'text-slate-600'}`}>
                              {isUploading ? "Uploading..." : preview ? preview.name : `Click to upload ${doc.name}`}
                            </p>
                            <p className="text-[11px] text-slate-400">PDF, JPG or PNG (Max {MAX_FILE_SIZE_MB}MB)</p>
                          </div>
                          <input 
                            type="file" 
                            required={doc.required && !isUploaded}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setDocPreviews(prev => ({
                                  ...prev,
                                  [key]: { name: file.name, url: URL.createObjectURL(file) }
                                }));
                                handleBackgroundUpload(file, key);
                              }
                            }}
                            className="hidden" 
                          />
                        </label>
                        {/* Hidden input to submit the pre-uploaded URL */}
                        <input type="hidden" name={key} value={uploadedUrls[key] || ""} />

                        {preview && !isUploading && (
                          <button
                            type="button"
                            onClick={() => {
                              setDocPreviews(prev => {
                                const next = { ...prev };
                                delete next[key];
                                return next;
                              });
                              setUploadedUrls(prev => {
                                const next = { ...prev };
                                delete next[key];
                                return next;
                              });
                            }}
                            className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(239,68,68,0.3)] hover:bg-red-600 z-10 border-2 border-white transition-all active:scale-90"
                          >
                            <CloseIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {preview?.url && preview.url.startsWith('http') && (
                        <a href={preview.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
                          <FileText className="w-3 h-3" /> View current document
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

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
            type="button"
            onClick={handleReviewClick}
            disabled={isSubmitting || Object.values(uploading).some(v => v)}
            className="bg-[#2B4B8A] hover:bg-[#1E3A70] text-white rounded-md px-10 h-11 text-base font-semibold w-full md:w-auto"
          >
            {Object.values(uploading).some(v => v) ? "Uploading Files…" : (isAdmin ? "Review & Save" : "Review Application")}
          </Button>
        </div>
      </div>
    </form>
    </>
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
