import mongoose from "mongoose";

// Reuse the field definition but now embedded in Project
const FieldDefinitionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "number", "date", "select", "checkbox", "status", "user"],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
    width: { type: Number },
  },
  { _id: false }
);

const MemberSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: "User" }, // Auth ID
    role: {
      type: String,
      enum: ["owner", "admin", "editor", "viewer"],
      default: "viewer",
    },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: true, index: true, ref: "User" },
    description: { type: String },
    members: { type: [MemberSchema], default: [] },
    fields: { type: [FieldDefinitionSchema], default: [] }, // The "Schema" is now per project
  },
  { timestamps: true }
);

// Prevent overwrite on hot reload
const Project =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);

export default Project;
