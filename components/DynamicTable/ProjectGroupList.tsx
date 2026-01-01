"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Plus, Folder, ArrowRight, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ProjectGroupListProps {
  projectId: string;
}

export default function ProjectGroupList({ projectId }: ProjectGroupListProps) {
  const [project, setProject] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Group Creation State
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

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
    if (!newGroupName) return;
    try {
      const res = await apiClient.post(`/projects/${projectId}/groups`, {
        name: newGroupName,
      });
      setGroups([...groups, res.data]);
      setIsGroupOpen(false);
      setNewGroupName("");
    } catch (e) {
      console.error("Failed to create group", e);
    }
  };

  const handleDeleteProject = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This cannot be undone."
      )
    )
      return;
    try {
      await apiClient.delete(`/projects/${projectId}`);
      router.push("/dashboard");
    } catch (e) {
      console.error("Failed to delete project", e);
      alert("Failed to delete project");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="flex flex-col h-full bg-background/50 p-8 space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            Select a group to manage tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-red-500/50 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-500"
            onClick={handleDeleteProject}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Project
          </Button>
          <Button onClick={() => setIsGroupOpen(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" /> New Group
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {groups.map((group) => (
          <Card
            key={group._id}
            className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
            onClick={() =>
              router.push(
                `/dashboard/projects/${projectId}/groups/${group._id}`
              )
            }
          >
            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 text-primary rounded-md group-hover:scale-110 transition-transform">
                  <Folder className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>Open to view tasks</CardDescription>
            </CardHeader>
          </Card>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-lg text-muted-foreground">
            <p>No groups yet.</p>
            <Button variant="link" onClick={() => setIsGroupOpen(true)}>
              Create the first group
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isGroupOpen} onOpenChange={setIsGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task Group</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Group Name</Label>
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Week 1"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateGroup}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
