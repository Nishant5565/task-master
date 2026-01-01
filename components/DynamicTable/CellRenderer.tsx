"use client";

import { FieldDefinition, SelectOption } from "@/lib/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CellRendererProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
}

export default function CellRenderer({
  field,
  value,
  onChange,
}: CellRendererProps) {
  // --- Text Field ---
  if (field.type === "text" || field.type === "description") {
    return (
      <input
        type="text"
        className="w-full h-full px-3 bg-transparent outline-none border-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-sm text-gray-700"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // --- Number Field ---
  if (field.type === "number") {
    return (
      <input
        type="number"
        className="w-full h-full px-3 bg-transparent outline-none border-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-sm text-gray-700"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // --- Checkbox Field ---
  if (field.type === "checkbox") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <input
          type="checkbox"
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
    );
  }

  // --- URL Field ---
  if (field.type === "url") {
    const textVal = value || "";
    const isValidUrl = (string: string) => {
      if (!string) return true;
      try {
        let urlToCheck = string;
        if (!/^https?:\/\//i.test(string)) {
          urlToCheck = "https://" + string;
        }
        const url = new URL(urlToCheck);
        return url.hostname.includes(".") || url.hostname === "localhost";
      } catch (_) {
        return false;
      }
    };
    const isValid = isValidUrl(textVal);

    return (
      <div className="relative w-full h-full group/cell">
        <input
          type="text"
          className={`w-full h-full px-3 bg-transparent outline-none border-none focus:ring-2 focus:ring-inset text-sm transition-colors
              ${
                !isValid && textVal
                  ? "focus:ring-red-500 bg-red-50 text-red-600"
                  : "focus:ring-indigo-500"
              } 
              ${
                isValid && textVal
                  ? "text-blue-600 underline decoration-blue-200"
                  : "text-gray-700"
              }
            `}
          value={textVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com"
        />

        {!isValid && textVal && (
          <>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
              <AlertCircle size={14} />
            </div>
            <div className="absolute top-full left-0 mt-1 z-50 pointer-events-none">
              <div className="bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center gap-1.5 whitespace-nowrap relative">
                <div className="absolute -top-1 left-3 w-2 h-2 bg-red-600 rotate-45"></div>
                Invalid URL
              </div>
            </div>
          </>
        )}

        {isValid && textVal && (
          <a
            href={textVal.startsWith("http") ? textVal : `https://${textVal}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white shadow-sm border border-gray-200 rounded-md text-gray-400 hover:text-indigo-600 opacity-0 group-hover/cell:opacity-100 transition-opacity z-10"
            title="Open Link"
            onMouseDown={(e) => e.preventDefault()}
          >
            <LinkIcon size={12} />
          </a>
        )}
      </div>
    );
  }

  // --- Select / Status Field (Custom Dropdown) ---
  if (field.type === "select" || field.type === "status") {
    const selectedOption = (field.options as SelectOption[])?.find(
      (o) => o.id === value
    );

    return (
      <div className="relative w-full h-full flex items-center group">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        >
          <option value="">Select...</option>
          {(field.options as SelectOption[])?.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="w-full h-full flex items-center px-3 pointer-events-none">
          {selectedOption ? (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${selectedOption.color}`}
            >
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">Select...</span>
          )}
        </div>
      </div>
    );
  }

  // --- Date Field ---
  if (field.type === "date") {
    const dateVal = value ? new Date(value) : undefined;
    return (
      <div className="w-full h-full">
        <input
          type="date"
          className="w-full h-full px-3 bg-transparent outline-none border-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-sm text-gray-700 font-mono"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // --- User / ID Field (Read Only) ---
  if (field.type === "user" || field.type === "id") {
    return (
      <div className="w-full h-full px-3 flex items-center text-xs text-gray-500 font-mono select-none bg-gray-50/50">
        {value || "---"}
      </div>
    );
  }

  return <div className="p-2 text-xs text-red-400">Unknown Type</div>;
}
