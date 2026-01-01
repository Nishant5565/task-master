import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { 
  Plus, 
  Settings, 
  Calendar, 
  CheckSquare, 
  Type, 
  Hash, 
  List, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal,
  GripVertical,
  X,
  ArrowLeft,
  Fingerprint,
  Link as LinkIcon,
  AlertCircle,
  Layout,
  LayoutGrid,
  ArrowRight,
  FileText
} from "lucide-react";

// --- Types ---

type FieldType = "text" | "number" | "select" | "status" | "date" | "checkbox" | "id" | "url" | "description";

interface SelectOption {
  id: string;
  label: string;
  color: string;
}

interface Field {
  id: string;
  name: string;
  type: FieldType;
  options?: SelectOption[]; // For select and status types
  width?: number;
}

interface Task {
  id: string;
  [key: string]: any; // Keyed by field.id
}

interface Group {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  tasks: Task[];
}

// --- Initial Data ---

const DEFAULT_FIELDS: Field[] = [
  { id: "f0", name: "ID", type: "id", width: 80 },
  { id: "f1", name: "Task Name", type: "text", width: 300 },
  { 
    id: "f2", 
    name: "Status", 
    type: "status", 
    width: 150,
    options: [
      { id: "opt1", label: "To Do", color: "bg-gray-100 text-gray-700" },
      { id: "opt2", label: "In Progress", color: "bg-blue-100 text-blue-700" },
      { id: "opt3", label: "Done", color: "bg-green-100 text-green-700" },
    ]
  },
  { id: "f3", name: "Due Date", type: "date", width: 140 },
];

const INITIAL_GROUPS: Group[] = [
  {
    id: "g1",
    title: "Week 1: Planning",
    description: "Initial requirements gathering and project setup.",
    fields: [...DEFAULT_FIELDS],
    tasks: [
      { id: "t1", f0: "TASK-1024", f1: "Define Requirements", f2: "opt3", f3: "2023-10-01" },
      { id: "t2", f0: "TASK-1025", f1: "Competitor Analysis", f2: "opt2", f3: "2023-10-02" },
    ],
  },
  {
    id: "g2",
    title: "Week 2: Design",
    description: "UI/UX design phase and prototyping.",
    fields: [
        { id: "f0", name: "ID", type: "id", width: 80 },
        { id: "f1", name: "Screen Name", type: "text", width: 250 },
        { id: "f7", name: "Description", type: "description", width: 350 },
        { id: "f5", name: "Approved", type: "checkbox", width: 100 },
        { id: "f6", name: "Figma Link", type: "url", width: 300 },
    ],
    tasks: [
      { id: "t3", f0: "TASK-1026", f1: "Dashboard Home", f7: "Main landing page for user analytics", f5: true, f6: "https://figma.com/file/123" },
      { id: "t4", f0: "TASK-1027", f1: "Settings Page", f7: "User profile and preferences management", f5: false, f6: "" },
    ],
  },
];

// --- Utilities ---

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateShortId = () => `TASK-${Math.floor(1000 + Math.random() * 9000)}`;

const getFieldIcon = (type: FieldType) => {
  switch (type) {
    case "text": return <Type size={14} />;
    case "number": return <Hash size={14} />;
    case "select": return <List size={14} />;
    case "status": return <CheckSquare size={14} />;
    case "date": return <Calendar size={14} />;
    case "checkbox": return <CheckSquare size={14} />;
    case "id": return <Fingerprint size={14} />;
    case "url": return <LinkIcon size={14} />;
    case "description": return <FileText size={14} />;
    default: return <Type size={14} />;
  }
};

const COLOR_PALETTE = [
  { bg: "bg-gray-100", text: "text-gray-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-yellow-100", text: "text-yellow-700" },
  { bg: "bg-red-100", text: "text-red-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
];

// --- Components ---

const CellText = ({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void, autoFocus?: boolean }) => {
  return (
    <input
      type="text"
      className="w-full h-full px-3 bg-transparent outline-none border-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-sm text-gray-700"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
    />
  );
};

const CellNumber = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  return (
    <input
      type="number"
      className="w-full h-full px-3 bg-transparent outline-none border-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-sm text-gray-700"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const CellDate = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  return (
    <input
      type="date"
      className="w-full h-full px-3 bg-transparent outline-none border-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-sm text-gray-700 font-mono"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const CellCheckbox = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <input
        type="checkbox"
        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
};

const CellUrl = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const isValidUrl = (string: string) => {
    if (!string) return true;
    try {
      let urlToCheck = string;
      if (!/^https?:\/\//i.test(string)) {
        urlToCheck = 'https://' + string;
      }
      const url = new URL(urlToCheck);
      return url.hostname.includes('.') || url.hostname === 'localhost';
    } catch (_) {
      return false;
    }
  };

  const isValid = isValidUrl(value);

  return (
    <div className="relative w-full h-full group/cell">
      <input
        type="text"
        className={`w-full h-full px-3 bg-transparent outline-none border-none focus:ring-2 focus:ring-inset text-sm transition-colors
          ${!isValid && value ? 'focus:ring-red-500 bg-red-50 text-red-600' : 'focus:ring-indigo-500'} 
          ${isValid && value ? 'text-blue-600 underline decoration-blue-200' : 'text-gray-700'}
        `}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com"
      />
      
      {!isValid && value && (
         <>
           <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
             <AlertCircle size={14} />
           </div>
           <div className="absolute top-full left-0 mt-1 z-50 pointer-events-none">
             <div className="bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center gap-1.5 whitespace-nowrap relative">
                <div className="absolute -top-1 left-3 w-2 h-2 bg-red-600 rotate-45"></div>
                Invalid URL
             </div>
           </div>
         </>
      )}

      {isValid && value && (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white shadow-sm border border-gray-200 rounded-md text-gray-400 hover:text-indigo-600 opacity-0 group-hover/cell:opacity-100 transition-opacity z-10"
          title="Open Link"
          onMouseDown={(e) => e.preventDefault()} 
        >
          <LinkIcon size={12} />
        </a>
      )}
    </div>
  );
};

const CellSelect = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options?: SelectOption[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options?.find((o) => o.id === value);

  return (
    <div className="relative w-full h-full">
      <div
        className="w-full h-full px-3 flex items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedOption.color}`}>
            {selectedOption.label}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Select...</span>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {options?.map((opt) => (
              <div
                key={opt.id}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
              >
                <div className={`w-3 h-3 rounded-full ${opt.color.split(" ")[0].replace("bg-", "bg-opacity-50 bg-")}`} />
                {opt.label}
              </div>
            ))}
            {(!options || options.length === 0) && (
              <div className="px-3 py-2 text-gray-400 text-xs">No options defined</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const FieldManager = ({ 
  fields, 
  onUpdateFields, 
  onClose 
}: { 
  fields: Field[]; 
  onUpdateFields: (fields: Field[]) => void; 
  onClose: () => void; 
}) => {
  const [localFields, setLocalFields] = useState<Field[]>(fields);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addField = () => {
    if (!newFieldName.trim()) return;
    
    // Determine default width based on type
    let defaultWidth = 150;
    if (newFieldType === 'id') defaultWidth = 100;
    else if (newFieldType === 'description') defaultWidth = 300;
    else if (newFieldType === 'url') defaultWidth = 200;

    const newField: Field = {
      id: generateId(),
      name: newFieldName,
      type: newFieldType,
      width: defaultWidth,
      options: (newFieldType === 'select' || newFieldType === 'status') ? [
        { id: generateId(), label: "Option 1", color: "bg-gray-100 text-gray-700" },
        { id: generateId(), label: "Option 2", color: "bg-blue-100 text-blue-700" }
      ] : undefined
    };
    setLocalFields([...localFields, newField]);
    setNewFieldName("");
  };

  const removeField = (id: string) => {
    setLocalFields(localFields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setLocalFields(prev => prev.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, ...updates };
      // Initialize options if switching to select/status
      if ((updated.type === 'select' || updated.type === 'status') && (!updated.options || updated.options.length === 0)) {
        updated.options = [
          { id: generateId(), label: "New Option", color: "bg-gray-100 text-gray-700" }
        ];
      }
      return updated;
    }));
  };

  // Option Helpers
  const getEditingField = () => localFields.find(f => f.id === editingFieldId);

  const addOption = (fieldId: string) => {
    setLocalFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      const newOpt: SelectOption = {
        id: generateId(),
        label: "New Option",
        color: "bg-gray-100 text-gray-700"
      };
      return { ...f, options: [...(f.options || []), newOpt] };
    }));
  };

  const updateOption = (fieldId: string, optionId: string, updates: Partial<SelectOption>) => {
    setLocalFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      return {
        ...f,
        options: f.options?.map(o => o.id === optionId ? { ...o, ...updates } : o)
      };
    }));
  };

  const removeOption = (fieldId: string, optionId: string) => {
    setLocalFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      return { ...f, options: f.options?.filter(o => o.id !== optionId) };
    }));
  };

  const cycleColor = (fieldId: string, optionId: string, currentColor: string) => {
    const currentBg = currentColor.split(" ")[0];
    const idx = COLOR_PALETTE.findIndex(c => c.bg === currentBg);
    const nextIndex = idx === -1 ? 0 : (idx + 1) % COLOR_PALETTE.length;
    const next = COLOR_PALETTE[nextIndex];
    updateOption(fieldId, optionId, { color: `${next.bg} ${next.text}` });
  };

  const save = () => {
    onUpdateFields(localFields);
    onClose();
  };

  // --- Sub-View: Options Editor ---
  if (editingFieldId) {
    const field = getEditingField();
    if (!field) {
      setEditingFieldId(null);
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[80vh] flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
             <button onClick={() => setEditingFieldId(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
               <ArrowLeft size={20} />
             </button>
             <h2 className="text-xl font-semibold text-gray-900">
               Edit Options: <span className="text-indigo-600">{field.name}</span>
             </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
             <div className="space-y-3">
               {field.options?.map((opt) => (
                 <div key={opt.id} className="flex items-center gap-3">
                    <div 
                      className={`w-6 h-6 rounded-full cursor-pointer border border-black/5 shadow-sm ${opt.color.split(' ')[0]}`}
                      onClick={() => cycleColor(field.id, opt.id, opt.color)}
                      title="Click to change color"
                    ></div>
                    <input 
                      type="text"
                      className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={opt.label}
                      onChange={(e) => updateOption(field.id, opt.id, { label: e.target.value })}
                    />
                    <button 
                      onClick={() => removeOption(field.id, opt.id)}
                      className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded"
                      disabled={(field.options?.length || 0) <= 1} 
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
             </div>
             
             <button 
               onClick={() => addOption(field.id)}
               className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50"
             >
               <Plus size={16} />
               Add Option
             </button>
          </div>

          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button onClick={() => setEditingFieldId(null)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Done</button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main View: Field List ---
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Customize Fields</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Add New Field</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Field Name"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
              />
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as FieldType)}
              >
                <option value="text">Text</option>
                <option value="description">Description</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="status">Status</option>
                <option value="date">Date</option>
                <option value="checkbox">Checkbox</option>
                <option value="id">ID</option>
                <option value="url">URL</option>
              </select>
              <button 
                onClick={addField}
                disabled={!newFieldName}
                className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
             <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Existing Fields</h3>
             {localFields.map((field, idx) => (
               <div 
                  key={field.id} 
                  draggable
                  onDragStart={(e) => {
                    setDraggedIndex(idx);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => {
                    if (draggedIndex !== null && draggedIndex !== idx) {
                        const newFields = [...localFields];
                        const item = newFields[draggedIndex];
                        newFields.splice(draggedIndex, 1);
                        newFields.splice(idx, 0, item);
                        setLocalFields(newFields);
                        setDraggedIndex(idx);
                    }
                  }}
                  onDragEnd={() => setDraggedIndex(null)}
                  className={`flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm transition-all ${
                    draggedIndex === idx 
                      ? 'opacity-50 border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100 scale-[0.98]' 
                      : 'hover:border-gray-300'
                  }`}
               >
                 <div className="text-gray-400 cursor-move px-1 active:cursor-grabbing hover:text-gray-600">
                   <GripVertical size={16} />
                 </div>
                 
                 <input 
                   type="text"
                   className="flex-1 min-w-[120px] font-medium text-gray-700 text-sm border border-transparent hover:border-gray-200 focus:border-indigo-300 rounded px-2 py-1 outline-none transition-colors"
                   value={field.name}
                   onChange={(e) => updateField(field.id, { name: e.target.value })}
                 />

                 <div className="relative">
                   <select 
                     className="appearance-none bg-gray-50 text-xs text-gray-600 border border-gray-200 rounded px-2 py-1.5 pr-6 outline-none focus:border-indigo-300 cursor-pointer"
                     value={field.type}
                     onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                   >
                    <option value="text">Text</option>
                    <option value="description">Description</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="status">Status</option>
                    <option value="date">Date</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="id">ID</option>
                    <option value="url">URL</option>
                   </select>
                   <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                     <ChevronDown size={12} />
                   </div>
                 </div>

                 {(field.type === 'select' || field.type === 'status') && (
                    <button 
                      onClick={() => setEditingFieldId(field.id)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit Options"
                    >
                      <Settings size={16} />
                    </button>
                 )}

                 <button onClick={() => removeField(field.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                   <Trash2 size={16} />
                 </button>
               </div>
             ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// --- View Components ---

const GroupView = ({ 
  group, 
  onUpdateGroup,
  onBack 
}: { 
  group: Group; 
  onUpdateGroup: (updated: Group) => void;
  onBack: () => void;
}) => {
  const [isFieldManagerOpen, setIsFieldManagerOpen] = useState(false);

  // Task Operations
  const addTask = () => {
    const newTask: Task = { id: generateId() };
    group.fields.forEach(f => {
      if (f.type === 'id') newTask[f.id] = generateShortId();
    });
    onUpdateGroup({ ...group, tasks: [...group.tasks, newTask] });
  };

  const updateTask = (taskId: string, fieldId: string, value: any) => {
    const updatedTasks = group.tasks.map(t => t.id === taskId ? { ...t, [fieldId]: value } : t);
    onUpdateGroup({ ...group, tasks: updatedTasks });
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = group.tasks.filter(t => t.id !== taskId);
    onUpdateGroup({ ...group, tasks: updatedTasks });
  };

  // Field Operations
  const handleUpdateFields = (newFields: Field[]) => {
    // Backfill ID fields
    const existingIds = new Set(group.fields.map(f => f.id));
    const newIdFields = newFields.filter(f => f.type === 'id' && !existingIds.has(f.id));
    
    let updatedTasks = [...group.tasks];
    if (newIdFields.length > 0) {
       updatedTasks = updatedTasks.map(t => {
         const updates: any = {};
         newIdFields.forEach(f => {
           if (!t[f.id]) updates[f.id] = generateShortId();
         });
         return { ...t, ...updates };
       });
    }
    
    onUpdateGroup({ ...group, fields: newFields, tasks: updatedTasks });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="text-xs text-gray-500 font-medium">Workspace / {group.title}</div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              {group.title}
            </h1>
          </div>
        </div>
        <button 
          onClick={() => setIsFieldManagerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Settings size={14} />
          Customize Fields
        </button>
      </header>

      {/* Main Table */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-w-fit">
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-white">
                 <tr>
                   <th className="w-10 sticky left-0 bg-white z-10 border-b border-gray-200"></th>
                   {group.fields.map((field) => (
                     <th
                       key={field.id}
                       className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-r-0 relative group/th"
                       style={{ width: field.width, minWidth: field.width }}
                     >
                       <div className="flex items-center gap-2">
                         {getFieldIcon(field.type)}
                         {field.name}
                       </div>
                       <div className="absolute right-0 top-0 bottom-0 w-1 hover:bg-indigo-300 cursor-col-resize"></div>
                     </th>
                   ))}
                   <th className="w-10 border-b border-gray-200"></th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-100">
                 {group.tasks.map((task) => (
                   <tr key={task.id} className="hover:bg-gray-50 group/row">
                     <td className="sticky left-0 bg-white group-hover/row:bg-gray-50 text-center border-r border-gray-100 z-10">
                        <div className="flex justify-center items-center h-full text-gray-300 cursor-grab active:cursor-grabbing">
                           <GripVertical size={12} />
                        </div>
                     </td>
                     {group.fields.map((field) => (
                       <td key={field.id} className="h-10 border-r border-gray-100 last:border-r-0 p-0 relative">
                         {(() => {
                            switch (field.type) {
                              case "text": return <CellText value={task[field.id]} onChange={(v) => updateTask(task.id, field.id, v)} />;
                              case "description": return <CellText value={task[field.id]} onChange={(v) => updateTask(task.id, field.id, v)} />;
                              case "number": return <CellNumber value={task[field.id]} onChange={(v) => updateTask(task.id, field.id, v)} />;
                              case "date": return <CellDate value={task[field.id]} onChange={(v) => updateTask(task.id, field.id, v)} />;
                              case "checkbox": return <CellCheckbox value={task[field.id]} onChange={(v) => updateTask(task.id, field.id, v)} />;
                              case "select":
                              case "status": return <CellSelect value={task[field.id]} options={field.options} onChange={(v) => updateTask(task.id, field.id, v)} />;
                              case "id": return <div className="w-full h-full px-3 flex items-center text-xs text-gray-500 font-mono select-none bg-gray-50/50">{task[field.id] || "---"}</div>;
                              case "url": return <CellUrl value={task[field.id]} onChange={(v) => updateTask(task.id, field.id, v)} />;
                              default: return null;
                            }
                         })()}
                       </td>
                     ))}
                     <td className="text-center px-2">
                       <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover/row:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                         <X size={14} />
                       </button>
                     </td>
                   </tr>
                 ))}
                 <tr>
                    <td className="sticky left-0 bg-white border-r border-gray-100"></td>
                    <td colSpan={group.fields.length} className="px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors" onClick={addTask}>
                      <div className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 text-sm">
                        <Plus size={16} />
                        Add New Task
                      </div>
                    </td>
                    <td></td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {isFieldManagerOpen && (
        <FieldManager 
          fields={group.fields} 
          onUpdateFields={handleUpdateFields} 
          onClose={() => setIsFieldManagerOpen(false)} 
        />
      )}
    </div>
  );
};

const Dashboard = ({ 
  groups, 
  onOpenGroup, 
  onCreateGroup, 
  onDeleteGroup 
}: { 
  groups: Group[]; 
  onOpenGroup: (id: string) => void;
  onCreateGroup: () => void;
  onDeleteGroup: (id: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
            <p className="text-gray-500">Manage your task groups and projects.</p>
          </div>
          <button 
            onClick={onCreateGroup}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Create Group
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div 
              key={group.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
              onClick={() => onOpenGroup(group.id)}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <LayoutGrid size={20} />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id); }}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {group.description || "No description provided."}
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-xl">
                 <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full">
                   {group.tasks.length} tasks
                 </span>
                 <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                   Open <ArrowRight size={14} />
                 </span>
              </div>
            </div>
          ))}
          
          {/* Empty State / Create Place holder */}
          {groups.length === 0 && (
             <div 
               onClick={onCreateGroup}
               className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
             >
               <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                 <Plus size={24} />
               </div>
               <h3 className="font-medium">Create your first Group</h3>
               <p className="text-sm text-gray-400 mt-1">Start organizing your tasks</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- App Orchestrator ---

const App = () => {
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Router sync
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // remove #
      if (hash.startsWith("group/")) {
        const id = hash.split("/")[1];
        if (groups.find(g => g.id === id)) {
          setActiveGroupId(id);
        } else {
          window.location.hash = "";
          setActiveGroupId(null);
        }
      } else {
        setActiveGroupId(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Init
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [groups]);

  const handleNavigate = (id: string | null) => {
    if (id) {
      window.location.hash = `group/${id}`;
    } else {
      window.location.hash = "";
    }
  };

  const createGroup = () => {
    const newGroup: Group = {
      id: generateId(),
      title: "Untitled Group",
      description: "New task collection",
      fields: [...DEFAULT_FIELDS],
      tasks: [],
    };
    setGroups(prev => [...prev, newGroup]);
    handleNavigate(newGroup.id);
  };

  const updateGroup = (updated: Group) => {
    setGroups(prev => prev.map(g => g.id === updated.id ? updated : g));
  };

  const deleteGroup = (id: string) => {
    if (confirm("Are you sure you want to delete this group? All tasks within it will be lost.")) {
      setGroups(prev => prev.filter(g => g.id !== id));
      if (activeGroupId === id) handleNavigate(null);
    }
  };

  const activeGroup = groups.find(g => g.id === activeGroupId);

  if (activeGroupId && activeGroup) {
    return (
      <GroupView 
        group={activeGroup} 
        onUpdateGroup={updateGroup} 
        onBack={() => handleNavigate(null)} 
      />
    );
  }

  return (
    <Dashboard 
      groups={groups} 
      onOpenGroup={(id) => handleNavigate(id)} 
      onCreateGroup={createGroup}
      onDeleteGroup={deleteGroup}
    />
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
