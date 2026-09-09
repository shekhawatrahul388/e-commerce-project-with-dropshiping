const express = require("express");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controller/wishlistController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getWishlist
);

router.post(
  "/add",
  authMiddleware,
  addToWishlist
);

router.delete(
  "/remove/:productId",
  authMiddleware,
  removeFromWishlist
);

router.delete(
  "/clear",
  authMiddleware,
  clearWishlist
);

module.exports = router;