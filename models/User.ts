import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth users
    name: { type: String },
    image: {
      type: String,
      default:
        "https://cdn.myotaku.world/media-1767378041585-48cb26048fb6c9c299f7d304a5f338a98d2ccf91c88cdb9a17997332d6200911.jpg-1767378041585.jpg",
    },
  },
  { timestamps: true }
);

// Prevent overwrite on hot reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
