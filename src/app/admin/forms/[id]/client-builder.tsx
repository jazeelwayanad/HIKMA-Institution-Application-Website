"use client";

import { useState } from "react";
import { updateFormSchema, updateFormDetails } from "@/app/actions/adminForms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
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

export type FieldType = (typeof FIELD_TYPES)[number]["value"];

export type SchemaField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];            
  allowedFileTypes?: string[];   
  helperText?: string;
  isProtected?: boolean;         
};

type SaveState = "idle" | "saving" | "saved" | "error";

// ─── Sortable Item Component ───────────────────────────────────────────────

function SortableFieldCard({
  field, index, isActive, onActivate, onUpdateField, onRemoveField, onDuplicateField,
  onUpdateOption, onAddOption, onRemoveOption, onToggleFileType
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.8 : 1 };
  const fieldTypeMeta = FIELD_TYPES.find((t: (typeof FIELD_TYPES)[number]) => t.value === field.type);
  const IconComponent = fieldTypeMeta?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-2xl border shadow-sm flex flex-col transition-all overflow-hidden ${
        isActive ? "border-indigo-400 ring-2 ring-indigo-100 shadow-md" : "border-slate-200 hover:border-slate-300"
      }`}
      onClick={() => onActivate(field.id)}
    >
      {isActive && <div className="h-1 bg-indigo-500 w-full" />}
      <div className="flex">
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing hover:bg-slate-50 text-slate-300 hover:text-slate-500 transition-colors border-r border-transparent hover:border-slate-100"
        >
          <GripVertical className="w-5 h-5 focus:outline-none" />
        </div>
        <div className="flex-1 p-5 overflow-hidden">
          {isActive ? (
            <div className="space-y-5" onClick={e => e.stopPropagation()}>
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
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((t: (typeof FIELD_TYPES)[number]) => {
                          const TIcon = t.icon;
                          return (
                            <SelectItem key={t.value} value={t.value}>
                              <span className="flex items-center gap-2"><TIcon className="w-4 h-4 text-slate-500" />{t.label}</span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {field.isProtected && (
                  <div className="w-52 flex-shrink-0 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-500 cursor-not-allowed">
                     <IconComponent className="w-4 h-4" />{fieldTypeMeta?.label}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Internal Key <span className="text-slate-300">(matches PDF)</span></Label>
                  <Input value={field.name} disabled={field.isProtected} onChange={e => onUpdateField(field.id, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, "").replace(/\s+/g, "_") })} className={`font-mono text-xs h-8 ${field.isProtected ? "bg-slate-100 text-slate-500" : "text-indigo-600 bg-indigo-50 border-indigo-200"}`} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Helper Text <span className="text-slate-300">(optional)</span></Label>
                  <Input value={field.helperText ?? ""} onChange={e => onUpdateField(field.id, { helperText: e.target.value })} className="h-8 text-sm" />
                </div>
              </div>
              
              {/* Option Rendering logic etc */}
              {(field.type === "select" || field.type === "radio") && (
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Options</Label>
                  <div className="space-y-2">
                    {(field.options ?? []).map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-slate-300 text-sm w-5">{field.type === "radio" ? "○" : `${i + 1}.`}</span>
                        <input value={opt} onChange={e => onUpdateOption(field.id, i, e.target.value)} className="flex-1 text-sm border-0 border-b border-slate-200 focus:border-indigo-400 focus:outline-none pb-1 bg-transparent" />
                        {(field.options?.length ?? 0) > 1 && (
                          <button onClick={() => onRemoveOption(field.id, i)} className="text-slate-300 hover:text-red-400 text-lg leading-none">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => onAddOption(field.id)} className="text-sm text-indigo-500 hover:text-indigo-700 inline-flex items-center gap-1 mt-1 font-medium"><PlusCircle className="w-4 h-4" /> Add option</button>
                </div>
              )}

              {field.type === "file" && (
                <div className="space-y-3">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Allowed File Types</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FILE_TYPES.map((ft: (typeof FILE_TYPES)[number]) => {
                      const checked = (field.allowedFileTypes ?? []).includes(ft.accept);
                      const isAny = ft.accept === "*";
                      const hasAny = (field.allowedFileTypes ?? []).includes("*");
                      const FTIcon = ft.icon;
                      return (
                        <label key={ft.accept} className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${checked ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-200 bg-white text-slate-600"} ${!isAny && hasAny ? "opacity-40 pointer-events-none" : ""}`}>
                          <input type="checkbox" className="sr-only" checked={checked} onChange={() => { if (isAny) { onUpdateField(field.id, { allowedFileTypes: checked ? [".pdf"] : ["*"] }); } else { onToggleFileType(field.id, ft.accept); } }} />
                          <FTIcon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-xs font-semibold leading-tight">{ft.label}</span>
                          {checked && <CheckCircle className="ml-auto w-4 h-4 text-indigo-500 flex-shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-xs text-slate-400 font-monomr-2 pr-2 border-r border-slate-200">#{index + 1}</div>
                  {!field.isProtected && (
                    <>
                      <button onClick={() => onDuplicateField(field.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Duplicate"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => onRemoveField(field.id)} className="p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                  {field.isProtected && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Protected Core Field</span>}
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-slate-500 font-medium">Required</span>
                  <button role="switch" aria-checked={field.required} disabled={field.isProtected} onClick={() => { if(!field.isProtected) onUpdateField(field.id, { required: !field.required }); }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${field.required ? "bg-indigo-600" : "bg-slate-200"} ${field.isProtected ? "opacity-60 cursor-not-allowed" : ""}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${field.required ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </label>
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 text-slate-400"><IconComponent className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{field.label || <span className="text-slate-300 italic">Untitled question</span>}{field.required && <span className="text-red-500 ml-1">*</span>}</p>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{field.name}</span>
                  <span>·</span><span>{fieldTypeMeta?.label}</span>
                </div>
              </div>
              {field.isProtected && <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Main Component Wrapper ──────────────────────────────────────────────────

export function FormBuilderClient({
  formId, initialSchema, pdfTemplateUrl, name, description
}: {
  formId: string; initialSchema: SchemaField[]; pdfTemplateUrl: string | null; name: string; description?: string | null;
}) {
  const [fields, setFields] = useState<SchemaField[]>(initialSchema);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(pdfTemplateUrl);
  const [activeTab, setActiveTab] = useState<"details" | "form" | "pdf">("details");

  const [formName, setFormName] = useState(name);
  const [formDesc, setFormDesc] = useState(description ?? "");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // Handlers
  const addField = (type: FieldType = "text") => {
    const id = `f_${Date.now()}`;
    setFields(prev => [...prev, { id, name: id, label: "", type, required: false }]);
    setActiveFieldId(id);
  };

  const duplicateField = (id: string) => {
    const source = fields.find(f => f.id === id);
    if (!source) return;
    const newId = `f_${Date.now()}`;
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      const next = [...prev]; next.splice(idx + 1, 0, { ...source, id: newId, name: newId, isProtected: false });
      return next;
    });
    setActiveFieldId(newId);
  };

  const removeField = (id: string) => { setFields(prev => prev.filter((f: typeof fields[0]) => f.id !== id || f.isProtected)); setActiveFieldId(null); };
  const updateField = (id: string, updates: Partial<SchemaField>) => { setFields(prev => prev.map((f: typeof fields[0]) => f.id === id ? { ...f, ...updates } : f)); };

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

  const addOption = (id: string) => updateField(id, { options: [...(fields.find((f: typeof fields[0]) => f.id === id)?.options ?? []), `Option`] });
  const updateOption = (id: string, i: number, val: string) => { const o = [...(fields.find((f: typeof fields[0]) => f.id === id)?.options ?? [])]; o[i] = val; updateField(id, { options: o }); };
  const removeOption = (id: string, i: number) => updateField(id, { options: (fields.find((f: typeof fields[0]) => f.id === id)?.options ?? []).filter((_, idx: number) => idx !== i) });
  const toggleFileType = (id: string, accept: string) => {
    const c = fields.find((f: typeof fields[0]) => f.id === id)?.allowedFileTypes ?? [];
    const n = c.includes(accept) ? c.filter((a: string) => a !== accept) : [...c, accept];
    updateField(id, { allowedFileTypes: n.length ? n : [".pdf"] });
  };

  const handleSaveSchema = async (goNext: boolean = false) => {
    setSaveState("saving"); const res = await updateFormSchema(formId, fields);
    setSaveState(res.success ? "saved" : "error"); 
    setTimeout(() => setSaveState("idle"), 2500);
    if (res.success && goNext) setActiveTab("pdf");
  };
  const handleSaveDetails = async (goNext: boolean = false) => {
    setSaveState("saving"); const res = await updateFormDetails(formId, { name: formName, description: formDesc });
    setSaveState(res.success ? "saved" : "error"); 
    setTimeout(() => setSaveState("idle"), 2500);
    if (res.success && goNext) setActiveTab("form");
  };
  async function handlePdfUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // ← capture before any await
    setIsUploading(true);
    const formData = new FormData(form);
    formData.append("formId", formId);
    const res = await fetch("/api/admin/upload-form-template", { method: "POST", body: formData });
    setIsUploading(false);
    if (res.ok) {
      const data = await res.json();
      setUploadedUrl(data.url);
      form.reset(); // safe — uses the captured reference
    } else {
      const data = await res.json().catch(() => ({}));
      alert(`Upload failed: ${data.error || "Unknown error"}`);
    }
  }

  const saveBtnCls = saveState === "saved" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : saveState === "error" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white";

  return (
    <div className="space-y-0 text-slate-900 rounded-xl overflow-hidden">
      <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
        <button className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "details" ? "border-slate-900 text-slate-900 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"}`} onClick={() => setActiveTab("details")}><Settings className="w-4 h-4"/> Form Profile</button>
        <button className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "form" ? "border-slate-900 text-slate-900 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"}`} onClick={() => setActiveTab("form")}><PenLine className="w-4 h-4"/> Form Builder<Badge className="ml-1 bg-slate-200 text-slate-700 border-none text-xs">{fields.length}</Badge></button>
        <button className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "pdf" ? "border-slate-900 text-slate-900 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"}`} onClick={() => setActiveTab("pdf")}><FileText className="w-4 h-4"/> PDF Template {uploadedUrl && <span className="ml-1 text-emerald-500 text-xs">●</span>}</button>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "details" && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2"><Label>Form Reference Name</Label><Input value={formName} onChange={e => setFormName(e.target.value)} className="h-11" /></div>
            <div className="space-y-2"><Label>Description / Usage Guide</Label><textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400" /></div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => handleSaveDetails(false)} disabled={saveState === "saving"} className={`${saveBtnCls} h-11 px-8`}>{saveState === "saving" ? "Saving..." : saveState === "saved" ? "✓ Saved!" : "Save Details"}</Button>
              <Button onClick={() => handleSaveDetails(true)} disabled={saveState === "saving"} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8">Save & Next ➔</Button>
            </div>
          </div>
        )}

        {activeTab === "form" && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={fields.map((f: typeof fields[0]) => f.id)} strategy={verticalListSortingStrategy}><div className="space-y-3">{fields.map((field: typeof fields[0], index: number) => <SortableFieldCard key={field.id} field={field} index={index} isActive={activeFieldId === field.id} onActivate={setActiveFieldId} onUpdateField={updateField} onRemoveField={removeField} onDuplicateField={duplicateField} onUpdateOption={updateOption} onAddOption={addOption} onRemoveOption={removeOption} onToggleFileType={toggleFileType} />)}</div></SortableContext></DndContext>
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm p-5 md:p-6 text-center"><div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-semibold mb-4 uppercase tracking-wider"><PlusCircle className="w-4 h-4" /> Add Next Question</div><div className="flex flex-wrap justify-center gap-2">{FIELD_TYPES.map((t: (typeof FIELD_TYPES)[number]) => { const TIcon = t.icon; return (<button key={t.value} onClick={() => addField(t.value)} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-600 font-medium text-sm transition-all active:scale-95"><TIcon className="w-4 h-4" />{t.label}</button>); })}</div></div>
            <div className="flex justify-between pt-4 items-center">
              <Button onClick={() => setActiveTab("details")} variant="outline" className="h-12 px-6">Back</Button>
              <div className="flex gap-3">
                <Button onClick={() => handleSaveSchema(false)} disabled={saveState === "saving"} className={`${saveBtnCls} px-10 h-12 text-base font-semibold rounded-xl`}>{saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved!" : "Save Schema"}</Button>
                <Button onClick={() => handleSaveSchema(true)} disabled={saveState === "saving"} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-12 text-base font-semibold rounded-xl">Save & Next ➔</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pdf" && (
          <div className="space-y-6 max-w-2xl">
             <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600"><p className="font-semibold text-slate-900 mb-2">Auto-fill Mapping</p><p>Upload an AcroForm PDF. Answers map to matching <span className="font-mono bg-white border px-1">Internal Key</span>s.</p></div>
             {uploadedUrl ? <div className="p-5 bg-white border border-emerald-200 rounded-xl flex justify-between"><div className="flex items-center gap-4"><CheckCircle2 className="text-emerald-600"/><div><p className="font-semibold text-slate-900">PDF Attached</p><p className="text-xs text-slate-500 font-mono mt-0.5 max-w-[200px] truncate">{uploadedUrl}</p></div></div><a href={uploadedUrl} className="text-sm text-indigo-600 px-4 py-2 hover:bg-indigo-50 rounded-lg">Preview PDF</a></div> : <div className="p-10 text-center"><FileText className="w-8 h-8 mx-auto text-slate-400 mb-2"/><p className="text-slate-500">No template attached. Auto-generated PDF will be used.</p></div>}
             <form onSubmit={handlePdfUpload} className="space-y-4"><input type="hidden" name="formId" value={formId} /><Label>Upload New Template</Label><Input id="pdf" name="pdf" type="file" required accept="application/pdf" className="h-11 py-2" /><Button type="submit" disabled={isUploading} className="w-full h-11 bg-slate-900 text-white">{isUploading ? "Uploading..." : "Upload Template"}</Button></form>
          </div>
        )}
      </div>
    </div>
  );
}
