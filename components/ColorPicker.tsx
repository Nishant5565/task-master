import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const COLORS = [
  {
    name: "blue",
    value: "bg-blue-500",
    text: "text-blue-600",
    bgLight: "bg-blue-50",
    ring: "ring-blue-100",
  },
  {
    name: "indigo",
    value: "bg-indigo-500",
    text: "text-indigo-600",
    bgLight: "bg-indigo-50",
    ring: "ring-indigo-100",
  },
  {
    name: "purple",
    value: "bg-purple-500",
    text: "text-purple-600",
    bgLight: "bg-purple-50",
    ring: "ring-purple-100",
  },
  {
    name: "pink",
    value: "bg-pink-500",
    text: "text-pink-600",
    bgLight: "bg-pink-50",
    ring: "ring-pink-100",
  },
  {
    name: "red",
    value: "bg-red-500",
    text: "text-red-600",
    bgLight: "bg-red-50",
    ring: "ring-red-100",
  },
  {
    name: "orange",
    value: "bg-orange-500",
    text: "text-orange-600",
    bgLight: "bg-orange-50",
    ring: "ring-orange-100",
  },
  {
    name: "emerald",
    value: "bg-emerald-500",
    text: "text-emerald-600",
    bgLight: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
  {
    name: "slate",
    value: "bg-slate-500",
    text: "text-slate-600",
    bgLight: "bg-slate-50",
    ring: "ring-slate-200",
  },
];

interface ColorPickerProps {
  value: string;
  onChange: (colorName: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <button
          key={color.name}
          onClick={() => onChange(color.name)}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            color.value,
            value === color.name
              ? "ring-2 ring-offset-2 ring-black"
              : "hover:opacity-80"
          )}
          title={color.name}
        >
          {value === color.name && <Check className="w-4 h-4 text-white" />}
        </button>
      ))}
    </div>
  );
}
