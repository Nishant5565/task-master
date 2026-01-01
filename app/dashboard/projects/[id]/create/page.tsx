"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CreateTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("groupId");

  const [project, setProject] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  useEffect(() => {
    async function init() {
      try {
        const res = await apiClient.get(`/projects/${projectId}/board`);
        setProject(res.data.project);
        setGroups(res.data.groups);

        // Initialize form data
        const initialData: any = {};
        res.data.project.fields.forEach((f: any) => {
          if (f.type === "checkbox") initialData[f.key] = false;
          else initialData[f.key] = "";
        });
        setFormData(initialData);

        // Auto-select group
        if (initialGroupId) {
          setSelectedGroupId(initialGroupId);
        } else if (res.data.groups.length > 0) {
          setSelectedGroupId(res.data.groups[0]._id);
        }
      } catch (e) {
        console.error("Failed to load project", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [projectId, initialGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId && groups.length > 0) {
      alert("Please select a group");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(`/projects/${projectId}/tasks`, {
        ...formData,
        groupId: selectedGroupId,
      });
      // Redirect back to the specific group page
      router.push(`/dashboard/projects/${projectId}/groups/${selectedGroupId}`);
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Group
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
          <CardDescription>Add a new task to {project.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input
                  autoFocus
                  placeholder="What needs to be done?"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  placeholder="Add details..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Group Selection */}
            {groups.length > 0 && (
              <div className="space-y-2">
                <Label>Group / Week</Label>
                <Select
                  value={selectedGroupId}
                  onValueChange={setSelectedGroupId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g._id} value={g._id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dynamic Fields */}
            <div className="grid grid-cols-2 gap-4">
              {(() => {
                const selectedGroup = groups.find(
                  (g) => g._id === selectedGroupId
                );
                if (!selectedGroup) {
                  return (
                    <div className="col-span-2 text-center py-4 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                      Select a group above to see its specific fields.
                    </div>
                  );
                }

                // Allow defaulting if fields are empty? Maybe.
                const fields = selectedGroup.fields || [];

                return fields.map((field: any) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    {field.type === "text" || field.type === "number" ? (
                      <Input
                        type={field.type}
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.key]: e.target.value,
                          })
                        }
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : field.type === "select" || field.type === "status" ? (
                      <Select
                        value={formData[field.key] || ""}
                        onValueChange={(val) =>
                          setFormData({ ...formData, [field.key]: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "date" ? (
                      <Input
                        type="date"
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.key]: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="text-sm text-muted">
                        Field type {field.type} not fully supported in form yet.
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Task
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
