import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowRight,
  Grid3X3,
  RefreshCcw,
  AlertCircle,
  Package,
  X,
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


const getCategoryImage = (category) => {
  if (!category) return "";

  return getImageUrl(
    category.image ||
      category.imageUrl ||
      category.thumbnail ||
      category.banner
  );
};


function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");


  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/category/all");

      const data =
        response.data?.categories ??
        response.data?.data ??
        response.data;

      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
        setError("Invalid category response from server.");
      }
    } catch (err) {
      console.error(
        "Category loading error:",
        err?.response?.data || err.message
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);


  const filteredCategories = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return categories;
    }

    return categories.filter((category) => {
      const name = String(
        category?.name ||
          category?.title ||
          ""
      ).toLowerCase();

      const description = String(
        category?.description || ""
      ).toLowerCase();

      const slug = String(
        category?.slug || ""
      ).toLowerCase();

      return (
        name.includes(value) ||
        description.includes(value) ||
        slug.includes(value)
      );
    });
  }, [categories, search]);


  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />

            <div className="h-10 w-64 bg-gray-200 rounded-xl mt-4 animate-pulse" />

            <div className="h-5 w-96 max-w-full bg-gray-200 rounded mt-3 animate-pulse" />
          </div>
        </section>

        
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-100"
                  >
                    <div className="h-56 bg-gray-200 animate-pulse" />

                    <div className="p-5 space-y-3">
                      <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />

                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />

                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />

                      <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>
    );
  }


  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle size={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mt-6">
            Categories Couldn't Load
          </h1>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={loadCategories}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition"
          >
            <RefreshCcw size={17} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      
      
      

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              to="/"
              className="hover:text-blue-600 transition"
            >
              Home
            </Link>

            <span>/</span>

            <span className="font-semibold text-gray-900">
              Categories
            </span>
          </div>

          <div className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-wider">
                <Grid3X3 size={14} />
                Explore
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mt-3">
                Shop by Category
              </h1>

              <p className="text-gray-500 mt-3 max-w-2xl">
                Browse our product categories and
                discover something perfect for you.
              </p>
            </div>

            
            <div className="w-full lg:w-[380px]">
              <div className="relative">
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
                  placeholder="Search category..."
                  className="w-full h-12 pl-11 pr-11 bg-gray-100 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      
      
      

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                All Categories
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {filteredCategories.length}{" "}
                categories available
              </p>
            </div>
          </div>

          
          
          

          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400">
                <Search size={36} />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mt-6">
                No Categories Found
              </h2>

              <p className="text-gray-500 mt-2">
                {search
                  ? "Try searching with a different category name."
                  : "No categories are available yet."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-6 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => {
                const image =
                  getCategoryImage(category);

                const id =
                  category?._id ||
                  category?.id ||
                  category?.slug;

                const slug =
                  category?.slug ||
                  category?._id ||
                  category?.id;

                const name =
                  category?.name ||
                  category?.title ||
                  "Category";

                const description =
                  category?.description ||
                  "Explore products in this category.";

                return (
                  <Link
                    key={id}
                    to={`/categories/${encodeURIComponent(
                      slug
                    )}`}
                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    
                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Package
                            size={60}
                            className="text-gray-300"
                          />
                        </div>
                      )}

                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />

                      
                      <div className="absolute right-4 bottom-4 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <ArrowRight
                          size={19}
                          className="group-hover:translate-x-0.5 transition"
                        />
                      </div>
                    </div>

                    
                    <div className="p-5">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                        {name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[40px]">
                        {description}
                      </p>

                      <div className="flex items-center gap-2 mt-5 text-sm font-black text-blue-600">
                        View Products

                        <ArrowRight
                          size={16}
                          className="group-hover:translate-x-1 transition"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      
      
      

      {filteredCategories.length > 0 && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 sm:px-10 py-10">
              
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl" />

              <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl" />

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-blue-400 font-black text-sm uppercase tracking-wider">
                    Find Your Favorites
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    Looking for something specific?
                  </h2>

                  <p className="text-gray-400 mt-2">
                    Search our complete product
                    collection.
                  </p>
                </div>

                <Link
                  to="/products"
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-gray-900 font-black hover:bg-blue-50 transition"
                >
                  Browse Products
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default Categories;