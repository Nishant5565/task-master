"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { TaskItem, generateShortId } from "@/lib/schema";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import CellRenderer from "./CellRenderer";
import FieldManager from "./FieldManager";

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

  const fetchData = async () => {
    try {
      const res = await apiClient.get(`/groups/${groupId}`);
      setGroup(res.data.group);
      setTasks(res.data.tasks);
      setProject(res.data.project);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchData();
  }, [groupId]);

  // --- Task Operations ---

  const handleAddTask = async () => {
    const newTask: any = {
      groupId,
      projectId, // Required by Task model
    };

    // Auto-generate ID fields
    group.fields?.forEach((f: any) => {
      if (f.type === "id") {
        newTask[f.key] = generateShortId();
      }
    });

    try {
      const res = await apiClient.post(`/tasks`, newTask);
      setTasks([...tasks, res.data]);
    } catch (e) {
      console.error("Failed to create task", e);
      alert("Failed to create task. Check console for details.");
    }
  };

  const handleUpdateTask = async (taskId: string, key: string, value: any) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, [key]: value } : t))
    );
    try {
      await apiClient.put(`/tasks/${taskId}`, { [key]: value });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (e) {
      console.error(e);
    }
  };

  // --- Field Operations ---

  const handleUpdateFields = async (newFields: any[]) => {
    // Backfill ID fields for existing tasks
    const existingIds = new Set(group.fields?.map((f: any) => f.key) || []);
    const newIdFields = newFields.filter(
      (f) => f.type === "id" && !existingIds.has(f.key)
    );

    let updatedTasks = [...tasks];
    if (newIdFields.length > 0) {
      updatedTasks = await Promise.all(
        updatedTasks.map(async (t) => {
          const updates: any = {};
          newIdFields.forEach((f) => {
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
    }

    setGroup({ ...group, fields: newFields });
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
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

      {/* Main Table */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-w-fit">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="w-10 sticky left-0 bg-white z-10 border-b border-gray-200"></th>
                  {group.fields &&
                    group.fields.map((field: any) => (
                      <th
                        key={field.key}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-r-0 relative group/th"
                        style={{
                          width: field.width || 150,
                          minWidth: field.width || 150,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {getFieldIcon(field.type)}
                          {field.label}
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-1 hover:bg-indigo-300 cursor-col-resize"></div>
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
                    <td className="sticky left-0 bg-white group-hover/row:bg-gray-50 text-center border-r border-gray-100 z-10">
                      <div className="flex justify-center items-center h-full text-gray-300 cursor-grab active:cursor-grabbing">
                        <GripVertical size={12} />
                      </div>
                    </td>
                    {group.fields &&
                      group.fields.map((field: any) => (
                        <td
                          key={field.key}
                          className="h-10 border-r border-gray-100 last:border-r-0 p-0 relative"
                        >
                          <CellRenderer
                            field={field}
                            value={task[field.key]}
                            onChange={(val) =>
                              handleUpdateTask(task._id!, field.key, val)
                            }
                          />
                        </td>
                      ))}
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
