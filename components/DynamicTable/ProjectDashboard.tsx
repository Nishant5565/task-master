"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { generateId } from "@/lib/schema";
import { Plus, LayoutGrid, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import BulkImportDialog from "./BulkImportDialog";

interface ProjectDashboardProps {
  projectId: string;
  onOpenGroup: (groupId: string) => void;
}

export default function ProjectDashboard({
  projectId,
  onOpenGroup,
}: ProjectDashboardProps) {
  const [project, setProject] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/board`);
      setProject(res.data.project);
      setGroups(res.data.groups);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const handleCreateGroup = async () => {
    const groupName = prompt("Enter group name:");
    if (!groupName) return;

    // Default fields for new groups (matching index.tsx pattern)
    const defaultFields = [
      {
        id: generateId(),
        key: "sno",
        label: "S No.",
        type: "id",
        width: 100,
      },
      {
        id: generateId(),
        key: "title",
        label: "Title",
        type: "text",
        width: 300,
      },
    ];

    try {
      const res = await apiClient.post(`/projects/${projectId}/groups`, {
        name: groupName,
        fields: defaultFields,
      });
      setGroups([...groups, res.data]);
      // Navigate to the new group
      onOpenGroup(res.data._id);
    } catch (e) {
      console.error("Failed to create group", e);
      alert("Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      !confirm(
        "Are you sure you want to delete this group? All tasks within it will be lost."
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch (error) {
      console.error("Failed to delete group", error);
      alert("Failed to delete group");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500">
              Manage your task groups and projects.
            </p>
          </div>
          <div className="flex gap-2">
            <BulkImportDialog projectId={projectId} onSuccess={fetchData} />
            <button
              onClick={handleCreateGroup}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} />
              Create Group
            </button>
          </div>
        </header>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
              onClick={() => onOpenGroup(group._id)}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <LayoutGrid size={20} />
                  </div>
                  <button
                    onClick={(e) => handleDeleteGroup(group._id, e)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {group.description || "No description provided."}
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-xl">
                <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full">
                  {group.taskCount || 0} tasks
                </span>
                <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {groups.length === 0 && (
            <div
              onClick={handleCreateGroup}
              className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Plus size={24} />
              </div>
              <h3 className="font-medium">Create your first Group</h3>
              <p className="text-sm text-gray-400 mt-1">
                Start organizing your tasks
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
