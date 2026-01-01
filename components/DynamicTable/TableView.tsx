"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { TaskItem, FieldDefinition } from "@/lib/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, LogOut, UserPlus, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CellRenderer from "./CellRenderer";
import { signOut } from "next-auth/react";
import FieldManager from "./FieldManager";
import Link from "next/link";
interface DynamicTableProps {
  projectId: string;
}

export default function DynamicTable({ projectId }: DynamicTableProps) {
  // Schema is now part of the Project object
  const [project, setProject] = useState<any>(null); // "any" for now to avoid extensive type refactor of Project vs Schema
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Fetch Logic
  useEffect(() => {
    async function init() {
      console.log("Initializing Project View with ID:", projectId);
      try {
        // Parallel fetch: Project Details (Schema) + Tasks
        const [projRes, tasksRes] = await Promise.all([
          apiClient.get(`/projects/${projectId}`),
          apiClient.get(`/projects/${projectId}/tasks`),
        ]);

        console.log("Fetched Project:", projRes.data);
        setProject(projRes.data);
        setTasks(tasksRes.data);
      } catch (error: any) {
        console.error("Failed to load workspace data:", error);
        if (error.response?.status === 401) {
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      init();
    } else {
      console.warn("No Project ID provided to DynamicTable");
      setLoading(false);
    }
  }, [projectId]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleAddTask = async () => {
    if (!project) return;
    try {
      const emptyTask: any = {};
      project.fields.forEach(
        (f: any) => (emptyTask[f.key] = f.type === "checkbox" ? false : "")
      );

      // Post to specific project task route
      const res = await apiClient.post(
        `/projects/${projectId}/tasks`,
        emptyTask
      );
      setTasks([res.data, ...tasks]);
    } catch (e) {
      console.error("Failed to add task", e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await apiClient.delete(`/tasks/${id}`);
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleUpdateTask = async (taskId: string, key: string, value: any) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, [key]: value } : t))
    );
    try {
      await apiClient.put(`/tasks/${taskId}`, { [key]: value });
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  const handleInvite = async () => {
    try {
      await apiClient.post(`/projects/${projectId}/invite`, {
        email: inviteEmail,
      });
      alert("User added successfully!"); // Simple alert for MVP
      setIsInviteOpen(false);
      setInviteEmail("");
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to invite");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-muted-foreground text-sm">
        Loading project...
      </div>
    );

  if (!project)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          This project may have been deleted, or you do not have permission to
          view it.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-background/50">
      <div className="flex items-center justify-between px-8 py-6 border-b bg-background">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {project.name}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
              {project.description || "Manage your tasks and fields."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex h-9"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to Project</DialogTitle>
                <DialogDescription>
                  Enter the email address of the user you want to invite. They
                  must have an account.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label>Email Address</Label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleInvite}>Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <FieldManager project={project} onUpdate={setProject} />

          <div className="h-6 w-px bg-border mx-2" />

          <Button
            onClick={handleAddTask}
            size="sm"
            className="gap-2 h-9 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sign Out"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                {project.fields.map((field: any) => (
                  <TableHead
                    key={field.key}
                    style={{ width: field.width || 150 }}
                    className="h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
                  >
                    <div className="flex items-center gap-2">{field.label}</div>
                  </TableHead>
                ))}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task._id}
                  className="group hover:bg-muted/30 transition-colors h-12"
                >
                  {project.fields.map((field: any) => (
                    <TableCell
                      key={field.key}
                      className="p-0 border-r last:border-r-0 border-transparent group-hover:border-border/50 relative px-1"
                    >
                      <CellRenderer
                        field={field}
                        value={task[field.key]}
                        onChange={(val: any) =>
                          handleUpdateTask(task._id!, field.key, val)
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell className="p-0 w-[50px] text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500"
                      onClick={() => handleDeleteTask(task._id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={project.fields.length + 1}
                    className="h-32 text-center text-muted-foreground border-none"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p>No tasks yet.</p>
                      <Button variant="link" onClick={handleAddTask}>
                        Create a task
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {/* Quick Add Row at bottom */}
              <TableRow className="hover:bg-transparent border-t border-dashed">
                <TableCell colSpan={project.fields.length + 1} className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-primary pl-2 h-9"
                    onClick={handleAddTask}
                  >
                    <Plus className="w-4 h-4 mr-2" /> New Task
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
