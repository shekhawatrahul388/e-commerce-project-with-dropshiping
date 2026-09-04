import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  FolderTree,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { toast } from "react-hot-toast";

import api from "../api/axios";

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  image: "",
  active: true,
};

const CATEGORIES_PER_PAGE = 8;

function AdminCategories() {


  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);



  const generateSlug = (value = "") => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };



  const loadCategories = async () => {
    try {
      setRefreshing(true);

      const response = await api.get(
        "/category/all"
      );

      console.log(
        "CATEGORY RESPONSE:",
        response.data
      );

      const data = response.data;

      let categoryData = [];

      if (Array.isArray(data)) {
        categoryData = data;
      } else if (
        Array.isArray(data?.categories)
      ) {
        categoryData = data.categories;
      } else if (
        Array.isArray(data?.data)
      ) {
        categoryData = data.data;
      }

      setCategories(categoryData);
    } catch (error) {
      console.error(
        "LOAD CATEGORY ERROR:",
        error?.response?.data || error
      );

      setCategories([]);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  useEffect(() => {
    loadCategories();
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



  const handleNameChange = (e) => {
    const value = e.target.value;

    setForm((prev) => {
      const oldGeneratedSlug =
        generateSlug(prev.name);

      const shouldAutoGenerate =
        !editingCategory ||
        prev.slug === oldGeneratedSlug ||
        prev.slug === "";

      return {
        ...prev,
        name: value,
        slug: shouldAutoGenerate
          ? generateSlug(value)
          : prev.slug,
      };
    });
  };



  const openCreate = () => {
    setEditingCategory(null);

    setForm({
      ...INITIAL_FORM,
    });

    setShowModal(true);
  };



  const openEdit = (category) => {
    setEditingCategory(category);

    setForm({
      name: category?.name || "",

      slug:
        category?.slug ||
        generateSlug(category?.name || ""),

      description:
        category?.description || "",

      image: category?.image || "",

      active:
        category?.active !== false,
    });

    setShowModal(true);
  };



  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setEditingCategory(null);

    setForm({
      ...INITIAL_FORM,
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();

    const slug =
      form.slug.trim() ||
      generateSlug(name);

    const description =
      form.description.trim();

    const image =
      form.image.trim();



    if (!name) {
      toast.error(
        "Category name is required"
      );
      return;
    }

    if (!slug) {
      toast.error(
        "Category slug is required"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        slug: generateSlug(slug),
        description,
        image,
        active: Boolean(form.active),
      };

      console.log(
        "CATEGORY PAYLOAD:",
        payload
      );



      if (editingCategory?._id) {
        const response = await api.put(
          `/category/update/${editingCategory._id}`,
          payload
        );

        console.log(
          "UPDATE CATEGORY RESPONSE:",
          response.data
        );

        toast.success(
          response.data?.message ||
            "Category updated successfully"
        );
      }



      else {
        const response = await api.post(
          "/category/create",
          payload
        );

        console.log(
          "CREATE CATEGORY RESPONSE:",
          response.data
        );

        toast.success(
          response.data?.message ||
            "Category created successfully"
        );
      }

      setShowModal(false);

      setEditingCategory(null);

      setForm({
        ...INITIAL_FORM,
      });

      setCurrentPage(1);

      await loadCategories();
    } catch (error) {
      console.error(
        "SAVE CATEGORY ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };



  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await api.delete(
        `/category/delete/${id}`
      );

      console.log(
        "DELETE CATEGORY RESPONSE:",
        response.data
      );

      toast.success(
        response.data?.message ||
          "Category deleted successfully"
      );

      await loadCategories();
    } catch (error) {
      console.error(
        "DELETE CATEGORY ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete category"
      );
    } finally {
      setDeletingId(null);
    }
  };



  const filteredCategories = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    return categories.filter(
      (category) => {
        const name =
          category?.name
            ?.toLowerCase() || "";

        const slug =
          category?.slug
            ?.toLowerCase() || "";

        const description =
          category?.description
            ?.toLowerCase() || "";

        const matchesSearch =
          !keyword ||
          name.includes(keyword) ||
          slug.includes(keyword) ||
          description.includes(keyword);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" &&
            category?.active !== false) ||
          (statusFilter === "inactive" &&
            category?.active === false);

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    categories,
    search,
    statusFilter,
  ]);



  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCategories.length /
        CATEGORIES_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) *
    CATEGORIES_PER_PAGE;

  const currentCategories =
    filteredCategories.slice(
      startIndex,
      startIndex +
        CATEGORIES_PER_PAGE
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



  const totalCategories =
    categories.length;

  const activeCategories =
    categories.filter(
      (category) =>
        category?.active !== false
    ).length;

  const inactiveCategories =
    categories.filter(
      (category) =>
        category?.active === false
    ).length;



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto animate-pulse">
            <FolderTree size={28} />
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-500">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">

      

      <header className="bg-white border-b border-gray-200">

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderTree size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  Categories
                </h1>

                <p className="text-xs text-gray-400 mt-1">
                  Manage your product
                  categories
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={loadCategories}
                disabled={refreshing}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              <button
                onClick={openCreate}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition"
              >
                <Plus size={18} />
                Add Category
              </button>

            </div>

          </div>

        </div>

      </header>

      

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-black text-gray-400 uppercase">
                  Total Categories
                </p>

                <p className="text-3xl font-black text-gray-900 mt-1">
                  {totalCategories}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderTree size={23} />
              </div>

            </div>

          </div>

          

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-black text-gray-400 uppercase">
                  Active
                </p>

                <p className="text-3xl font-black text-green-600 mt-1">
                  {activeCategories}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle size={23} />
              </div>

            </div>

          </div>

          

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-black text-gray-400 uppercase">
                  Inactive
                </p>

                <p className="text-3xl font-black text-red-600 mt-1">
                  {inactiveCategories}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle size={23} />
              </div>

            </div>

          </div>

        </section>

        

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                placeholder="Search category..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
              />

            </div>

            

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value
                );
                setCurrentPage(1);
              }}
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

          </div>

        </section>

        

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          

          <div className="hidden lg:block overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b border-gray-100">

                <tr>

                  <th className="text-left px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Category
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Slug
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Description
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Status
                  </th>

                  <th className="text-right px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {currentCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center"
                    >
                      <FolderTree
                        size={42}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 font-bold text-gray-500">
                        No categories found
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Try changing your
                        search or filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentCategories.map(
                    (category) => (
                      <tr
                        key={category._id}
                        className="hover:bg-gray-50/70 transition"
                      >

                        

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3 min-w-[250px]">

                            <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">

                              {category.image ? (
                                <img
                                  src={
                                    category.image
                                  }
                                  alt={
                                    category.name ||
                                    "Category"
                                  }
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <FolderTree
                                    size={22}
                                  />
                                </div>
                              )}

                            </div>

                            <div className="min-w-0">

                              <p className="text-sm font-bold text-gray-900 truncate">
                                {category.name ||
                                  "Unnamed"}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                Category
                              </p>

                            </div>

                          </div>

                        </td>

                        

                        <td className="px-5 py-4">

                          <span className="inline-block max-w-[180px] truncate px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                            /
                            {category.slug ||
                              "no-slug"}
                          </span>

                        </td>

                        

                        <td className="px-5 py-4">

                          <p className="text-xs text-gray-500 max-w-[300px] line-clamp-2">
                            {category.description ||
                              "No description"}
                          </p>

                        </td>

                        

                        <td className="px-5 py-4">

                          {category.active !==
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

                        </td>

                        

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openEdit(
                                  category
                                )
                              }
                              className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  category._id
                                )
                              }
                              disabled={
                                deletingId ===
                                category._id
                              }
                              className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId ===
                              category._id ? (
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
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

          

          <div className="lg:hidden divide-y divide-gray-100">

            {currentCategories.length === 0 ? (
              <div className="py-16 text-center">

                <FolderTree
                  size={42}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 font-bold text-gray-500">
                  No categories found
                </p>

              </div>
            ) : (
              currentCategories.map(
                (category) => (
                  <div
                    key={category._id}
                    className="p-4"
                  >

                    <div className="flex gap-3">

                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">

                        {category.image ? (
                          <img
                            src={
                              category.image
                            }
                            alt={
                              category.name ||
                              "Category"
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FolderTree
                              size={23}
                            />
                          </div>
                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between gap-2">

                          <div className="min-w-0">

                            <h3 className="font-bold text-gray-900 truncate">
                              {category.name ||
                                "Unnamed"}
                            </h3>

                            <p className="text-xs text-gray-400 mt-1 truncate">
                              /
                              {category.slug ||
                                "no-slug"}
                            </p>

                          </div>

                          {category.active !==
                          false ? (
                            <span className="shrink-0 px-2 py-1 rounded-full bg-green-50 text-green-600 text-[9px] font-black">
                              Active
                            </span>
                          ) : (
                            <span className="shrink-0 px-2 py-1 rounded-full bg-red-50 text-red-600 text-[9px] font-black">
                              Inactive
                            </span>
                          )}

                        </div>

                        <p className="text-xs text-gray-500 mt-3 line-clamp-2">
                          {category.description ||
                            "No description"}
                        </p>

                      </div>

                    </div>

                    <div className="flex gap-2 mt-4">

                      <button
                        onClick={() =>
                          openEdit(
                            category
                          )
                        }
                        className="flex-1 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Edit size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            category._id
                          )
                        }
                        disabled={
                          deletingId ===
                          category._id
                        }
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-50"
                      >
                        {deletingId ===
                        category._id ? (
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>

                    </div>

                  </div>
                )
              )
            )}

          </div>

          

          {filteredCategories.length >
            CATEGORIES_PER_PAGE && (
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
                      CATEGORIES_PER_PAGE,
                    filteredCategories.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-700">
                  {
                    filteredCategories.length
                  }
                </span>

              </p>

              <div className="flex items-center gap-1">

                <button
                  disabled={safePage === 1}
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
                        changePage(page)
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

        </section>

      </main>

      

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">

          

          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          

          <div className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">

            

            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-black text-gray-900">
                  {editingCategory
                    ? "Edit Category"
                    : "Create Category"}
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  {editingCategory
                    ? "Update category details"
                    : "Create a new product category"}
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

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Category Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleNameChange
                    }
                    placeholder="Example: Electronics"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

                </div>

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Slug *
                  </label>

                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="electronics"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

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
                    onChange={handleChange}
                    rows={4}
                    placeholder="Write category description..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm resize-none"
                  />

                </div>

                

                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Category Image URL
                  </label>

                  <div className="relative">

                    <ImageIcon
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="url"
                      name="image"
                      value={form.image}
                      onChange={handleChange}
                      placeholder="https://example.com/category.jpg"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                    />

                  </div>

                </div>

                

                <div className="md:col-span-2">

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">

                    <input
                      type="checkbox"
                      name="active"
                      checked={form.active}
                      onChange={handleChange}
                      className="w-4 h-4 accent-blue-600"
                    />

                    <div>

                      <p className="text-sm font-bold text-gray-800">
                        Active Category
                      </p>

                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Active categories can
                        be displayed on the
                        storefront.
                      </p>

                    </div>

                  </label>

                </div>

              </div>

              

              {form.image && (
                <div className="mt-5">

                  <p className="text-xs font-bold text-gray-700 mb-2">
                    Image Preview
                  </p>

                  <div className="w-28 h-28 rounded-2xl bg-gray-100 overflow-hidden border">

                    <img
                      src={form.image}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                </div>
              )}

              

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

                      {editingCategory
                        ? "Update Category"
                        : "Create Category"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminCategories;