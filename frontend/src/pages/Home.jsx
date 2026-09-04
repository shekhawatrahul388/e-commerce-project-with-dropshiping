import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  MessageCircle,
  Package,
  Truck,
  ShieldCheck,
  Headphones,
  Loader2,
  Eye,
} from "lucide-react";

import { toast } from "react-hot-toast";
import api from "../api/axios";



const getImageUrl = (image) => {
  if (!image) return "";


  if (typeof image === "object") {
    image =
      image.url ||
      image.secure_url ||
      image.path ||
      image.image ||
      "";
  }

  if (!image) return "";

  const imageString = String(image);


  if (
    imageString.startsWith("data:") ||
    imageString.startsWith("https://")
  ) {
    return imageString;
  }

  if (imageString.startsWith("http://")) {
    return imageString.replace("http://", "https://");
  }

  const baseUrl =
    import.meta.env.VITE_API_URL ||
    "https://dropshiping-products-backend-3.onrender.com/api";


  const serverUrl = baseUrl.replace(/\/api\/?$/, "");

  return `${serverUrl}/${imageString.replace(/^\/+/, "")}`;
};

const getResponseData = (result, keys = []) => {
  if (result.status === "rejected") {
    console.log("Home API error:", result.reason?.response?.data || result.reason?.message);
    return null;
  }

  let data = result.value.data;

  for (const key of keys) {
    if (data?.[key] !== undefined) {
      data = data[key];
      break;
    }
  }

  return data;
};



