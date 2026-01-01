"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings2,
  X,
  Plus,
  GripVertical,
  Trash2,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { SelectOption, COLOR_PALETTE, generateId } from "@/lib/schema";
import apiClient from "@/lib/axios";

interface Group {
  _id: string;
  fields: any[];
}

interface FieldManagerProps {
  group: Group;
  onUpdate: (updatedGroup: Group) => void;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "description", label: "Description" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "status", label: "Status" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
  { value: "id", label: "ID" },
  { value: "url", label: "URL" },
];

export default function FieldManager({ group, onUpdate }: FieldManagerProps) {
  const [open, setOpen] = useState(false);
  const [localFields, setLocalFields] = useState<any[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null
  );

  // Sync local fields when modal opens
  useEffect(() => {
    if (open) {
      setLocalFields(group.fields || []);
    }
  }, [open, group.fields]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Optimistic update
      onUpdate({ ...group, fields: localFields });

      await apiClient.put(`/groups/${group._id}`, {
        fields: localFields,
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to save fields", error);
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (!newFieldName.trim()) return;

    // Determine default width based on type
    let defaultWidth = 150;
    if (newFieldType === "id") defaultWidth = 100;
    else if (newFieldType === "description") defaultWidth = 300;
    else if (newFieldType === "url") defaultWidth = 200;

    const key =
      newFieldName.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();

    const newField: any = {
      id: generateId(),
      key,
      label: newFieldName,
      type: newFieldType,
      width: defaultWidth,
    };

    // Initialize options for select/status types
    if (newFieldType === "select" || newFieldType === "status") {
      newField.options = [
        {
          id: generateId(),
          label: "Option 1",
          color: "bg-gray-100 text-gray-700",
        },
        {
          id: generateId(),
          label: "Option 2",
          color: "bg-blue-100 text-blue-700",
        },
      ];
    }

    setLocalFields([...localFields, newField]);
    setNewFieldName("");
    setNewFieldType("text");
  };

  const removeField = (index: number) => {
    const newFields = [...localFields];
    newFields.splice(index, 1);
    setLocalFields(newFields);
  };

  const updateField = (index: number, updates: any) => {
    const newFields = [...localFields];
    const updated = { ...newFields[index], ...updates };

    // Initialize options if switching to select/status
    if (
      (updated.type === "select" || updated.type === "status") &&
      (!updated.options || updated.options.length === 0)
    ) {
      updated.options = [
        {
          id: generateId(),
          label: "New Option",
          color: "bg-gray-100 text-gray-700",
        },
      ];
    }

    newFields[index] = updated;
    setLocalFields(newFields);
  };

  // --- Options Management ---

  const addOption = (fieldIndex: number) => {
    const newFields = [...localFields];
    const field = newFields[fieldIndex];
    const newOpt: SelectOption = {
      id: generateId(),
      label: "New Option",
      color: "bg-gray-100 text-gray-700",
    };
    field.options = [...(field.options || []), newOpt];
    setLocalFields(newFields);
  };

  const updateOption = (
    fieldIndex: number,
    optionId: string,
    updates: Partial<SelectOption>
  ) => {
    const newFields = [...localFields];
    const field = newFields[fieldIndex];
    field.options = field.options?.map((o: SelectOption) =>
      o.id === optionId ? { ...o, ...updates } : o
    );
    setLocalFields(newFields);
  };

  const removeOption = (fieldIndex: number, optionId: string) => {
    const newFields = [...localFields];
    const field = newFields[fieldIndex];
    field.options = field.options?.filter(
      (o: SelectOption) => o.id !== optionId
    );
    setLocalFields(newFields);
  };

  const cycleColor = (
    fieldIndex: number,
    optionId: string,
    currentColor: string
  ) => {
    const currentBg = currentColor.split(" ")[0];
    const idx = COLOR_PALETTE.findIndex((c) => c.bg === currentBg);
    const nextIndex = idx === -1 ? 0 : (idx + 1) % COLOR_PALETTE.length;
    const next = COLOR_PALETTE[nextIndex];
    updateOption(fieldIndex, optionId, { color: `${next.bg} ${next.text}` });
  };

  // --- Drag and Drop ---

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDragEnter = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      const newFields = [...localFields];
      const item = newFields[draggedIndex];
      newFields.splice(draggedIndex, 1);
      newFields.splice(index, 0, item);
      setLocalFields(newFields);
      setDraggedIndex(index);
    }
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  // --- Options Editor Sub-View ---
  if (editingFieldIndex !== null) {
    const field = localFields[editingFieldIndex];
    if (!field) {
      setEditingFieldIndex(null);
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[80vh] flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <button
              onClick={() => setEditingFieldIndex(null)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Options:{" "}
              <span className="text-indigo-600">{field.label}</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-3">
              {field.options?.map((opt: SelectOption) => (
                <div key={opt.id} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full cursor-pointer border border-black/5 shadow-sm ${
                      opt.color.split(" ")[0]
                    }`}
                    onClick={() =>
                      cycleColor(editingFieldIndex, opt.id, opt.color)
                    }
                    title="Click to change color"
                  ></div>
                  <input
                    type="text"
                    className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={opt.label}
                    onChange={(e) =>
                      updateOption(editingFieldIndex, opt.id, {
                        label: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={() => removeOption(editingFieldIndex, opt.id)}
                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded"
                    disabled={(field.options?.length || 0) <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addOption(editingFieldIndex)}
              className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50"
            >
              <Plus size={16} />
              Add Option
            </button>
          </div>

          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setEditingFieldIndex(null)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Field Manager View ---
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          <Settings2 size={14} />
          Customize Fields
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0 bg-white rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Customize Fields
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Add New Field Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
              Add New Field
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Field Name"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addField()}
              />
              <Select value={newFieldType} onValueChange={setNewFieldType}>
                <SelectTrigger className="w-[140px] h-[42px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={addField}
                disabled={!newFieldName}
                className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Existing Fields List */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
              Existing Fields
            </h3>
            <div className="space-y-2">
              {localFields.map((field, idx) => (
                <div
                  key={field.key || idx}
                  draggable
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={onDragOver}
                  onDragEnter={() => onDragEnter(idx)}
                  onDragEnd={onDragEnd}
                  className={`flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm transition-all ${
                    draggedIndex === idx
                      ? "opacity-50 border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100 scale-[0.98]"
                      : "hover:border-gray-300"
                  }`}
                >
                  <div className="text-gray-400 cursor-move px-1 active:cursor-grabbing hover:text-gray-600">
                    <GripVertical size={16} />
                  </div>

                  <input
                    type="text"
                    className="flex-1 min-w-[120px] font-medium text-gray-700 text-sm border border-transparent hover:border-gray-200 focus:border-indigo-300 rounded px-2 py-1 outline-none transition-colors"
                    value={field.label}
                    onChange={(e) =>
                      updateField(idx, { label: e.target.value })
                    }
                  />

                  <Select
                    value={field.type}
                    onValueChange={(value) => updateField(idx, { type: value })}
                  >
                    <SelectTrigger className="w-[120px] h-[32px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(field.type === "select" || field.type === "status") && (
                    <button
                      onClick={() => setEditingFieldIndex(idx)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit Options"
                    >
                      <Settings size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => removeField(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {localFields.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                  No fields yet. Add one above.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
