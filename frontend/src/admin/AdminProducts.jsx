import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  Package,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Layers,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import api from "../api/axios";

function AdminProducts() {
  const [searchParams] = useSearchParams();


  const initialForm = {
    name: "",
    description: "",
    brand: "",
    category: "",
    price: "",
    discountPrice: "",
    stock: "",
    image: "",
    imageFile: null,
    images: "",
    sku: "",
    active: true,
    dropshipping: false,
    supplier: "",
    supplierName: "",
    supplierProductId: "",
    supplierUrl: "",
    supplierPrice: "",
  };



  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState(
    searchParams.get("source") || "all"
  );

  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [bulkForms, setBulkForms] = useState([]);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 10;



  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/product/all?includePending=true");

      const data = response?.data;

      let productData = [];

      if (Array.isArray(data)) {
        productData = data;
      } else if (Array.isArray(data?.products)) {
        productData = data.products;
      } else if (Array.isArray(data?.data)) {
        productData = data.data;
      }

      setProducts(productData);
    } catch (error) {
      console.error(
        "PRODUCT LOAD ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load products"
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };



  const loadCategories = async () => {
    try {
      const response = await api.get("/category/all");

      const data = response?.data;

      let categoryData = [];

      if (Array.isArray(data)) {
        categoryData = data;
      } else if (Array.isArray(data?.categories)) {
        categoryData = data.categories;
      } else if (Array.isArray(data?.data)) {
        categoryData = data.data;
      }

      setCategories(categoryData);
    } catch (error) {
      console.error(
        "CATEGORY LOAD ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load categories"
      );

      setCategories([]);
    }
  };



  const loadSuppliers = async () => {
    try {
      const response = await api.get("/supplier/all");
      const data = response?.data;
      const supplierData = Array.isArray(data?.suppliers)
        ? data.suppliers
        : Array.isArray(data)
          ? data
          : [];
      setSuppliers(supplierData);
    } catch (error) {
      console.error("SUPPLIER LOAD ERROR:", error?.response?.data || error);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSuppliers();
  }, []);



  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (file && (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) {
      toast.error("Choose an image smaller than 5 MB");
      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageFile: file,
    }));
  };



  const openCreate = () => {
    setEditingProduct(null);
    setForm({ ...initialForm });
    setShowModal(true);
  };

  const createBulkForm = () => ({
    name: "",
    description: "",
    category: "",
    price: "",
    discountPrice: "",
    stock: "",
    image: "",
    sku: "",
  });

  const openBulkCreate = () => {
    setBulkForms([createBulkForm()]);
    setShowBulkModal(true);
  };

  const updateBulkForm = (index, event) => {
    const { name, value } = event.target;
    setBulkForms((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [name]: value } : item
    )));
  };

  const validateBulkForms = () => {
    if (bulkForms.length === 0 || bulkForms.length > 100) {
      toast.error("Add between 1 and 100 products");
      return false;
    }

    for (let index = 0; index < bulkForms.length; index += 1) {
      const item = bulkForms[index];
      if (!item.name.trim() || !item.description.trim() || !item.category) {
        toast.error(`Complete name, description and category for product ${index + 1}`);
        return false;
      }
      if (item.price === "" || Number.isNaN(Number(item.price)) || Number(item.price) < 0) {
        toast.error(`Enter a valid price for product ${index + 1}`);
        return false;
      }
      if (item.stock === "" || Number.isNaN(Number(item.stock)) || Number(item.stock) < 0) {
        toast.error(`Enter valid stock for product ${index + 1}`);
        return false;
      }
      if (item.discountPrice !== "" && (Number.isNaN(Number(item.discountPrice)) || Number(item.discountPrice) < 0 || Number(item.discountPrice) > Number(item.price))) {
        toast.error(`Enter a valid sale price for product ${index + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleBulkSubmit = async (event) => {
    event.preventDefault();
    if (!validateBulkForms()) return;

    try {
      setSaving(true);
      const productsPayload = bulkForms.map((item) => ({
        name: item.name.trim(),
        description: item.description.trim(),
        category: item.category,
        price: Number(item.price),
        salePrice: item.discountPrice === "" ? null : Number(item.discountPrice),
        stock: Number(item.stock),
        image: item.image.trim(),
        images: [],
        sku: item.sku.trim(),
        isActive: true,
        isDropshipping: false,
        tags: [],
      }));

      const response = await api.post("/product/create-multiple", { products: productsPayload });
      toast.success(response.data?.message || `${productsPayload.length} products created successfully`);
      setShowBulkModal(false);
      setBulkForms([]);
      await loadProducts();
    } catch (error) {
      console.error("BULK PRODUCT SAVE ERROR:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to create products");
    } finally {
      setSaving(false);
    }
  };



  const getCategoryId = (category) => {
    if (!category) return "";

    if (typeof category === "object") {
      return category?._id || "";
    }

    return category;
  };



  const openEdit = (product) => {
    if (!product) return;

    setEditingProduct(product);

    let imageList = "";

    if (Array.isArray(product.images)) {
      imageList = product.images.join("\n");
    }

    setForm({
      name: product.name || "",

      description:
        product.description || "",

      brand:
        product.brand || "",

      category:
        getCategoryId(product.category),

      price:
        product.price !== undefined &&
        product.price !== null
          ? product.price
          : "",

      discountPrice:
        product.discountPrice !== undefined &&
        product.discountPrice !== null
          ? product.discountPrice
          : "",

      stock:
        product.stock !== undefined &&
        product.stock !== null
          ? product.stock
          : "",

      image:
        product.image || "",

      images: imageList,

      sku:
        product.sku || "",

      active:
        product.active !== false,

      dropshipping:
        product.dropshipping === true,

      supplier:
        product.supplier?._id || product.supplier || "",

      supplierName:
        product.supplierName || "",

      supplierProductId:
        product.supplierProductId || "",

      supplierUrl:
        product.supplierUrl || "",

      supplierPrice:
        product.supplierPrice !== undefined &&
        product.supplierPrice !== null
          ? product.supplierPrice
          : "",
    });

    setShowModal(true);
  };



  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProduct(null);
    setForm({ ...initialForm });
  };



  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return false;
    }

    if (!form.category) {
      toast.error("Please select category");
      return false;
    }

    if (
      form.price === "" ||
      form.price === null ||
      Number(form.price) < 0 ||
      Number.isNaN(Number(form.price))
    ) {
      toast.error("Valid price is required");
      return false;
    }

    if (
      form.stock === "" ||
      form.stock === null ||
      Number(form.stock) < 0 ||
      Number.isNaN(Number(form.stock))
    ) {
      toast.error("Valid stock is required");
      return false;
    }

    if (
      form.discountPrice !== "" &&
      Number(form.discountPrice) < 0
    ) {
      toast.error(
        "Discount price cannot be negative"
      );
      return false;
    }

    if (form.dropshipping) {
      if (!form.supplier) {
        toast.error("Please select a supplier for dropshipping product");
        return false;
      }

      if (form.supplierPrice === "" || Number(form.supplierPrice) < 0 || Number.isNaN(Number(form.supplierPrice))) {
        toast.error("Valid supplier price is required for dropshipping product");
        return false;
      }
    }

    return true;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const images = form.images
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      let imageUrl = form.image.trim();

      if (form.imageFile) {
        const imageData = new FormData();
        imageData.append("image", form.imageFile);

        const uploadResponse = await api.post(
          "/upload/single",
          imageData
        );

        imageUrl = uploadResponse.data?.image?.url || "";

        if (!imageUrl) {
          throw new Error("Image upload failed");
        }
      }

      const payload = {
        name: form.name.trim(),

        description:
          form.description.trim(),

        brand:
          form.brand.trim(),

        category:
          form.category,

        price:
          Number(form.price),

        salePrice:
          form.discountPrice === ""
            ? 0
            : Number(form.discountPrice),

        stock:
          Number(form.stock),

        image:
          imageUrl,

        images,

        sku:
          form.sku.trim(),

        isActive:
          Boolean(form.active),

        isDropshipping:
          Boolean(form.dropshipping),

        supplier:
          form.dropshipping ? form.supplier : null,

        supplierName:
          form.supplierName.trim(),

        supplierProductId:
          form.supplierProductId.trim(),

        supplierUrl:
          form.supplierUrl.trim(),

        supplierPrice:
          form.dropshipping ? Number(form.supplierPrice) : 0,

        tags: [],
      };

      console.log(
        "PRODUCT PAYLOAD:",
        payload
      );



      if (editingProduct?._id) {
        const response = await api.put(
          `/product/update/${editingProduct._id}`,
          payload
        );

        console.log(
          "UPDATE PRODUCT:",
          response.data
        );

        toast.success(
          "Product updated successfully"
        );
      }



      else {
        const response = await api.post(
          "/product/create",
          payload
        );

        console.log(
          "CREATE PRODUCT:",
          response.data
        );

        toast.success(
          "Product created successfully"
        );
      }

      setShowModal(false);
      setEditingProduct(null);
      setForm({ ...initialForm });

      await loadProducts();
    } catch (error) {
      console.error(
        "PRODUCT SAVE ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };



  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await api.delete(
        `/product/delete/${id}`
      );

      console.log(
        "DELETE PRODUCT:",
        response.data
      );

      toast.success(
        "Product deleted successfully"
      );

      await loadProducts();


      const newLength =
        filteredProducts.length - 1;

      const newTotalPages =
        Math.max(
          1,
          Math.ceil(
            newLength /
              productsPerPage
          )
        );

      if (
        currentPage >
        newTotalPages
      ) {
        setCurrentPage(
          newTotalPages
        );
      }
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
    }
  };



  const handleToggle = async (product) => {
    if (!product?._id) return;

    try {
      setTogglingId(product._id);




      await api.patch(
        `/product/toggle/${product._id}`
      );

      toast.success(
        product.active === false
          ? "Product activated"
          : "Product deactivated"
      );

      await loadProducts();
    } catch (error) {
      console.error(
        "TOGGLE PRODUCT ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update status"
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleApproval = async (product, approvalStatus) => {
    try {
      await api.patch(`/product/approve/${product._id}`, { approvalStatus });
      toast.success(`Product ${approvalStatus}`);
      await loadProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approval update failed");
    }
  };



  const filteredProducts = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    return products.filter(
      (product) => {
        const name =
          product.name
            ?.toLowerCase() || "";

        const brand =
          product.brand
            ?.toLowerCase() || "";

        const sku =
          product.sku
            ?.toLowerCase() || "";

        const matchesSearch =
          !keyword ||
          name.includes(keyword) ||
          brand.includes(keyword) ||
          sku.includes(keyword);

        const productCategory =
          getCategoryId(
            product.category
          );

        const matchesCategory =
          categoryFilter === "all" ||
          productCategory ===
            categoryFilter;

        const matchesStatus =
          statusFilter === "all" ||
          (
            statusFilter === "active" &&
            product.active !== false
          ) ||
          (
            statusFilter === "inactive" &&
            product.active === false
          );

        const matchesSource =
          sourceFilter === "all" ||
          (sourceFilter === "dropshipping" && product.isDropshipping === true);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesSource
        );
      }
    );
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
    sourceFilter,
  ]);



  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    categoryFilter,
    statusFilter,
  ]);



  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        productsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) *
    productsPerPage;

  const currentProducts =
    filteredProducts.slice(
      startIndex,
      startIndex +
        productsPerPage
    );

  const changePage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };



  const totalProducts =
    products.length;

  const activeProducts =
    products.filter(
      (product) =>
        product.active !== false
    ).length;

  const inactiveProducts =
    products.filter(
      (product) =>
        product.active === false
    ).length;

  const lowStockProducts =
    products.filter((product) => {
      const stock =
        Number(product.stock);

      return (
        stock >= 0 &&
        stock <= 5
      );
    }).length;



  const getProductImage = (product) => {
    if (
      product?.image &&
      typeof product.image === "string"
    ) {
      return product.image;
    }

    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    return "";
  };



  const getCategoryName = (product) => {
    if (
      product?.category &&
      typeof product.category === "object"
    ) {
      return (
        product.category.name ||
        "Uncategorized"
      );
    }

    const categoryId =
      getCategoryId(
        product?.category
      );

    const category =
      categories.find(
        (cat) =>
          cat._id === categoryId
      );

    return (
      category?.name ||
      "Uncategorized"
    );
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-500">
            Loading products...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">

      
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  Products
                </h1>

                <p className="text-xs text-gray-400 mt-1">
                  Manage your store products
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={() => {
                  loadProducts();
                  loadCategories();
                }}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>

              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm"
              >
                <Plus size={18} />
                Add Product
              </button>

              <button
                onClick={openBulkCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold"
              >
                <Layers size={18} />
                Add Multiple
              </button>

            </div>
          </div>
        </div>
      </div>

      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Total Products
                </p>

                <p className="text-3xl font-black text-gray-900 mt-1">
                  {totalProducts}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package size={21} />
              </div>
            </div>
          </div>

          
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Active
                </p>

                <p className="text-3xl font-black text-green-600 mt-1">
                  {activeProducts}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle size={21} />
              </div>
            </div>
          </div>

          
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Inactive
                </p>

                <p className="text-3xl font-black text-red-600 mt-1">
                  {inactiveProducts}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle size={21} />
              </div>
            </div>
          </div>

          
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Low Stock
                </p>

                <p className="text-3xl font-black text-orange-500 mt-1">
                  {lowStockProducts}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Layers size={21} />
              </div>
            </div>
          </div>

        </div>

        
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search product, brand, SKU..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
              />
            </div>

            
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-blue-500 text-sm"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>

            
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-blue-500 text-sm"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-blue-500 text-sm"
            >
              <option value="all">All Product Types</option>
              <option value="dropshipping">Dropshipping Only</option>
            </select>

          </div>
        </div>

        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          
          <div className="hidden xl:block overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-4 text-[10px] font-black text-gray-400 uppercase">
                    Product
                  </th>

                  <th className="text-left px-5 py-4 text-[10px] font-black text-gray-400 uppercase">
                    Category
                  </th>

                  <th className="text-left px-5 py-4 text-[10px] font-black text-gray-400 uppercase">
                    Price
                  </th>

                  <th className="text-left px-5 py-4 text-[10px] font-black text-gray-400 uppercase">
                    Stock
                  </th>

                  <th className="text-left px-5 py-4 text-[10px] font-black text-gray-400 uppercase">
                    Status
                  </th>

                  <th className="text-right px-5 py-4 text-[10px] font-black text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {currentProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-16 text-center"
                    >
                      <Package
                        size={42}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 font-bold text-gray-500">
                        No products found
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentProducts.map(
                    (product) => {
                      const image =
                        getProductImage(
                          product
                        );

                      return (
                        <tr
                          key={product._id}
                          className="hover:bg-gray-50/70 transition"
                        >

                          
                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3 min-w-[280px]">

                              <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">

                                {image ? (
                                  <img
                                    src={image}
                                    alt={
                                      product.name
                                    }
                                    className="w-full h-full object-cover"
                                    onError={(
                                      e
                                    ) => {
                                      e.currentTarget.style.display =
                                        "none";
                                    }}
                                  />
                                ) : (
                                  <ImageIcon
                                    size={22}
                                    className="text-gray-300"
                                  />
                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="font-bold text-sm text-gray-900 truncate max-w-[220px]">
                                  {product.name}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                  {product.brand ||
                                    "No brand"}
                                </p>

                                {product.sku && (
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    SKU:{" "}
                                    {
                                      product.sku
                                    }
                                  </p>
                                )}

                              </div>

                            </div>

                          </td>

                          
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                              {getCategoryName(
                                product
                              )}
                            </span>
                          </td>

                          
                          <td className="px-5 py-4">
                            <p className="font-black text-gray-900">
                              ₹
                              {Number(
                                product.price || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            {Number(
                              product.discountPrice
                            ) > 0 && (
                              <p className="text-xs text-green-600 font-semibold mt-0.5">
                                Sale ₹
                                {Number(
                                  product.discountPrice
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            )}
                          </td>

                          
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm font-bold ${
                                Number(
                                  product.stock
                                ) <= 5
                                  ? "text-orange-500"
                                  : "text-gray-700"
                              }`}
                            >
                              {product.stock ?? 0}
                            </span>
                          </td>

                          
                          <td className="px-5 py-4">

                            <button
                              onClick={() =>
                                handleToggle(
                                  product
                                )
                              }
                              disabled={
                                togglingId ===
                                product._id
                              }
                            >
                              {togglingId ===
                              product._id ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black">
                                  <Loader2
                                    size={12}
                                    className="animate-spin"
                                  />
                                  Updating
                                </span>
                              ) : product.active !==
                                false ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black">
                                  <CheckCircle
                                    size={12}
                                  />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black">
                                  <XCircle
                                    size={12}
                                  />
                                  Inactive
                                </span>
                              )}
                            </button>

                          </td>

                          
                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              {product.approvalStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApproval(product, "approved")}
                                    className="px-3 h-9 rounded-lg bg-green-50 text-green-700 hover:bg-green-600 hover:text-white text-xs font-bold"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleApproval(product, "rejected")}
                                    className="px-3 h-9 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white text-xs font-bold"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() =>
                                  window.open(
                                    `/products/${product._id}`,
                                    "_blank"
                                  )
                                }
                                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-700 hover:text-white flex items-center justify-center"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  openEdit(
                                    product
                                  )
                                }
                                className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    product._id
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  product._id
                                }
                                className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId ===
                                product._id ? (
                                  <RefreshCw
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={16}
                                  />
                                )}
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>

          </div>

          
          <div className="xl:hidden divide-y divide-gray-100">

            {currentProducts.length === 0 ? (
              <div className="py-16 text-center">
                <Package
                  size={42}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 font-bold text-gray-500">
                  No products found
                </p>
              </div>
            ) : (
              currentProducts.map(
                (product) => {
                  const image =
                    getProductImage(
                      product
                    );

                  return (
                    <div
                      key={product._id}
                      className="p-4 sm:p-5"
                    >

                      <div className="flex gap-3">

                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">

                          {image ? (
                            <img
                              src={image}
                              alt={
                                product.name
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon
                              size={25}
                              className="text-gray-300"
                            />
                          )}

                        </div>

                        <div className="flex-1 min-w-0">

                          <div className="flex justify-between gap-2">

                            <div>
                              <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">
                                {
                                  product.name
                                }
                              </h3>

                              <p className="text-xs text-gray-400 mt-1">
                                {product.brand ||
                                  "No brand"}
                              </p>
                            </div>

                            {product.active !==
                            false ? (
                              <span className="h-fit px-2 py-1 rounded-full bg-green-50 text-green-600 text-[9px] font-black shrink-0">
                                Active
                              </span>
                            ) : (
                              <span className="h-fit px-2 py-1 rounded-full bg-red-50 text-red-600 text-[9px] font-black shrink-0">
                                Inactive
                              </span>
                            )}

                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">

                            <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold">
                              {getCategoryName(
                                product
                              )}
                            </span>

                            <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold">
                              Stock:{" "}
                              {product.stock ??
                                0}
                            </span>

                          </div>

                          <div className="flex items-center gap-2 mt-3">

                            <span className="font-black text-gray-900">
                              ₹
                              {Number(
                                product.price ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            {Number(
                              product.discountPrice
                            ) > 0 && (
                              <span className="text-xs text-green-600 font-semibold">
                                ₹
                                {Number(
                                  product.discountPrice
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      <div className="grid grid-cols-4 gap-2 mt-4">

                        <button
                          onClick={() =>
                            window.open(
                              `/products/${product._id}`,
                              "_blank"
                            )
                          }
                          className="h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center gap-1.5 text-xs font-bold"
                        >
                          <Eye size={15} />
                          View
                        </button>

                        <button
                          onClick={() =>
                            openEdit(
                              product
                            )
                          }
                          className="h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center gap-1.5 text-xs font-bold"
                        >
                          <Edit size={15} />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleToggle(
                              product
                            )
                          }
                          disabled={
                            togglingId ===
                            product._id
                          }
                          className="h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center text-xs font-bold disabled:opacity-50"
                        >
                          {togglingId ===
                          product._id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            "Toggle"
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              product._id
                            )
                          }
                          disabled={
                            deletingId ===
                            product._id
                          }
                          className="h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-50"
                        >
                          {deletingId ===
                          product._id ? (
                            <RefreshCw
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={15}
                            />
                          )}
                        </button>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

          
          {filteredProducts.length >
            productsPerPage && (
            <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">

              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-bold text-gray-700">
                  {startIndex + 1}
                </span>{" "}
                -{" "}
                <span className="font-bold text-gray-700">
                  {Math.min(
                    startIndex +
                      productsPerPage,
                    filteredProducts.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-700">
                  {
                    filteredProducts.length
                  }
                </span>
              </p>

              <div className="flex items-center gap-1">

                <button
                  disabled={
                    safePage === 1
                  }
                  onClick={() =>
                    changePage(
                      safePage - 1
                    )
                  }
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft size={17} />
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                )
                  .slice(
                    Math.max(
                      0,
                      safePage - 3
                    ),
                    safePage + 2
                  )
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() =>
                        changePage(
                          page
                        )
                      }
                      className={`w-9 h-9 rounded-lg text-xs font-bold ${
                        page === safePage
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  disabled={
                    safePage ===
                    totalPages
                  }
                  onClick={() =>
                    changePage(
                      safePage + 1
                    )
                  }
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight size={17} />
                </button>

              </div>

            </div>
          )}

        </div>
      </main>

      

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">

          
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">

            
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  {editingProduct
                    ? "Update product information"
                    : "Add a new product to your store"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                
                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    placeholder="Enter product name"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

                </div>

                
                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Brand
                  </label>

                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={
                      handleChange
                    }
                    placeholder="Brand name"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

                </div>

                
                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    SKU
                  </label>

                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={
                      handleChange
                    }
                    placeholder="SKU-001"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm uppercase"
                  />

                </div>

                
                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Category *
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={
                      handleChange
                    }
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  >

                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category._id
                          }
                          value={
                            category._id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                
                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Price *
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={
                        form.price
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                      className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                    />

                  </div>

                </div>

                
                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Sale / Discount Price
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="discountPrice"
                      min="0"
                      value={
                        form.discountPrice
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                      className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                    />

                  </div>

                </div>

                
                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Stock *
                  </label>

                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={form.stock}
                    onChange={
                      handleChange
                    }
                    placeholder="0"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

                </div>

                
                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Main Image
                  </label>

                  <input
                    type="file"
                    name="imageFile"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="w-full h-11 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  />

                  {form.imageFile && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Selected: {form.imageFile.name}
                    </p>
                  )}

                  <div className="relative mt-2">

                    <ImageIcon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="image"
                      value={form.image}
                      onChange={
                        handleChange
                      }
                      placeholder="Or paste an image URL"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                    />

                  </div>

                </div>

                
                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Additional Images
                  </label>

                  <textarea
                    name="images"
                    value={form.images}
                    onChange={
                      handleChange
                    }
                    rows="4"
                    placeholder={
                      "Paste one image URL per line\nhttps://image1.jpg\nhttps://image2.jpg"
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm resize-none"
                  />

                  <p className="text-[10px] text-gray-400 mt-1">
                    One URL per line
                  </p>

                </div>

                
                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows="5"
                    placeholder="Write product description..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm resize-none"
                  />

                </div>

                
                <div>

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">

                    <input
                      type="checkbox"
                      name="active"
                      checked={
                        form.active
                      }
                      onChange={
                        handleChange
                      }
                      className="w-4 h-4 accent-blue-600"
                    />

                    <div>

                      <p className="text-sm font-bold text-gray-800">
                        Active Product
                      </p>

                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Product will be visible in store.
                      </p>

                    </div>

                  </label>

                </div>

                
                <div className="md:col-span-2">

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">

                    <input
                      type="checkbox"
                      name="dropshipping"
                      checked={
                        form.dropshipping
                      }
                      onChange={
                        handleChange
                      }
                      className="w-4 h-4 accent-blue-600"
                    />

                    <div>

                      <p className="text-sm font-bold text-gray-800">
                        Dropshipping Product
                      </p>

                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Mark product as dropshipping.
                      </p>

                    </div>

                  </label>

                </div>

                {form.dropshipping && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Supplier *
                      </label>
                      <select
                        name="supplier"
                        value={form.supplier}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                      >
                        <option value="">Select supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.name}
                            {supplier.companyName ? ` — ${supplier.companyName}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        name="supplierName"
                        value={form.supplierName}
                        onChange={handleChange}
                        placeholder="Supplier contact name"
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Supplier Product ID
                      </label>
                      <input
                        type="text"
                        name="supplierProductId"
                        value={form.supplierProductId}
                        onChange={handleChange}
                        placeholder="SKU or product ID from supplier"
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Supplier Product URL
                      </label>
                      <input
                        type="url"
                        name="supplierUrl"
                        value={form.supplierUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/product"
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Supplier Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          name="supplierPrice"
                          min="0"
                          value={form.supplierPrice}
                          onChange={handleChange}
                          placeholder="0"
                          className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>

              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-7 pt-5 border-t border-gray-100">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 px-5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />

                      {editingProduct
                        ? "Update Product"
                        : "Create Product"}
                    </>
                  )}

                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowBulkModal(false)} />
          <div className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">Add Multiple Products</h2>
                <p className="text-xs text-gray-400 mt-1">Add up to 100 products in one submission</p>
              </div>
              <button type="button" onClick={() => !saving && setShowBulkModal(false)} disabled={saving} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-5 sm:p-6">
              <div className="space-y-4">
                {bulkForms.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-black text-gray-800">Product {index + 1}</p>
                      {bulkForms.length > 1 && <button type="button" onClick={() => setBulkForms((prev) => prev.filter((_, itemIndex) => itemIndex !== index))} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <input name="name" value={item.name} onChange={(event) => updateBulkForm(index, event)} placeholder="Product name *" className="md:col-span-3 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" />
                      <input name="sku" value={item.sku} onChange={(event) => updateBulkForm(index, event)} placeholder="SKU" className="md:col-span-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" />
                      <select name="category" value={item.category} onChange={(event) => updateBulkForm(index, event)} className="md:col-span-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm">
                        <option value="">Category *</option>
                        {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                      </select>
                      <input type="number" min="0" name="price" value={item.price} onChange={(event) => updateBulkForm(index, event)} placeholder="Price *" className="md:col-span-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" />
                      <input type="number" min="0" name="discountPrice" value={item.discountPrice} onChange={(event) => updateBulkForm(index, event)} placeholder="Sale price" className="md:col-span-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" />
                      <input type="number" min="0" name="stock" value={item.stock} onChange={(event) => updateBulkForm(index, event)} placeholder="Stock *" className="md:col-span-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" />
                      <input name="image" value={item.image} onChange={(event) => updateBulkForm(index, event)} placeholder="Main image URL" className="md:col-span-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm" />
                      <textarea name="description" value={item.description} onChange={(event) => updateBulkForm(index, event)} placeholder="Description *" rows="2" className="md:col-span-10 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm resize-none" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-5 pt-5 border-t border-gray-100">
                <button type="button" onClick={() => setBulkForms((prev) => [...prev, createBulkForm()])} disabled={saving || bulkForms.length >= 100} className="h-11 px-5 rounded-xl border border-blue-200 text-blue-700 font-bold text-sm hover:bg-blue-50 disabled:opacity-50"><Plus size={17} className="inline mr-1" /> Add another row</button>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button type="button" onClick={() => setShowBulkModal(false)} disabled={saving} className="h-11 px-5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={saving} className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">{saving ? <><RefreshCw size={17} className="animate-spin" /> Saving...</> : <><Save size={17} /> Create {bulkForms.length} Products</>}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminProducts;