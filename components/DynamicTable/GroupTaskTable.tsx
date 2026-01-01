"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { generateShortId } from "@/lib/schema";
import {
  Plus,
  ArrowLeft,
  GripVertical,
  Type,
  Hash,
  List,
  CheckSquare,
  Calendar,
  Fingerprint,
  Link as LinkIcon,
  FileText,
  X,
  Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COLOR_PALETTE, TaskItem, CellStyle } from "@/lib/schema";
import CellRenderer from "./CellRenderer";
import FieldManager from "./FieldManager";
import FormattingToolbar from "./FormattingToolbar";

interface GroupTaskTableProps {
  projectId: string;
  groupId: string;
  onBack?: () => void;
}

const getFieldIcon = (type: string) => {
  switch (type) {
    case "text":
      return <Type size={14} />;
    case "number":
      return <Hash size={14} />;
    case "select":
      return <List size={14} />;
    case "status":
      return <CheckSquare size={14} />;
    case "date":
      return <Calendar size={14} />;
    case "checkbox":
      return <CheckSquare size={14} />;
    case "id":
      return <Fingerprint size={14} />;
    case "url":
      return <LinkIcon size={14} />;
    case "description":
      return <FileText size={14} />;
    default:
      return <Type size={14} />;
  }
};

export default function GroupTaskTable({
  projectId,
  groupId,
  onBack,
}: GroupTaskTableProps) {
  const [project, setProject] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- Column Resizing ---
  const [resizing, setResizing] = useState<{
    key: string;
    startWidth: number;
    startX: number;
  } | null>(null);

  // --- Excel-like Selection ---
  const [selection, setSelection] = useState<{
    type: "cell" | "row" | "col" | "mixed";
    items: Set<string>; // Set of IDs (cell: "taskId:fieldKey", row: "taskId", col: "fieldKey")
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/groups/${groupId}`);
        const { group, tasks, project } = res.data;

        setGroup(group);
        setProject(project);

        // Ensure tasks have all fields from schema (backfill)
        const newFields = group.fields || [];
        const fetchedTasks = tasks;

        const updatedTasks = await Promise.all(
          fetchedTasks.map(async (t: any) => {
            const newIdFields = newFields.filter(
              (f: any) => (f.type === "id" || f.type === "user") && !t[f.key]
            );

            const updates: any = {};
            newIdFields.forEach((f: any) => {
              if (!t[f.key]) updates[f.key] = generateShortId();
            });

            if (Object.keys(updates).length > 0) {
              try {
                await apiClient.put(`/tasks/${t._id}`, updates);
                return { ...t, ...updates };
              } catch (e) {
                console.error("Failed to backfill ID", e);
                return t;
              }
            }
            return t;
          })
        );
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchData();
  }, [groupId]);

  // --- Task Operations ---

  const handleAddTask = async () => {
    const newTask = {
      groupId,
      projectId,
      // Initialize fields if needed
    };
    try {
      const res = await apiClient.post("/tasks", newTask);
      setTasks([...tasks, res.data]);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleUpdateTask = async (
    taskId: string,
    fieldKey: string,
    value: any
  ) => {
    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, [fieldKey]: value } : t
    );
    setTasks(updatedTasks);

    try {
      await apiClient.put(`/tasks/${taskId}`, { [fieldKey]: value });
    } catch (error) {
      console.error("Failed to update task", error);
      // Revert on failure (could refetch)
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(tasks.filter((t) => t._id !== taskId));
    try {
      await apiClient.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  // --- Field Operations ---

  const handleAddField = async (field: any) => {
    const newFields = [...(group.fields || []), field];
    setGroup({ ...group, fields: newFields });

    // Persist
    try {
      await apiClient.put(`/groups/${groupId}`, { fields: newFields });
    } catch (e) {
      console.error("Failed to add field", e);
    }
  };

  const handleUpdateFields = (updatedFields: any[]) => {
    setGroup({ ...group, fields: updatedFields });
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    key: string,
    currentWidth: number
  ) => {
    e.preventDefault();
    setResizing({ key, startWidth: currentWidth, startX: e.clientX });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(50, resizing.startWidth + diff); // Min width 50

      const updatedFields = group.fields.map((f: any) =>
        f.key === resizing.key ? { ...f, width: newWidth } : f
      );
      setGroup({ ...group, fields: updatedFields });
    };

    const handleMouseUp = async () => {
      if (resizing) {
        // Persist the new width
        handleUpdateFields(group.fields);
        try {
          await apiClient.put(`/groups/${groupId}`, { fields: group.fields });
        } catch (e) {
          console.error("Failed to save column width", e);
        }
        setResizing(null);
      }
    };

    if (resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, group, groupId]); // Added deps

  // Helper to check if a cell is selected
  const isCellSelected = (taskId: string, fieldKey: string) => {
    if (!selection) return false;
    if (selection.type === "cell" || selection.type === "mixed") {
      return selection.items.has(`${taskId}:${fieldKey}`);
    }
    if (selection.type === "row") {
      return selection.items.has(taskId);
    }
    if (selection.type === "col") {
      return selection.items.has(fieldKey);
    }
    return false;
  };

  const handleCellClick = (
    e: React.MouseEvent,
    taskId: string,
    fieldKey: string
  ) => {
    e.stopPropagation(); // Prevent row click if any
    const id = `${taskId}:${fieldKey}`;

    // Simple single selection for now, or toggle with Ctrl
    if (e.ctrlKey || e.metaKey) {
      setSelection((prev) => {
        const newItems = new Set(prev?.items);
        if (newItems.has(id)) newItems.delete(id);
        else newItems.add(id);
        return { type: "cell", items: newItems };
      });
    } else {
      setSelection({ type: "cell", items: new Set([id]) });
    }
  };

  const handleRowHeaderClick = (taskId: string) => {
    setSelection({ type: "row", items: new Set([taskId]) });
  };

  const handleColHeaderClick = (fieldKey: string) => {
    setSelection({ type: "col", items: new Set([fieldKey]) });
  };

  const updateSelectionStyle = async (newStyle: Partial<CellStyle>) => {
    if (!selection) return;

    const updatedTasks = [...tasks];
    const updatesToSave: any[] = [];

    // Helper to merge style into task
    const mergeTaskStyle = (
      task: TaskItem,
      fieldKey: string,
      style: Partial<CellStyle>
    ) => {
      const currentStyles = task.styles || {};
      const fieldStyle = currentStyles[fieldKey] || {};
      const mergedStyle = { ...fieldStyle, ...style };

      // Clean up undefined values
      Object.keys(mergedStyle).forEach((key) => {
        if (mergedStyle[key as keyof CellStyle] === undefined) {
          delete mergedStyle[key as keyof CellStyle];
        }
      });

      // Update task
      task.styles = { ...currentStyles, [fieldKey]: mergedStyle };
    };

    if (selection.type === "cell" || selection.type === "mixed") {
      selection.items.forEach((id) => {
        const [taskId, fieldKey] = id.split(":");
        const task = updatedTasks.find((t) => t._id === taskId);
        if (task) {
          mergeTaskStyle(task, fieldKey, newStyle);
          updatesToSave.push(task);
        }
      });
    } else if (selection.type === "row") {
      selection.items.forEach((taskId) => {
        const task = updatedTasks.find((t) => t._id === taskId);
        if (task) {
          // Apply to ALL fields in this row
          group.fields.forEach((f: any) => {
            mergeTaskStyle(task, f.key, newStyle);
          });
          updatesToSave.push(task);
        }
      });
    } else if (selection.type === "col") {
      selection.items.forEach((fieldKey) => {
        updatedTasks.forEach((task) => {
          mergeTaskStyle(task, fieldKey, newStyle);
          updatesToSave.push(task);
        });
      });
    }

    setTasks(updatedTasks);

    // Batch save (naive implementation, sending many requests - should improve for prod)
    // For 'col' selection this is heavy. Better to check if we can save column default styles instead?
    // User asked for "Excel like", implying cell specific overrides.
    // Optimizing: only send unique tasks that changed.
    const uniqueTasks = Array.from(new Set(updatesToSave));
    try {
      await Promise.all(
        uniqueTasks.map((t) =>
          apiClient.put(`/tasks/${t._id}`, { styles: t.styles })
        )
      );
    } catch (e) {
      console.error("Failed to save styles", e);
    }
  };

  // Compute current styles for toolbar (based on first selected item)
  const getCurrentSelectionStyles = (): CellStyle => {
    if (!selection || selection.items.size === 0) return {};

    // Get first item
    const firstId = Array.from(selection.items)[0];
    let task: TaskItem | undefined;
    let fieldKey = "";

    if (selection.type === "cell" || selection.type === "mixed") {
      const parts = firstId.split(":");
      task = tasks.find((t) => t._id === parts[0]);
      fieldKey = parts[1];
    } else if (selection.type === "row") {
      task = tasks.find((t) => t._id === firstId);
      fieldKey = group.fields[0]?.key; // Just grab first field
    } else if (selection.type === "col") {
      fieldKey = firstId;
      task = tasks[0];
    }

    if (task && fieldKey && task.styles) {
      return task.styles[fieldKey] || {};
    }
    return {};
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (!project || !group) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Group not found</div>
      </div>
    );
  }

  // --- Render ---

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack || (() => router.back())}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="text-xs text-gray-500 font-medium">
              Workspace / {group.name}
            </div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              {group.name}
            </h1>
          </div>
        </div>

        <FieldManager
          group={group}
          onUpdate={(updatedGroup) => {
            handleUpdateFields(updatedGroup.fields);
          }}
        />
      </header>

      {/* Formatting Toolbar */}
      <FormattingToolbar
        selection={
          selection
            ? { type: selection.type, count: selection.items.size }
            : null
        }
        currentStyles={getCurrentSelectionStyles()}
        onUpdateStyle={updateSelectionStyle}
      />

      {/* Main Table */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-w-fit">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-white">
                <tr>
                  <th className="w-10 sticky left-0 bg-white z-10 border-b border-gray-200"></th>
                  {group.fields &&
                    group.fields.map((field: any) => (
                      <th
                        key={field.key}
                        className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-r-0 relative group/th select-none ${
                          selection?.type === "col" &&
                          selection.items.has(field.key)
                            ? "bg-indigo-50 text-indigo-700"
                            : ""
                        }`}
                        style={{
                          width: field.width || 150,
                          minWidth: field.width || 150,
                        }}
                        onClick={() => handleColHeaderClick(field.key)}
                      >
                        <div className="flex items-center gap-2 truncate flex-1">
                          {getFieldIcon(field.type)}
                          {field.label}
                        </div>

                        {/* Column Settings Trigger */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="opacity-0 group-hover/th:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Settings2 size={12} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-64 p-4 bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                            align="start"
                          >
                            <div className="space-y-4">
                              <h4 className="font-semibold text-xs text-gray-900 pb-2 border-b border-gray-100">
                                Column Appearance
                              </h4>

                              {/* Background Color */}
                              <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                  Background
                                </label>
                                <div className="grid grid-cols-7 gap-1">
                                  {/* Reset/Default */}
                                  <button
                                    className={`w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 ${
                                      !field.bgColor
                                        ? "ring-2 ring-indigo-500 ring-offset-1"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      const updatedFields = group.fields.map(
                                        (f: any) =>
                                          f.key === field.key
                                            ? { ...f, bgColor: undefined }
                                            : f
                                      );
                                      handleUpdateFields(updatedFields);
                                      apiClient.put(`/groups/${groupId}`, {
                                        fields: updatedFields,
                                      });
                                    }}
                                    title="Default"
                                  >
                                    <X size={12} className="text-gray-400" />
                                  </button>
                                  {COLOR_PALETTE.map((color) => (
                                    <button
                                      key={color.bg}
                                      className={`w-6 h-6 rounded-md border border-black/5 ${
                                        color.bg
                                      } ${
                                        field.bgColor === color.bg
                                          ? "ring-2 ring-indigo-500 ring-offset-1"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        const updatedFields = group.fields.map(
                                          (f: any) =>
                                            f.key === field.key
                                              ? { ...f, bgColor: color.bg }
                                              : f
                                        );
                                        handleUpdateFields(updatedFields);
                                        apiClient.put(`/groups/${groupId}`, {
                                          fields: updatedFields,
                                        });
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Text Color */}
                              <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                  Text Color
                                </label>
                                <div className="grid grid-cols-7 gap-1">
                                  {/* Reset/Default */}
                                  <button
                                    className={`w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 ${
                                      !field.textColor
                                        ? "ring-2 ring-indigo-500 ring-offset-1"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      const updatedFields = group.fields.map(
                                        (f: any) =>
                                          f.key === field.key
                                            ? { ...f, textColor: undefined }
                                            : f
                                      );
                                      handleUpdateFields(updatedFields);
                                      apiClient.put(`/groups/${groupId}`, {
                                        fields: updatedFields,
                                      });
                                    }}
                                    title="Default"
                                  >
                                    <X size={12} className="text-gray-400" />
                                  </button>
                                  {COLOR_PALETTE.map((color) => (
                                    <button
                                      key={color.text}
                                      className={`w-6 h-6 rounded-md border border-black/5 ${
                                        color.bg
                                      } flex items-center justify-center ${
                                        field.textColor === color.text
                                          ? "ring-2 ring-indigo-500 ring-offset-1"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        const updatedFields = group.fields.map(
                                          (f: any) =>
                                            f.key === field.key
                                              ? { ...f, textColor: color.text }
                                              : f
                                        );
                                        handleUpdateFields(updatedFields);
                                        apiClient.put(`/groups/${groupId}`, {
                                          fields: updatedFields,
                                        });
                                      }}
                                    >
                                      <span
                                        className={`text-[10px] font-bold ${color.text}`}
                                      >
                                        A
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <div
                          className="absolute right-0 top-0 bottom-0 w-1 hover:bg-indigo-300 cursor-col-resize z-20"
                          onMouseDown={(e) =>
                            handleMouseDown(e, field.key, field.width || 150)
                          }
                          onClick={(e) => e.stopPropagation()} // Prevent select on resize click
                        ></div>
                      </th>
                    ))}
                  {(!group.fields || group.fields.length === 0) && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Task Name
                    </th>
                  )}
                  <th className="w-10 border-b border-gray-200"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50 group/row">
                    <td
                      className={`sticky left-0 bg-white group-hover/row:bg-gray-50 text-center border-r border-gray-100 z-10 cursor-pointer ${
                        selection?.type === "row" &&
                        selection.items.has(task._id!)
                          ? "bg-indigo-100"
                          : ""
                      }`}
                      onClick={() => handleRowHeaderClick(task._id!)}
                    >
                      <div className="flex justify-center items-center h-full text-gray-300">
                        {selection?.type === "row" &&
                        selection.items.has(task._id!) ? (
                          <CheckSquare size={12} className="text-indigo-600" />
                        ) : (
                          <GripVertical size={12} />
                        )}
                      </div>
                    </td>
                    {group.fields &&
                      group.fields.map((field: any) => {
                        const isSelected = isCellSelected(task._id!, field.key);
                        const cellStyle = task.styles?.[field.key];

                        return (
                          <td
                            key={field.key}
                            className={`min-h-10 border-r border-gray-100 last:border-r-0 p-0 relative align-top transition-colors 
                                ${field.bgColor || ""} ${field.textColor || ""}
                                ${
                                  isSelected
                                    ? "ring-2 ring-indigo-500 z-10"
                                    : ""
                                }
                              `}
                            onClick={(e) =>
                              handleCellClick(e, task._id!, field.key)
                            }
                          >
                            <CellRenderer
                              field={field}
                              value={task[field.key]}
                              onChange={(val) =>
                                handleUpdateTask(task._id!, field.key, val)
                              }
                              style={cellStyle} // Pass the style
                            />
                          </td>
                        );
                      })}
                    {(!group.fields || group.fields.length === 0) && (
                      <td className="h-10 border-r border-gray-100 p-3 text-sm text-gray-400">
                        Configure fields...
                      </td>
                    )}
                    <td className="text-center px-2">
                      <button
                        onClick={() => handleDeleteTask(task._id!)}
                        className="opacity-0 group-hover/row:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Add Task Row */}
                <tr>
                  <td className="sticky left-0 bg-white border-r border-gray-100"></td>
                  <td
                    colSpan={group.fields?.length || 1}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={handleAddTask}
                  >
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
    </div>
  );
}
