const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    username: { type: String, required: true, trim: true, index: true },
    storeName: { type: String, required: true, trim: true },
    storeSlug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    storeUrl: { type: String, required: true },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    theme: { type: String, enum: ["default", "modern", "dark"], default: "default" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Store || mongoose.model("Store", storeSchema);