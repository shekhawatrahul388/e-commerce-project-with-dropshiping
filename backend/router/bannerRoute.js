const express = require("express");

const {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controller/bannerController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();



router.get("/", getBanners);



router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllBanners
);

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createBanner
);

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateBanner
);

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteBanner
);

module.exports = router;