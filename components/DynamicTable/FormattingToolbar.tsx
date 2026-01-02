"use client";

import {
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  WrapText,
  Palette,
  ChevronDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CellStyle, COLOR_PALETTE } from "@/lib/schema";

interface FormattingToolbarProps {
  selection: { type: "cell" | "row" | "col" | "mixed"; count: number } | null;
  currentStyles: CellStyle;
  onUpdateStyle: (style: Partial<CellStyle>) => void;
}

export default function FormattingToolbar({
  selection,
  currentStyles,
  onUpdateStyle,
}: FormattingToolbarProps) {
  const hasSelection = selection && selection.count > 0;
  const disabled = !hasSelection;

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 shadow-sm min-h-[50px]">
      <div className="text-xs font-medium text-gray-500 border-r border-gray-200 pr-3 mr-1 min-w-[80px]">
        {hasSelection ? (
          <>
            {selection.count}{" "}
            {selection.type === "mixed" ? "items" : selection.type}
            (s)
          </>
        ) : (
          <span className="text-gray-400">No selection</span>
        )}
      </div>

      {/* Font Size */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center justify-between border border-gray-200 rounded-md bg-white px-2 py-1 h-8 min-w-[64px] ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-gray-300"
            }`}
            disabled={disabled}
          >
            <span className="text-xs text-gray-700">
              {currentStyles.fontSize || 14}px
            </span>
            <ChevronDown size={12} className="text-gray-400 ml-1" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-20 p-1 z-50 max-h-60 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {[12, 13, 14, 15, 16, 18, 20, 24].map((size) => (
              <button
                key={size}
                className={`text-xs px-2 py-1.5 text-left rounded-sm hover:bg-gray-100 ${
                  (currentStyles.fontSize || 14) === size
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => onUpdateStyle({ fontSize: size })}
              >
                {size}px
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      {/* Bold */}
      <button
        onClick={() => onUpdateStyle({ bold: !currentStyles.bold })}
        disabled={disabled}
        className={`p-1.5 rounded-md ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
        } ${
          currentStyles.bold
            ? "bg-indigo-50 text-indigo-600 font-bold"
            : "text-gray-600"
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={`p-1.5 rounded-md ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            } flex items-center gap-1 ${
              currentStyles.textColor
                ? "bg-gray-50 text-gray-900"
                : "text-gray-600"
            }`}
            title="Text Color"
          >
            <div className="relative">
              <Type size={16} />
              <div
                className={`absolute -bottom-1 left-0 right-0 h-1 bg-current rounded-sm ${
                  currentStyles.textColor || "bg-black"
                }`}
              ></div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 z-50">
          <div className="grid grid-cols-7 gap-1">
            <button
              className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-xs"
              onClick={() => onUpdateStyle({ textColor: undefined })}
              title="Default"
            >
              A
            </button>
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.text}
                className={`w-6 h-6 rounded flex items-center justify-center font-bold ${c.text} hover:bg-gray-50 border border-transparent hover:border-gray-200`}
                onClick={() => onUpdateStyle({ textColor: c.text })}
              >
                A
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Background Color */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={`p-1.5 rounded-md ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            } text-gray-600`}
            title="Background Color"
          >
            <div className="relative">
              <Palette size={16} />
              <div
                className={`absolute -bottom-1 left-0 right-0 h-1 rounded-sm ${
                  currentStyles.bgColor
                    ? currentStyles.bgColor.replace("bg-", "bg-")
                    : "bg-transparent"
                }`}
              ></div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 z-50">
          <div className="grid grid-cols-7 gap-1">
            <button
              className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              onClick={() => onUpdateStyle({ bgColor: undefined })}
              title="No Fill"
            >
              /
            </button>
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.bg}
                className={`w-6 h-6 rounded ${c.bg} border border-black/5 hover:scale-105 transition-transform`}
                onClick={() => onUpdateStyle({ bgColor: c.bg })}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      {/* Alignment */}
      <div
        className={`flex bg-gray-50 rounded-md p-0.5 border border-gray-200 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <button
          disabled={disabled}
          onClick={() => onUpdateStyle({ align: "left" })}
          className={`p-1 rounded ${
            currentStyles.align === "left" || !currentStyles.align
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <AlignLeft size={14} />
        </button>
        <button
          disabled={disabled}
          onClick={() => onUpdateStyle({ align: "center" })}
          className={`p-1 rounded ${
            currentStyles.align === "center"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <AlignCenter size={14} />
        </button>
        <button
          disabled={disabled}
          onClick={() => onUpdateStyle({ align: "right" })}
          className={`p-1 rounded ${
            currentStyles.align === "right"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <AlignRight size={14} />
        </button>
      </div>

      {/* Wrap */}
      <button
        disabled={disabled}
        onClick={() => onUpdateStyle({ wrap: !currentStyles.wrap })}
        className={`p-1.5 rounded-md ml-1 ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
        } ${
          currentStyles.wrap ? "bg-indigo-50 text-indigo-600" : "text-gray-600"
        }`}
        title="Wrap Text"
      >
        <WrapText size={16} />
      </button>
    </div>
  );
}
