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
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useCart } from "../context/CartContext";



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



function ProductCard({ product, hideStoreAction = false }) {
  const navigate = useNavigate();
  const {
    addToCart,
    cartItems,
    updateQuantity,
    updating,
  } = useCart();
  const productId = product?._id || product?.id;

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [addingCart, setAddingCart] =
    useState(false);

  const [loadingWishlist, setLoadingWishlist] =
    useState(false);

  const [imageLoaded, setImageLoaded] =
    useState(false);

  const [hasStore, setHasStore] = useState(false);
  const [isInStore, setIsInStore] = useState(false);
  const [addingToStore, setAddingToStore] = useState(false);



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

  const cartItem = cartItems?.find((item) => {
    const itemProductId = item?.product?._id || item?.product?.id || item?.productId;
    return String(itemProductId) === String(productId);
  });

  const cartQuantity = Number(cartItem?.quantity || 0);



  useEffect(() => {
    if (!productId) return;

    if (!localStorage.getItem("token")) return;

    const loadWishlistStatus = async () => {
      try {
        const response = await api.get("/wishlist");
        const data = response.data?.wishlist || response.data?.data || response.data;
        const products = Array.isArray(data)
          ? data
          : data?.products || data?.items || [];

        setIsWishlisted(products.some((item) => {
          const itemId =
            item?._id ||
            item?.id ||
            item?.product?._id ||
            item?.product?.id ||
            item?.productId;

          return String(itemId) === String(productId);
        }));
      } catch (error) {
        console.log("Wishlist check error:", error?.response?.data || error.message);
      }
    };

    loadWishlistStatus();
    window.addEventListener("wishlist-updated", loadWishlistStatus);

    return () => {
      window.removeEventListener("wishlist-updated", loadWishlistStatus);
    };
  }, [productId]);

  useEffect(() => {
    if (!productId || !localStorage.getItem("token")) return;

    let active = true;

    Promise.all([
      api.get("/dropshippers/me"),
      api.get("/dropshippers/products"),
    ])
      .then(([storeResponse, productsResponse]) => {
        if (!active) return;

        const store = storeResponse.data?.store;
        const products = productsResponse.data?.products || [];
        const selected = products.some((item) => {
          const selectedProduct = item?.product;
          const selectedId =
            selectedProduct?._id ||
            selectedProduct?.id ||
            item?.productId;

          return String(selectedId) === String(productId);
        });

        setHasStore(Boolean(store));
        setIsInStore(selected);
      })
      .catch(() => {
        if (active) {
          setHasStore(false);
          setIsInStore(false);
        }
      });

    return () => {
      active = false;
    };
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

      if (typeof addToCart === "function") {
        await addToCart(productId, 1);
      } else {
        await api.post("/cart/add", {
          productId,
          quantity: 1,
          storeSlug: product.storeSlug || "",
        });
        toast.success("Product added to cart");
      }
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

  const handleQuantityChange = async (e, quantity) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem || quantity < 0 || quantity > stock) return;
    await updateQuantity(productId, quantity);
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

      if (isWishlisted) {
        await api.delete(`/wishlist/remove/${productId}`);

        setIsWishlisted(false);
        window.dispatchEvent(new Event("wishlist-updated"));

        toast.success(
          "Removed from wishlist"
        );
      } else {
        await api.post("/wishlist/add", {
          productId,
        });

        setIsWishlisted(true);
        window.dispatchEvent(new Event("wishlist-updated"));

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

  const handleInquiry = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await api.post("/whatsapp/product-inquiry", {
        productId,
        storeSlug: product.storeSlug || "",
      });
      if (response.data?.whatsappUrl) {
        window.open(response.data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "WhatsApp inquiry is unavailable");
    }
  };

  const handleAddToStore = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInStore) return;

    const basePrice = Number(
      product?.salePrice || product?.price || 0
    );
    const commissionPercent = Math.min(
      Math.max(Number(product?.commissionPercent) || 0, 0),
      100
    );
    const minimumPrice = Number(
      (basePrice * (1 + commissionPercent / 100)).toFixed(2)
    );
    const sellingPrice = window.prompt(
      "Enter your selling price",
      String(minimumPrice)
    );

    if (sellingPrice === null) return;

    try {
      setAddingToStore(true);
      await api.post("/dropshippers/products", {
        productId,
        sellingPrice: Number(sellingPrice),
      });
      setIsInStore(true);
      toast.success("Product added to your store");
    } catch (error) {
      if (error?.response?.status === 409) {
        setIsInStore(true);
      }
      toast.error(
        error?.response?.data?.message ||
          "Unable to add product to your store"
      );
    } finally {
      setAddingToStore(false);
    }
  };



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

          

          {cartQuantity > 0 ? (
            <div className="h-11 rounded-xl bg-blue-600 text-white flex items-center justify-between px-2 shadow-md shadow-blue-100">
              <button
                type="button"
                onClick={(e) => handleQuantityChange(e, cartQuantity - 1)}
                disabled={updating}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm font-black">{cartQuantity}</span>
              <button
                type="button"
                onClick={(e) => handleQuantityChange(e, cartQuantity + 1)}
                disabled={updating || cartQuantity >= stock}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingCart || outOfStock}
              className={`h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                outOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100"
              }`}
            >
              {addingCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
              {addingCart ? "Adding..." : outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          )}

          

          <button
            type="button"
            onClick={handleInquiry}
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
          </button>
        </div>

        {hasStore && !hideStoreAction && (
          <button
            type="button"
            onClick={handleAddToStore}
            disabled={isInStore || addingToStore}
            className={`mt-2 w-full h-10 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition ${
              isInStore
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default"
                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            {addingToStore ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isInStore ? (
              <Check size={16} />
            ) : null}
            {addingToStore
              ? "Adding..."
              : isInStore
                ? "Added to my store"
                : "Add to my store"}
          </button>
        )}

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