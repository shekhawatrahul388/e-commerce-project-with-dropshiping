import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  MessageCircle,
  Package,
  Check,
  AlertCircle,
  Loader2,
  Share2,
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

  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "https://dropshiping-products-backend-3.onrender.com/api";

  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${baseUrl}/${imageString.replace(/^\/+/, "")}`;
};



const getProductImages = (product) => {
  if (!product) return [];

  let images = [];

  if (Array.isArray(product.images)) {
    images = [...product.images];
  }

  if (product.image) {
    const alreadyExists = images.some(
      (img) => JSON.stringify(img) === JSON.stringify(product.image)
    );

    if (!alreadyExists) {
      images.unshift(product.image);
    }
  }

  return images.map(getImageUrl).filter(Boolean);
};



function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const [inquiryLoading, setInquiryLoading] = useState(false);



  const loadProduct = async () => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/product/single/${id}`);

      const data =
        response.data?.product ||
        response.data?.data ||
        response.data;

      if (!data) {
        throw new Error("Product not found");
      }

      setProduct(data);
      setSelectedImage(0);
      setQuantity(1);
    } catch (err) {
      console.error(
        "Product details error:",
        err?.response?.data || err.message
      );

      setError(
        err?.response?.data?.message ||
          "Product not found."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);



  const checkWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token || !id) {
      setInWishlist(false);
      return;
    }

    try {
      const response = await api.get("/wishlist");

      const data =
        response.data?.wishlist ||
        response.data?.data ||
        response.data;

      if (!Array.isArray(data)) {
        setInWishlist(false);
        return;
      }

      const exists = data.some((item) => {
        const productId =
          typeof item === "string"
            ? item
            : item?.product?._id ||
              item?.productId ||
              item?._id;

        return String(productId) === String(id);
      });

      setInWishlist(exists);
    } catch (err) {
      console.error(
        "Wishlist check error:",
        err?.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    checkWishlist();
  }, [id]);



  const addToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return false;
    }

    if (!product?._id) {
      toast.error("Product not available");
      return false;
    }

    try {
      setCartLoading(true);

      await api.post("/cart/add", {
        productId: product._id,
        quantity,
      });

      toast.success(
        `${quantity} item${quantity > 1 ? "s" : ""} added to cart`
      );

      return true;
    } catch (err) {
      console.error(
        "Add cart error:",
        err?.response?.data || err.message
      );

      toast.error(
        err?.response?.data?.message ||
          "Unable to add product to cart"
      );

      return false;
    } finally {
      setCartLoading(false);
    }
  };



  const goToCart = async () => {
    const success = await addToCart();

    if (success) {
      navigate("/cart");
    }
  };



  const toggleWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!product?._id) {
      toast.error("Product not available");
      return;
    }

    try {
      setWishlistLoading(true);

      if (inWishlist) {
        await api.delete(
          `/wishlist/remove/${product._id}`
        );

        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post("/wishlist/add", {
          productId: product._id,
        });

        setInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error(
        "Wishlist error:",
        err?.response?.data || err.message
      );

      toast.error(
        err?.response?.data?.message ||
          "Wishlist update failed"
      );
    } finally {
      setWishlistLoading(false);
    }
  };



  const sendWhatsappInquiry = async () => {
    if (!product) return;

    try {
      setInquiryLoading(true);

      const response = await api.get("/whatsapp/settings");

      const settings =
        response.data?.settings ||
        response.data?.data ||
        response.data;

      const number =
        settings?.phone ||
        settings?.whatsappNumber ||
        settings?.number;

      if (!number) {
        toast.error(
          "WhatsApp number is not configured"
        );
        return;
      }

      const cleanNumber = String(number).replace(/\D/g, "");

      if (!cleanNumber) {
        toast.error("Invalid WhatsApp number");
        return;
      }

      const message = `
Hello, I am interested in this product.

Product: ${product.name}
Price: ₹${Number(product.price || 0).toLocaleString("en-IN")}
Quantity: ${quantity}
Product ID: ${product._id}

Please provide more details.
      `.trim();

      const whatsappUrl =
        `https://wa.me/${cleanNumber}` +
        `?text=${encodeURIComponent(message)}`;

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (err) {
      console.error(
        "WhatsApp inquiry error:",
        err?.response?.data || err.message
      );

      toast.error("Unable to open WhatsApp");
    } finally {
      setInquiryLoading(false);
    }
  };



  const handleShare = async () => {
    if (!product) return;

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied");
      } else {
        toast.error("Sharing is not supported");
      }
    } catch (err) {
      console.log("Share cancelled");
    }
  };



  const stock = Number(product?.stock || 0);

  const increaseQuantity = () => {
    setQuantity((prev) => {
      if (prev < stock) {
        return prev + 1;
      }

      return prev;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => {
      if (prev > 1) {
        return prev - 1;
      }

      return 1;
    });
  };



  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />

          <div className="grid lg:grid-cols-2 gap-10 mt-8">
            <div>
              <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />

              <div className="grid grid-cols-5 gap-3 mt-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="aspect-square bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-28 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-14 w-full bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }



  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white max-w-md w-full rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle size={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mt-5">
            Product Not Found
          </h1>

          <p className="text-gray-500 mt-2">
            {error ||
              "This product may have been removed."}
          </p>

          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={loadProduct}
              className="px-5 py-3 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
            >
              Try Again
            </button>

            <Link
              to="/products"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Products
            </Link>
          </div>
        </div>
      </main>
    );
  }



  const images = getProductImages(product);

  const price = Number(product.price || 0);

  const oldPrice = Number(
    product.oldPrice ||
      product.mrp ||
      product.originalPrice ||
      0
  );

  const discount =
    oldPrice > price
      ? Math.round(
          ((oldPrice - price) / oldPrice) * 100
        )
      : 0;

  const total = price * quantity;

  const category =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const isInStock = stock > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              to="/"
              className="hover:text-blue-600"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              to="/products"
              className="hover:text-blue-600"
            >
              Products
            </Link>

            {category && (
              <>
                <span>/</span>

                <span className="text-gray-900 truncate">
                  {category}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      

      <section className="py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          

          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

            

            <div>
              <div className="relative bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="aspect-square flex items-center justify-center">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImage] || images[0]}
                      alt={product.name || "Product"}
                      className="w-full h-full object-contain p-8 sm:p-12"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Package
                      size={90}
                      className="text-gray-300"
                    />
                  )}
                </div>

                

                {discount > 0 && (
                  <span className="absolute top-5 left-5 bg-red-500 text-white px-3 py-1.5 rounded-xl text-sm font-black">
                    {discount}% OFF
                  </span>
                )}

                

                <button
                  onClick={handleShare}
                  className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-600"
                  title="Share"
                >
                  <Share2 size={19} />
                </button>
              </div>

              

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {images.slice(0, 5).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() =>
                        setSelectedImage(index)
                      }
                      className={`aspect-square rounded-xl overflow-hidden bg-white border-2 ${
                        selectedImage === index
                          ? "border-blue-600"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            

            <div>

              

              {product.brand && (
                <p className="text-sm font-black uppercase tracking-wider text-blue-600">
                  {product.brand}
                </p>
              )}

              

              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 leading-tight">
                {product.name}
              </h1>

              

              {category && (
                <p className="text-sm text-gray-500 mt-3">
                  Category:{" "}
                  <span className="font-bold text-gray-700">
                    {category}
                  </span>
                </p>
              )}

              

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <span className="text-3xl font-black text-gray-900">
                  ₹{price.toLocaleString("en-IN")}
                </span>

                {oldPrice > price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{oldPrice.toLocaleString("en-IN")}
                    </span>

                    <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-black">
                      Save ₹
                      {(oldPrice - price).toLocaleString("en-IN")}
                    </span>
                  </>
                )}
              </div>

              

              <div className="mt-5">
                {isInStock ? (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-black">
                    <Check size={17} />

                    In Stock

                    <span className="font-medium text-green-600">
                      ({stock} available)
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-black">
                    <AlertCircle size={17} />
                    Out of Stock
                  </div>
                )}
              </div>

              

              {product.description && (
                <div className="mt-7 pt-7 border-t border-gray-200">
                  <h2 className="font-black text-gray-900 text-lg">
                    Description
                  </h2>

                  <p className="text-gray-600 leading-7 mt-3 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              

              {isInStock && (
                <div className="mt-7">
                  <p className="text-sm font-black text-gray-900 mb-3">
                    Quantity
                  </p>

                  <div className="flex items-center">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-11 h-11 rounded-l-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                    >
                      <Minus size={17} />
                    </button>

                    <div className="w-14 h-11 border-y border-gray-200 bg-white flex items-center justify-center font-black">
                      {quantity}
                    </div>

                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= stock}
                      className="w-11 h-11 rounded-r-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
              )}

              

              {isInStock && (
                <div className="flex items-center justify-between mt-5 p-4 rounded-2xl bg-blue-50">
                  <span className="text-sm font-bold text-gray-600">
                    Total
                  </span>

                  <span className="text-xl font-black text-blue-700">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              

              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <button
                  onClick={addToCart}
                  disabled={!isInStock || cartLoading}
                  className="min-h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cartLoading ? (
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`min-h-[52px] rounded-xl border font-black flex items-center justify-center gap-2 transition ${
                    inWishlist
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:text-red-500"
                  }`}
                >
                  {wishlistLoading ? (
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                  ) : (
                    <>
                      <Heart
                        size={20}
                        fill={
                          inWishlist
                            ? "currentColor"
                            : "none"
                        }
                      />

                      {inWishlist
                        ? "Wishlisted"
                        : "Wishlist"}
                    </>
                  )}
                </button>
              </div>

              

              {isInStock && (
                <button
                  onClick={goToCart}
                  disabled={cartLoading}
                  className="w-full mt-3 min-h-[52px] rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 font-black transition disabled:opacity-50"
                >
                  {cartLoading
                    ? "Adding..."
                    : "Buy / View Cart"}
                </button>
              )}

              

              <button
                onClick={sendWhatsappInquiry}
                disabled={inquiryLoading}
                className="w-full mt-3 min-h-[52px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-black flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {inquiryLoading ? (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <>
                    <MessageCircle size={20} />
                    WhatsApp Inquiry
                  </>
                )}
              </button>

              

              <div className="grid grid-cols-2 gap-3 mt-7">
                <div className="p-4 rounded-2xl bg-white border border-gray-100">
                  <Package
                    size={20}
                    className="text-blue-600"
                  />

                  <p className="font-black text-gray-900 text-sm mt-2">
                    Quality Product
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Carefully selected
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-100">
                  <Check
                    size={20}
                    className="text-green-600"
                  />

                  <p className="font-black text-gray-900 text-sm mt-2">
                    Secure Shopping
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Safe & reliable
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;