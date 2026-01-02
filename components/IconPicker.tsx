import { useState } from "react";
import * as Icons from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const ICON_LIST = [
  "LayoutGrid",
  "List",
  "Kanban",
  "CheckSquare",
  "Flag",
  "Calendar",
  "Clock",
  "Target",
  "Zap",
  "Award",
  "Briefcase",
  "Folder",
  "FileText",
  "Settings",
  "Users",
  "Star",
  "Heart",
  "Smile",
  "AlertCircle",
  "Info",
  "Rocket",
  "Gavel",
  "Building",
  "Home",
  "User",
  "Mail",
  "Phone",
  "Camera",
  "Video",
  "Music",
  "Map",
  "Globe",
  "Sun",
  "Moon",
  "Cloud",
  "Umbrella",
  "Coffee",
  "Gift",
  "ShoppingBag",
  "CreditCard",
  "DollarSign",
  "PieChart",
  "BarChart",
  "Activity",
  "TrendingUp",
  "TrendingDown",
  "Anchor",
  "Compass",
  "Navigation",
  "MapPin",
  "Truck",
  "Package",
  "Box",
  "Layers",
  "Database",
  "Server",
  "Cpu",
  "Smartphone",
  "Tablet",
  "Monitor",
  "Printer",
  "Wifi",
  "Bluetooth",
  "Battery",
  "Plug",
  "ZapOff",
  "Command",
  "Hash",
  "Search",
  "Filter",
  "SortAsc",
  "SortDesc",
  "Download",
  "Upload",
  "Share",
  "ExternalLink",
  "Link",
  "Paperclip",
  "Trash",
  "Edit",
  "Plus",
  "Minus",
  "X",
  "Check",
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const SelectedIcon = (Icons as any)[value] || Icons.HelpCircle;

  const filteredIcons = ICON_LIST.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[60px] h-[60px] p-0 rounded-xl"
          type="button"
        >
          <div className="flex flex-col items-center justify-center gap-1">
            <SelectedIcon className="w-6 h-6" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-2">
        <Input
          placeholder="Search icon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 h-8"
        />
        <ScrollArea className="h-[200px]">
          <div className="grid grid-cols-5 gap-2">
            {filteredIcons.map((iconName) => {
              const Icon = (Icons as any)[iconName];
              if (!Icon) return null;
              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md hover:bg-slate-100 transition-colors",
                    value === iconName && "bg-slate-100 ring-1 ring-slate-900"
                  )}
                  title={iconName}
                >
                  <Icon className="w-5 h-5 text-slate-600" />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
