const multer = require("multer");
const path = require("path");

const {CloudinaryStorage,} = require("multer-storage-cloudinary");

const cloudinary =
  require("../config/Cloudnary");

const cloudinaryConfig = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
].map((key) => process.env[key]?.trim());

const hasCloudinaryConfig =
  cloudinaryConfig.every(Boolean) &&
  !cloudinaryConfig.includes("rahulsingh");



const cloudinaryStorage =
  new CloudinaryStorage({
    cloudinary,

    params: {
      folder:
        "ecommerce/products",

      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],

      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: "limit",
          quality: "auto",
        },
      ],
    },
  });

const localStorage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads/products"),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const storage = hasCloudinaryConfig
  ? cloudinaryStorage
  : localStorage;



const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      ),
      false
    );
  }
};



const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,

    files: 10,
  },
});

module.exports = upload;