import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  List,
  Package,
  RefreshCcw,
  Search,
  ShoppingCart,
  Star,
} from "lucide-react";
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
    imageString.startsWith("https://") ||
    imageString.startsWith("data:")
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
  return getImageUrl(
    product?.image ||
      product?.thumbnail ||
      product?.images?.[0]
  );
};



const getCategoryId = (category) => {
  if (!category) return "";

  if (typeof category === "object") {
    return String(
      category?._id ||
        category?.id ||
        ""
    );
  }

  return String(category);
};



function ProductCard({ product, view }) {
  const navigate = useNavigate();

  const image = getProductImage(product);

  const price = Number(product?.price || 0);

  const oldPrice = Number(
    product?.oldPrice ||
      product?.mrp ||
      product?.comparePrice ||
      0
  );

  const rating = Number(
    product?.rating || 0
  );

  const stock = Number(
    product?.stock ?? 0
  );

  const discount =
    oldPrice > price && price > 0
      ? Math.round(
          ((oldPrice - price) / oldPrice) * 100
        )
      : 0;



  if (view === "list") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition">
        <div className="flex gap-4">

          

          <Link
            to={`/products/${product?._id}`}
            className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-xl bg-gray-50 overflow-hidden"
          >
            {image ? (
              <img
                src={image}
                alt={product?.name || "Product"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package size={40} />
              </div>
            )}

            {discount > 0 && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                {discount}% OFF
              </span>
            )}

            {stock <= 0 && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="bg-white text-red-600 px-2 py-1 rounded-lg text-xs font-bold">
                  Out of Stock
                </span>
              </div>
            )}
          </Link>

          

          <div className="flex-1 min-w-0 flex flex-col">

            {product?.brand && (
              <p className="text-xs uppercase tracking-wider text-blue-600 font-bold">
                {product.brand}
              </p>
            )}

            <Link
              to={`/products/${product?._id}`}
              className="mt-1"
            >
              <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 line-clamp-2">
                {product?.name || "Unnamed Product"}
              </h3>
            </Link>

            {product?.description && (
              <p className="hidden sm:block mt-2 text-sm text-gray-500 line-clamp-2">
                {product.description}
              </p>
            )}

            

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              {rating > 0 && (
                <span className="text-xs font-semibold text-gray-500">
                  {rating.toFixed(1)}
                </span>
              )}
            </div>

            

            <div className="mt-auto pt-3 flex flex-wrap items-center gap-2">
              <span className="text-xl font-black text-gray-900">
                ₹{price.toLocaleString("en-IN")}
              </span>

              {oldPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{oldPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          

          <button
            type="button"
            onClick={() =>
              navigate(`/products/${product?._id}`)
            }
            className="hidden sm:flex self-end w-11 h-11 rounded-xl bg-blue-600 text-white items-center justify-center hover:bg-blue-700 transition"
            title="View product"
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      

      <Link
        to={`/products/${product?._id}`}
        className="relative block aspect-square bg-gray-50 overflow-hidden"
      >
        {image ? (
          <img
            src={image}
            alt={product?.name || "Product"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package size={50} />
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">
            {discount}% OFF
          </span>
        )}

        {stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      

      <div className="p-4">

        {product?.brand && (
          <p className="text-xs uppercase tracking-wider text-blue-600 font-bold">
            {product.brand}
          </p>
        )}

        <Link to={`/products/${product?._id}`}>
          <h3 className="font-bold text-gray-900 mt-1 line-clamp-2 min-h-[42px] group-hover:text-blue-600 transition">
            {product?.name || "Unnamed Product"}
          </h3>
        </Link>

        

        <div className="flex items-center gap-2 mt-2">
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

        

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-lg font-black text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {oldPrice > price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{oldPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        

        <Link
          to={`/products/${product?._id}`}
          className="mt-4 w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition"
        >
          <ShoppingCart size={16} />
          View Product
        </Link>
      </div>
    </div>
  );
}



function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />

      <div className="p-4">
        <div className="w-20 h-3 bg-gray-200 rounded" />
        <div className="w-full h-4 bg-gray-200 rounded mt-3" />
        <div className="w-3/4 h-4 bg-gray-200 rounded mt-2" />
        <div className="w-24 h-3 bg-gray-200 rounded mt-3" />
        <div className="w-20 h-5 bg-gray-200 rounded mt-4" />
        <div className="w-full h-10 bg-gray-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}



function CategoryProducts() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const categoryKey = slug || id;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [view, setView] = useState("grid");



  const loadCategory = async () => {
    if (!categoryKey) return;

    try {
      setLoading(true);
      setError("");



      let categoryData = null;

      try {
        if (id) {
          const categoryResponse = await api.get(
            `/category/${id}`
          );

          categoryData =
            categoryResponse?.data?.category ||
            categoryResponse?.data?.data ||
            categoryResponse?.data;
        } else {
          const categoryResponse = await api.get(
            `/category/slug/${slug}`
          );

          categoryData =
            categoryResponse?.data?.category ||
            categoryResponse?.data?.data ||
            categoryResponse?.data;
        }
      } catch (categoryError) {
        console.log(
          "Category lookup failed:",
          categoryError?.response?.data
        );



        const allCategoryResponse = await api.get(
          "/category/all"
        );

        const allCategories =
          allCategoryResponse?.data?.categories ||
          allCategoryResponse?.data?.data ||
          allCategoryResponse?.data;

        if (Array.isArray(allCategories)) {
          categoryData = allCategories.find((item) => {
            const itemSlug = String(item?.slug || "").toLowerCase();
            const itemId = String(item?._id || item?.id || "");

            return (
              itemSlug === String(categoryKey).toLowerCase() ||
              itemId === String(categoryKey)
            );
          });
        }
      }

      if (!categoryData) {
        throw new Error("Category not found");
      }

      setCategory(categoryData);



      const productResponse = await api.get(
        "/product/all"
      );

      const productData =
        productResponse?.data?.products ||
        productResponse?.data?.data ||
        productResponse?.data;

      if (!Array.isArray(productData)) {
        setProducts([]);
        return;
      }



      const categoryId = String(
        categoryData?._id || ""
      );

      const categorySlug = String(
        categoryData?.slug || slug || id || ""
      ).toLowerCase();



      const filteredProducts = productData.filter(
        (product) => {

          if (product?.isActive === false) {
            return false;
          }

          const productCategory =
            product?.category;


          if (
            productCategory &&
            typeof productCategory === "object"
          ) {
            const productCategoryId =
              String(
                productCategory?._id ||
                  productCategory?.id ||
                  ""
              );

            const productCategorySlug =
              String(
                productCategory?.slug || ""
              ).toLowerCase();

            return (
              productCategoryId === categoryId ||
              productCategorySlug === categorySlug
            );
          }


          if (productCategory) {
            return (
              String(productCategory) ===
              categoryId
            );
          }

          return false;
        }
      );

      setProducts(filteredProducts);
    } catch (err) {
      console.error(
        "Category products error:",
        err?.response?.data || err
      );

      setCategory(null);
      setProducts([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Category products load nahi ho paaye"
      );
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (!categoryKey) {
      navigate("/categories");
      return;
    }

    loadCategory();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [categoryKey, id, slug, navigate]);



  const displayedProducts = useMemo(() => {
    let result = [...products];

    const searchValue =
      search.trim().toLowerCase();


    if (searchValue) {
      result = result.filter((product) => {
        const name = String(
          product?.name || ""
        ).toLowerCase();

        const brand = String(
          product?.brand || ""
        ).toLowerCase();

        const description = String(
          product?.description || ""
        ).toLowerCase();

        return (
          name.includes(searchValue) ||
          brand.includes(searchValue) ||
          description.includes(searchValue)
        );
      });
    }


    switch (sort) {
      case "price-low":
        result.sort(
          (a, b) =>
            Number(a?.price || 0) -
            Number(b?.price || 0)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            Number(b?.price || 0) -
            Number(a?.price || 0)
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b?.rating || 0) -
            Number(a?.rating || 0)
        );
        break;

      case "name":
        result.sort((a, b) =>
          String(a?.name || "").localeCompare(
            String(b?.name || "")
          )
        );
        break;

      default:
        break;
    }

    return result;
  }, [products, search, sort]);



  const handleRetry = () => {
    loadCategory();
  };



  if (!loading && error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-lg mx-auto text-center bg-white rounded-3xl border border-gray-100 p-10">

            <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <RefreshCcw size={35} />
            </div>

            <h1 className="text-2xl font-black text-gray-900 mt-5">
              Unable to load category
            </h1>

            <p className="text-gray-500 mt-2">
              {error}
            </p>

            <div className="flex justify-center gap-3 mt-6">

              <button
                type="button"
                onClick={handleRetry}
                className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                Try Again
              </button>

              <Link
                to="/categories"
                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
              >
                Categories
              </Link>

            </div>
          </div>
        </div>
      </main>
    );
  }



  const categoryImage = getImageUrl(
    category?.image ||
      category?.thumbnail ||
      category?.coverImage
  );

  const categoryName =
    category?.name ||
    category?.title ||
    "Category";



  return (
    <main className="min-h-screen bg-gray-50">

      

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

          

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">

            <Link
              to="/"
              className="hover:text-blue-600"
            >
              Home
            </Link>

            <ChevronRight size={15} />

            <Link
              to="/categories"
              className="hover:text-blue-600"
            >
              Categories
            </Link>

            <ChevronRight size={15} />

            <span className="text-gray-900 font-semibold">
              {categoryName}
            </span>

          </div>

          

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">

            <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative p-7 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center gap-7">

              

              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white/10 border border-white/20 overflow-hidden shrink-0">

                {categoryImage ? (
                  <img
                    src={categoryImage}
                    alt={categoryName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Grid3X3 size={55} />
                  </div>
                )}

              </div>

              

              <div className="text-center md:text-left">

                <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-100">
                  <Grid3X3 size={16} />
                  Category Collection
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-2">
                  {categoryName}
                </h1>

                {category?.description && (
                  <p className="mt-3 text-blue-100 max-w-2xl leading-7">
                    {category.description}
                  </p>
                )}

                {!loading && (
                  <p className="mt-4 text-sm font-semibold text-white/80">
                    {products.length}{" "}
                    {products.length === 1
                      ? "product"
                      : "products"}{" "}
                    available
                  </p>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      

      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          

          <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm">

            <div className="flex flex-col lg:flex-row gap-3">

              

              <div className="relative flex-1">

                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder={`Search in ${categoryName}...`}
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50 border border-transparent outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                />

              </div>

              

              <div className="flex gap-2">

                

                <div className="relative flex-1 sm:flex-none">

                  <select
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value)
                    }
                    className="appearance-none w-full sm:w-48 h-11 pl-4 pr-10 rounded-xl bg-gray-50 border border-transparent outline-none focus:border-blue-500 font-medium text-gray-700 cursor-pointer"
                  >
                    <option value="default">
                      Sort: Default
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>

                    <option value="rating">
                      Highest Rated
                    </option>

                    <option value="name">
                      Name: A-Z
                    </option>
                  </select>

                  <ChevronDown
                    size={17}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                  />

                </div>

                

                <div className="hidden sm:flex items-center bg-gray-50 rounded-xl p-1">

                  <button
                    type="button"
                    onClick={() =>
                      setView("grid")
                    }
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      view === "grid"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500"
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setView("list")
                    }
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      view === "list"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500"
                    }`}
                    title="List view"
                  >
                    <List size={19} />
                  </button>

                </div>
              </div>
            </div>
          </div>

          

          <div className="flex items-center justify-between mt-7 mb-5">

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Products
              </h2>

              {!loading && (
                <p className="text-sm text-gray-500 mt-1">
                  {displayedProducts.length} results
                  {search && ` for "${search}"`}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleRetry}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 disabled:opacity-40"
            >
              <RefreshCcw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

          </div>

          

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <ProductSkeleton
                    key={index}
                  />
                )
              )}
            </div>
          )}

          

          {!loading &&
            displayedProducts.length === 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-10 sm:p-16 text-center">

                <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                  <Package size={38} />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-5">
                  {search
                    ? "No products found"
                    : "No products in this category"}
                </h3>

                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  {search
                    ? `No products match "${search}". Try another search.`
                    : "Products will appear here when they are added to this category."}
                </p>

                <div className="flex justify-center gap-3 mt-6">

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                    >
                      Clear Search
                    </button>
                  )}

                  <Link
                    to="/categories"
                    className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                  >
                    All Categories
                  </Link>

                </div>
              </div>
            )}

          

          {!loading &&
            displayedProducts.length > 0 && (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
                    : "space-y-4"
                }
              >
                {displayedProducts.map(
                  (product) => (
                    <ProductCard
                      key={product?._id}
                      product={product}
                      view={view}
                    />
                  )
                )}
              </div>
            )}

        </div>
      </section>

      

      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() =>
              navigate("/categories")
            }
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:border-blue-300 hover:text-blue-600 transition"
          >
            <ArrowLeft size={18} />
            All Categories
          </button>

        </div>
      </div>

    </main>
  );
}

export default CategoryProducts;