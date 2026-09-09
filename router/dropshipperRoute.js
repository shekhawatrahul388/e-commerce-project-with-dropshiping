const express = require("express");
const auth = require("../middleware/authMiddleware");
const controller = require("../controller/storeController");
const router = express.Router();

router.use(auth);
router.post("/create", controller.createStore);
router.get("/me", controller.getMyStore);
router.put("/update", controller.updateStore);
router.put("/theme", controller.updateTheme);
router.put("/media", controller.updateMedia);
router.get("/check-slug/:slug", controller.checkSlug);
router.post("/products", controller.addProduct);
router.get("/products", controller.ownProducts);
router.delete("/products/:productId", controller.ownProduct);
router.put("/products/:productId", controller.ownProduct);

module.exports = router;