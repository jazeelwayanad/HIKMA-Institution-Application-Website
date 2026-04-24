"use client";

import { useState } from "react";
import { updateCourseSchema, updateCourseStatus, updateCourseDetails } from "@/app/actions/adminCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  FileText, Image as ImageIcon, File as FileIcon, FileSpreadsheet, FolderOpen,
  AlignLeft, Type, Hash, Calendar, ChevronDown, CheckCircle2, Paperclip,
  Copy, Trash2, GripVertical, PlusCircle, PenLine, Settings, CheckCircle
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

const FILE_TYPES = [
  { label: "PDF",             accept: ".pdf",             icon: FileText },
  { label: "Image (JPG/PNG)", accept: ".jpg,.jpeg,.png", icon: ImageIcon },
  { label: "Word (DOC/DOCX)", accept: ".doc,.docx",      icon: FileIcon },
  { label: "Excel (XLS/XLSX)",accept: ".xls,.xlsx",      icon: FileSpreadsheet },
  { label: "Any File",        accept: "*",                icon: FolderOpen },
] as const;

const FIELD_TYPES = [
  { value: "text",      label: "Short Answer",    icon: Type },
  { value: "textarea",  label: "Paragraph",       icon: AlignLeft },
  { value: "number",    label: "Number",          icon: Hash },
  { value: "date",      label: "Date",            icon: Calendar },
  { value: "select",    label: "Dropdown",        icon: ChevronDown },
  { value: "radio",     label: "Multiple Choice", icon: CheckCircle2 },
  { value: "file",      label: "File Upload",     icon: Paperclip },
] as const;

type FieldType = (typeof FIELD_TYPES)[number]["value"];

export type SchemaField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];            // for select / radio
  allowedFileTypes?: string[];   // for file
  helperText?: string;
  isProtected?: boolean;         // Cannot be deleted
};

type SaveState = "idle" | "saving" | "saved" | "error";

// ─── Sortable Item Component ───────────────────────────────────────────────

