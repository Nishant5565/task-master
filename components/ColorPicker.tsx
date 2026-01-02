import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const COLORS = [
  {
    name: "slate",
    value: "bg-slate-500",
    text: "text-slate-600",
    bgLight: "bg-slate-50",
    ring: "ring-slate-100",
  },
  {
    name: "gray",
    value: "bg-gray-500",
    text: "text-gray-600",
    bgLight: "bg-gray-50",
    ring: "ring-gray-100",
  },
  {
    name: "zinc",
    value: "bg-zinc-500",
    text: "text-zinc-600",
    bgLight: "bg-zinc-50",
    ring: "ring-zinc-100",
  },
  {
    name: "neutral",
    value: "bg-neutral-500",
    text: "text-neutral-600",
    bgLight: "bg-neutral-50",
    ring: "ring-neutral-100",
  },
  {
    name: "stone",
    value: "bg-stone-500",
    text: "text-stone-600",
    bgLight: "bg-stone-50",
    ring: "ring-stone-100",
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
    name: "amber",
    value: "bg-amber-500",
    text: "text-amber-600",
    bgLight: "bg-amber-50",
    ring: "ring-amber-100",
  },
  {
    name: "yellow",
    value: "bg-yellow-500",
    text: "text-yellow-600",
    bgLight: "bg-yellow-50",
    ring: "ring-yellow-100",
  },
  {
    name: "lime",
    value: "bg-lime-500",
    text: "text-lime-600",
    bgLight: "bg-lime-50",
    ring: "ring-lime-100",
  },
  {
    name: "green",
    value: "bg-green-500",
    text: "text-green-600",
    bgLight: "bg-green-50",
    ring: "ring-green-100",
  },
  {
    name: "emerald",
    value: "bg-emerald-500",
    text: "text-emerald-600",
    bgLight: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
  {
    name: "teal",
    value: "bg-teal-500",
    text: "text-teal-600",
    bgLight: "bg-teal-50",
    ring: "ring-teal-100",
  },
  {
    name: "cyan",
    value: "bg-cyan-500",
    text: "text-cyan-600",
    bgLight: "bg-cyan-50",
    ring: "ring-cyan-100",
  },
  {
    name: "sky",
    value: "bg-sky-500",
    text: "text-sky-600",
    bgLight: "bg-sky-50",
    ring: "ring-sky-100",
  },
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
    name: "violet",
    value: "bg-violet-500",
    text: "text-violet-600",
    bgLight: "bg-violet-50",
    ring: "ring-violet-100",
  },
  {
    name: "purple",
    value: "bg-purple-500",
    text: "text-purple-600",
    bgLight: "bg-purple-50",
    ring: "ring-purple-100",
  },
  {
    name: "fuchsia",
    value: "bg-fuchsia-500",
    text: "text-fuchsia-600",
    bgLight: "bg-fuchsia-50",
    ring: "ring-fuchsia-100",
  },
  {
    name: "pink",
    value: "bg-pink-500",
    text: "text-pink-600",
    bgLight: "bg-pink-50",
    ring: "ring-pink-100",
  },
  {
    name: "rose",
    value: "bg-rose-500",
    text: "text-rose-600",
    bgLight: "bg-rose-50",
    ring: "ring-rose-100",
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
