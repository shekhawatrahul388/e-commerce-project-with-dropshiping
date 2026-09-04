const express = require("express");

const upload =
  require("../middleware/uploadMiddleware");

const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
} = require(
  "../controller/uploadcontroller"
);

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

const adminMiddleware =
  require(
    "../middleware/adminMiddleware"
  );

const router =
  express.Router();



router.post(
  "/single",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  uploadSingleImage
);



router.post(
  "/multiple",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 10),
  uploadMultipleImages
);



router.delete(
  "/delete",
  authMiddleware,
  adminMiddleware,
  deleteImage
);

module.exports = router;