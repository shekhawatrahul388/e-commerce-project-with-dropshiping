const express = require("express");

const {
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUserRole,
} = require("../controller/userController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();



router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);



router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.put(
  "/editprofile",
  authMiddleware,
  updateProfile
);




router.get(
  "/all",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);


router.get(
  "/single/:id",
  authMiddleware,
  adminMiddleware,
  getSingleUser
);


router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);


router.put(
  "/role/:id",
  authMiddleware,
  adminMiddleware,
  updateUserRole
);

module.exports = router;