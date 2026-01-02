import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskGroup",
      required: false, // Optional: if present, invites only to this group
    },
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Index for faster lookups
InvitationSchema.index({ projectId: 1, email: 1 });
InvitationSchema.index({ token: 1 });

const Invitation =
  mongoose.models.Invitation || mongoose.model("Invitation", InvitationSchema);

export default Invitation;
