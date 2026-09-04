const express = require("express");

const router = express.Router();

const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} = require("../controller/cartcontroller");

const authMiddleware = require("../middleware/authMiddleware");



router.get(
  "/",
  authMiddleware,
  getCart
);



router.post(
  "/add",
  authMiddleware,
  addToCart
);



router.put(
  "/update/:productId",
  authMiddleware,
  updateCart
);



router.delete(
  "/remove/:productId",
  authMiddleware,
  removeFromCart
);



router.delete(
  "/clear",
  authMiddleware,
  clearCart
);

module.exports = router;