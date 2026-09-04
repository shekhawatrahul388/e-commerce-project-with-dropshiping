const cloudinary =
  require("../config/Cloudnary");

const getImageUrl = (req, file) => {
  if (file.path.startsWith("http")) {
    return file.path;
  }

  return `https://${req.get("host")}/uploads/products/${file.filename}`;
};



const uploadSingleImage = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select an image",
      });
    }

    res.status(200).json({
      success: true,

      message:
        "Image uploaded successfully",

      image: {
        url: getImageUrl(req, req.file),

        publicId:
          req.file.filename,

        originalName:
          req.file.originalname,

        size:
          req.file.size,

        type:
          req.file.mimetype,
      },
    });
  } catch (error) {
    console.error(
      "Single Upload Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to upload image",
    });
  }
};



const uploadMultipleImages =
  async (req, res) => {
    try {
      if (
        !req.files ||
        req.files.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select images",
        });
      }

      const images =
        req.files.map(
          (file) => ({
            url: getImageUrl(req, file),

            publicId:
              file.filename,

            originalName:
              file.originalname,

            size:
              file.size,

            type:
              file.mimetype,
          })
        );

      res.status(200).json({
        success: true,

        message:
          `${images.length} images uploaded successfully`,

        count:
          images.length,

        images,
      });
    } catch (error) {
      console.error(
        "Multiple Upload Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to upload images",
      });
    }
  };



const deleteImage = async (
  req,
  res
) => {
  try {
    const { publicId } =
      req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message:
          "Public ID is required",
      });
    }

    await cloudinary.uploader.destroy(
      publicId
    );

    res.status(200).json({
      success: true,

      message:
        "Image deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Image Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete image",
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
};