const express = require("express");

const {
  createAdmin,
  getAllUsers,
  getSingleUser,
  updateUser,
  changeUserRole,
  deleteUser,
  getUserStatistics,
} = require("../controller/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.post("/create", createAdmin);




router.get("/users", getAllUsers);


router.get("/users/statistics", getUserStatistics);


router.get("/users/:id", getSingleUser);


router.put("/users/:id", updateUser);


router.patch("/users/:id/role", changeUserRole);


router.delete("/users/:id", deleteUser);

module.exports = router;