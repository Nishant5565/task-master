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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Project {
  _id: string;
  name: string;
  description?: string;
  updatedAt: string;
  _count?: { tasks: number }; // Future optimization
  ownerId?: { _id: string; name: string; image: string };
  members?: {
    userId: { _id: string; name: string; image: string };
    role: string;
  }[];
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Alert State
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });

  useEffect(() => {
    fetchProjects();
  }, []);

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await apiClient.delete(`/projects/${projectToDelete}`);
      setProjects(projects.filter((p) => p._id !== projectToDelete));
    } catch (err) {
      console.error("Failed to delete project", err);
      setAlertInfo({
        open: true,
        title: "Error",
        message: "Failed to delete project. Please try again.",
      });
    } finally {
      setProjectToDelete(null);
    }
  };

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
      const res = await apiClient.post("/projects", {
        name: newProjectName,
        description: newProjectDescription,
      });
      setProjects([res.data, ...projects]);
      setIsCreateOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
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
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Marketing Q1"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Briefly describe the goals of this project..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
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
              {/* Card Content */}
              <div className="flex items-center justify-between mb-2">
                {/* Member Stack */}
                <div className="flex -space-x-2 overflow-hidden pl-1 py-1">
                  {/* Render Owner first */}
                  {(project.ownerId as any) && (
                    <Avatar className="h-8 w-8 rounded-full ring-2 ring-background z-10">
                      <AvatarImage
                        src={(project.ownerId as any).image}
                        alt={(project.ownerId as any).name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {(project.ownerId as any).name
                          ?.substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {/* Render other members */}
                  {project.members &&
                    project.members
                      .filter(
                        (m: any) =>
                          (m.userId as any)?._id !==
                          (project.ownerId as any)?._id
                      )
                      .slice(0, 3)
                      .map((m: any, i) => (
                        <Avatar
                          key={i}
                          className="h-8 w-8 rounded-full ring-2 ring-background"
                        >
                          <AvatarImage
                            src={(m.userId as any)?.image}
                            alt={(m.userId as any)?.name}
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                            {(m.userId as any)?.name
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                  {project.members && project.members.length > 4 && (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-background bg-muted text-xs font-medium text-muted-foreground">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project._id);
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generic Alert Dialog */}
      <AlertDialog
        open={alertInfo.open}
        onOpenChange={(open) => setAlertInfo((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertInfo.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertInfo.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
