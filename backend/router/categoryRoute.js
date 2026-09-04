const express = require("express");

const {
  createCategory,
  getCategories,
  getAllCategories,
  getSingleCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = require("../controller/categorycontroller");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();



router.get("/", getCategories);

router.get("/all", getCategories);

router.get("/slug/:slug", getCategoryBySlug);

router.get("/:id", getSingleCategory);



router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllCategories
);

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createCategory
);

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateCategory
);

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteCategory
);

module.exports = router;