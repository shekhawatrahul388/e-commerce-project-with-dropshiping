const express = require("express");
const auth = require("../middleware/authMiddleware");
const controller = require("../controller/storeController");
const router = express.Router();

router.get("/:slug/products", controller.publicProducts);
router.get("/:slug/theme", controller.publicTheme);
router.get("/:slug", controller.publicStore);

module.exports = router;