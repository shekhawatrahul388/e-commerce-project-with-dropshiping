import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  MessageCircle,
  Star,
  Eye,
  Check,
  Loader2,
  Store,
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

  if (
    image.startsWith("data:") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("http://")) {
    return image.replace("http://", "https://");
  }

  const baseUrl =
    import.meta.env.VITE_API_URL ||
    "https://dropshiping-products-backend-3.onrender.com/api";

  return `${baseUrl.replace(/\/api\/?$/, "")}/${String(
    image
  ).replace(/^\/+/, "")}`;
};



function ProductCard({ product }) {
  const navigate = useNavigate();
  const productId = product?._id || product?.id;

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [addingCart, setAddingCart] =
    useState(false);

  const [loadingWishlist, setLoadingWishlist] =
    useState(false);

  const [addingStore, setAddingStore] =
    useState(false);

  const [imageLoaded, setImageLoaded] =
    useState(false);



  const name =
    product.name || "Product";

  const description =
    product.description || "";

  const image = getImageUrl(
    product.image ||
      product.images?.[0]
  );

  const price =
    Number(product.sellingPrice ?? product.price) || 0;

  const originalPrice =
    Number(
      product.originalPrice ||
      product.salePrice ||
        product.mrp ||
        product.oldPrice ||
        product.comparePrice ||
        0
    );

  const stock =
    Number(product.stock ?? 0);

  const rating =
    Number(
      product.rating ||
        product.averageRating ||
        0
    );

  const reviews =
    Number(
      product.reviewsCount ||
        product.reviewCount ||
        product.reviews?.length ||
        0
    );

  const brand =
    product.brand || "";

  const category =
    typeof product.category === "object"
      ? product.category?.name || ""
      : product.category || "";

  const discount =
    originalPrice > price
      ? Math.round(
          ((originalPrice - price) /
            originalPrice) *
            100
        )
      : Number(product.discount || 0);

  const outOfStock = stock <= 0;



  useEffect(() => {
    if (!productId) return;

    try {
      const wishlist = JSON.parse(
        localStorage.getItem("wishlist") ||
          "[]"
      );

      const exists = wishlist.some(
        (item) =>
          item === productId ||
          item?._id === productId
      );

      setIsWishlisted(exists);
    } catch (error) {
      console.log(
        "Wishlist check error:",
        error
      );
    }
  }, [productId]);

  if (!product) return null;



  const handleProductClick = () => {
    if (!productId) return;

    navigate(
      `/products/${productId}`
    );
  };



  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token =
      localStorage.getItem("token");

    if (!token) {
      toast.error(
        "Please login to add products to cart"
      );

      navigate("/send-otp", {
        state: {
          from: `/products/${productId}`,
        },
      });

      return;
    }

    if (!productId) {
      toast.error(
        "Product ID is missing"
      );
      return;
    }

    if (outOfStock) {
      toast.error(
        "This product is out of stock"
      );
      return;
    }

    try {
      setAddingCart(true);

      const response =
        await api.post(
          "/cart/add",
          {
            productId,
            quantity: 1,
            storeSlug: product.storeSlug || "",
          }
        );

      toast.success(
        response.data?.message ||
          "Product added to cart"
      );
    } catch (error) {
      console.log(
        "Add cart error:",
        error?.response?.data ||
          error.message
      );

      if (
        error?.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        navigate("/send-otp");
        return;
      }

      toast.error(
        error?.response?.data?.message ||
          "Unable to add product to cart"
      );
    } finally {
      setAddingCart(false);
    }
  };



  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token =
      localStorage.getItem("token");

    if (!token) {
      toast.error(
        "Please login to use wishlist"
      );

      navigate("/send-otp", {
        state: {
          from: `/products/${productId}`,
        },
      });

      return;
    }

    if (!productId) {
      toast.error(
        "Product ID is missing"
      );
      return;
    }

    try {
      setLoadingWishlist(true);

      const oldWishlist =
        JSON.parse(
          localStorage.getItem(
            "wishlist"
          ) || "[]"
        );

      if (isWishlisted) {
        const updatedWishlist =
          oldWishlist.filter(
            (item) =>
              item !== productId &&
              item?._id !== productId
          );

        localStorage.setItem(
          "wishlist",
          JSON.stringify(
            updatedWishlist
          )
        );

        setIsWishlisted(false);

        toast.success(
          "Removed from wishlist"
        );
      } else {
        const updatedWishlist = [
          ...oldWishlist,
          productId,
        ];

        localStorage.setItem(
          "wishlist",
          JSON.stringify(
            updatedWishlist
          )
        );

        setIsWishlisted(true);

        toast.success(
          "Added to wishlist"
        );
      }
    } catch (error) {
      console.log(
        "Wishlist error:",
        error
      );

      toast.error(
        "Wishlist update failed"
      );
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleAddToStore = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem("token")) {
      toast.error("Please login to create a store");
      navigate("/send-otp", { state: { from: "/products" } });
      return;
    }
    try {
      setAddingStore(true);
      await api.post("/dropshippers/products", { productId, sellingPrice: price });
      toast.success("Product added to your store");
    } catch (error) {
      if (error?.response?.status === 404) navigate("/create-store");
      else toast.error(error?.response?.data?.message || "Unable to add product to store");
    } finally {
      setAddingStore(false);
    }
  };



  const whatsappNumber =
    localStorage.getItem(
      "whatsappNumber"
    ) || "";

  const cleanWhatsapp =
    String(whatsappNumber).replace(
      /\D/g,
      ""
    );

  let whatsappPhone =
    cleanWhatsapp;

  if (whatsappPhone.length === 10) {
    whatsappPhone =
      `91${whatsappPhone}`;
  }

  const whatsappMessage =
    `Hello, I am interested in this product.\n\n` +
    `Product: ${name}\n` +
    `Price: ₹${price.toLocaleString(
      "en-IN"
    )}\n` +
    `Product ID: ${productId}\n\n` +
    `Please share more details.`;

  const whatsappUrl =
    `https://wa.me/${
      whatsappPhone || ""
    }?text=${encodeURIComponent(
      whatsappMessage
    )}`;



  const roundedRating = Math.round(
    Math.min(Math.max(rating, 0), 5)
  );



  return (
    <article className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      
      
      

      <div
        onClick={handleProductClick}
        className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer"
      >

        

        {discount > 0 && (
          <div className="absolute left-3 top-3 z-20 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-black shadow-md">
            {discount}% OFF
          </div>
        )}

        

        {outOfStock && (
          <div className="absolute inset-0 z-10 bg-black/45 flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-white text-gray-900 font-black text-sm shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        

        <button
          type="button"
          onClick={handleWishlist}
          disabled={loadingWishlist}
          className={`absolute right-3 top-3 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white text-gray-600 hover:text-red-500 hover:bg-red-50"
          }`}
          title={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {loadingWishlist ? (
            <Loader2
              size={19}
              className="animate-spin"
            />
          ) : (
            <Heart
              size={19}
              fill={
                isWishlisted
                  ? "currentColor"
                  : "none"
              }
            />
          )}
        </button>

        

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
          </div>
        )}

        

        {image ? (
          <img
            src={image}
            alt={name}
            onLoad={() =>
              setImageLoaded(true)
            }
            onError={(e) => {
              e.currentTarget.style.display =
                "none";

              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded
                ? "opacity-100"
                : "opacity-0"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={45} />
          </div>
        )}

        

        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick();
            }}
            className="w-full h-10 rounded-xl bg-white/95 backdrop-blur text-gray-800 font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <Eye size={17} />
            Quick View
          </button>
        </div>
      </div>

      
      
      

      <div className="p-4">

        

        {brand && (
          <p className="text-[11px] uppercase tracking-wider text-blue-600 font-black mb-1">
            {brand}
          </p>
        )}

        

        {category && (
          <p className="text-xs text-gray-400 mb-1">
            {category}
          </p>
        )}

        

        <Link
          to={`/products/${productId}`}
          onClick={(e) =>
            e.stopPropagation()
          }
          className="block"
        >
          <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[44px] hover:text-blue-600 transition">
            {name}
          </h3>
        </Link>

        

        {description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {description}
          </p>
        )}

        

        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <=
                    roundedRating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              )
            )}
          </div>

          {rating > 0 && (
            <span className="text-xs font-bold text-gray-700">
              {rating.toFixed(1)}
            </span>
          )}

          {reviews > 0 && (
            <span className="text-xs text-gray-400">
              ({reviews})
            </span>
          )}
        </div>

        

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xl font-black text-gray-900">
            ₹
            {price.toLocaleString(
              "en-IN"
            )}
          </span>

          {originalPrice >
            price && (
            <span className="text-sm text-gray-400 line-through">
              ₹
              {originalPrice.toLocaleString(
                "en-IN"
              )}
            </span>
          )}
        </div>

        

        {!outOfStock && (
          <div className="mt-2">
            {stock <= 5 ? (
              <p className="text-xs text-orange-600 font-bold">
                Only {stock} left
              </p>
            ) : (
              <p className="text-xs text-green-600 font-semibold">
                In Stock
              </p>
            )}
          </div>
        )}

        

        <div className="grid grid-cols-2 gap-2 mt-4">

          

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              addingCart ||
              outOfStock
            }
            className={`h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              outOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100"
            }`}
          >
            {addingCart ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <ShoppingCart
                size={18}
              />
            )}

            {addingCart
              ? "Adding..."
              : outOfStock
              ? "Out of Stock"
              : "Add to Cart"}
          </button>

          

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) =>
              e.stopPropagation()
            }
            className="h-11 rounded-xl bg-green-50 text-green-600 border border-green-100 hover:bg-green-500 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <MessageCircle
              size={18}
            />

            <span className="hidden sm:inline">
              Inquiry
            </span>

            <span className="sm:hidden">
              Chat
            </span>
          </a>
        </div>

        <button
          type="button"
          onClick={handleAddToStore}
          disabled={addingStore || outOfStock}
          className="mt-2 h-10 w-full rounded-xl border border-blue-200 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {addingStore ? <Loader2 size={16} className="animate-spin" /> : <Store size={16} />}
          {addingStore ? "Adding..." : "Add to My Store"}
        </button>
      </div>

      

      {isWishlisted && (
        <div className="absolute bottom-4 right-4 pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md">
            <Check size={14} />
          </div>
        </div>
      )}
    </article>
  );
}

export default ProductCard;