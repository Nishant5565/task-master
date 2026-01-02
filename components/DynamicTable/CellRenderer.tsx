"use client";

import { useState, useRef, useEffect } from "react";
import { CellStyle, FieldDefinition, SelectOption } from "@/lib/schema";
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
  style?: CellStyle;
}

export default function CellRenderer({
  field,
  value,
  onChange,
  style = {},
}: CellRendererProps) {
  // Helper to generate style object
  const getStyleObj = () => ({
    fontWeight: style.bold ? "bold" : "normal",
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    // Colors are applied via className in parent or here if passed as class
    textAlign: style.align || "left",
    whiteSpace: style.wrap === false ? "nowrap" : "pre-wrap",
  });

  const commonClasses = `w-full bg-transparent outline-none border-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-sm ${
    style.textColor || "text-gray-700"
  } px-3 py-2`;

  // --- Text Field ---
  if (field.type === "text" || field.type === "description") {
    // eslint-disable-next-line
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          textareaRef.current.scrollHeight + "px";
      }
    }, [value, style.fontSize]); // Re-adjust on font size change

    return (
      <textarea
        ref={textareaRef}
        className={`${commonClasses} resize-none overflow-hidden leading-relaxed`}
        style={getStyleObj() as any}
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        rows={1}
      />
    );
  }

  // --- Number Field ---
  if (field.type === "number") {
    return (
      <input
        type="number"
        className={commonClasses}
        style={getStyleObj() as any}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // --- Checkbox Field ---
  if (field.type === "checkbox") {
    return (
      <div
        className="w-full h-full flex items-start justify-center py-2.5"
        style={{ backgroundColor: style.bgColor }}
      >
        <input
          type="checkbox"
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer mt-0.5"
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
      <div
        className="relative w-full group/cell"
        style={{ backgroundColor: style.bgColor }}
      >
        <input
          type="text"
          className={`w-full bg-transparent outline-none border-none focus:ring-2 focus:ring-inset text-sm transition-colors px-3 py-2
              ${
                !isValid && textVal
                  ? "focus:ring-red-500 bg-red-50 text-red-600"
                  : "focus:ring-indigo-500"
              } 
              ${
                isValid && textVal
                  ? "text-blue-600 underline decoration-blue-200"
                  : style.textColor || "text-gray-700"
              }
            `}
          style={getStyleObj() as any}
          value={textVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com"
        />

        {!isValid && textVal && (
          <>
            <div className="absolute right-2 top-2.5 text-red-500 pointer-events-none">
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
            className="absolute right-2 top-2 p-1 bg-white shadow-sm border border-gray-200 rounded-md text-gray-400 hover:text-indigo-600 opacity-0 group-hover/cell:opacity-100 transition-opacity z-10"
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
      <div
        className="relative w-full h-full min-h-10 group"
        // onClick/onPointerDown removed to allow Select to function normally.
        // If row selection interference returns, we will handle it in handleCellClick.
      >
        <Select value={value || ""} onValueChange={(val) => onChange(val)}>
          <SelectTrigger className="w-full h-full min-h-10 border-none shadow-none bg-transparent hover:bg-black/5 focus:ring-0 px-2 py-0 text-xs data-[placeholder]:text-gray-400">
            {selectedOption ? (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${selectedOption.color}`}
                style={{
                  fontWeight: style.bold ? "bold" : "normal",
                  fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
                }}
              >
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-gray-400">Select...</span>
            )}
          </SelectTrigger>
          <SelectContent
            className="z-[9999] bg-white border border-gray-200 shadow-xl max-h-[300px]"
            position="popper"
            sideOffset={5}
            align="start"
          >
            {(field.options as SelectOption[])?.map((opt) => (
              <SelectItem
                key={opt.id}
                value={opt.id}
                className="text-xs focus:bg-gray-100 cursor-pointer my-1"
              >
                <span
                  className={`px-2 py-0.5 rounded font-medium ${opt.color}`}
                >
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // --- Date Field ---
  if (field.type === "date") {
    return (
      <div className="w-full">
        <input
          type="date"
          className={`w-full bg-transparent outline-none border-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-sm font-mono px-3 py-2 ${
            style.textColor || "text-gray-700"
          }`}
          style={getStyleObj() as any}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // --- User / ID Field (Read Only) ---
  if (field.type === "user" || field.type === "id") {
    return (
      <div
        className="w-full min-h-10 px-3 py-2 flex items-start text-xs text-gray-500 font-mono select-none bg-gray-50/50"
        style={
          {
            ...getStyleObj(),
            backgroundColor: style.bgColor || undefined, // Keep gray default if no override
          } as any
        }
      >
        <span className="mt-0.5">{value || "---"}</span>
      </div>
    );
  }

  return <div className="p-2 text-xs text-red-400">Unknown Type</div>;
}
