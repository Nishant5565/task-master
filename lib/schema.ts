export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "status"
  | "description"
  | "url"
  | "id"
  | "user";

// SelectOption interface for select/status field options
export interface SelectOption {
  id: string;
  label: string;
  color: string; // Tailwind classes e.g., "bg-gray-100 text-gray-700"
}

export interface FieldDefinition {
  id?: string; // Unique field identifier (optional for backward compatibility)
  key: string; // Property key in the data object (e.g., "priority")
  label: string; // Display name (e.g., "Priority")
  type: FieldType; // Input type
  required?: boolean;
  options?: SelectOption[]; // For select/status types (enhanced from string[])
  width?: number; // Column width preference
}

export interface TaskSchema {
  _id?: string;
  name: string;
  fields: FieldDefinition[];
}

export interface TaskItem {
  _id?: string;
  [key: string]: any; // Dynamic data storage
}

// --- Utilities ---

// Color palette for select/status options
export const COLOR_PALETTE = [
  { bg: "bg-gray-100", text: "text-gray-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-yellow-100", text: "text-yellow-700" },
  { bg: "bg-red-100", text: "text-red-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
];

// Generate random ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Generate task ID in format TASK-XXXX
export const generateShortId = () =>
  `TASK-${Math.floor(1000 + Math.random() * 9000)}`;
