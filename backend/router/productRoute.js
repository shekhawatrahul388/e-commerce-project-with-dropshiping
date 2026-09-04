const express = require("express");

const router = express.Router();

const {
  createProduct,
  submitProduct,
  getMyProducts,
  approveProduct,
  createMultipleProducts,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getDropshippingProducts,
} = require("../controller/productcontroller");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");



router.post(
  "/create",
  createProduct
);

router.post(
  "/submit",
  authMiddleware,
  upload.single("image"),
  submitProduct
);
router.get("/mine", authMiddleware, getMyProducts);
router.patch("/approve/:id", authMiddleware, adminMiddleware, approveProduct);



router.post(
  "/create-multiple",
  authMiddleware,
  adminMiddleware,
  createMultipleProducts
);



router.get(
  "/all",
  getAllProducts
);



router.get(
  "/dropshipping",
  getDropshippingProducts
);



router.get(
  "/single/:id",
  getSingleProduct
);



router.put(
  "/update/:id",
  updateProduct
);



router.delete(
  "/delete/:id",
  deleteProduct
);



router.patch(
  "/toggle/:id",
  toggleProductStatus
);

module.exports = router;