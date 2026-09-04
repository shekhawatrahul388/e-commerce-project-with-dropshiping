const Menu = require("../models/Menu");


const getMenu = async (req, res) => {
  try {
    const menus = await Menu.find({
      isActive: true,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: menus,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getAllMenu = async (req, res) => {
  try {
    const menus = await Menu.find()
      .populate("parent")
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: menus,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const createMenu = async (req, res) => {
  try {
    const {
      title,
      url,
      type,
      parent,
      icon,
      order,
      isActive,
      openInNewTab,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Menu title is required",
      });
    }

    if (parent) {
      const parentMenu = await Menu.findById(parent);

      if (!parentMenu) {
        return res.status(404).json({
          success: false,
          message: "Parent menu not found",
        });
      }
    }

    const menu = await Menu.create({
      title,
      url: url || "#",
      type: type || "link",
      parent: parent || null,
      icon: icon || "",
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      openInNewTab: openInNewTab || false,
    });

    res.status(201).json({
      success: true,
      message: "Menu created successfully",
      data: menu,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    const {
      title,
      url,
      type,
      parent,
      icon,
      order,
      isActive,
      openInNewTab,
    } = req.body;

    if (title) {
      menu.title = title;
    }

    if (url) {
      menu.url = url;
    }

    if (type) {
      menu.type = type;
    }

    if (parent) {
      const parentMenu = await Menu.findById(parent);

      if (!parentMenu) {
        return res.status(404).json({
          success: false,
          message: "Parent menu not found",
        });
      }

      menu.parent = parent;
    }

    if (icon !== undefined) {
      menu.icon = icon;
    }

    if (order !== undefined) {
      menu.order = order;
    }

    if (isActive !== undefined) {
      menu.isActive = isActive;
    }

    if (openInNewTab !== undefined) {
      menu.openInNewTab = openInNewTab;
    }

    await menu.save();

    res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      data: menu,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    await Menu.updateMany(
      { parent: id },
      { parent: null }
    );

    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
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
  getMenu,
  getAllMenu,
  createMenu,
  updateMenu,
  deleteMenu,
};