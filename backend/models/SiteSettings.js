const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      default: "",
    },

    siteName: {
      type: String,
      default: "MyStore",
      trim: true,
    },

    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },

    whatsappMessage: {
      type: String,
      default: "Hello, I want to inquire about this product.",
      trim: true,
    },

    whatsappEnabled: {
      type: Boolean,
      default: true,
    },

    themeMode: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },

    primaryColor: {
      type: String,
      default: "#2563eb",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", settingSchema);