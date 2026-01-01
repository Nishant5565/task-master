"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { TaskItem } from "@/lib/schema";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import TaskGroupSection from "./TaskGroupSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldManager from "./FieldManager";

interface GroupedTableViewProps {
  projectId: string;
}

import { useRouter } from "next/navigation";

export default function GroupedTableView({ projectId }: GroupedTableViewProps) {
  const [project, setProject] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Group Creation State
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const fetchData = async () => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/board`);
      setProject(res.data.project);
      setGroups(res.data.groups);
      setTasks(res.data.tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Optimistic Update
    const sourceGroup = source.droppableId;
    const destGroup = destination.droppableId;

    const newTasks = Array.from(tasks);
    const movedTaskIndex = newTasks.findIndex((t) => t._id === draggableId);
    if (movedTaskIndex === -1) return;

    const [movedTask] = newTasks.splice(movedTaskIndex, 1);
    movedTask.groupId = destGroup; // Update group ref

    // Calculate new position
    // Filter tasks for destination group to find insertion index
    const destGroupTasks = newTasks.filter(
      (t) =>
        t.groupId === destGroup || (!t.groupId && destGroup === "ungrouped")
    );
    // Insert into the filtered list logic is complex for flat array.
    // Simpler approach: Re-fetch or simplistic reorder.
    // For now: Just append locally to visual group or handle complex index math.

    // For MVP: Let's just update the backend and rely on index from dnd-kit which is based on visual list.
    // We need to construct the payload for reorder.

    // Correct approach: Re-sort the flat list based on the visual change.

    // 1. Get tasks of source group
    // 2. Remove
    // 3. Get tasks of dest group
    // 4. Insert
    // 5. Update global list

    // Let's defer strict local ordering perfection for a refresh, OR impl simple swap.
    // We will just call API.

    // Actually, improved local logic:
    // Update the task's groupId in state immediately so it jumps visually.
    const updatedTasks = tasks.map((t) =>
      t._id === draggableId ? { ...t, groupId: destGroup } : t
    );
    setTasks(updatedTasks);

    try {
      // We need to send the new order of the DESTINATION group to the backend.
      // It's hard to get exact order without full array manipulation.
      // Let's send a simplified "moved" payload.
      await apiClient.put("/tasks/reorder", {
        items: [
          { _id: draggableId, groupId: destGroup, order: destination.index },
        ],
      });
      // Refetch to ensure sync
      // fetchData();
    } catch (e) {
      console.error("Reorder failed", e);
    }
  };

  const router = useRouter(); // Import useRouter at top level

  const handleAddTask = (groupId: string) => {
    // We can pass groupId via query param if we want to pre-select it
    // For now, simpliest is just go to create page
    // Using a query param would be nice: ?group=ID
    // But let's stick to base route for now as user just asked for separate page.
    router.push(`/dashboard/projects/${projectId}/create`);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    const res = await apiClient.post(`/projects/${projectId}/groups`, {
      name: newGroupName,
    });
    setGroups([...groups, res.data]);
    setIsGroupOpen(false);
    setNewGroupName("");
  };

  const handleUpdateTask = async (taskId: string, key: string, value: any) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, [key]: value } : t))
    );
    apiClient.put(`/tasks/${taskId}`, { [key]: value });
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    apiClient.delete(`/tasks/${taskId}`);
  };

  if (loading) return <div>Loading board...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Header from TableView - simplified Reuse */}
      <div className="flex items-center justify-between px-8 py-6 border-b bg-background">
        <h2 className="text-2xl font-bold">{project.name}</h2>
        <div className="flex gap-2">
          <FieldManager project={project} onUpdate={setProject} />
          <Button onClick={() => setIsGroupOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Group
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <DragDropContext onDragEnd={onDragEnd}>
          {groups.map((group) => (
            <TaskGroupSection
              key={group._id}
              group={group}
              tasks={tasks.filter((t) => t.groupId === group._id)} // Poor man's selector
              fields={project.fields}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
          {/* Ungrouped Tasks? optional */}
        </DragDropContext>
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
