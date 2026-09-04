const User = require("../models/User");
const jwt = require("jsonwebtoken");



const sendOtp = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const userName = String(name).trim();
    const phoneNumber = String(phone).trim();

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10 digit phone number",
      });
    }

    let user = await User.findOne({
      phone: phoneNumber,
    });

    if (!user) {
      user = new User({
        name: userName,
        phone: phoneNumber,
      });
    } else {
      user.name = userName;
    }

    const otp = process.env.OTP || "123456";

    user.otp = String(otp);

    user.otpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    const phoneNumber = String(phone).trim();
    const enteredOtp = String(otp).trim();

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be 6 digits",
      });
    }

    const user = await User.findOne({
      phone: phoneNumber,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (String(user.otp) !== enteredOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      user.otpExpiry &&
      user.otpExpiry.getTime() < Date.now()
    ) {
      user.otp = null;
      user.otpExpiry = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP",
      });
    }

    user.isVerified = true;

    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is missing in .env",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select(
      "-otp -otpExpiry"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const getAllUsers = async (req, res) => {
  try {

    const users = await User.find()
      .select("-otp -otpExpiry")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {

    console.error("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};



const getSingleUser = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await User.findById(id)
      .select("-otp -otpExpiry");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.error("GET SINGLE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};



const deleteUser = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {

    console.error("DELETE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};



const updateUserRole = async (req, res) => {
  try {

    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",

      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {

    console.error("UPDATE USER ROLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};



module.exports = {
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,


  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUserRole,
};