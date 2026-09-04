require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Store = require("./models/Store");

const DNS = require("dns");
DNS.setServers(["1.1.1.1" , "8.8.8.8"]);


const app = express();
app.set("trust proxy", 1);

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

const PORT = process.env.PORT || 2000;
const mongoUri = process.env.MONGO_URI;





  const userRoute = require("./router/userRoute")
  app.use("/api/user" , userRoute)


  const CategoryRouter = require("./router/categoryRoute")
  app.use("/api/category" , CategoryRouter)


    const productRouter = require("./router/productRoute")
  app.use("/api/product" , productRouter)


const wishlistRoute = require("./router/wishlistRouter")
app.use("/api/wishlist" , wishlistRoute)


const cartRoute = require("./router/cartRoute")
app.use("/api/cart" , cartRoute)



const adminRouter = require("./router/adminRoute");
app.use("/api/admin", adminRouter);


const admindeshboard = require("./router/admindeshboardRouter")
app.use("/api/admin", admindeshboard);


const uploadRoutes =
  require("./router/uploadRoute");

app.use(
  "/api/upload",
  uploadRoutes
);

app.use((error, req, res, next) => {
  console.error("REQUEST ERROR:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Image upload failed",
  });
});

const navbarRouter = require("./router/navbarRouter")
app.use("/api/navbar" , navbarRouter)


const siteSettingsRoutes = require("./router/siteSettingsRouter");
app.use("/api/settings", siteSettingsRoutes);


const footerRoutes = require("./router/footerRoute");
app.use("/api/footer", footerRoutes);


const menuRoutes = require("./router/menuRoute");
app.use("/api/menu", menuRoutes);


const bannerRoutes = require("./router/bannerRoute");
app.use("/api/banner", bannerRoutes);


const whatsappRoutes  = require("./router/whatsappRoute");
app.use("/api/whatsapp",whatsappRoutes);

const storeRoutes = require("./router/storeRoute");
app.use("/api/store", storeRoutes);

const dropshipperRoutes = require("./router/dropshipperRoute");
app.use("/api/dropshippers", dropshipperRoutes);


const addressRoutes = require("./router/addressRoute");
app.use("/api/address",addressRoutes);


const supplierRoutes =
  require("./router/supplierRoute");

app.use(
  "/api/supplier",
  supplierRoutes
);

const startServer = async () => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  for (const indexName of ["owner_1", "subdomain_1"]) {
    try {
      await Store.collection.dropIndex(indexName);
      console.log(`Removed obsolete stores index: ${indexName}`);
    } catch (error) {
      if (error.codeName !== "IndexNotFound" && error.code !== 27) {
        throw error;
      }
    }
  }

  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("MongoDB connection failed. Check MONGO_URI or start a local MongoDB instance.");
  console.error(error.message);
  process.exitCode = 1;
});


