import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Upload,
  Trash2,
  Save,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  Moon,
  Sun,
  Palette,
  Settings,
} from "lucide-react";

import { toast } from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const API_URL = (import.meta.env.VITE_API_URL || "https://dropshiping-products-backend-3.onrender.com/api").replace(/\/api\/?$/, "");

const AdminSetting = () => {
  const {
    themeMode,
    setThemeMode,
    primaryColor,
    setPrimaryColor,
  } = useTheme();



  const [settings, setSettings] = useState(null);

  const [siteName, setSiteName] = useState("MyStore");

  const [draftThemeMode, setDraftThemeMode] = useState(themeMode);

  const [draftPrimaryColor, setDraftPrimaryColor] = useState(primaryColor);

  const [logoFile, setLogoFile] = useState(null);

  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [savingName, setSavingName] = useState(false);

  const [deleting, setDeleting] = useState(false);



  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  };



  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/settings`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to fetch settings"
        );
      }

      const data = response.data.settings || {};

      setSettings(data);


      if (!localStorage.getItem("theme-mode")) {
        setThemeMode(
          data.themeMode === "dark" ? "dark" : "light"
        );
      }

      setDraftThemeMode(data.themeMode === "dark" ? "dark" : "light");


      if (
        !localStorage.getItem("primary-color") &&
        /^#[0-9a-fA-F]{6}$/.test(
          data.primaryColor || ""
        )
      ) {
        setPrimaryColor(data.primaryColor);
      }

      if (/^#[0-9a-fA-F]{6}$/.test(data.primaryColor || "")) {
        setDraftPrimaryColor(data.primaryColor);
      }


      setSiteName(
        data.siteName?.trim() || "MyStore"
      );


      if (data.logo) {
        const logoUrl = /^(https?:|data:)/i.test(data.logo)
          ? data.logo
          : `${API_URL}${data.logo}`;

        setPreview(logoUrl);
      } else {
        setPreview("");
      }
    } catch (error) {
      console.error(
        "GET SETTINGS ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load settings"
      );
    } finally {
      setLoading(false);
    }
  };



  const handleSaveAppearance = async () => {
    try {
      await axios.put(
        `${API_URL}/api/settings/appearance`,
        {
          themeMode: draftThemeMode,
          primaryColor: draftPrimaryColor,
        },
        getConfig()
      );

      localStorage.setItem(
        "theme-mode",
        draftThemeMode
      );

      localStorage.setItem(
        "primary-color",
        draftPrimaryColor
      );

      setThemeMode(draftThemeMode);
      setPrimaryColor(draftPrimaryColor);

      toast.success(
        "Theme and color updated successfully"
      );
    } catch (error) {
      console.error(
        "APPEARANCE ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update appearance"
      );
    }
  };



  useEffect(() => {
    fetchSettings();
  }, []);



  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;


    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        "Logo must be less than 2MB"
      );

      e.target.value = "";
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only JPG, PNG, WEBP and SVG files are allowed"
      );

      e.target.value = "";
      return;
    }


    if (
      preview &&
      preview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(preview);
    }

    const objectUrl =
      URL.createObjectURL(file);

    setLogoFile(file);
    setPreview(objectUrl);
  };



  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error(
        "Please select a logo first"
      );

      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("logo", logoFile);

      const response = await axios.post(
        `${API_URL}/api/settings/logo`,
        formData,
        getConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Logo upload failed"
        );
      }

      toast.success(
        "Logo updated successfully"
      );


      if (
        preview &&
        preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(preview);
      }

      setLogoFile(null);

      await fetchSettings();
    } catch (error) {
      console.error(
        "UPLOAD LOGO ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Logo upload failed"
      );
    } finally {
      setUploading(false);
    }
  };



  const handleDeleteLogo = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove the logo?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const response = await axios.delete(
        `${API_URL}/api/settings/logo`,
        getConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to remove logo"
        );
      }

      toast.success(
        "Logo removed successfully"
      );

      if (
        preview &&
        preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(preview);
      }

      setPreview("");
      setLogoFile(null);

      await fetchSettings();
    } catch (error) {
      console.error(
        "DELETE LOGO ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to remove logo"
      );
    } finally {
      setDeleting(false);
    }
  };



  const handleSaveSiteName = async () => {
    const trimmedName =
      siteName.trim();

    if (!trimmedName) {
      toast.error(
        "Website name is required"
      );

      return;
    }

    if (trimmedName.length > 100) {
      toast.error(
        "Website name cannot exceed 100 characters"
      );

      return;
    }

    try {
      setSavingName(true);

      const response = await axios.put(
        `${API_URL}/api/settings/site-name`,
        {
          siteName: trimmedName,
        },
        getConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update website name"
        );
      }

      toast.success(
        "Website name updated successfully"
      );

      setSiteName(trimmedName);
      window.dispatchEvent(new CustomEvent("site-name-updated", {
        detail: trimmedName,
      }));

      await fetchSettings();
    } catch (error) {
      console.error(
        "SITE NAME ERROR:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update website name"
      );
    } finally {
      setSavingName(false);
    }
  };



  useEffect(() => {
    return () => {
      if (
        preview &&
        preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);



  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      

      <div className="bg-white border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">

        <div className="max-w-[1600px] mx-auto px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">

                  <Settings size={15} />

                  Store configuration

                </div>

                <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                  Store Settings
                </h1>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Manage your storefront identity,
                  appearance, and customer-facing
                  brand from one place.
                </p>

              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">

                {draftThemeMode === "dark" ? (
                  <Moon
                    size={19}
                    className="text-blue-600"
                  />
                ) : (
                  <Sun
                    size={19}
                    className="text-amber-500"
                  />
                )}

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active theme
                  </p>

                  <p className="mt-0.5 text-sm font-bold capitalize text-slate-800 dark:text-white">
                    {draftThemeMode} mode
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      

      <main className="max-w-[1600px] mx-auto px-4 py-6 sm:px-6 lg:px-8">

        

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50">
              <Palette size={20} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900 dark:text-white">
                Theme and Brand Color
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Control the store appearance.
              </p>

            </div>

          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">

            

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Theme
              </label>

              <div className="grid grid-cols-2 gap-2">

                {["light", "dark"].map(
                  (mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setDraftThemeMode(mode)
                      }
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-bold capitalize transition ${
                        draftThemeMode === mode
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >

                      {mode === "dark" ? (
                        <Moon size={16} />
                      ) : (
                        <Sun size={16} />
                      )}

                      {mode}

                    </button>
                  )
                )}

              </div>

            </div>

            

            <div>

              <label
                htmlFor="primary-color"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Primary Color
              </label>

              <div className="flex gap-3">

                <input
                  id="primary-color"
                  type="color"
                  value={draftPrimaryColor}
                  onChange={(event) =>
                    setDraftPrimaryColor(
                      event.target.value
                    )
                  }
                  className="h-11 w-16 rounded-lg border border-slate-200 bg-white p-1"
                />

                <input
                  value={draftPrimaryColor}
                  onChange={(event) =>
                    setDraftPrimaryColor(
                      event.target.value
                    )
                  }
                  pattern="^#[0-9a-fA-F]{6}$"
                  className="h-11 flex-1 rounded-xl border border-slate-200 px-3 font-mono text-sm uppercase dark:border-slate-700"
                />

                <button
                  type="button"
                  onClick={
                    handleSaveAppearance
                  }
                  className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
                >
                  <Save size={17} />
                </button>

              </div>

            </div>

          </div>

        </div>

        

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Live preview
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                Storefront identity
              </h2>

            </div>

            <div
              className="rounded-xl px-4 py-2 text-sm font-bold text-white"
              style={{
                backgroundColor:
                  draftPrimaryColor,
              }}
            >
              {draftThemeMode === "dark"
                ? "Dark storefront"
                : "Light storefront"}
            </div>

          </div>

          <div
            className={`p-5 sm:p-6 ${
              draftThemeMode === "dark"
                ? "bg-slate-950"
                : "bg-slate-50"
            }`}
          >

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">

              <div
                className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl text-white"
                style={{
                  backgroundColor:
                    draftPrimaryColor,
                }}
              >

                {preview ? (
                  <img
                    src={preview}
                    alt="Store logo preview"
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <ImageIcon size={22} />
                )}

              </div>

              <div className="min-w-0">

                <p className="truncate text-lg font-black text-slate-900 dark:text-white">
                  {siteName || "MyStore"}
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your store name and logo preview
                </p>

              </div>

            </div>

          </div>

        </div>

        

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ImageIcon size={20} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900 dark:text-white">
                Website Information
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Basic website settings
              </p>

            </div>

          </div>

          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Website Name
          </label>

          <div className="flex flex-col sm:flex-row gap-3">

            <input
              type="text"
              value={siteName}
              maxLength={100}
              onChange={(e) =>
                setSiteName(
                  e.target.value
                )
              }
              placeholder="MyStore"
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <button
              type="button"
              onClick={
                handleSaveSiteName
              }
              disabled={savingName}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {savingName ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Name
                </>
              )}

            </button>

          </div>

        </div>

        

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

          

          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ImageIcon size={20} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900 dark:text-white">
                Store Logo
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                This logo will appear in your navbar.
              </p>

            </div>

          </div>

          

          <div className="grid md:grid-cols-2 gap-8">

            

            <div>

              <p className="text-sm font-semibold text-slate-700 mb-3">
                Logo Preview
              </p>

              <div className="h-52 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">

                {preview ? (
                  <img
                    src={preview}
                    alt="Store Logo"
                    className="max-h-36 max-w-[80%] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="text-center">

                    <ImageIcon
                      size={45}
                      className="mx-auto text-slate-300"
                    />

                    <p className="text-sm text-slate-400 mt-3">
                      No logo uploaded
                    </p>

                  </div>
                )}

              </div>

            </div>

            

            <div>

              <p className="text-sm font-semibold text-slate-700 mb-3">
                Change Logo
              </p>

              <label className="h-52 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 cursor-pointer flex flex-col items-center justify-center transition">

                <Upload
                  size={34}
                  className="text-blue-600"
                />

                <p className="text-sm font-bold text-slate-700 mt-3">
                  Choose Logo
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, WEBP or SVG
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Maximum 2MB
                </p>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.svg"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

              </label>

              

              {logoFile && (
                <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2">

                  <CheckCircle
                    size={17}
                    className="text-green-600 shrink-0"
                  />

                  <span className="text-xs font-semibold text-green-700 truncate">
                    {logoFile.name}
                  </span>

                </div>
              )}

            </div>

          </div>

          

          <div className="mt-7 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">

            

            <button
              type="button"
              onClick={
                handleUploadLogo
              }
              disabled={
                !logoFile ||
                uploading
              }
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {uploading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Logo
                </>
              )}

            </button>

            

            {settings?.logo && (
              <button
                type="button"
                onClick={
                  handleDeleteLogo
                }
                disabled={deleting}
                className="h-11 px-6 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {deleting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Remove Logo
                  </>
                )}

              </button>
            )}

          </div>

        </div>

      </main>

    </div>
  );
};

export default AdminSetting;