const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "My Ecommerce",
      trim: true,
    },
    description: {
      type: String,
      default: "Your trusted online shopping destination.",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    facebook: {
      type: String,
      default: "",
      trim: true,
    },
    instagram: {
      type: String,
      default: "",
      trim: true,
    },
    twitter: {
      type: String,
      default: "",
      trim: true,
    },
    youtube: {
      type: String,
      default: "",
      trim: true,
    },
    copyright: {
      type: String,
      default: "© 2026 My Ecommerce. All rights reserved.",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Footer ||
  mongoose.model("Footer", footerSchema);