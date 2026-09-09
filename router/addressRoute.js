const express = require("express");

const {
  createAddress,
  getMyAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controller/addressController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  createAddress
);

router.get(
  "/",
  authMiddleware,
  getMyAddresses
);

router.get(
  "/:id",
  authMiddleware,
  getSingleAddress
);

router.put(
  "/update/:id",
  authMiddleware,
  updateAddress
);

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteAddress
);

router.put(
  "/default/:id",
  authMiddleware,
  setDefaultAddress
);

module.exports = router;