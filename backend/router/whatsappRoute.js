const express = require("express");

const {
  getWhatsappSettings,
  updateWhatsappSettings,
  createProductInquiry,
  createCartInquiry,
} = require("../controller/whatsappController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();



router.get(
  "/settings",
  getWhatsappSettings
);

router.post(
  "/product-inquiry",
  createProductInquiry
);



router.post(
  "/cart-inquiry",
  authMiddleware,
  createCartInquiry
);



router.put(
  "/settings",
  authMiddleware,
  adminMiddleware,
  updateWhatsappSettings
);

module.exports = router;