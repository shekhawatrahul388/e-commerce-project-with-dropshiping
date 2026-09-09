require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Store = require("./models/Store");
// const DNS = require("dns");
// DNS.setServers(["1.1.1.1"]);

const dnsServers = process.env.MONGO_DNS_SERVERS
  ?.split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers?.length) {
  require("dns").setServers(dnsServers);
}

const app = express();
app.use(cors());
app.use(express.json());



app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

const mongoUri = process.env.MONGO_URI;
const PORT = process.env.PORT || 2000;





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

const connectToMongo = async (attempt = 1) => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
    });
  } catch (error) {
    if (attempt >= 5) {
      throw error;
    }

    const delay = Math.min(attempt * 2000, 8000);
    console.error(
      `MongoDB connection attempt ${attempt} failed: ${error.message}. Retrying in ${delay / 1000}s...`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectToMongo(attempt + 1);
  }
};

const startServer = async () => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  await connectToMongo();

  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("MongoDB connection failed:", error.message);
  process.exitCode = 1;
});

