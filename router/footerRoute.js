const express = require("express");

const router = express.Router();

const {
  getFooter,
  updateFooter,
} = require("../controller/footerController");


router.get("/", getFooter);


router.put("/update", updateFooter);

module.exports = router;