const mongoose = require("mongoose");

const Supplier = require("../models/Supplier");
const Product = require("../models/product");



const createSupplier = async (req, res) => {
  try {
    const {
      name,
      companyName,
      phone,
      email,
      address,
      website,
      notes,
      isActive,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required",
      });
    }

    const supplier = await Supplier.create({
      name: String(name).trim(),

      companyName:
        companyName
          ? String(companyName).trim()
          : "",

      phone:
        phone
          ? String(phone).trim()
          : "",

      email:
        email
          ? String(email).trim().toLowerCase()
          : "",

      address:
        address
          ? String(address).trim()
          : "",

      website:
        website
          ? String(website).trim()
          : "",

      notes:
        notes
          ? String(notes).trim()
          : "",

      isActive:
        isActive !== undefined
          ? Boolean(isActive)
          : true,
    });

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    console.error(
      "Create Supplier Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create supplier",
    });
  }
};



const getAllSuppliers = async (req, res) => {
  try {
    const {
      search = "",
      active,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const filter = {};


    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          companyName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          email: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }


    if (active !== undefined) {
      filter.isActive =
        active === "true";
    }

    const [
      suppliers,
      total,
    ] = await Promise.all([
      Supplier.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      Supplier.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,

      suppliers,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages:
          Math.ceil(
            total / limitNumber
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get Suppliers Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get suppliers",
    });
  }
};



const getSingleSupplier = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const supplier =
      await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const products =
      await Product.find({
        supplier: id,
      }).populate(
        "category",
        "name"
      );

    res.status(200).json({
      success: true,
      supplier,
      products,
    });
  } catch (error) {
    console.error(
      "Get Single Supplier Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get supplier",
    });
  }
};



const updateSupplier = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const supplier =
      await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const {
      name,
      companyName,
      phone,
      email,
      address,
      website,
      notes,
      isActive,
    } = req.body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Supplier name cannot be empty",
        });
      }

      supplier.name =
        String(name).trim();
    }

    if (companyName !== undefined) {
      supplier.companyName =
        String(companyName).trim();
    }

    if (phone !== undefined) {
      supplier.phone =
        String(phone).trim();
    }

    if (email !== undefined) {
      supplier.email =
        String(email)
          .trim()
          .toLowerCase();
    }

    if (address !== undefined) {
      supplier.address =
        String(address).trim();
    }

    if (website !== undefined) {
      supplier.website =
        String(website).trim();
    }

    if (notes !== undefined) {
      supplier.notes =
        String(notes).trim();
    }

    if (isActive !== undefined) {
      supplier.isActive =
        Boolean(isActive);
    }

    await supplier.save();

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    console.error(
      "Update Supplier Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update supplier",
    });
  }
};



const deleteSupplier = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const supplier =
      await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }


    const productCount =
      await Product.countDocuments({
        supplier: id,
      });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot delete supplier. ${productCount} products are connected to this supplier.`,
      });
    }

    await Supplier.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Supplier Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete supplier",
    });
  }
};



const toggleSupplierStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const supplier =
      await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    supplier.isActive =
      !supplier.isActive;

    await supplier.save();

    res.status(200).json({
      success: true,

      message:
        supplier.isActive
          ? "Supplier activated"
          : "Supplier deactivated",

      isActive:
        supplier.isActive,
    });
  } catch (error) {
    console.error(
      "Toggle Supplier Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to change supplier status",
    });
  }
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSingleSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
};