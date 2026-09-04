import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit3,
  X,
  Save,
  Menu as MenuIcon,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Link as LinkIcon,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://dropshiping-products-backend-3.onrender.com/api";

const initialForm = {
  title: "",
  url: "",
  type: "link",
  parent: "",
  icon: "",
  order: 0,
  isActive: true,
  openInNewTab: false,
};

function AdminMenu() {


  const [menus, setMenus] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  const [formData, setFormData] = useState(initialForm);



  const getConfig = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
    }

    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
  };



  const fetchMenus = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/menu/admin/all`,
        getConfig()
      );

      console.log("MENU RESPONSE:", response.data);

      const responseData = response.data;

      const data =
        responseData?.data ||
        responseData?.menus ||
        responseData?.items ||
        [];

      setMenus(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("MENU FETCH ERROR:", error);

      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        toast.error("Admin access required.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load menus"
        );
      }

      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };



  const openEditModal = (menu) => {
    if (!menu) return;

    setEditingMenu(menu);

    setFormData({
      title: menu.title || "",
      url: menu.url || "",
      type: menu.type || "link",

      parent:
        typeof menu.parent === "object"
          ? menu.parent?._id || ""
          : menu.parent || "",

      icon: menu.icon || "",

      order:
        menu.order !== undefined && menu.order !== null
          ? menu.order
          : 0,

      isActive:
        menu.isActive !== undefined
          ? Boolean(menu.isActive)
          : true,

      openInNewTab:
        menu.openInNewTab !== undefined
          ? Boolean(menu.openInNewTab)
          : false,
    });

    setShowModal(true);
  };



  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMenu(null);
    setFormData(initialForm);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = formData.title.trim();
    const url = formData.url.trim();

    if (!title) {
      toast.error("Menu title is required");
      return;
    }

    if (!url) {
      toast.error("Menu URL is required");
      return;
    }

    const payload = {
      title,

      url,

      type: formData.type || "link",

      parent: formData.parent || null,

      icon: formData.icon.trim(),

      order: Number(formData.order) || 0,

      isActive: Boolean(formData.isActive),

      openInNewTab: Boolean(formData.openInNewTab),
    };

    console.log("MENU PAYLOAD:", payload);

    try {
      setSaving(true);



      if (editingMenu?._id) {
        const response = await axios.put(
          `${API_URL}/menu/update/${editingMenu._id}`,
          payload,
          getConfig()
        );

        console.log("MENU UPDATE RESPONSE:", response.data);

        toast.success(
          response.data?.message ||
            "Menu updated successfully"
        );
      } else {
        toast.error("Select a menu to edit");
        return;
      }

      closeModal();

      await fetchMenus();
    } catch (error) {
      console.error("MENU SAVE ERROR:", error);
      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        toast.error("Admin access required.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to save menu"
        );
      }
    } finally {
      setSaving(false);
    }
  };



  const getStatus = (menu) => {
    return menu?.isActive !== false;
  };



  const filteredMenus = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return menus;
    }

    return menus.filter((menu) => {
      return (
        menu?.title?.toLowerCase().includes(keyword) ||
        menu?.url?.toLowerCase().includes(keyword) ||
        menu?.type?.toLowerCase().includes(keyword) ||
        menu?.icon?.toLowerCase().includes(keyword)
      );
    });
  }, [menus, search]);



  const parentMenus = useMemo(() => {
    return menus.filter((menu) => {

      if (
        editingMenu?._id &&
        menu._id === editingMenu._id
      ) {
        return false;
      }

      return true;
    });
  }, [menus, editingMenu]);



  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
              <MenuIcon size={28} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Menu Management
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Edit your website navigation menu
              </p>
            </div>

          </div>

        </div>

        

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">
              Total Menus
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
              {menus.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">
              Active
            </p>

            <p className="text-2xl font-bold text-green-600 mt-1">
              {
                menus.filter((menu) =>
                  getStatus(menu)
                ).length
              }
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">
              Inactive
            </p>

            <p className="text-2xl font-bold text-red-500 mt-1">
              {
                menus.filter(
                  (menu) => !getStatus(menu)
                ).length
              }
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">
              Showing
            </p>

            <p className="text-2xl font-bold text-blue-600 mt-1">
              {filteredMenus.length}
            </p>
          </div>

        </div>

        

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">

          <div className="flex flex-col sm:flex-row gap-3">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search menus..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />

            </div>

            <button
              type="button"
              onClick={fetchMenus}
              disabled={loading}
              className="h-11 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 transition"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>

        </div>

        

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">

              <RefreshCw
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="text-sm text-slate-500 mt-4">
                Loading menus...
              </p>

            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-5">

              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <MenuIcon size={28} />
              </div>

              <h3 className="font-bold text-slate-800 mt-4">
                No menus found
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                No navigation menus are available to edit.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      #
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Menu
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      URL
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Parent
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Order
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredMenus.map(
                    (menu, index) => {

                      const active =
                        getStatus(menu);

                      const destination =
                        menu.url || "#";

                      const parentName =
                        typeof menu.parent === "object"
                          ? menu.parent?.title
                          : menus.find(
                              (item) =>
                                item._id ===
                                menu.parent
                            )?.title;

                      return (
                        <tr
                          key={menu._id}
                          className="hover:bg-slate-50/70 transition"
                        >

                          

                          <td className="px-5 py-4">
                            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                          </td>

                          

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <MenuIcon size={18} />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {menu.title ||
                                    "Unnamed Menu"}
                                </p>

                                {menu.icon && (
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {menu.icon}
                                  </p>
                                )}
                              </div>

                            </div>

                          </td>

                          

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <LinkIcon
                                size={15}
                                className="text-slate-400 shrink-0"
                              />

                              <code className="px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-600 max-w-[180px] truncate">
                                {destination}
                              </code>

                              {destination !== "#" && (
                                <a
                                  href={destination}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-blue-600"
                                  title="Open"
                                >
                                  <ExternalLink
                                    size={14}
                                  />
                                </a>
                              )}

                            </div>

                          </td>

                          

                          <td className="px-5 py-4">

                            <span className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold">
                              {menu.type ||
                                "link"}
                            </span>

                          </td>

                          

                          <td className="px-5 py-4">

                            {parentName ? (
                              <span className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-semibold">
                                {parentName}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Main Menu
                              </span>
                            )}

                          </td>

                          

                          <td className="px-5 py-4">

                            <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold">
                              {menu.order ??
                                index + 1}
                            </span>

                          </td>

                          

                          <td className="px-5 py-4">

                            {active ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">

                                <Eye size={13} />

                                Active

                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">

                                <EyeOff size={13} />

                                Inactive

                              </span>
                            )}

                          </td>

                          

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(menu)
                                }
                                className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                                title="Edit"
                              >
                                <Edit3 size={16} />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

      

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          

          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            

            <div className="sticky top-0 z-10 bg-white px-5 sm:px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">

                  <Edit3 size={19} />

                </div>

                <div>

                  <h2 className="font-bold text-lg text-slate-900">
                    Edit Menu
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure navigation menu
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 space-y-5"
            >

              

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Menu Title
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: Products"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Menu URL
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <div className="relative">

                  <LinkIcon
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="/products"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Menu Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="link">
                    Link
                  </option>

                  <option value="dropdown">
                    Dropdown
                  </option>

                </select>

              </div>

              

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Parent Menu
                </label>

                <select
                  name="parent"
                  value={formData.parent}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="">
                    No Parent - Main Menu
                  </option>

                  {parentMenus.map((menu) => (
                    <option
                      key={menu._id}
                      value={menu._id}
                    >
                      {menu.title}
                    </option>
                  ))}

                </select>

              </div>

              

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Icon
                </label>

                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  placeholder="Home, ShoppingBag, User..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Display Order
                </label>

                <input
                  type="number"
                  name="order"
                  min="0"
                  value={formData.order}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              

              <label className="min-h-11 px-4 py-2 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer">

                <span className="text-sm text-slate-700 font-medium">
                  {formData.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-600"
                />

              </label>

              

              <label className="min-h-11 px-4 py-2 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer">

                <span className="text-sm text-slate-700 font-medium">
                  Open in new tab
                </span>

                <input
                  type="checkbox"
                  name="openInNewTab"
                  checked={
                    formData.openInNewTab
                  }
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-600"
                />

              </label>

              

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Preview
                </p>

                <div className="flex items-center justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <MenuIcon size={17} />
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-slate-800">
                        {formData.title ||
                          "Menu Title"}
                      </span>

                      <p className="text-xs text-slate-400">
                        {formData.url ||
                          "/example"}
                      </p>
                    </div>

                  </div>

                  {formData.type ===
                    "dropdown" && (
                    <ChevronDown
                      size={16}
                      className="text-slate-400"
                    />
                  )}

                </div>

              </div>

              

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold flex items-center justify-center gap-2 transition"
                >

                  {saving ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />

                      Update Menu
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

export default AdminMenu;