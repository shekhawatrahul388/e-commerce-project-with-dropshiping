import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  Heart,
  ShoppingCart,
  Eye,
  ChevronDown,
  Grid3X3,
  List,
  Package,
  Loader2,
  RefreshCcw,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";



const getImageUrl = (image) => {
  if (!image) return "";

  let imageValue = image;

  if (typeof image === "object") {
    imageValue =
      image.url ||
      image.secure_url ||
      image.path ||
      image.image ||
      "";
  }

  if (!imageValue) return "";

  const value = String(imageValue);


  if (/^https?:\/\//.test(value)) {
    return value.replace(/^http:\/\//, "https://");
  }

  const baseUrl = (
    import.meta.env.VITE_API_URL || "https://dropshiping-products-backend-3.onrender.com/api"
  ).replace(/\/api\/?$/, "");

  return `${baseUrl}/${value.replace(/^\/+/, "")}`;
};

const getProductImage = (product) => {
  if (!product) return "";

  if (product.image) {
    return getImageUrl(product.image);
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    return getImageUrl(product.images[0]);
  }

  return "";
};

const getProductId = (product) => {
  return product?._id || product?.id || "";
};

const getCategoryId = (category) => {
  if (!category) return "";

  if (typeof category === "object") {
    return category._id || category.id || "";
  }

  return String(category);
};

const matchesCategory = (productCategory, selectedCategory) => {
  const selected = String(selectedCategory || "").toLowerCase();
  if (!productCategory || !selected) return false;

  if (typeof productCategory === "object") {
    return [
      productCategory._id,
      productCategory.id,
      productCategory.slug,
      productCategory.name,
    ].filter(Boolean).some((value) => String(value).toLowerCase() === selected);
  }

  return String(productCategory).toLowerCase() === selected;
};



function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();



  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );

  const [sort, setSort] = useState("latest");
  const [view, setView] = useState("grid");

  const [showFilters, setShowFilters] = useState(false);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [wishlist, setWishlist] = useState([]);

  const [cartLoading, setCartLoading] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(null);

  const [visibleCount, setVisibleCount] = useState(12);



  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/product/all");

      const data =
        response.data?.products ??
        response.data?.data ??
        response.data;

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(
        "Products error:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);



  const loadWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      const response = await api.get("/wishlist");

      const data =
        response.data?.wishlist ??
        response.data?.data ??
        response.data;

      if (!Array.isArray(data)) {
        setWishlist([]);
        return;
      }

      const ids = data
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          return (
            item?.product?._id ||
            item?.product?.id ||
            item?.productId ||
            item?._id ||
            item?.id
          );
        })
        .filter(Boolean)
        .map(String);

      setWishlist(ids);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setWishlist([]);
        return;
      }

      console.error(
        "Wishlist loading error:",
        err?.response?.data || err
      );
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);



  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "all";

    setSearch(urlSearch);
    setCategory(urlCategory);
  }, [searchParams]);



  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const cat = product?.category;

      if (!cat) return;

      if (typeof cat === "object") {
        const id = cat._id || cat.id;
        const name = cat.name || "Category";

        if (id) {
          categoryMap.set(String(id), {
            id: String(id),
            name,
          });
        }
      } else {
        const id = String(cat);

        categoryMap.set(id, {
          id,
          name: id,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [products]);



  const filteredProducts = useMemo(() => {
    let result = [...products];



    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        const name = String(product?.name || "").toLowerCase();

        const description = String(
          product?.description || ""
        ).toLowerCase();

        const brand = String(
          product?.brand || ""
        ).toLowerCase();

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          brand.includes(searchValue)
        );
      });
    }



    if (category !== "all") {
      result = result.filter((product) => {
        return matchesCategory(product?.category, category);
      });
    }



    if (minPrice !== "") {
      result = result.filter(
        (product) =>
          Number(product?.price || 0) >=
          Number(minPrice)
      );
    }



    if (maxPrice !== "") {
      result = result.filter(
        (product) =>
          Number(product?.price || 0) <=
          Number(maxPrice)
      );
    }



    switch (sort) {
      case "low":
        result.sort(
          (a, b) =>
            Number(a?.price || 0) -
            Number(b?.price || 0)
        );
        break;

      case "high":
        result.sort(
          (a, b) =>
            Number(b?.price || 0) -
            Number(a?.price || 0)
        );
        break;

      case "name":
        result.sort((a, b) =>
          String(a?.name || "").localeCompare(
            String(b?.name || "")
          )
        );
        break;

      case "stock":
        result.sort(
          (a, b) =>
            Number(b?.stock || 0) -
            Number(a?.stock || 0)
        );
        break;

      case "latest":
      default:
        result.sort((a, b) => {
          const dateA = new Date(
            a?.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b?.createdAt || 0
          ).getTime();

          return dateB - dateA;
        });
        break;
    }

    return result;
  }, [
    products,
    search,
    category,
    minPrice,
    maxPrice,
    sort,
  ]);



  const visibleProducts = filteredProducts.slice(
    0,
    visibleCount
  );



  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    const params = {};

    if (value) {
      params.search = value;
    }

    if (category !== "all") {
      params.category = category;
    }

    setSearchParams(params);
    setVisibleCount(12);
  };



  const handleCategory = (value) => {
    setCategory(value);
    setVisibleCount(12);

    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (value !== "all") {
      params.category = value;
    }

    setSearchParams(params);
  };



  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("latest");
    setVisibleCount(12);

    setSearchParams({});
  };



  const addToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      navigate("/send-otp");
      return;
    }

    const productId = getProductId(product);

    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    try {
      setCartLoading(productId);

      await api.post("/cart/add", {
        productId,
        quantity: 1,
      });

      toast.success("Added to cart");
    } catch (err) {
      console.error(
        "Cart error:",
        err?.response?.data || err
      );

      toast.error(
        err?.response?.data?.message ||
          "Unable to add to cart"
      );
    } finally {
      setCartLoading(null);
    }
  };



  const toggleWishlist = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      navigate("/send-otp");
      return;
    }

    const productId = getProductId(product);

    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    const id = String(productId);

    const exists = wishlist.includes(id);

    try {
      setWishlistLoading(id);

      if (exists) {
        await api.delete(
          `/wishlist/remove/${id}`
        );

        setWishlist((prev) =>
          prev.filter(
            (wishlistId) => wishlistId !== id
          )
        );

        toast.success("Removed from wishlist");
      } else {
        await api.post("/wishlist/add", {
          productId: id,
        });

        setWishlist((prev) => [
          ...prev,
          id,
        ]);

        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error(
        "Wishlist error:",
        err?.response?.data || err
      );

      toast.error(
        err?.response?.data?.message ||
          "Wishlist update failed"
      );
    } finally {
      setWishlistLoading(null);
    }
  };



  const ProductCard = ({ product }) => {
    const productId = getProductId(product);

    const image = getProductImage(product);

    const price = Number(product?.price || 0);

    const oldPrice = Number(
      product?.oldPrice ||
        product?.mrp ||
        product?.originalPrice ||
        0
    );

    const stock = Number(product?.stock || 0);

    const isInStock = stock > 0;

    const isWishlisted =
      wishlist.includes(String(productId));

    const discount =
      oldPrice > price && price > 0
        ? Math.round(
            ((oldPrice - price) /
              oldPrice) *
              100
          )
        : 0;

    return (
      <article
        className={`
          group
          bg-white
          border border-gray-100
          rounded-2xl
          overflow-hidden
          hover:shadow-xl
          hover:-translate-y-1
          transition-all
          duration-300
          ${
            view === "list"
              ? "flex"
              : ""
          }
        `}
      >
        

        <div
          className={`
            relative
            bg-gray-50
            ${
              view === "list"
                ? "w-44 sm:w-56 shrink-0"
                : ""
            }
          `}
        >
          <Link
            to={`/products/${productId}`}
            className="block"
          >
            <div
              className={`
                flex
                items-center
                justify-center
                ${
                  view === "list"
                    ? "h-full min-h-[220px]"
                    : "aspect-square"
                }
              `}
            >
              {image ? (
                <img
                  src={image}
                  alt={
                    product?.name ||
                    "Product"
                  }
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                  className="
                    w-full
                    h-full
                    object-contain
                    p-5
                    group-hover:scale-105
                    transition
                    duration-500
                  "
                />
              ) : (
                <Package
                  size={60}
                  className="text-gray-300"
                />
              )}
            </div>
          </Link>

          

          {discount > 0 && (
            <span
              className="
                absolute
                top-3
                left-3
                px-2.5
                py-1
                rounded-lg
                bg-red-500
                text-white
                text-xs
                font-black
              "
            >
              {discount}% OFF
            </span>
          )}

          

          {!isInStock && (
            <span
              className="
                absolute
                top-3
                left-3
                px-2.5
                py-1
                rounded-lg
                bg-gray-900
                text-white
                text-xs
                font-black
              "
            >
              Out of Stock
            </span>
          )}

          

          <button
            type="button"
            onClick={() =>
              toggleWishlist(product)
            }
            disabled={
              wishlistLoading ===
              String(productId)
            }
            className={`
              absolute
              top-3
              right-3
              w-10
              h-10
              rounded-full
              flex
              items-center
              justify-center
              shadow-sm
              transition
              ${
                isWishlisted
                  ? "bg-red-50 text-red-500"
                  : "bg-white text-gray-600 hover:text-red-500"
              }
            `}
            title="Wishlist"
          >
            {wishlistLoading ===
            String(productId) ? (
              <Loader2
                size={18}
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
        </div>

        

        <div
          className={`
            p-4
            sm:p-5
            flex
            flex-col
            ${
              view === "list"
                ? "flex-1"
                : ""
            }
          `}
        >
          

          {product?.brand && (
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-wider
                text-blue-600
                mb-1
              "
            >
              {product.brand}
            </p>
          )}

          

          <Link
            to={`/products/${productId}`}
            className="
              font-black
              text-gray-900
              text-base
              sm:text-lg
              line-clamp-2
              hover:text-blue-600
              transition
            "
          >
            {product?.name ||
              "Unnamed Product"}
          </Link>

          

          {view === "list" &&
            product?.description && (
              <p
                className="
                  text-sm
                  text-gray-500
                  line-clamp-2
                  mt-2
                "
              >
                {product.description}
              </p>
            )}

          

          <div className="flex items-center gap-2 mt-3">
            <span
              className="
                text-xl
                font-black
                text-gray-900
              "
            >
              ₹
              {price.toLocaleString(
                "en-IN"
              )}
            </span>

            {oldPrice > price && (
              <span
                className="
                  text-sm
                  text-gray-400
                  line-through
                "
              >
                ₹
                {oldPrice.toLocaleString(
                  "en-IN"
                )}
              </span>
            )}
          </div>

          

          <div className="mt-2">
            {isInStock ? (
              <span
                className="
                  text-xs
                  font-bold
                  text-green-600
                  inline-flex
                  items-center
                  gap-1
                "
              >
                <Check size={13} />
                In Stock
              </span>
            ) : (
              <span
                className="
                  text-xs
                  font-bold
                  text-red-500
                "
              >
                Currently unavailable
              </span>
            )}
          </div>

          

          <div
            className={`
              grid
              grid-cols-2
              gap-2
              mt-4
              ${
                view === "list"
                  ? "max-w-md"
                  : ""
              }
            `}
          >
            <Link
              to={`/products/${productId}`}
              className="
                h-10
                rounded-xl
                border
                border-gray-200
                hover:border-blue-300
                hover:bg-blue-50
                text-gray-700
                hover:text-blue-600
                font-bold
                text-sm
                flex
                items-center
                justify-center
                gap-1.5
                transition
              "
            >
              <Eye size={16} />
              View
            </Link>

            <button
              type="button"
              disabled={
                !isInStock ||
                cartLoading ===
                  productId
              }
              onClick={() =>
                addToCart(product)
              }
              className="
                h-10
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-bold
                text-sm
                flex
                items-center
                justify-center
                gap-1.5
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {cartLoading ===
              productId ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <>
                  <ShoppingCart
                    size={16}
                  />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  };



  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-8
          "
        >
          <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse" />

          <div className="h-5 w-72 bg-gray-200 rounded mt-3 animate-pulse" />

          <div
            className="
              grid
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5
              mt-8
            "
          >
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  bg-white
                  rounded-2xl
                  overflow-hidden
                "
              >
                <div className="aspect-square bg-gray-200 animate-pulse" />

                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />

                  <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />

                  <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />

                  <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
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
      <main
        className="
          min-h-screen
          bg-gray-50
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div
          className="
            bg-white
            rounded-3xl
            p-8
            max-w-md
            w-full
            text-center
            border
            border-gray-100
            shadow-sm
          "
        >
          <div
            className="
              w-20
              h-20
              rounded-3xl
              bg-red-50
              text-red-500
              mx-auto
              flex
              items-center
              justify-center
            "
          >
            <AlertCircle size={40} />
          </div>

          <h1
            className="
              text-2xl
              font-black
              mt-5
              text-gray-900
            "
          >
            Products Couldn't Load
          </h1>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={loadProducts}
            className="
              mt-6
              px-6
              py-3
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-black
              inline-flex
              items-center
              gap-2
            "
          >
            <RefreshCcw size={18} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      

      <section className="bg-white border-b border-gray-100">
        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-7
          "
        >
          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-end
              lg:justify-between
              gap-5
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-black
                  text-blue-600
                  uppercase
                  tracking-wider
                "
              >
                Our Collection
              </p>

              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  font-black
                  text-gray-900
                  mt-1
                "
              >
                All Products
              </h1>

              <p className="text-gray-500 mt-2">
                Discover products you'll love.
              </p>
            </div>

            

            <form
              onSubmit={handleSearch}
              className="w-full lg:w-[430px]"
            >
              <div className="relative">
                <Search
                  size={19}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search products..."
                  className="
                    w-full
                    h-12
                    pl-11
                    pr-12
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    focus:bg-white
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-50
                    outline-none
                    transition
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSearchParams({});
                      setCategory("all");
                    }}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      w-8
                      h-8
                      flex
                      items-center
                      justify-center
                      text-gray-400
                      hover:text-gray-700
                    "
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      

      <section className="py-6 sm:py-8">
        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
          "
        >

          

          <div className="flex lg:hidden gap-3 mb-5">
            <button
              type="button"
              onClick={() =>
                setShowFilters(true)
              }
              className="
                flex-1
                h-11
                rounded-xl
                bg-white
                border
                border-gray-200
                font-bold
                text-gray-700
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <SlidersHorizontal
                size={18}
              />
              Filters
            </button>

            <button
              type="button"
              onClick={() =>
                setView(
                  view === "grid"
                    ? "list"
                    : "grid"
                )
              }
              className="
                w-12
                h-11
                rounded-xl
                bg-white
                border
                border-gray-200
                flex
                items-center
                justify-center
              "
            >
              {view === "grid" ? (
                <List size={19} />
              ) : (
                <Grid3X3 size={19} />
              )}
            </button>
          </div>

          <div
            className="
              grid
              lg:grid-cols-[250px_1fr]
              gap-7
            "
          >

            

            <aside className="hidden lg:block">
              <div
                className="
                  bg-white
                  rounded-2xl
                  border
                  border-gray-100
                  p-5
                  sticky
                  top-24
                "
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-gray-900">
                    Filters
                  </h2>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="
                      text-xs
                      font-bold
                      text-blue-600
                      hover:underline
                    "
                  >
                    Reset
                  </button>
                </div>

                

                <div className="mt-6">
                  <p
                    className="
                      text-sm
                      font-black
                      text-gray-900
                      mb-3
                    "
                  >
                    Category
                  </p>

                  <div className="space-y-1">

                    <button
                      type="button"
                      onClick={() =>
                        handleCategory(
                          "all"
                        )
                      }
                      className={`
                        w-full
                        flex
                        items-center
                        justify-between
                        px-3
                        py-2.5
                        rounded-xl
                        text-sm
                        font-bold
                        transition
                        ${
                          category ===
                          "all"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span>
                        All Products
                      </span>

                      <span className="text-xs">
                        {products.length}
                      </span>
                    </button>

                    {categories.map(
                      (cat) => {
                        const count =
                          products.filter(
                            (product) =>
                              getCategoryId(
                                product?.category
                              ) ===
                              cat.id
                          ).length;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              handleCategory(
                                cat.id
                              )
                            }
                            className={`
                              w-full
                              flex
                              items-center
                              justify-between
                              px-3
                              py-2.5
                              rounded-xl
                              text-sm
                              font-bold
                              transition
                              ${
                                category ===
                                cat.id
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-600 hover:bg-gray-50"
                              }
                            `}
                          >
                            <span className="truncate">
                              {cat.name}
                            </span>

                            <span className="text-xs">
                              {count}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                

                <div
                  className="
                    mt-7
                    pt-6
                    border-t
                    border-gray-100
                  "
                >
                  <p
                    className="
                      text-sm
                      font-black
                      text-gray-900
                      mb-3
                    "
                  >
                    Price Range
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(e) =>
                        setMinPrice(
                          e.target.value
                        )
                      }
                      placeholder="Min"
                      className="
                        w-full
                        h-10
                        px-3
                        rounded-lg
                        border
                        border-gray-200
                        outline-none
                        focus:border-blue-500
                        text-sm
                      "
                    />

                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(e) =>
                        setMaxPrice(
                          e.target.value
                        )
                      }
                      placeholder="Max"
                      className="
                        w-full
                        h-10
                        px-3
                        rounded-lg
                        border
                        border-gray-200
                        outline-none
                        focus:border-blue-500
                        text-sm
                      "
                    />
                  </div>
                </div>
              </div>
            </aside>

            

            <div>

              

              <div
                className="
                  bg-white
                  border
                  border-gray-100
                  rounded-2xl
                  p-3
                  sm:p-4
                  mb-5
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <strong className="text-gray-900">
                      {filteredProducts.length}
                    </strong>{" "}
                    products
                  </p>

                  <div className="flex items-center gap-2">

                    

                    <div className="relative">
                      <select
                        value={sort}
                        onChange={(e) =>
                          setSort(
                            e.target.value
                          )
                        }
                        className="
                          appearance-none
                          h-10
                          pl-3
                          pr-9
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          text-sm
                          font-bold
                          text-gray-700
                          outline-none
                          focus:border-blue-500
                          cursor-pointer
                        "
                      >
                        <option value="latest">
                          Latest
                        </option>

                        <option value="low">
                          Price: Low
                        </option>

                        <option value="high">
                          Price: High
                        </option>

                        <option value="name">
                          Name
                        </option>

                        <option value="stock">
                          Stock
                        </option>
                      </select>

                      <ChevronDown
                        size={15}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          pointer-events-none
                          text-gray-500
                        "
                      />
                    </div>

                    

                    <div
                      className="
                        hidden
                        sm:flex
                        border
                        border-gray-200
                        rounded-xl
                        overflow-hidden
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setView("grid")
                        }
                        className={`
                          w-10
                          h-10
                          flex
                          items-center
                          justify-center
                          ${
                            view ===
                            "grid"
                              ? "bg-blue-600 text-white"
                              : "text-gray-500 hover:bg-gray-50"
                          }
                        `}
                      >
                        <Grid3X3 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setView("list")
                        }
                        className={`
                          w-10
                          h-10
                          flex
                          items-center
                          justify-center
                          ${
                            view ===
                            "list"
                              ? "bg-blue-600 text-white"
                              : "text-gray-500 hover:bg-gray-50"
                          }
                        `}
                      >
                        <List size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              

              {filteredProducts.length ===
              0 ? (
                <div
                  className="
                    bg-white
                    border
                    border-gray-100
                    rounded-3xl
                    p-10
                    sm:p-16
                    text-center
                  "
                >
                  <div
                    className="
                      w-20
                      h-20
                      mx-auto
                      rounded-3xl
                      bg-gray-100
                      flex
                      items-center
                      justify-center
                      text-gray-400
                    "
                  >
                    <Package size={40} />
                  </div>

                  <h2
                    className="
                      text-2xl
                      font-black
                      text-gray-900
                      mt-5
                    "
                  >
                    No Products Found
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Try changing your search
                    or filter options.
                  </p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="
                      mt-6
                      px-6
                      py-3
                      rounded-xl
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      font-black
                    "
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  

                  <div
                    className={
                      view === "grid"
                        ? `
                          grid
                          grid-cols-2
                          md:grid-cols-3
                          xl:grid-cols-4
                          gap-3
                          sm:gap-5
                        `
                        : "space-y-4"
                    }
                  >
                    {visibleProducts.map(
                      (product) => (
                        <ProductCard
                          key={getProductId(
                            product
                          )}
                          product={product}
                        />
                      )
                    )}
                  </div>

                  

                  {visibleCount <
                    filteredProducts.length && (
                    <div className="flex justify-center mt-8">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCount(
                            (prev) =>
                              prev + 12
                          )
                        }
                        className="
                          px-7
                          py-3
                          rounded-xl
                          bg-white
                          border
                          border-gray-200
                          hover:border-blue-400
                          hover:text-blue-600
                          font-black
                          transition
                        "
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      

      {showFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">

          

          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setShowFilters(false)
            }
            className="
              absolute
              inset-0
              bg-black/40
              cursor-default
            "
          />

          

          <div
            className="
              absolute
              right-0
              top-0
              h-full
              w-[85%]
              max-w-sm
              bg-white
              shadow-2xl
              overflow-y-auto
            "
          >
            <div
              className="
                sticky
                top-0
                bg-white
                border-b
                border-gray-100
                px-5
                py-4
                flex
                items-center
                justify-between
                z-10
              "
            >
              <h2 className="font-black text-lg">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(false)
                }
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-gray-100
                  flex
                  items-center
                  justify-center
                "
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5">

              

              <p className="text-sm font-black mb-3">
                Category
              </p>

              <div className="space-y-1">

                <button
                  type="button"
                  onClick={() => {
                    handleCategory("all");
                    setShowFilters(false);
                  }}
                  className={`
                    w-full
                    text-left
                    px-4
                    py-3
                    rounded-xl
                    font-bold
                    ${
                      category ===
                      "all"
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-50"
                    }
                  `}
                >
                  All Products
                </button>

                {categories.map(
                  (cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        handleCategory(
                          cat.id
                        );
                        setShowFilters(
                          false
                        );
                      }}
                      className={`
                        w-full
                        text-left
                        px-4
                        py-3
                        rounded-xl
                        font-bold
                        ${
                          category ===
                          cat.id
                            ? "bg-blue-50 text-blue-600"
                            : "hover:bg-gray-50"
                        }
                      `}
                    >
                      {cat.name}
                    </button>
                  )
                )}
              </div>

              

              <div
                className="
                  border-t
                  mt-6
                  pt-6
                "
              >
                <p className="text-sm font-black mb-3">
                  Price Range
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(
                        e.target.value
                      )
                    }
                    placeholder="Min price"
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      border
                      border-gray-200
                      outline-none
                      focus:border-blue-500
                    "
                  />

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(
                        e.target.value
                      )
                    }
                    placeholder="Max price"
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      border
                      border-gray-200
                      outline-none
                      focus:border-blue-500
                    "
                  />
                </div>
              </div>

              

              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setShowFilters(false);
                }}
                className="
                  w-full
                  mt-7
                  h-12
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  font-black
                "
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Products;