const express = require("express");

const {
  createSupplier,
  getAllSuppliers,
  getSingleSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
} = require(
  "../controller/supplierController"
);

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

const adminMiddleware =
  require(
    "../middleware/adminMiddleware"
  );

const router = express.Router();



router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createSupplier
);



router.get(
  "/all",
  authMiddleware,
  adminMiddleware,
  getAllSuppliers
);



router.get(
  "/single/:id",
  authMiddleware,
  adminMiddleware,
  getSingleSupplier
);



router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateSupplier
);



router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteSupplier
);



router.put(
  "/toggle/:id",
  authMiddleware,
  adminMiddleware,
  toggleSupplierStatus
);

module.exports = router;