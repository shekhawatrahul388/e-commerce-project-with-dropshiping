const express = require("express");

const router = express.Router();

const {
  getNavbar,
  getAllNavbar,
  createNavbar,
  updateNavbar,
  deleteNavbar,
} = require("../controller/navbarController");




router.get("/all", getNavbar);




router.get("/admin/all", getAllNavbar);


router.post("/create", createNavbar);


router.put("/update/:id", updateNavbar);


router.delete("/delete/:id", deleteNavbar);

module.exports = router;