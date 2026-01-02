"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { generateId } from "@/lib/schema";
import {
  Plus,
  LayoutGrid,
  Trash2,
  ArrowRight,
  MoreHorizontal,
  Settings,
  CheckSquare,
  List,
  Kanban,
  Flag,
  Calendar,
  Clock,
  Target,
  Zap,
  Award,
  Briefcase,
  Folder,
  FileText,
  Users,
  Star,
  Heart,
  Smile,
  AlertCircle,
  Info,
  Rocket,
  Gavel,
  Forum,
  PostAdd,
  Architecture,
  PublishedWithChanges,
} from "lucide-react";
import { useRouter } from "next/navigation";
import BulkImportDialog from "./BulkImportDialog";
import InviteMemberDialog from "@/components/InviteMemberDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IconPicker from "@/components/IconPicker";
import ColorPicker, { COLORS } from "@/components/ColorPicker";
import * as LucideIcons from "lucide-react";

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
  const [members, setMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Edit Dialog State
  const [editGroup, setEditGroup] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState("");
  const [updating, setUpdating] = useState(false);

  const router = useRouter();

  const fetchData = async () => {
    try {
      const [boardRes, membersRes] = await Promise.all([
        apiClient.get(`/projects/${projectId}/board`),
        apiClient.get(`/projects/${projectId}/members`),
      ]);
      setProject(boardRes.data.project);
      setGroups(boardRes.data.groups);
      setTasks(boardRes.data.tasks);
      setMembers(membersRes.data);
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
      { id: generateId(), key: "sno", label: "S No.", type: "id", width: 100 },
      {
        id: generateId(),
        key: "title",
        label: "Title",
        type: "text",
        width: 300,
      },
      {
        id: generateId(),
        key: "status",
        label: "Status",
        type: "status",
        width: 150,
        options: [
          { id: "todo", label: "To Do", color: "bg-slate-500" },
          { id: "in-progress", label: "In Progress", color: "bg-blue-500" },
          { id: "done", label: "Done", color: "bg-green-500" },
        ],
      },
    ];

    try {
      const res = await apiClient.post(`/projects/${projectId}/groups`, {
        name: groupName,
        fields: defaultFields,
      });
      setGroups([...groups, res.data]);
      // Navigate to the new group
      // onOpenGroup(res.data._id); // Don't auto open, let user configure
    } catch (e) {
      console.error("Failed to create group", e);
      alert("Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this group? all tasks will be lost."
      )
    )
      return;
    try {
      await apiClient.delete(`/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch (error) {
      console.error("Failed to delete group", error);
      alert("Failed to delete group");
    }
  };

  const openEditDialog = (group: any) => {
    setEditGroup(group);
    setEditName(group.name);
    setEditIcon(group.icon || "LayoutGrid");
    setEditColor(group.color || "indigo");
    setIsEditDialogOpen(true);
  };

  const handleUpdateGroup = async () => {
    if (!editGroup) return;
    try {
      setUpdating(true);
      const res = await apiClient.put(`/groups/${editGroup._id}`, {
        name: editName,
        icon: editIcon,
        color: editColor,
      });

      setGroups((prev) =>
        prev.map((g) => (g._id === editGroup._id ? { ...g, ...res.data } : g))
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed update", error);
      alert("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // Helper for initials
  const getInitials = (name?: string, email?: string) => {
    const src = name || email || "?";
    return src.substring(0, 2).toUpperCase();
  };

  // Helper to get stats
  const getGroupStats = (groupId: string) => {
    const groupTasks = tasks.filter((t) => t.groupId === groupId);
    const total = groupTasks.length;
    // Assuming 'status' field with value 'done' or 'completed' (case insensitive)
    const completed = groupTasks.filter((t) => {
      const status = t.data?.status; // Assuming data structure
      if (typeof status === "string")
        return ["done", "completed"].includes(status.toLowerCase());
      if (typeof status === "object" && status?.label)
        return ["done", "completed"].includes(status.label.toLowerCase());
      return false;
    }).length;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
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
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-500">
                Workspace
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-sm font-medium text-indigo-600">
                {project.name}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Task Groups
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Manage your project phases, track progress, and organize team
              resources effectively.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Member Stack */}
            <div className="flex -space-x-2 mr-4 overflow-hidden">
              {members.slice(0, 5).map((m: any) => (
                <Avatar
                  key={m.userId}
                  className="inline-block h-8 w-8 ring-2 ring-white cursor-pointer"
                >
                  <AvatarImage />
                  <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                    {getInitials(m.name, m.email)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {members.length > 5 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-xs font-medium text-gray-500">
                  +{members.length - 5}
                </div>
              )}
            </div>

            <InviteMemberDialog projectId={projectId} />

            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />

            <BulkImportDialog projectId={projectId} onSuccess={fetchData} />
            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-md shadow-indigo-200 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-600 transition-all"
            >
              <Plus size={20} className="mr-2" />
              Create Group
            </button>
          </div>
        </header>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groups.map((group) => {
            const stats = getGroupStats(group._id);
            const colorDef =
              COLORS.find((c) => c.name === group.color) || COLORS[1]; // default indigo
            const Icon =
              (LucideIcons as any)[group.icon] || LucideIcons.LayoutGrid;

            return (
              <div
                key={group._id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                onClick={() => onOpenGroup(group._id)}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorDef.value.replace(
                    "bg-",
                    "from-"
                  )} to-white opacity-0 group-hover:opacity-100 transition-opacity`}
                ></div>
                <div className="p-6 flex-1 cursor-pointer">
                  <div className="flex justify-between items-start mb-5">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ring-1 ${colorDef.bgLight} ${colorDef.text} ${colorDef.ring}`}
                    >
                      <Icon size={24} />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={20} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(group);
                          }}
                        >
                          <Settings className="mr-2 h-4 w-4" /> Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group._id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {group.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">
                    {group.description || "Manage tasks and track progress."}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                    <div
                      className={`${colorDef.value} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${stats.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${colorDef.text}`}>
                      {stats.percentage === 100
                        ? "Completed"
                        : stats.percentage > 0
                        ? "In Progress"
                        : "Not Started"}
                    </span>
                    <span className="text-slate-400">
                      {stats.completed}/{stats.total} tasks
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* Show first few members avatars (optional, using project members for now as placeholder or per-group if implemented) */}
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                      ?
                    </div>
                  </div>
                  <button
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center group/link transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenGroup(group._id);
                    }}
                  >
                    View Details
                    <ArrowRight
                      size={16}
                      className="ml-1 transform group-hover/link:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            );
          })}

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

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Icon</Label>
              <IconPicker value={editIcon} onChange={setEditIcon} />
            </div>
            <div className="grid gap-2">
              <Label>Color Theme</Label>
              <ColorPicker value={editColor} onChange={setEditColor} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateGroup} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
