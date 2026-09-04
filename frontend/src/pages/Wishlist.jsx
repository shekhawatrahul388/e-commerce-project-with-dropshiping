import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
  Loader2,
  RefreshCcw,
  AlertCircle,
  ShoppingBag,
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



const getProductImage = (product) => {
  if (!product) return "";

  if (product.image) {
    return getImageUrl(product.image);
  }

  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    return getImageUrl(product.images[0]);
  }

  if (product.thumbnail) {
    return getImageUrl(product.thumbnail);
  }

  return "";
};



const getProductId = (item) => {
  if (!item) return "";

  if (
    item.product &&
    typeof item.product === "object"
  ) {
    return (
      item.product._id ||
      item.product.id ||
      ""
    );
  }

  return (
    item.productId ||
    item.product ||
    item._id ||
    item.id ||
    ""
  );
};



const getProduct = (item) => {
  if (!item) return null;

  if (
    item.product &&
    typeof item.product === "object"
  ) {
    return item.product;
  }

  if (item.productDetails) {
    return item.productDetails;
  }

  return item;
};



function Wishlist() {
  const navigate = useNavigate();



  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [clearing, setClearing] = useState(false);



  const loadWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wishlist/");

      console.log(
        "WISHLIST RESPONSE:",
        response.data
      );

      const data =
        response.data?.wishlist ??
        response.data?.data ??
        response.data;

      let items = [];

      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data?.items)) {
        items = data.items;
      } else if (Array.isArray(data?.products)) {
        items = data.products;
      }

      setWishlist(items);
    } catch (error) {
      console.error(
        "WISHLIST LOAD ERROR:",
        error?.response?.data || error.message
      );

      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error("Please login first");

        navigate("/login");
        return;
      }

      setError(
        error?.response?.data?.message ||
          "Unable to load wishlist"
      );
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadWishlist();
  }, []);



  const removeFromWishlist = async (productId) => {
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    try {
      setRemovingId(productId);

      const response = await api.delete(
        `/wishlist/remove/${productId}`
      );

      console.log(
        "REMOVE WISHLIST RESPONSE:",
        response.data
      );

      setWishlist((prev) =>
        prev.filter(
          (item) =>
            String(getProductId(item)) !==
            String(productId)
        )
      );

      toast.success(
        "Removed from wishlist"
      );
    } catch (error) {
      console.error(
        "REMOVE WISHLIST ERROR:",
        error?.response?.data ||
          error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to remove item"
      );
    } finally {
      setRemovingId(null);
    }
  };



  const addToCart = async (productId) => {
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    try {
      setAddingId(productId);

      const response = await api.post(
        "/cart/add",
        {
          productId,
          quantity: 1,
        }
      );

      console.log(
        "ADD TO CART RESPONSE:",
        response.data
      );

      toast.success("Added to cart");
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error?.response?.data ||
          error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to add product to cart"
      );
    } finally {
      setAddingId(null);
    }
  };



  const moveToCart = async (productId) => {
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    try {
      setAddingId(productId);

      await api.post("/cart/add", {
        productId,
        quantity: 1,
      });

      await api.delete(
        `/wishlist/remove/${productId}`
      );

      setWishlist((prev) =>
        prev.filter(
          (item) =>
            String(getProductId(item)) !==
            String(productId)
        )
      );

      toast.success(
        "Product moved to cart"
      );
    } catch (error) {
      console.error(
        "MOVE TO CART ERROR:",
        error?.response?.data ||
          error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to move product to cart"
      );
    } finally {
      setAddingId(null);
    }
  };



  const clearWishlist = async () => {
    if (!wishlist.length) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear your wishlist?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);

      const response = await api.delete(
        "/wishlist/clear"
      );

      console.log(
        "CLEAR WISHLIST RESPONSE:",
        response.data
      );

      setWishlist([]);

      toast.success(
        "Wishlist cleared successfully"
      );
    } catch (error) {
      console.error(
        "CLEAR WISHLIST ERROR:",
        error?.response?.data ||
          error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to clear wishlist"
      );
    } finally {
      setClearing(false);
    }
  };



  if (!localStorage.getItem("token")) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center">

          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 text-red-500 flex items-center justify-center">
            <Heart size={42} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mt-6">
            Login Required
          </h1>

          <p className="text-gray-500 mt-2">
            Please login to view your
            wishlist.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-7">

            <Link
              to="/login"
              className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-center"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="py-3 rounded-xl border border-gray-200 text-gray-700 font-black text-center hover:bg-gray-50"
            >
              Register
            </Link>

          </div>
        </div>
      </main>
    );
  }



  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />

          <div className="h-10 w-52 bg-gray-200 rounded-xl mt-5 animate-pulse" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
              >

                <div className="h-64 bg-gray-200 animate-pulse" />

                <div className="p-5 space-y-3">

                  <div className="h-5 bg-gray-200 rounded animate-pulse" />

                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />

                  <div className="h-11 bg-gray-200 rounded-xl animate-pulse" />

                </div>

              </div>
            ))}

          </div>
        </div>
      </main>
    );
  }



  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">

          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle size={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mt-6">
            Wishlist Couldn't Load
          </h1>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={loadWishlist}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black"
          >
            <RefreshCcw size={17} />
            Try Again
          </button>

        </div>
      </main>
    );
  }

  if (!wishlist.length) {
    return (
      <main className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="flex items-center gap-2 text-sm text-gray-500">

            <Link
              to="/"
              className="hover:text-blue-600"
            >
              Home
            </Link>

            <span>/</span>

            <span className="font-semibold text-gray-900">
              Wishlist
            </span>

          </div>

          <div className="max-w-xl mx-auto text-center py-16">

            <div className="w-24 h-24 mx-auto rounded-[30px] bg-white border border-gray-100 shadow-sm flex items-center justify-center text-red-200">

              <Heart
                size={48}
                fill="currentColor"
              />

            </div>

            <h1 className="text-3xl font-black text-gray-900 mt-7">
              Your Wishlist is Empty
            </h1>

            <p className="text-gray-500 mt-3">
              Save products you love here
              and find them easily later.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition"
            >
              Explore Products
              <ArrowRight size={18} />
            </Link>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      

      <section className="bg-white border-b border-gray-100">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

          <div className="flex items-center gap-2 text-sm text-gray-500">

            <Link
              to="/"
              className="hover:text-blue-600"
            >
              Home
            </Link>

            <span>/</span>

            <span className="font-semibold text-gray-900">
              Wishlist
            </span>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-5">

            <div>

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">

                  <Heart
                    size={22}
                    fill="currentColor"
                  />

                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
                  My Wishlist
                </h1>

              </div>

              <p className="text-gray-500 mt-2">
                {wishlist.length}{" "}
                {wishlist.length === 1
                  ? "product"
                  : "products"}{" "}
                saved
              </p>

            </div>

            <button
              type="button"
              onClick={clearWishlist}
              disabled={clearing}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >

              {clearing ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={17} />
              )}

              Clear Wishlist

            </button>

          </div>
        </div>
      </section>

      

      <section className="py-8">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

            {wishlist.map((item, index) => {

              const product =
                getProduct(item);

              const productId =
                getProductId(item);

              const image =
                getProductImage(product);

              const name =
                product?.name ||
                item?.name ||
                "Product";

              const price =
                Number(
                  product?.price ||
                    item?.price ||
                    0
                );

              const oldPrice =
                Number(
                  product?.oldPrice ||
                    product?.mrp ||
                    product?.originalPrice ||
                    0
                );

              const stock =
                Number(
                  product?.stock ?? 1
                );

              const removing =
                removingId === productId;

              const adding =
                addingId === productId;

              return (
                <article
                  key={
                    productId || index
                  }
                  className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >

                  

                  <div className="relative h-64 bg-gray-50 overflow-hidden">

                    <Link
                      to={`/products/${productId}`}
                      className="block w-full h-full"
                    >

                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="w-full h-full object-contain p-6 group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package
                            size={55}
                            className="text-gray-300"
                          />
                        </div>
                      )}

                    </Link>

                    

                    <button
                      type="button"
                      onClick={() =>
                        removeFromWishlist(
                          productId
                        )
                      }
                      disabled={removing}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 transition disabled:opacity-60"
                      title="Remove from wishlist"
                    >

                      {removing ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Heart
                          size={19}
                          fill="currentColor"
                        />
                      )}

                    </button>

                    

                    {stock <= 0 && (
                      <span className="absolute left-4 top-4 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-black">
                        Out of Stock
                      </span>
                    )}

                  </div>

                  

                  <div className="p-5">

                    

                    {product?.brand && (
                      <p className="text-[11px] font-black uppercase tracking-wider text-blue-600 mb-1">
                        {product.brand}
                      </p>
                    )}

                    

                    <Link
                      to={`/products/${productId}`}
                      className="block text-lg font-black text-gray-900 hover:text-blue-600 transition line-clamp-2 min-h-[56px]"
                    >
                      {name}
                    </Link>

                    

                    <div className="flex items-center gap-2 mt-3">

                      <span className="text-xl font-black text-gray-900">
                        ₹
                        {price.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      {oldPrice > price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹
                          {oldPrice.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}

                    </div>

                    

                    <div className="grid grid-cols-[1fr_44px] gap-2 mt-5">

                      

                      <button
                        type="button"
                        disabled={
                          adding ||
                          stock <= 0
                        }
                        onClick={() =>
                          addToCart(
                            productId
                          )
                        }
                        className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >

                        {adding ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <>
                            <ShoppingCart
                              size={17}
                            />
                            Add to Cart
                          </>
                        )}

                      </button>

                      

                      <button
                        type="button"
                        onClick={() =>
                          removeFromWishlist(
                            productId
                          )
                        }
                        disabled={removing}
                        className="h-11 rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 flex items-center justify-center transition disabled:opacity-50"
                        title="Remove"
                      >

                        <Trash2 size={18} />

                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>

          

          <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

                <ShoppingBag size={23} />

              </div>

              <div>

                <h3 className="font-black text-gray-900">
                  Looking for more?
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Discover more products
                  from our store.
                </p>

              </div>

            </div>

            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black"
            >
              Continue Shopping
              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Wishlist;