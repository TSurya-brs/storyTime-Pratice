import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    category: { type: String },
    keyword: { type: String },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Category = mongoose.model("category", categorySchema);

export default Category;
