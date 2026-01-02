import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth users
    name: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

// Prevent overwrite on hot reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
