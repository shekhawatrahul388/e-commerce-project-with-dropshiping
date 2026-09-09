const Banner = require("../models/Banner");


const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({
      isActive: true,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({
      order: 1,
    });

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      desktopImage,
      mobileImage,
      buttonText,
      buttonUrl,
      position,
      order,
      isActive,
      startDate,
      endDate,
    } = req.body;

    if (!title || !desktopImage) {
      return res.status(400).json({
        success: false,
        message: "Title and desktop image are required",
      });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      desktopImage,
      mobileImage,
      buttonText,
      buttonUrl,
      position,
      order,
      isActive,
      startDate,
      endDate,
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const {
      title,
      subtitle,
      desktopImage,
      mobileImage,
      buttonText,
      buttonUrl,
      position,
      order,
      isActive,
      startDate,
      endDate,
    } = req.body;

    banner.title = title || banner.title;
    banner.subtitle = subtitle || banner.subtitle;
    banner.desktopImage = desktopImage || banner.desktopImage;
    banner.mobileImage = mobileImage || banner.mobileImage;
    banner.buttonText = buttonText || banner.buttonText;
    banner.buttonUrl = buttonUrl || banner.buttonUrl;
    banner.position = position || banner.position;
    banner.order = order || banner.order;

    if (isActive !== undefined) {
      banner.isActive = isActive;
    }

    if (startDate !== undefined) {
      banner.startDate = startDate;
    }

    if (endDate !== undefined) {
      banner.endDate = endDate;
    }

    await banner.save();

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
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
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};