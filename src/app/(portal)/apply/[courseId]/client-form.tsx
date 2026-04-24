"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitApplication } from "@/app/actions/application";

type FormSchemaField = {
  id: string;
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "file" | "select" | "radio" | "date";
  required: boolean;
  placeholder?: string;
  helperText?: string;
  isProtected?: boolean;
  options?: string[];
  allowedFileTypes?: string[]; // e.g. [".pdf", ".jpg"]
};

function isImageAccept(types?: string[]) {
  if (!types) return false;
  return types.some(t => [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(t.toLowerCase()));
}

export function DynamicFormClient({ courseId, schema }: { courseId: string; schema: FormSchemaField[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  function handleFileChange(fieldName: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setFilePreviews(prev => ({ ...prev, [fieldName]: url }));
    } else {
      setFilePreviews(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorDetails(null);

    const formData = new FormData(event.currentTarget);
    formData.append("courseId", courseId);

    const result = await submitApplication(formData, schema);

    if (result.success) {
      router.push(`/apply/success?appNo=${result.appNo}&appId=${result.applicationId}`);
    } else {
      setErrorDetails(result.error || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">

      {/* ── Dynamic Fields ── */}
      <div className="space-y-7">
        {schema.map((field) => {
          const isWide = field.type === "file" || field.type === "textarea";
          const acceptAttr = field.allowedFileTypes?.join(",") || "*";

          return (
            <div key={field.id} className={`space-y-1.5 ${isWide ? "col-span-full" : ""}`}>
              <Label htmlFor={field.name} className="text-sm font-medium text-slate-700">
                {field.label || <span className="text-slate-300 italic">Untitled field</span>}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {/* Short text */}
              {field.type === "text" && (
                <Input
                  type="text"
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="max-w-lg"
                />
              )}

              {/* Paragraph */}
              {field.type === "textarea" && (
                <textarea
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder || "Your answer…"}
                  rows={4}
                  className="flex w-full max-w-2xl rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
              )}

              {/* Number */}
              {field.type === "number" && (
                <Input
                  type="number"
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="max-w-xs"
                />
              )}

              {/* Date */}
              {field.type === "date" && (
                <Input
                  type="date"
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  className="max-w-xs"
                />
              )}

              {/* File upload */}
              {field.type === "file" && (
                <div className="space-y-2">
                  {/* Image preview (shown above input if an image was selected) */}
                  {filePreviews[field.name] && (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-indigo-200 shadow-sm">
                      <img
                        src={filePreviews[field.name]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFilePreviews(prev => { const n = { ...prev }; delete n[field.name]; return n; })}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/70"
                        title="Remove preview"
                      >×</button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 max-w-lg">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <input
                      type="file"
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      accept={acceptAttr}
                      onChange={e => handleFileChange(field.name, e)}
                      className="text-sm text-slate-600 file:mr-3 file:text-indigo-600 file:bg-indigo-50 file:border-0 file:rounded file:px-3 file:py-1 file:text-xs file:font-semibold file:hover:bg-indigo-100 file:cursor-pointer flex-1"
                    />
                  </div>
                  {field.allowedFileTypes && field.allowedFileTypes[0] !== "*" && (
                    <p className="text-xs text-slate-400">
                      Accepted: <span className="font-mono">{field.allowedFileTypes.join(", ")}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Dropdown / Select */}
              {field.type === "select" && field.options && (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  defaultValue=""
                  className="flex h-10 w-full max-w-lg rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                >
                  <option value="" disabled>Select an option…</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {/* Radio / Multiple choice */}
              {field.type === "radio" && field.options && (
                <div className="space-y-2 mt-1">
                  {field.options.map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={field.name}
                        value={opt}
                        required={field.required}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Helper text */}
              {field.helperText && (
                <p className="text-xs text-slate-400 mt-1">{field.helperText}</p>
              )}
            </div>
          );
        })}
      </div>

      {errorDetails && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {errorDetails}
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-10 h-11 text-base font-semibold shadow-md shadow-indigo-200"
        >
          {isSubmitting ? "Submitting…" : "Submit Application"}
        </Button>
      </div>
    </form>
  );
}
