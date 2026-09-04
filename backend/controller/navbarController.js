const Navbar = require("../models/navbar");


const getNavbar = async (req, res) => {
  try {
    const navbar = await Navbar.find({
      isActive: true,
    }).sort({
      order: 1,
    });

    res.status(200).json({
      success: true,
      navbar,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getAllNavbar = async (req, res) => {
  try {
    const navbar = await Navbar.find().sort({
      order: 1,
    });

    res.status(200).json({
      success: true,
      navbar,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const createNavbar = async (req, res) => {
  try {
    const {
      title,
      url,
      icon,
      order,
      isActive,
      openInNewTab,
    } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: "Title and URL are required",
      });
    }

    const navbar = await Navbar.create({
      title,
      url,
      icon: icon || "",
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      openInNewTab: openInNewTab || false,
    });

    res.status(201).json({
      success: true,
      message: "Navbar item created successfully",
      navbar,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const updateNavbar = async (req, res) => {
  try {
    const { id } = req.params;

    const navbar = await Navbar.findById(id);

    if (!navbar) {
      return res.status(404).json({
        success: false,
        message: "Navbar item not found",
      });
    }

    const {
      title,
      url,
      icon,
      order,
      isActive,
      openInNewTab,
    } = req.body;

    if (title) {
      navbar.title = title;
    }

    if (url) {
      navbar.url = url;
    }

    if (icon !== undefined) {
      navbar.icon = icon;
    }

    if (order !== undefined) {
      navbar.order = order;
    }

    if (isActive !== undefined) {
      navbar.isActive = isActive;
    }

    if (openInNewTab !== undefined) {
      navbar.openInNewTab = openInNewTab;
    }

    await navbar.save();

    res.status(200).json({
      success: true,
      message: "Navbar item updated successfully",
      navbar,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const deleteNavbar = async (req, res) => {
  try {
    const { id } = req.params;

    const navbar = await Navbar.findByIdAndDelete(id);

    if (!navbar) {
      return res.status(404).json({
        success: false,
        message: "Navbar item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Navbar item deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getNavbar,
  getAllNavbar,
  createNavbar,
  updateNavbar,
  deleteNavbar,
};