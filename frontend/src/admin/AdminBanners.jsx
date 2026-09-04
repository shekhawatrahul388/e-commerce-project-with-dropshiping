import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  Monitor,
  Smartphone,
  Upload,
} from "lucide-react";



const API_URL =
  import.meta.env.VITE_API_URL || "https://dropshiping-products-backend-3.onrender.com/api";



const FALLBACK_IMAGE =
  "https://placehold.co/1200x500/e2e8f0/64748b?text=Banner+Image";



const emptyForm = {
  title: "",
  subtitle: "",
  desktopImage: "",
  mobileImage: "",
  buttonText: "",
  buttonUrl: "",
  position: "left",
  order: 0,
  isActive: true,
  startDate: "",
  endDate: "",
};



const formatDateForInput = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};



function AdminBanners() {
  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    ...emptyForm,
  });



  const getConfig = (includeJson = true) => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        ...(includeJson ? { "Content-Type": "application/json" } : {}),
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    };
  };



  const handleImageLoad = (e) => {
    console.log("IMAGE LOADED:", e.currentTarget.src);
  };



  const handleImageError = (e) => {
    const img = e.currentTarget;

    console.error("IMAGE FAILED:", img.src);


    if (img.dataset.fallbackApplied === "true") {
      return;
    }

    img.dataset.fallbackApplied = "true";
    img.src = FALLBACK_IMAGE;
  };

  const handleBannerImageUpload = async (event, fieldName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const payload = new FormData();
      payload.append("image", file);
      const response = await axios.post(
        `${API_URL}/upload/single`,
        payload,
        getConfig(false)
      );
      const imageUrl = response.data?.image?.url;
      if (!imageUrl) throw new Error("Image URL was not returned");
      setFormData((previous) => ({ ...previous, [fieldName]: imageUrl }));
      toast.success("Banner image uploaded");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Banner image upload failed");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };



  const fetchBanners = async () => {
    try {
      setLoading(true);

      console.log("================================");
      console.log("FETCHING BANNERS...");
      console.log("API:", `${API_URL}/banner/admin/all`);

      const response = await axios.get(
        `${API_URL}/banner/admin/all`,
        getConfig()
      );

      console.log("BANNERS API RESPONSE:", response.data);

      const responseData = response.data;

      let data = [];



      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (Array.isArray(responseData?.banners)) {
        data = responseData.banners;
      } else if (Array.isArray(responseData?.data)) {
        data = responseData.data;
      }

      console.log("FINAL BANNERS:", data);

      setBanners(data);
    } catch (error) {
      console.error("BANNER FETCH ERROR:", error);

      console.error(
        "BACKEND ERROR:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load banners"
      );

      setBanners([]);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchBanners();
  }, []);



  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };



  const openAddModal = () => {
    setEditingId(null);

    setFormData({
      ...emptyForm,
    });

    setShowModal(true);
  };



  const openEditModal = (banner) => {
    if (!banner?._id) {
      toast.error("Invalid banner");
      return;
    }

    setEditingId(banner._id);

    setFormData({
      title: banner.title || "",

      subtitle: banner.subtitle || "",

      desktopImage:
        banner.desktopImage || "",

      mobileImage:
        banner.mobileImage || "",

      buttonText:
        banner.buttonText || "",

      buttonUrl:
        banner.buttonUrl || "",

      position:
        banner.position || "left",

      order:
        banner.order ?? 0,

      isActive:
        typeof banner.isActive === "boolean"
          ? banner.isActive
          : true,

      startDate:
        formatDateForInput(
          banner.startDate
        ),

      endDate:
        formatDateForInput(
          banner.endDate
        ),
    });

    setShowModal(true);
  };



  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);

    setFormData({
      ...emptyForm,
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();



    if (!formData.title.trim()) {
      toast.error("Banner title is required");
      return;
    }

    if (!formData.desktopImage.trim()) {
      toast.error("Desktop image URL is required");
      return;
    }



    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >
        new Date(formData.endDate)
    ) {
      toast.error(
        "End date cannot be before start date"
      );
      return;
    }



    const payload = {
      title: formData.title.trim(),

      subtitle: formData.subtitle.trim(),

      desktopImage:
        formData.desktopImage.trim(),

      mobileImage:
        formData.mobileImage.trim(),

      buttonText:
        formData.buttonText.trim(),

      buttonUrl:
        formData.buttonUrl.trim(),

      position:
        formData.position || "left",

      order:
        Number(formData.order) || 0,

      isActive:
        Boolean(formData.isActive),

      startDate:
        formData.startDate || null,

      endDate:
        formData.endDate || null,
    };

    console.log("BANNER PAYLOAD:", payload);

    try {
      setSaving(true);



      if (editingId) {
        const response = await axios.put(
          `${API_URL}/banner/update/${editingId}`,
          payload,
          getConfig()
        );

        console.log(
          "UPDATE RESPONSE:",
          response.data
        );

        toast.success(
          "Banner updated successfully"
        );
      }



      else {
        const response = await axios.post(
          `${API_URL}/banner/create`,
          payload,
          getConfig()
        );

        console.log(
          "CREATE RESPONSE:",
          response.data
        );

        toast.success(
          "Banner created successfully"
        );
      }



      setShowModal(false);
      setEditingId(null);

      setFormData({
        ...emptyForm,
      });

      await fetchBanners();
    } catch (error) {
      console.error(
        "BANNER SAVE ERROR:",
        error
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save banner"
      );
    } finally {
      setSaving(false);
    }
  };



  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid banner ID");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await axios.delete(
        `${API_URL}/banner/delete/${id}`,
        getConfig()
      );

      console.log(
        "DELETE RESPONSE:",
        response.data
      );

      toast.success(
        "Banner deleted successfully"
      );

      await fetchBanners();
    } catch (error) {
      console.error(
        "DELETE ERROR:",
        error
      );

      console.error(
        "DELETE BACKEND RESPONSE:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete banner"
      );
    } finally {
      setDeletingId(null);
    }
  };



  const handleToggle = async (banner) => {
    if (!banner?._id) {
      toast.error("Invalid banner");
      return;
    }

    try {
      const newStatus = !banner.isActive;

      await axios.put(
        `${API_URL}/banner/update/${banner._id}`,
        {
          isActive: newStatus,
        },
        getConfig()
      );

      toast.success(
        newStatus
          ? "Banner activated"
          : "Banner disabled"
      );

      await fetchBanners();
    } catch (error) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  };



  const filteredBanners = banners.filter(
    (banner) => {
      const text = `
        ${banner?.title || ""}
        ${banner?.subtitle || ""}
        ${banner?.buttonText || ""}
      `.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    }
  );



  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <RefreshCw
              size={26}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading banners...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">

      

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <ImageIcon size={27} />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Banner Management
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage homepage banners and promotional sections.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Plus size={19} />
          Add Banner
        </button>

      </div>

      

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Banners"
          value={banners.length}
          icon={ImageIcon}
          bg="bg-blue-50"
          text="text-blue-600"
        />

        <StatCard
          title="Active"
          value={
            banners.filter(
              (item) => item.isActive
            ).length
          }
          icon={Eye}
          bg="bg-green-50"
          text="text-green-600"
        />

        <StatCard
          title="Inactive"
          value={
            banners.filter(
              (item) => !item.isActive
            ).length
          }
          icon={EyeOff}
          bg="bg-red-50"
          text="text-red-600"
        />

        <StatCard
          title="Visible"
          value={
            banners.filter(
              (item) => item.isActive
            ).length
          }
          icon={Monitor}
          bg="bg-purple-50"
          text="text-purple-600"
        />

      </div>

      

      <div className="bg-white border border-slate-200 rounded-2xl p-4">

        <div className="relative max-w-md">

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
            placeholder="Search banners..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </div>

      

      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Banner
                </th>

                <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Button
                </th>

                <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Position
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

            <tbody>

              {filteredBanners.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center"
                  >

                    <ImageIcon
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-600">
                      No banners found
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Create your first banner.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredBanners.map(
                  (banner) => (

                    <tr
                      key={banner._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                    >

                      

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-4">

                          <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">

                            <img
                              src={
                                banner.desktopImage ||
                                FALLBACK_IMAGE
                              }
                              alt={
                                banner.title ||
                                "Banner"
                              }
                              className="block w-full h-full object-cover"
                              onLoad={
                                handleImageLoad
                              }
                              onError={
                                handleImageError
                              }
                            />

                          </div>

                          <div className="min-w-0">

                            <p className="font-bold text-slate-800 truncate max-w-[240px]">
                              {banner.title ||
                                "Untitled Banner"}
                            </p>

                            {banner.subtitle && (
                              <p className="text-xs text-slate-500 mt-1 truncate max-w-[240px]">
                                {banner.subtitle}
                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      

                      <td className="px-5 py-4">

                        {banner.buttonText ? (

                          <div>

                            <span className="inline-flex px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold">
                              {banner.buttonText}
                            </span>

                            {banner.buttonUrl && (
                              <p className="text-[11px] text-slate-400 mt-1 max-w-[160px] truncate">
                                {banner.buttonUrl}
                              </p>
                            )}

                          </div>

                        ) : (

                          <span className="text-xs text-slate-400">
                            No button
                          </span>

                        )}

                      </td>

                      

                      <td className="px-5 py-4">

                        <span className="capitalize inline-flex px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                          {banner.position || "left"}
                        </span>

                      </td>

                      

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                          {banner.order ?? 0}
                        </span>

                      </td>

                      

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleToggle(
                              banner
                            )
                          }
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                            banner.isActive
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >

                          {banner.isActive ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}

                          {banner.isActive
                            ? "Active"
                            : "Inactive"}

                        </button>

                      </td>

                      

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          {banner.buttonUrl && (
                            <a
                              href={
                                banner.buttonUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                            >
                              <ExternalLink
                                size={16}
                              />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                banner
                              )
                            }
                            className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              banner._id
                            }
                            onClick={() =>
                              handleDelete(
                                banner._id
                              )
                            }
                            className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 flex items-center justify-center"
                          >

                            {deletingId ===
                            banner._id ? (
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

      </div>

      

      <div className="lg:hidden space-y-4">

        {filteredBanners.length === 0 ? (

          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

            <ImageIcon
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-600">
              No banners found
            </p>

          </div>

        ) : (

          filteredBanners.map(
            (banner) => (

              <div
                key={banner._id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
              >

                

                <div className="relative w-full h-52 bg-slate-100 overflow-hidden">

                  <img
                    src={
                      banner.desktopImage ||
                      FALLBACK_IMAGE
                    }
                    alt={
                      banner.title ||
                      "Banner"
                    }
                    className="block w-full h-full object-cover"
                    onLoad={
                      handleImageLoad
                    }
                    onError={
                      handleImageError
                    }
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(
                        banner
                      )
                    }
                    className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold ${
                      banner.isActive
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {banner.isActive
                      ? "Active"
                      : "Inactive"}
                  </button>

                </div>

                

                <div className="p-4">

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <h3 className="font-bold text-slate-900 truncate">
                        {banner.title ||
                          "Untitled Banner"}
                      </h3>

                      {banner.subtitle && (
                        <p className="text-xs text-slate-500 mt-1">
                          {banner.subtitle}
                        </p>
                      )}

                    </div>

                    <span className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {banner.order ?? 0}
                    </span>

                  </div>

                  {banner.buttonText && (
                    <div className="mt-3">
                      <span className="inline-flex px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold">
                        {banner.buttonText}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">

                    <span className="text-xs text-slate-400">
                      Position:
                    </span>

                    <span className="text-xs font-semibold text-slate-600 capitalize">
                      {banner.position ||
                        "left"}
                    </span>

                  </div>

                  

                  <div className="grid grid-cols-2 gap-2 mt-4">

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(
                          banner
                        )
                      }
                      className="h-10 rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        banner._id
                      }
                      onClick={() =>
                        handleDelete(
                          banner._id
                        )
                      }
                      className="h-10 rounded-xl bg-red-50 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >

                      {deletingId ===
                      banner._id ? (
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      Delete

                    </button>

                  </div>

                </div>

              </div>

            )
          )

        )}

      </div>

      

      {showModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          

          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          

          <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">

            

            <div className="sticky top-0 z-30 px-5 sm:px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Banner"
                    : "Create Banner"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Add banner information and promotional content.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                

                <div className="space-y-5">

                  

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Title
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={
                        formData.title
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Summer Sale"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-blue-600">
                      <Upload size={15} />
                      {uploadingImage ? "Uploading..." : "Upload image instead"}
                      <input type="file" accept="image/*" onChange={(event) => handleBannerImageUpload(event, "desktopImage")} disabled={uploadingImage} className="hidden" />
                    </label>

                  </div>

                  

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Subtitle
                    </label>

                    <input
                      type="text"
                      name="subtitle"
                      value={
                        formData.subtitle
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Up to 50% Off"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-blue-600">
                      <Upload size={15} />
                      Upload mobile image
                      <input type="file" accept="image/*" onChange={(event) => handleBannerImageUpload(event, "mobileImage")} disabled={uploadingImage} className="hidden" />
                    </label>

                  </div>

                  

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Desktop Image URL
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <input
                      type="url"
                      name="desktopImage"
                      value={
                        formData.desktopImage
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="https://example.com/banner.jpg"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Recommended: 1920 × 600
                    </p>

                  </div>

                  

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mobile Image URL
                    </label>

                    <input
                      type="url"
                      name="mobileImage"
                      value={
                        formData.mobileImage
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="https://example.com/mobile.jpg"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Optional. Desktop image will be used if empty.
                    </p>

                  </div>

                  

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Button Text
                      </label>

                      <input
                        type="text"
                        name="buttonText"
                        value={
                          formData.buttonText
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Shop Now"
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Button URL
                      </label>

                      <input
                        type="text"
                        name="buttonUrl"
                        value={
                          formData.buttonUrl
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="/products"
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                  </div>

                  

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Text Position
                    </label>

                    <select
                      name="position"
                      value={
                        formData.position
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="left">
                        Left
                      </option>

                      <option value="center">
                        Center
                      </option>

                      <option value="right">
                        Right
                      </option>
                    </select>

                  </div>

                  

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Display Order
                    </label>

                    <input
                      type="number"
                      name="order"
                      min="0"
                      value={
                        formData.order
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Start Date
                      </label>

                      <input
                        type="date"
                        name="startDate"
                        value={
                          formData.startDate
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        End Date
                      </label>

                      <input
                        type="date"
                        name="endDate"
                        value={
                          formData.endDate
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                  </div>

                  

                  <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">

                    <div className="flex items-center gap-3">

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          formData.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >

                        {formData.isActive ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff
                            size={18}
                          />
                        )}

                      </div>

                      <div>

                        <p className="font-semibold text-sm text-slate-800">
                          Banner Status
                        </p>

                        <p className="text-xs text-slate-500">
                          {formData.isActive
                            ? "Banner is active"
                            : "Banner is inactive"}
                        </p>

                      </div>

                    </div>

                    <input
                      type="checkbox"
                      name="isActive"
                      checked={
                        formData.isActive
                      }
                      onChange={
                        handleChange
                      }
                      className="w-5 h-5 accent-blue-600"
                    />

                  </label>

                </div>

                

                <div>

                  

                  <div className="flex items-center gap-2 mb-3">

                    <Monitor
                      size={17}
                      className="text-slate-500"
                    />

                    <h3 className="font-bold text-slate-800">
                      Desktop Preview
                    </h3>

                  </div>

                  <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">

                    <img
                      src={
                        formData.desktopImage ||
                        FALLBACK_IMAGE
                      }
                      alt="Desktop banner preview"
                      className="absolute inset-0 z-0 block w-full h-full object-cover"
                      onLoad={
                        handleImageLoad
                      }
                      onError={
                        handleImageError
                      }
                    />

                    <div className="absolute inset-0 z-10 bg-black/25 pointer-events-none" />

                    <div
                      className={`absolute inset-0 z-20 p-6 sm:p-8 flex flex-col justify-center ${
                        formData.position ===
                        "center"
                          ? "items-center text-center"
                          : formData.position ===
                            "right"
                          ? "items-end text-right"
                          : "items-start text-left"
                      }`}
                    >

                      {formData.subtitle && (
                        <p className="text-sm text-white/90 mb-2 drop-shadow">
                          {
                            formData.subtitle
                          }
                        </p>
                      )}

                      <h2 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">
                        {formData.title ||
                          "Banner Title"}
                      </h2>

                      {formData.buttonText && (
                        <span className="mt-4 inline-flex w-fit px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-bold shadow-lg">
                          {
                            formData.buttonText
                          }
                        </span>
                      )}

                    </div>

                  </div>

                  

                  <div className="mt-7">

                    <div className="flex items-center gap-2 mb-3">

                      <Smartphone
                        size={17}
                        className="text-slate-500"
                      />

                      <h3 className="font-bold text-slate-800">
                        Mobile Preview
                      </h3>

                    </div>

                    <div className="mx-auto w-[250px] sm:w-[280px] aspect-[9/16] rounded-[2rem] border-[7px] border-slate-800 overflow-hidden bg-slate-200 relative shadow-xl">

                      <img
                        src={
                          formData.mobileImage ||
                          formData.desktopImage ||
                          FALLBACK_IMAGE
                        }
                        alt="Mobile banner preview"
                        className="absolute inset-0 z-0 block w-full h-full object-cover"
                        onLoad={
                          handleImageLoad
                        }
                        onError={
                          handleImageError
                        }
                      />

                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      <div className="absolute z-20 bottom-0 left-0 right-0 p-5">

                        {formData.subtitle && (
                          <p className="text-[11px] text-white/80 mb-1">
                            {
                              formData.subtitle
                            }
                          </p>
                        )}

                        <h3 className="text-xl font-bold text-white">
                          {formData.title ||
                            "Banner"}
                        </h3>

                        {formData.buttonText && (
                          <span className="inline-flex mt-3 px-3 py-1.5 bg-white rounded-lg text-[10px] font-bold text-slate-900">
                            {
                              formData.buttonText
                            }
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-5 border-t border-slate-200">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 px-5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold flex items-center justify-center gap-2"
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
                      {editingId
                        ? "Update Banner"
                        : "Create Banner"}
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



function StatCard({
  title,
  value,
  icon: Icon,
  bg,
  text,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">

      <div className="flex items-center justify-between gap-3">

        <div>

          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl ${bg} ${text} flex items-center justify-center`}
        >
          <Icon size={20} />
        </div>

      </div>

    </div>
  );
}

export default AdminBanners;