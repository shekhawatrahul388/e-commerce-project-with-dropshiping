const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    desktopImage: {
      type: String,
      required: true,
    },

    mobileImage: {
      type: String,
      default: "",
    },

    buttonText: {
      type: String,
      default: "",
      trim: true,
    },

    buttonUrl: {
      type: String,
      default: "",
      trim: true,
    },

    position: {
      type: String,
      enum: [
        "left",
        "center",
        "right"
      ],
      default: "left",
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banner", bannerSchema);