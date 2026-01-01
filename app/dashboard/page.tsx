"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Folder,
  Loader2,
  ArrowRight,
  LayoutGrid,
  List,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

interface Project {
  _id: string;
  name: string;
  description?: string;
  updatedAt: string;
  _count?: { tasks: number }; // Future optimization
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get("/projects");
      setProjects(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      const res = await apiClient.post("/projects", { name: newProjectName });
      setProjects([res.data, ...projects]);
      setIsCreateOpen(false);
      setNewProjectName("");
      // Optional: Redirect immediately
      // router.push(`/dashboard/projects/${res.data._id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-background/50 backdrop-blur-sm">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex items-end justify-between border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Workspaces
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your projects and tasks in one place.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Add a new workspace for your tasks.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Project Name</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Marketing Q1"
                className="mt-2"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project._id}
            className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => router.push(`/dashboard/projects/${project._id}`)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="space-y-0 pb-2 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:scale-105 transition-transform">
                  <Folder className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        !confirm(
                          "Are you sure you want to delete this project? This cannot be undone."
                        )
                      )
                        return;
                      apiClient
                        .delete(`/projects/${project._id}`)
                        .then(() => {
                          setProjects(
                            projects.filter((p) => p._id !== project._id)
                          );
                        })
                        .catch((err) => {
                          console.error("Failed to delete project", err);
                          alert("Failed to delete project");
                        });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
              <CardTitle className="text-lg font-semibold truncate pr-4">
                {project.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                {project.description || "No description provided."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-4 border-t bg-muted/20 text-xs text-muted-foreground justify-between relative z-10">
              <span>
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Active
              </span>
            </CardFooter>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-24 border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center gap-4 bg-muted/5 animate-in fade-in-50">
            <div className="bg-muted p-4 rounded-full shadow-inner ring-1 ring-border">
              <LayoutGrid className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg text-foreground">
                No projects yet
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Create your first workspace to start organizing your tasks and
                collaborating with your team.
              </p>
            </div>
            <Button
              className="mt-4 shadow-md"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Create First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
