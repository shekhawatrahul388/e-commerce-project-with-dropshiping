const Category = require("../models/category");


const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      parentCategory,
      order,
      isActive,
      featured,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }


    let categorySlug = slug;

    if (!categorySlug) {
      categorySlug = name
        .toLowerCase()
        .trim()
        .replace(/ /g, "-");
    }

    const existingCategory = await Category.findOne({
      slug: categorySlug,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      slug: categorySlug,
      description,
      image,
      parentCategory,
      order,
      isActive,
      featured,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    })
      .populate("parentCategory")
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parentCategory")
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).populate(
      "parentCategory"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      slug,
      isActive: true,
    }).populate("parentCategory");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      slug,
      description,
      image,
      parentCategory,
      order,
      isActive,
      featured,
    } = req.body;

    if (name) {
      category.name = name;
    }

    if (slug) {
      const existingCategory = await Category.findOne({
        slug,
      });

      if (
        existingCategory &&
        existingCategory._id.toString() !== id
      ) {
        return res.status(400).json({
          success: false,
          message: "Slug already exists",
        });
      }

      category.slug = slug;
    }

    if (description) {
      category.description = description;
    }

    if (image) {
      category.image = image;
    }

    if (parentCategory) {
      category.parentCategory = parentCategory;
    }

    if (order !== undefined) {
      category.order = order;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    if (featured !== undefined) {
      category.featured = featured;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await Category.deleteMany({
      parentCategory: id,
    });

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
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
  createCategory,
  getCategories,
  getAllCategories,
  getSingleCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};