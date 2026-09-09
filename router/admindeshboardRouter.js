const express = require("express");

const router = express.Router();

const {
  getAdminDashboard,
} = require("../controller/adminDeshboard");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");



router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  getAdminDashboard
);

module.exports = router;