function ProductCard({ product, onInquiry }) {
  const navigate = useNavigate();

  const productId = product?._id || product?.id;

  const image = getImageUrl(
    product?.image || product?.images?.[0]
  );

  const price = Number(product?.price || 0);

  const oldPrice = Number(
    product?.oldPrice ||
      product?.mrp ||
      product?.comparePrice ||
      0
  );

  const rating = Number(product?.rating || 0);

  const discount =
    oldPrice > price && price > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;



  const handleProductClick = () => {
    if (!productId) {
      toast.error("Product not available");
      return;
    }

    navigate(`/products/${productId}`);
  };



  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      

      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product?.name || "Product"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package size={48} />
          </div>
        )}

        
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">
            {discount}% OFF
          </span>
        )}

        
        <button
          type="button"
          onClick={() =>
            toast("Wishlist feature coming next")
          }
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-50 shadow-sm transition"
        >
          <Heart size={18} />
        </button>

        
        <button
          type="button"
          onClick={handleProductClick}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-14 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-800 px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2"
        >
          <Eye size={15} />
          Quick View
        </button>
      </div>

      

      <div className="p-4">
        
        {product?.brand && (
          <p className="text-[11px] uppercase tracking-wider text-blue-600 font-bold mb-1">
            {product.brand}
          </p>
        )}

        
        <button
          type="button"
          onClick={handleProductClick}
          className="text-left w-full"
        >
          <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[48px] group-hover:text-blue-600 transition">
            {product?.name || "Product Name"}
          </h3>
        </button>

        
        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                className={
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>

          {rating > 0 && (
            <span className="text-xs text-gray-500">
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xl font-extrabold text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {oldPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{oldPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        
        <button
          type="button"
          onClick={() => onInquiry(product)}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition"
        >
          <MessageCircle size={17} />
          WhatsApp Inquiry
        </button>
      </div>
    </div>
  );
}



function Home() {
  const navigate = useNavigate();



  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [navbar, setNavbar] = useState(null);
  const [menu, setMenu] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [productLoading, setProductLoading] = useState(false);



  useEffect(() => {
    const loadHome = async () => {
      setLoading(true);
      setProductLoading(true);

      const results = await Promise.allSettled([
        api.get("/banner"),
        api.get("/category"),
        api.get("/product/all"),
        api.get("/navbar/all"),
        api.get("/menu"),
        api.get("/whatsapp/settings"),
      ]);

      const bannersData = getResponseData(results[0], ["banners", "data"]);
      const categoriesData = getResponseData(results[1], ["categories", "data"]);
      const productsData = getResponseData(results[2], ["products", "data"]);
      const navbarData = getResponseData(results[3], ["navbar", "data"]);
      const menuData = getResponseData(results[4], ["menus", "menu", "data"]);
      const whatsappData = getResponseData(results[5], ["settings", "data"]);

      setBanners(Array.isArray(bannersData) ? bannersData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setNavbar(navbarData || null);
      setMenu(Array.isArray(menuData) ? menuData : []);
      setWhatsappNumber(
        whatsappData?.phone ||
          whatsappData?.phoneNumber ||
          whatsappData?.whatsappNumber ||
          whatsappData?.number ||
          ""
      );

      setProductLoading(false);
      setLoading(false);
    };

    loadHome();
  }, []);



  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setBannerIndex(
        (previous) => (previous + 1) % banners.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);



  const nextBanner = () => {
    if (!banners.length) return;

    setBannerIndex(
      (previous) => (previous + 1) % banners.length
    );
  };



  const previousBanner = () => {
    if (!banners.length) return;

    setBannerIndex((previous) =>
      previous === 0
        ? banners.length - 1
        : previous - 1
    );
  };



  const handleInquiry = async (product) => {
    const productId = product?._id || product?.id;


    try {
      if (productId) {
        await api.post("/whatsapp/product-inquiry", {
          productId,
          productName: product?.name || "",
          price: product?.price || 0,
        });
      }
    } catch (error) {
      console.log(
        "Inquiry API error:",
        error?.response?.data || error?.message
      );
    }


    let number = String(whatsappNumber || "").replace(
      /\D/g,
      ""
    );

    if (!number) {
      toast.error("WhatsApp number is not configured");
      return;
    }


    if (number.length === 10) {
      number = `91${number}`;
    }

    const message = encodeURIComponent(
      `Hello, I am interested in this product.

Product: ${product?.name || ""}

Price: ₹${product?.price || ""}

Please share more details.`
    );

    const whatsappUrl =
      `https://wa.me/${number}?text=${message}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };



  const handleCategoryClick = (category) => {
    if (!category) return;

    const slug = category?.slug;

    if (slug) {
      navigate(`/categories/${slug}`);
      return;
    }

    const categoryId =
      category?._id || category?.id;

    if (categoryId) {
      navigate(`/category/${categoryId}`);
    }
  };



  const siteName =
    navbar?.siteName ||
    navbar?.name ||
    navbar?.companyName ||
    "MyStore";



  const currentBanner = banners[bannerIndex];

  const bannerImage = getImageUrl(
    currentBanner?.image ||
      currentBanner?.bannerImage ||
      currentBanner?.desktopImage
  );



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-gray-600 font-medium">
            Loading store...
          </p>
        </div>
      </div>
    );
  }



  return (
    <main className="bg-gray-50 min-h-screen">

      

      <section className="relative overflow-hidden">
        {banners.length > 0 ? (
          <div className="relative w-full">

            
            <div className="relative h-[420px] sm:h-[480px] lg:h-[560px] overflow-hidden">

              {bannerImage ? (
                <img
                  src={bannerImage}
                  alt={
                    currentBanner?.title ||
                    "Banner"
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />
              )}

              
              <div className="absolute inset-0 bg-black/35" />

              
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">

                  <div className="max-w-2xl text-white">

                    {currentBanner?.subtitle && (
                      <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] mb-4 text-white/90">
                        {currentBanner.subtitle}
                      </p>
                    )}

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
                      {currentBanner?.title ||
                        `Welcome to ${siteName}`}
                    </h1>

                    {currentBanner?.description && (
                      <p className="mt-5 text-base sm:text-lg text-white/90 max-w-xl leading-relaxed">
                        {currentBanner.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 mt-7">

                      <Link
                        to={
                          currentBanner?.link ||
                            currentBanner?.buttonUrl ||
                          "/products"
                        }
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
                      >
                        Shop Now
                        <ArrowRight size={18} />
                      </Link>

                      <Link
                        to="/categories"
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur border border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition"
                      >
                        Explore Categories
                      </Link>

                    </div>
                  </div>
                </div>
              </div>

              
              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousBanner}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    type="button"
                    onClick={nextBanner}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            
            {banners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setBannerIndex(index)
                    }
                    className={`h-2 rounded-full transition-all ${
                      index === bannerIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (

          

          <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">

              <div className="max-w-2xl text-white">

                <p className="text-blue-100 font-bold uppercase tracking-widest text-sm">
                  Welcome to {siteName}
                </p>

                <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                  Discover products you'll love.
                </h1>

                <p className="mt-6 text-lg text-blue-100 max-w-xl">
                  Browse our collection of quality
                  products and find something
                  perfect for you.
                </p>

                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 mt-8 px-7 py-4 bg-white text-blue-700 rounded-xl font-bold hover:bg-gray-100 transition shadow-xl"
                >
                  Shop Now
                  <ArrowRight size={19} />
                </Link>

              </div>
            </div>
          </div>
        )}
      </section>

      

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x-0 lg:divide-x divide-gray-100">

            
            <div className="flex items-center gap-3 py-6 px-3 lg:px-6">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck size={22} />
              </div>

              <div>
                <p className="font-bold text-gray-900 text-sm">
                  Fast Delivery
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Quick & reliable
                </p>
              </div>
            </div>

            
            <div className="flex items-center gap-3 py-6 px-3 lg:px-6">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="font-bold text-gray-900 text-sm">
                  Quality Products
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Trusted products
                </p>
              </div>
            </div>

            
            <div className="flex items-center gap-3 py-6 px-3 lg:px-6">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Package size={22} />
              </div>

              <div>
                <p className="font-bold text-gray-900 text-sm">
                  Wide Collection
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Many products
                </p>
              </div>
            </div>

            
            <div className="flex items-center gap-3 py-6 px-3 lg:px-6">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Headphones size={22} />
              </div>

              <div>
                <p className="font-bold text-gray-900 text-sm">
                  Customer Support
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  We're here to help
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      

      {categories.length > 0 && (
        <section className="py-14 sm:py-16">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex items-end justify-between gap-4 mb-8">

              <div>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">
                  Explore
                </p>

                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">
                  Shop by Category
                </h2>

                <p className="text-gray-500 mt-2">
                  Find products from your favorite
                  categories.
                </p>
              </div>

              <Link
                to="/categories"
                className="hidden sm:inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
              >
                View All
                <ArrowRight size={17} />
              </Link>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">

              {categories.slice(0, 12).map((category) => {
                const image = getImageUrl(
                  category?.image
                );

                const categoryId =
                  category?._id || category?.id;

                return (
                  <button
                    type="button"
                    key={categoryId}
                    onClick={() =>
                      handleCategoryClick(category)
                    }
                    className="group bg-white border border-gray-100 rounded-2xl p-3 hover:border-blue-200 hover:shadow-lg transition-all text-center"
                  >

                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">

                      {image ? (
                        <img
                          src={image}
                          alt={
                            category?.name ||
                            "Category"
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={35} />
                        </div>
                      )}

                    </div>

                    <h3 className="mt-3 font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-blue-600 transition">
                      {category?.name || "Category"}
                    </h3>

                  </button>
                );
              })}

            </div>

            <Link
              to="/categories"
              className="sm:hidden mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-gray-200 text-blue-600 font-bold"
            >
              View All Categories
              <ArrowRight size={17} />
            </Link>

          </div>
        </section>
      )}

      

      <section className="py-14 sm:py-16 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between gap-4 mb-8">

            <div>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">
                Our Collection
              </p>

              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">
                Featured Products
              </h2>

              <p className="text-gray-500 mt-2">
                Explore some of our latest products.
              </p>
            </div>

            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
            >
              View All
              <ArrowRight size={17} />
            </Link>

          </div>

          {productLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2
                size={35}
                className="animate-spin text-blue-600"
              />
            </div>
          ) : products.length > 0 ? (

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">

              {products
                .filter(
                  (product) =>
                    product?.isActive !== false
                )
                .slice(0, 8)
                .map((product) => (
                  <ProductCard
                    key={
                      product?._id ||
                      product?.id
                    }
                    product={product}
                    onInquiry={handleInquiry}
                  />
                ))}

            </div>

          ) : (

            <div className="py-20 text-center">

              <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Package size={30} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No products available
              </h3>

              <p className="mt-1 text-gray-500">
                Products will appear here once
                they are added.
              </p>

            </div>
          )}

          <Link
            to="/products"
            className="sm:hidden mt-8 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>

        </div>
      </section>

      

      <section className="py-16">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 p-7 sm:p-10 lg:p-14">

            
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10" />

            <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-white/10" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

              <div className="text-white max-w-2xl">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-sm font-bold mb-4">
                  <MessageCircle size={16} />
                  Quick Inquiry
                </div>

                <h2 className="text-3xl sm:text-4xl font-black">
                  Have a question about a product?
                </h2>

                <p className="mt-3 text-green-50 leading-relaxed">
                  Contact us directly on WhatsApp
                  and get product details, pricing
                  and availability.
                </p>

              </div>

              {whatsappNumber ? (

                <button
                  type="button"
                  onClick={() => {
                    let number = String(
                      whatsappNumber
                    ).replace(/\D/g, "");

                    if (number.length === 10) {
                      number = `91${number}`;
                    }

                    const url =
                      `https://wa.me/${number}`;

                    window.open(
                      url,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white text-green-600 font-black shadow-xl hover:bg-green-50 transition"
                >
                  <MessageCircle size={21} />
                  Chat on WhatsApp
                </button>

              ) : (

                <Link
                  to="/products"
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white text-green-600 font-black shadow-xl hover:bg-green-50 transition"
                >
                  Browse Products
                  <ArrowRight size={20} />
                </Link>

              )}

            </div>
          </div>
        </div>
      </section>

      

      <section className="pb-16">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="rounded-3xl bg-gray-900 p-8 sm:p-12 text-center">

            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto">
              <Package size={25} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mt-5">
              Find something you love
            </h2>

            <p className="text-gray-400 mt-3 max-w-lg mx-auto">
              Browse our complete collection and
              discover your next favorite product.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-7 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
            >
              Explore Products
              <ArrowRight size={18} />
            </Link>

          </div>
        </div>
      </section>

    </main>
  );
}

export default Home;