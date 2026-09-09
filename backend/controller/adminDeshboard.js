const User = require("../models/User");
const Product = require("../models/product");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");
const Address = require("../models/Address");
const Store = require("../models/Store");
const StoreProduct = require("../models/StoreProduct");

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
      totalStores,
      totalStoreProducts,
      totalCartItems,
      totalWishlistItems,
      recentUsers,
      stores,
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
      Store.countDocuments({ status: "active" }),
      StoreProduct.countDocuments(),
      Cart.aggregate([
        { $unwind: "$items" },
        { $group: { _id: null, total: { $sum: "$items.quantity" } } },
      ]),
      Wishlist.aggregate([
        { $project: { total: { $size: "$products" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      User.find({}, "name phone role isVerified createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Store.find({ status: "active" }, "storeName storeSlug storeUrl username user createdAt")
        .populate("user", "name phone role")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
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
          totalItems: totalCartItems[0]?.total || 0,
        },

        wishlist: {
          totalWishlists,
          totalItems: totalWishlistItems[0]?.total || 0,
        },

        addresses: {
          total: totalAddresses,
        },
        stores: {
          total: totalStores,
          products: totalStoreProducts,
          recent: stores,
        },
        recentUsers,
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