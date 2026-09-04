const User = require("../models/User");
const Product = require("../models/product");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");
const Address = require("../models/Address");

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalAllUsers,
      totalProducts,
      activeProducts,
      featuredProducts,
      dropshippingProducts,
      totalCategories,
      totalCarts,
      totalWishlists,
      totalAddresses,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ featured: true }),
      Product.countDocuments({ isDropshipping: true }),
      Category.countDocuments(),
      Cart.countDocuments(),
      Wishlist.countDocuments(),
      Address.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      dashboard: {
        users: {
          total: totalAllUsers,
          users: totalUsers,
          admins: totalAdmins,
        },

        products: {
          total: totalProducts,
          active: activeProducts,
          featured: featuredProducts,
          dropshipping: dropshippingProducts,
        },

        categories: {
          total: totalCategories,
        },

        cart: {
          totalCarts,
        },

        wishlist: {
          totalWishlists,
        },

        addresses: {
          total: totalAddresses,
        },
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        recentOrders: [],
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
  getAdminDashboard,
};