function SortableFieldCard({
  field,
  index,
  totalFields,
  isActive,
  onActivate,
  onUpdateField,
  onRemoveField,
  onDuplicateField,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onToggleFileType
}: {
  field: SchemaField;
  index: number;
  totalFields: number;
  isActive: boolean;
  onActivate: (id: string) => void;
  onUpdateField: (id: string, updates: Partial<SchemaField>) => void;
  onRemoveField: (id: string) => void;
  onDuplicateField: (id: string) => void;
  onUpdateOption: (id: string, idx: number, val: string) => void;
  onAddOption: (id: string) => void;
  onRemoveOption: (id: string, idx: number) => void;
  onToggleFileType: (id: string, accept: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const fieldTypeMeta = FIELD_TYPES.find((t: typeof FIELD_TYPES[0]) => t.value === field.type);
  const IconComponent = fieldTypeMeta?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-2xl border shadow-sm flex flex-col transition-all overflow-hidden ${
        isActive ? "border-indigo-400 ring-2 ring-indigo-100 shadow-md" : "border-slate-200 hover:border-slate-300"
      }`}
      onClick={(e) => {
        // Only activate if not dragging or clicking buttons inside
        onActivate(field.id);
      }}
    >
      {isActive && <div className="h-1 bg-indigo-500 w-full" />}
      
      <div className="flex">
        {/* Drag handle (Left Side) */}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing hover:bg-slate-50 text-slate-300 hover:text-slate-500 transition-colors border-r border-transparent hover:border-slate-100"
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5 focus:outline-none" />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 overflow-hidden">
          {isActive ? (
            /* ── EDITING STATE ── */
            <div className="space-y-5" onClick={e => e.stopPropagation()}>
              
              {/* Row 1: Label + Type */}
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    id={`label-${field.id}`}
                    value={field.label}
                    onChange={e => onUpdateField(field.id, { label: e.target.value })}
                    placeholder="Question"
                    className="w-full text-base font-medium text-slate-800 placeholder-slate-300 border-0 border-b-2 border-slate-200 focus:border-indigo-500 focus:outline-none pb-1.5 bg-transparent transition-colors"
                  />
                </div>
                {!field.isProtected && (
                  <div className="w-52 flex-shrink-0">
                    <Select value={field.type} onValueChange={(val: any) => {
                      const updates: Partial<SchemaField> = { type: val };
                      if (val === "select" || val === "radio") updates.options = field.options?.length ? field.options : ["Option 1"];
                      if (val === "file") updates.allowedFileTypes = field.allowedFileTypes?.length ? field.allowedFileTypes : [".pdf"];
                      if (val !== "select" && val !== "radio") updates.options = undefined;
                      onUpdateField(field.id, updates);
                    }}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((t: typeof FIELD_TYPES[0]) => {
                          const TIcon = t.icon;
                          return (
                            <SelectItem key={t.value} value={t.value}>
                              <span className="flex items-center gap-2">
                                <TIcon className="w-4 h-4 text-slate-500" />
                                {t.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {field.isProtected && (
                  <div className="w-52 flex-shrink-0 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-500 cursor-not-allowed">
                     <IconComponent className="w-4 h-4" />
                     {fieldTypeMeta?.label}
                  </div>
                )}
              </div>

              {/* Row 2: Internal key + helper text */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Internal Key <span className="text-slate-300">(matches PDF)</span></Label>
                  <Input
                    value={field.name}
                    disabled={field.isProtected}
                    onChange={e => onUpdateField(field.id, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, "").replace(/\s+/g, "_") })}
                    placeholder="e.g. full_name"
                    className={`font-mono text-xs h-8 ${field.isProtected ? "bg-slate-100 text-slate-500" : "text-indigo-600 bg-indigo-50 border-indigo-200"}`}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Helper Text <span className="text-slate-300">(optional)</span></Label>
                  <Input
                    value={field.helperText ?? ""}
                    onChange={e => onUpdateField(field.id, { helperText: e.target.value })}
                    placeholder="Shown below the input"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* ── Per-type config ── */}

              {/* Select / Radio options */}
              {(field.type === "select" || field.type === "radio") && (
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Options</Label>
                  <div className="space-y-2">
                    {(field.options ?? []).map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-slate-300 text-sm w-5">
                          {field.type === "radio" ? "○" : `${i + 1}.`}
                        </span>
                        <input
                          value={opt}
                          onChange={e => onUpdateOption(field.id, i, e.target.value)}
                          className="flex-1 text-sm border-0 border-b border-slate-200 focus:border-indigo-400 focus:outline-none pb-1 bg-transparent"
                          placeholder={`Option ${i + 1}`}
                        />
                        {(field.options?.length ?? 0) > 1 && (
                          <button onClick={() => onRemoveOption(field.id, i)} className="text-slate-300 hover:text-red-400 text-lg leading-none">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onAddOption(field.id)}
                    className="text-sm text-indigo-500 hover:text-indigo-700 inline-flex items-center gap-1 mt-1 font-medium"
                  >
                    <PlusCircle className="w-4 h-4" /> Add option
                  </button>
                </div>
              )}

              {/* File upload: allowed types */}
              {field.type === "file" && (
                <div className="space-y-3">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Allowed File Types</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FILE_TYPES.map((ft: typeof FILE_TYPES[0]) => {
                      const checked = (field.allowedFileTypes ?? []).includes(ft.accept);
                      const isAny = ft.accept === "*";
                      const hasAny = (field.allowedFileTypes ?? []).includes("*");
                      const FTIcon = ft.icon;
                      
                      return (
                        <label
                          key={ft.accept}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                            checked
                              ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          } ${!isAny && hasAny ? "opacity-40 pointer-events-none" : ""}`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => {
                              if (isAny) {
                                onUpdateField(field.id, { allowedFileTypes: checked ? [".pdf"] : ["*"] });
                              } else {
                                onToggleFileType(field.id, ft.accept);
                              }
                            }}
                          />
                          <FTIcon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-xs font-semibold leading-tight">{ft.label}</span>
                          {checked && <CheckCircle className="ml-auto w-4 h-4 text-indigo-500 flex-shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400">
                    Accepted: <span className="font-mono text-slate-600">{(field.allowedFileTypes ?? []).join(", ") || "none"}</span>
                  </p>
                </div>
              )}

              {field.type === "textarea" && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500">
                  Students will see a multi-line text box (paragraph input)
                </div>
              )}

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-xs text-slate-400 font-monomr-2 pr-2 border-r border-slate-200">
                     #{index + 1}
                  </div>
                  {!field.isProtected && (
                    <>
                      <button onClick={() => onDuplicateField(field.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => onRemoveField(field.id)} className="p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {field.isProtected && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Protected Core Field</span>
                  )}
                </div>

                {/* Required toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-slate-500 font-medium">Required</span>
                  <button
                    role="switch"
                    aria-checked={field.required}
                    disabled={field.isProtected}
                    onClick={() => {
                        if(!field.isProtected) onUpdateField(field.id, { required: !field.required });
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${field.required ? "bg-indigo-600" : "bg-slate-200"} ${field.isProtected ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${field.required ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </label>
              </div>

            </div>
          ) : (
            /* ── PREVIEW STATE (collapsed) ── */
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 text-slate-400">
                 <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {field.label || <span className="text-slate-300 italic">Untitled question</span>}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{field.name}</span>
                  <span>·</span>
                  <span>{fieldTypeMeta?.label}</span>
                  {field.type === "file" && field.allowedFileTypes && (
                    <><span>·</span><span className="font-mono">{field.allowedFileTypes.join(", ")}</span></>
                  )}
                  {(field.type === "select" || field.type === "radio") && field.options && (
                    <><span>·</span><span>{field.options.length} options</span></>
                  )}
                </div>
              </div>
              {field.isProtected && (
                 <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Main Component Wrapper ──────────────────────────────────────────────────

export function FormBuilderClient({
  courseId,
  initialSchema,
  currentStatus,
  pdfTemplateUrl,
  title,
  description,
  fee,
}: {
  courseId: string;
  initialSchema: SchemaField[];
  currentStatus: string;
  pdfTemplateUrl: string | null;
  title: string;
  description?: string | null;
  fee?: number | null;
}) {
  const [fields, setFields] = useState<SchemaField[]>(initialSchema);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(pdfTemplateUrl);
  const [activeTab, setActiveTab] = useState<"details" | "form" | "pdf">("details");

  const [courseTitle, setCourseTitle] = useState(title);
  const [courseDesc, setCourseDesc] = useState(description ?? "");
  const [courseFee, setCourseFee] = useState(String(fee ?? 0));
  const [detailsSaveState, setDetailsSaveState] = useState<SaveState>("idle");

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Field helpers ──────────────────────────────────────────────────────────

  const addField = (type: FieldType = "text") => {
    const id = `f_${Date.now()}`;
    const newField: SchemaField = {
      id,
      name: id,
      label: "",
      type,
      required: false,
      options: type === "select" || type === "radio" ? ["Option 1"] : undefined,
      allowedFileTypes: type === "file" ? [".pdf"] : undefined,
    };
    setFields(prev => [...prev, newField]);
    setActiveFieldId(id);
    setTimeout(() => document.getElementById(`label-${id}`)?.focus(), 50);
  };

  const duplicateField = (id: string) => {
    const source = fields.find(f => f.id === id);
    if (!source) return;
    const newId = `f_${Date.now()}`;
    const clone = { ...source, id: newId, name: newId, isProtected: false };
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    setActiveFieldId(newId);
  };

   const removeField = (id: string) => {
     setFields(prev => prev.filter((f: typeof fields[0]) => f.id !== id || f.isProtected));
     setActiveFieldId(null);
   };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    setFields(prev => prev.map((f: typeof fields[0]) => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((items: typeof fields) => {
        const oldIndex = items.findIndex((item: typeof fields[0]) => item.id === active.id);
        const newIndex = items.findIndex((item: typeof fields[0]) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Option management for select / radio
  const addOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [...(fields.find(f => f.id === fieldId)?.options ?? []), `Option ${(fields.find(f => f.id === fieldId)?.options?.length ?? 0) + 1}`]
    });
  };

  const updateOption = (fieldId: string, idx: number, val: string) => {
    const opts = [...(fields.find(f => f.id === fieldId)?.options ?? [])];
    opts[idx] = val;
    updateField(fieldId, { options: opts });
  };

  const removeOption = (fieldId: string, idx: number) => {
    const opts = (fields.find(f => f.id === fieldId)?.options ?? []).filter((_, i) => i !== idx);
    updateField(fieldId, { options: opts });
  };

  const toggleFileType = (fieldId: string, accept: string) => {
    const current = fields.find(f => f.id === fieldId)?.allowedFileTypes ?? [];
    const next = current.includes(accept)
      ? current.filter(a => a !== accept)
      : [...current, accept];
    updateField(fieldId, { allowedFileTypes: next.length ? next : [".pdf"] });
  };

  // ── Save handlers ──────────────────────────────────────────────────────────

  const handleSaveSchema = async () => {
    setSaveState("saving");
    const result = await updateCourseSchema(courseId, fields);
    setSaveState(result.success ? "saved" : "error");
    setTimeout(() => setSaveState("idle"), 2500);
  };

  const handleSaveDetails = async () => {
    setDetailsSaveState("saving");
    const result = await updateCourseDetails(courseId, {
      title: courseTitle,
      description: courseDesc,
      fee: parseFloat(courseFee) || 0,
    });
    setDetailsSaveState(result.success ? "saved" : "error");
    setTimeout(() => setDetailsSaveState("idle"), 2500);
  };

  const handleStatusChange = async (status: "OPEN" | "DRAFT" | "CLOSED") => {
    await updateCourseStatus(courseId, status);
  };

  async function handlePdfUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/upload-template", { method: "POST", body: formData });
    setIsUploading(false);
    if (res.ok) {
      const data = await res.json();
      setUploadedUrl(data.url);
      (e.currentTarget as HTMLFormElement).reset();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(`Upload failed: ${data.error || "Unknown error"}`);
    }
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const saveBtnLabel = (state: SaveState) =>
    state === "saving" ? "Saving…" : state === "saved" ? "Saved!" : state === "error" ? "Error!" : "Save Changes";

  const saveBtnCls = (state: SaveState) =>
    state === "saved" ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : state === "error" ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-slate-900 hover:bg-slate-800 text-white";

  const tabCls = (t: typeof activeTab) =>
    `px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
      activeTab === t
        ? "border-slate-900 text-slate-900 bg-white"
        : "border-transparent text-slate-500 hover:text-slate-700"
    }`;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-0 text-slate-900">

      {/* ── Tab navigation ── */}
      <div className="flex border-b border-slate-200 bg-slate-50/50 -mx-6 -mt-6 px-6 pt-2 rounded-t-xl">
        <button className={tabCls("details")} onClick={() => setActiveTab("details")}>
           <Settings className="w-4 h-4"/> Course Details
        </button>
        <button className={tabCls("form")} onClick={() => setActiveTab("form")}>
          <PenLine className="w-4 h-4"/> Form Builder
          <Badge className="ml-1 bg-slate-200 text-slate-700 hover:bg-slate-300 border-none text-xs px-1.5">{fields.length}</Badge>
        </button>
        <button className={tabCls("pdf")} onClick={() => setActiveTab("pdf")}>
          <FileText className="w-4 h-4"/> PDF Template {uploadedUrl && <span className="ml-1 text-emerald-500 text-xs">●</span>}
        </button>
      </div>

      {/* ════════════════════════════════════════════
          TAB: Course Details
      ════════════════════════════════════════════ */}
      {activeTab === "details" && (
        <div className="pt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label>Course / Program Title <span className="text-red-500">*</span></Label>
              <Input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="text-base font-medium h-12" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Description</Label>
              <textarea
                value={courseDesc}
                onChange={e => setCourseDesc(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:border-transparent resize-none"
                placeholder="Brief description shown to students on the landing page…"
              />
            </div>
            <div className="space-y-2">
              {/* <Label>Application Fee (0 = Free)</Label> */}
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" min="0" step="0.01" value={courseFee} onChange={e => setCourseFee(e.target.value)} className="pl-7 h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Enrollment Status</Label>
              <Select value={currentStatus} onValueChange={(val: any) => handleStatusChange(val)}>
                <SelectTrigger className="bg-white h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft (not visible)</SelectItem>
                  <SelectItem value="OPEN">Open — Accepting Applications</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveDetails} disabled={detailsSaveState === "saving"} className={`${saveBtnCls(detailsSaveState)} h-11 px-8`}>
              {saveBtnLabel(detailsSaveState)}
            </Button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB: Form Builder (Drag & Drop)
      ════════════════════════════════════════════ */}
      {activeTab === "form" && (
        <div className="pt-8 space-y-6 max-w-3xl mx-auto">

          {/* Form header card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-2 bg-slate-900" />
            <div className="p-6 md:p-8">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Application Form Preview</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{courseTitle || "Untitled Course"}</p>
              {courseDesc && <p className="text-slate-500 text-sm mt-3 leading-relaxed">{courseDesc}</p>}
            </div>
          </div>

          {/* DND Field List */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f: typeof fields[0]) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {fields.map((field: typeof fields[0], index: number) => (
                  <SortableFieldCard
                    key={field.id}
                    field={field}
                    index={index}
                    totalFields={fields.length}
                    isActive={activeFieldId === field.id}
                    onActivate={setActiveFieldId}
                    onUpdateField={updateField}
                    onRemoveField={removeField}
                    onDuplicateField={duplicateField}
                    onUpdateOption={updateOption}
                    onAddOption={addOption}
                    onRemoveOption={removeOption}
                    onToggleFileType={toggleFileType}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* ── Add question panel ── */}
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm p-5 md:p-6 text-center">
             <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-semibold mb-4 uppercase tracking-wider">
               <PlusCircle className="w-4 h-4" /> Add Next Question
             </div>
             <div className="flex flex-wrap justify-center gap-2">
              {FIELD_TYPES.map(t => {
                const TIcon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => addField(t.value)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-600 font-medium text-sm transition-all shadow-sm active:scale-95"
                  >
                    <TIcon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
             </div>
          </div>

          {/* ── Save button ── */}
          <div className="flex justify-end pt-4 pb-10">
            <Button onClick={handleSaveSchema} disabled={saveState === "saving"} className={`${saveBtnCls(saveState)} px-10 h-12 text-base font-semibold rounded-xl shadow-md`}>
              {saveBtnLabel(saveState)}
            </Button>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB: PDF Template
      ════════════════════════════════════════════ */}
      {activeTab === "pdf" && (
        <div className="pt-8 space-y-6 max-w-2xl">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
            <p className="font-semibold text-slate-900 flex items-center gap-2 mb-2"><FileText className="w-4 h-4" /> Auto-fill Mapping</p>
            <p>Upload a PDF with AcroForm fields (fillable boxes). The system will securely inject the applicant&apos;s answers into any PDF field whose name perfectly matches the <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs text-slate-800">Internal Key</span> from your Form Builder.</p>
          </div>

          {uploadedUrl ? (
            <div className="p-5 bg-white border border-emerald-200 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                   <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">PDF Template Attached</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 max-w-[200px] truncate">{uploadedUrl}</p>
                </div>
              </div>
              <a href={uploadedUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">Preview PDF</a>
            </div>
          ) : (
            <div className="p-10 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No template attached</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">A clean, system-generated fallback PDF will be provided to approved students.</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
             <form onSubmit={handlePdfUpload} className="space-y-4 max-w-sm">
               <input type="hidden" name="courseId" value={courseId} />
               <div className="space-y-2">
                 <Label className="text-slate-700">Upload new Fillable PDF</Label>
                 <Input
                   id="pdf" name="pdf" type="file" required accept="application/pdf"
                   className="cursor-pointer bg-white file:text-slate-700 file:bg-slate-100 file:border-0 file:rounded file:px-3 file:py-1 file:mr-4 file:font-semibold hover:file:bg-slate-200 h-11 py-2"
                 />
                 <p className="text-xs text-slate-400">PDFs only. Max 10MB.</p>
               </div>
               <Button type="submit" disabled={isUploading} className="bg-slate-900 hover:bg-slate-800 text-white w-full h-11">
                 {isUploading ? "Uploading…" : (uploadedUrl ? "Replace Template" : "Upload Template")}
               </Button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
