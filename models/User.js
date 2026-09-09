const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true,
    },


    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },


    otp: {
      type: String,
      default: null,
    },


    otpExpiry: {
      type: Date,
      default: null,
    },


    isVerified: {
      type: Boolean,
      default: false,
    },


    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

module.exports = User;