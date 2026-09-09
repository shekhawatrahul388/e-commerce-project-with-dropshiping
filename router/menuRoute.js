const express = require("express");

const {
  getMenu,
  getAllMenu,
  createMenu,
  updateMenu,
  deleteMenu,
} = require("../controller/menuController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


router.get("/", getMenu);


router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllMenu
);

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createMenu
);

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateMenu
);

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteMenu
);

module.exports = router;