const User = require("../models/User");
const Address = require("../models/Address");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");


const createAdmin = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    let user = await User.findOne({ phone });

    if (user) {
      user.name = name;
      user.role = "admin";
      await user.save();
    } else {
      user = await User.create({
        name,
        phone,
        role: "admin",
      });
    }

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const addresses = await Address.find({
      user: id,
    });

    const cart = await Cart.findOne({
      user: id,
    });

    const wishlist = await Wishlist.findOne({
      user: id,
    });

    res.status(200).json({
      success: true,
      user,
      addresses,
      cart,
      wishlist,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) {
      user.name = name;
    }

    if (phone) {
      if (phone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }

      const existingUser = await User.findOne({
        phone,
      });

      if (
        existingUser &&
        existingUser._id.toString() !== id
      ) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }

      user.phone = phone;
    }

    if (role) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
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

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);


    await Address.deleteMany({ user: id });
    await Cart.deleteMany({ user: id });
    await Wishlist.deleteMany({ user: id });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      statistics: {
        total,
        users: totalUsers,
        admins: totalAdmins,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createAdmin,
  getAllUsers,
  getSingleUser,
  updateUser,
  changeUserRole,
  deleteUser,
  getUserStatistics,
};