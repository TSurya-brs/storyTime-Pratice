import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    languages: { type: Array },
    categories: { type: Array },
    saved_stories: { type: Array },
    token: { type: String },
    verified: { type: Boolean, default: false },
    verify_token: { type: String },
    verify_token_expires: Date,
    reset_password_token: { type: String },
    reset_password_expires: Date,
    status: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const User = mongoose.model("User", userSchema);
export default User;
