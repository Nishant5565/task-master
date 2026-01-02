import mongoose from "mongoose";

// Embedded Field Schema (Copied from Project, now per Group)
const FieldDefinitionSchema = new mongoose.Schema(
  {
    id: { type: String }, // Field ID for tracking
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "text",
        "description",
        "number",
        "date",
        "select",
        "checkbox",
        "status",
        "user",
        "id",
        "url",
      ],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: { type: mongoose.Schema.Types.Mixed, default: [] }, // Can be strings or SelectOption objects
    width: { type: Number },
  },
  { _id: false }
);

const TaskGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    order: { type: Number, required: true, default: 0 },
    icon: { type: String, default: "LayoutGrid" },
    color: { type: String, default: "indigo" }, // blue, indigo, purple, pink, orange, green, slate
    userId: { type: String, required: true, index: true }, // Creator
    // Fields specific to this group
    fields: { type: [FieldDefinitionSchema], default: [] },
    members: {
      type: [
        {
          userId: { type: String, required: true },
          role: {
            type: String,
            enum: ["editor", "viewer"], // No owner/admin for groups? Maybe just simple roles
            default: "viewer",
          },
        },
      ],
      default: [],
      _id: false,
    },
  },
  { timestamps: true }
);

// Prevent overwrite on hot reload
const TaskGroup =
  mongoose.models.TaskGroup || mongoose.model("TaskGroup", TaskGroupSchema);

export default TaskGroup;
