import mongoose from "mongoose";

const TaskItemSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskGroup",
      index: true,
    },
    order: { type: Number, default: 0 },
    userId: { type: String, required: true, index: true }, // Creator
    assignedTo: { type: String }, // Auth User ID of assignee
  },
  { strict: false, timestamps: true }
);

// Prevent overwrite on hot reload
const TaskModel =
  mongoose.models.Task || mongoose.model("Task", TaskItemSchema);

export default TaskModel;
