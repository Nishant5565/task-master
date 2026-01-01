import mongoose from "mongoose";

const FieldDefinitionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "number", "date", "select", "checkbox", "status"],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
    width: { type: Number },
  },
  { _id: false }
);

const TaskSchemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "Default Schema" },
    userId: { type: String, required: true, index: true }, // Linking to NextAuth User ID (email or sub)
    fields: { type: [FieldDefinitionSchema], required: true },
  },
  { timestamps: true }
);

// Prevent overwrite on hot reload
const SchemaModel =
  mongoose.models.TaskSchema || mongoose.model("TaskSchema", TaskSchemaSchema);

export default SchemaModel;
