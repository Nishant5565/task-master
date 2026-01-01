"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUp, Copy, Check } from "lucide-react";
import apiClient from "@/lib/axios";

interface BulkImportDialogProps {
  projectId: string;
  onSuccess: () => void;
}

const EXAMPLE_JSON = `{
  "group_name": "Week 1: Planning",
  "group_fields": [
    {
      "field_name": "Task",
      "field_type": "text"
    },
    {
      "field_name": "Status",
      "field_type": "status",
      "options": [
        { "id": "1", "label": "To Do", "color": "bg-gray-100 text-gray-700" },
        { "id": "2", "label": "In Progress", "color": "bg-blue-100 text-blue-700" },
        { "id": "3", "label": "Done", "color": "bg-green-100 text-green-700" }
      ]
    },
    {
      "field_name": "Due Date",
      "field_type": "date"
    },
    {
      "field_name": "Priority",
      "field_type": "select",
      "options": [
        { "id": "low", "label": "Low", "color": "bg-gray-100 text-gray-700" },
        { "id": "med", "label": "Medium", "color": "bg-yellow-100 text-yellow-700" },
        { "id": "high", "label": "High", "color": "bg-red-100 text-red-700" }
      ]
    }
  ],
  "group_values": [
    {
      "Task": "Define Requirements",
      "Status": "Done",
      "Due Date": "2024-01-15",
      "Priority": "high"
    },
    {
      "Task": "Create Wireframes",
      "Status": "In Progress",
      "Due Date": "2024-01-20",
      "Priority": "med"
    },
    {
      "Task": "User Research",
      "Status": "To Do",
      "Due Date": "2024-01-25",
      "Priority": "low"
    }
  ]
}`;

export default function BulkImportDialog({
  projectId,
  onSuccess,
}: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyExample = () => {
    navigator.clipboard.writeText(EXAMPLE_JSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    setError("");
    setLoading(true);

    try {
      // Validate JSON
      const data = JSON.parse(jsonInput);

      // Check if it's an array or single object
      const isArray = Array.isArray(data);

      if (!isArray) {
        // Single group validation
        if (!data.group_name) {
          throw new Error("Missing required field: group_name");
        }
        if (!Array.isArray(data.group_fields)) {
          throw new Error(
            "Missing or invalid field: group_fields (must be an array)"
          );
        }
      } else {
        // Array validation
        if (data.length === 0) {
          throw new Error("Empty array provided");
        }
      }

      // Send to API
      const response = await apiClient.post(
        `/projects/${projectId}/import`,
        data
      );

      // Handle response
      if (response.data.totalGroups !== undefined) {
        // Batch import response
        const msg = [
          `Import complete!`,
          `✅ ${response.data.successful} groups created`,
          response.data.failed > 0 ? `❌ ${response.data.failed} failed` : "",
          response.data.errors?.length > 0
            ? `\nErrors:\n${response.data.errors
                .map((e: any) => `- ${e.group_name}: ${e.error}`)
                .join("\n")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n");

        alert(msg);
      }

      // Success - close dialog and refresh
      setOpen(false);
      setJsonInput("");
      onSuccess();
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format. Please check your syntax.");
      } else {
        setError(err.response?.data?.error || err.message || "Import failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default">
          <FileUp className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Group & Tasks</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Import one or multiple groups with fields and tasks using JSON
            format. You can paste a single group object or an array of groups.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Example Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Example Format</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyExample}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Example
                  </>
                )}
              </Button>
            </div>
            <div className="bg-gray-50 p-3 rounded-md border">
              <pre className="text-xs overflow-x-auto">{EXAMPLE_JSON}</pre>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste Your JSON</label>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="font-mono text-sm min-h-[200px]"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Field Types Reference */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
            <p className="text-xs font-semibold text-blue-900 mb-2">
              Supported Field Types:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div>• text</div>
              <div>• description</div>
              <div>• number</div>
              <div>• date</div>
              <div>• checkbox</div>
              <div>• url</div>
              <div>• id (auto-generated)</div>
              <div>• status (with options)</div>
              <div>• select (with options)</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading || !jsonInput.trim()}
          >
            {loading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
