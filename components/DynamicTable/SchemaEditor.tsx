"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Need to install or likely just use input
import { Settings } from "lucide-react";
import apiClient from "@/lib/axios";
import { TaskSchema } from "@/lib/schema";

interface SchemaEditorProps {
  currentSchema: TaskSchema | null;
  onUpdate: (newSchema: TaskSchema) => void;
}

export default function SchemaEditor({
  currentSchema,
  onUpdate,
}: SchemaEditorProps) {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    // Strip database ID fields for cleaner editing
    const cleanSchema = { ...currentSchema };
    delete cleanSchema._id;
    // pretty print
    setJson(JSON.stringify(cleanSchema, null, 2));
    setOpen(true);
    setError(null);
  };

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(json);
      // Basic validation
      if (!parsed.fields || !Array.isArray(parsed.fields)) {
        throw new Error("Schema must have a 'fields' array.");
      }

      const res = await apiClient.put("/schema", parsed);
      onUpdate(res.data);
      setOpen(false);
    } catch (e: any) {
      setError(e.message || "Invalid JSON");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleOpen}>
          <Settings className="w-4 h-4 mr-2" />
          Schema
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Workspace Schema</DialogTitle>
          <DialogDescription>
            Define your task structure using JSON. Changes will reflect
            immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 py-4">
          <textarea
            className="w-full h-full font-mono text-xs p-4 bg-muted/50 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
