import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import {
  MessageCircle,
  Save,
  RefreshCw,
  Phone,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Eye,
  Settings,
  Info,
} from "lucide-react";



const API_URL =
  import.meta.env.VITE_API_URL || "https://dropshiping-products-backend-3.onrender.com/api";



const DEFAULT_SETTINGS = {
  phone: "",
  enabled: true,
  productMessage: "Hello, I am interested in this product.",
  cartMessage: "Hello, I am interested in these products.",
};



function AdminWhatsapp() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);



  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };



  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/whatsapp/settings`
      );

      console.log("WHATSAPP SETTINGS RESPONSE:", response.data);

      const data =
        response.data?.settings ||
        response.data?.data ||
        response.data?.whatsapp ||
        response.data;

      if (data && typeof data === "object") {
        setSettings({
          phone:
            data.phone ||
            data.phoneNumber ||
            data.whatsappNumber ||
            data.number ||
            "",

          enabled:
            data.enabled !== undefined
              ? Boolean(data.enabled)
              : data.whatsappEnabled !== undefined
              ? Boolean(data.whatsappEnabled)
              : true,

          productMessage:
            data.productMessage ||
            data.whatsappMessage ||
            DEFAULT_SETTINGS.productMessage,

          cartMessage:
            data.cartMessage ||
            DEFAULT_SETTINGS.cartMessage,
        });
      }
    } catch (error) {
      console.error(
        "WhatsApp settings error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load WhatsApp settings"
      );
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchSettings();
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 12);

    setSettings((prev) => ({
      ...prev,
      phone: value,
    }));
  };



  const toggleWhatsapp = () => {
    setSettings((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login as admin");
      return;
    }

    const cleanNumber = String(settings.phone || "").replace(
      /\D/g,
      ""
    );

    if (!cleanNumber) {
      toast.error("WhatsApp number is required");
      return;
    }

    if (cleanNumber.length < 10) {
      toast.error("Please enter a valid WhatsApp number");
      return;
    }

    try {
      setSaving(true);



      const payload = {
        whatsappNumber: cleanNumber,

        whatsappMessage:
          settings.productMessage ||
          DEFAULT_SETTINGS.productMessage,

        whatsappEnabled: settings.enabled,

        productMessage:
          settings.productMessage ||
          DEFAULT_SETTINGS.productMessage,

        cartMessage:
          settings.cartMessage ||
          DEFAULT_SETTINGS.cartMessage,

        phone: cleanNumber,

        enabled: settings.enabled,
      };

      console.log(
        "WHATSAPP UPDATE PAYLOAD:",
        payload
      );

      const response = await axios.put(
        `${API_URL}/whatsapp/settings`,
        payload,
        getConfig()
      );

      console.log(
        "WHATSAPP UPDATE RESPONSE:",
        response.data
      );



      const data =
        response.data?.whatsapp ||
        response.data?.settings ||
        response.data?.data ||
        response.data;

      setSettings((prev) => ({
        ...prev,

        phone:
          data?.phone ||
          data?.phoneNumber ||
          data?.whatsappNumber ||
          data?.number ||
          cleanNumber,

        enabled:
          data?.enabled !== undefined
            ? Boolean(data.enabled)
            : data?.whatsappEnabled !== undefined
            ? Boolean(data.whatsappEnabled)
            : prev.enabled,

        productMessage:
          data?.productMessage ||
          data?.whatsappMessage ||
          prev.productMessage,

        cartMessage:
          data?.cartMessage ||
          prev.cartMessage,
      }));

      toast.success(
        response.data?.message ||
          "WhatsApp settings updated successfully"
      );
    } catch (error) {
      console.error(
        "Update WhatsApp Error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update WhatsApp settings"
      );
    } finally {
      setSaving(false);
    }
  };



  const productPreview = String(
    settings.productMessage || ""
  )
    .replace(/\{productName\}/gi, "Premium T-Shirt")
    .replace(/\{price\}/gi, "₹999");



  const cartPreview = String(
    settings.cartMessage || ""
  )
    .replace(/\{productName\}/gi, "Premium T-Shirt")
    .replace(/\{price\}/gi, "₹999");



  const previewNumber =
    settings.phone || "919876543210";



  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading WhatsApp settings...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        

        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                <MessageCircle size={26} />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  WhatsApp Settings
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Manage WhatsApp inquiry settings
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </div>
        </div>

        

        <div
          className={`mb-6 rounded-2xl border p-4 sm:p-5 ${
            settings.enabled
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  settings.enabled
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {settings.enabled ? (
                  <CheckCircle2 size={23} />
                ) : (
                  <XCircle size={23} />
                )}
              </div>

              <div>
                <h3
                  className={`font-bold ${
                    settings.enabled
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  WhatsApp Inquiry{" "}
                  {settings.enabled
                    ? "Enabled"
                    : "Disabled"}
                </h3>

                <p className="text-sm text-slate-600">
                  {settings.enabled
                    ? "Customers can send product and cart inquiries."
                    : "WhatsApp inquiry buttons are currently disabled."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleWhatsapp}
              aria-label="Toggle WhatsApp"
              className={`relative w-14 h-8 rounded-full transition ${
                settings.enabled
                  ? "bg-green-600"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                  settings.enabled
                    ? "left-7"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          

          <div className="xl:col-span-2">

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >

              

              <div className="px-5 sm:px-6 py-5 border-b border-slate-200">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Settings size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      WhatsApp Configuration
                    </h2>

                    <p className="text-sm text-slate-500">
                      Configure your business WhatsApp number
                    </p>
                  </div>

                </div>

              </div>

              

              <div className="p-5 sm:p-6 space-y-6">

                

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    WhatsApp Number
                  </label>

                  <div className="relative">

                    <Phone
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="phone"
                      value={settings.phone}
                      onChange={handlePhoneChange}
                      placeholder="919876543210"
                      inputMode="numeric"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition"
                    />

                  </div>

                  <div className="flex items-start gap-2 mt-2 text-xs text-slate-500">

                    <Info
                      size={14}
                      className="mt-0.5 shrink-0"
                    />

                    <p>
                      Enter WhatsApp number with country
                      code. Example:
                      <span className="font-semibold ml-1">
                        919876543210
                      </span>
                    </p>

                  </div>
                </div>

                

                <div>

                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">

                    <ShoppingBag size={17} />

                    Product Inquiry Message

                  </label>

                  <textarea
                    name="productMessage"
                    value={settings.productMessage}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter product inquiry message..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none resize-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition"
                  />

                  <p className="text-xs text-slate-400 mt-2">
                    You can use:
                    <span className="font-medium ml-1">
                      {"{productName}"}
                    </span>

                    <span className="mx-1">
                      and
                    </span>

                    <span className="font-medium">
                      {"{price}"}
                    </span>
                  </p>

                </div>

                

                <div>

                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">

                    <ShoppingCart size={17} />

                    Cart Inquiry Message

                  </label>

                  <textarea
                    name="cartMessage"
                    value={settings.cartMessage}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter cart inquiry message..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none resize-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition"
                  />

                  <p className="text-xs text-slate-400 mt-2">
                    This message will be used when
                    customers send their cart inquiry.
                  </p>

                </div>

              </div>

              

              <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <p className="text-xs text-slate-500">
                  Changes will apply to WhatsApp inquiry
                  buttons.
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-xl font-semibold shadow-sm transition"
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
                      Save Settings
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

          

          <div className="xl:col-span-1">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">

              

              <div className="px-5 py-5 border-b border-slate-200">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <Eye size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Preview
                    </h2>

                    <p className="text-xs text-slate-500">
                      WhatsApp message preview
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-5">

                

                <div className="rounded-t-2xl bg-green-600 px-4 py-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center">
                      <MessageCircle size={22} />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        MyStore
                      </p>

                      <p className="text-xs text-green-100">
                        WhatsApp Business
                      </p>
                    </div>

                  </div>

                </div>

                

                <div className="bg-[#e5ddd5] p-4 min-h-[300px]">

                  <div className="space-y-4">

                    

                    <div>

                      <p className="text-[11px] font-semibold text-slate-500 mb-1">
                        PRODUCT INQUIRY
                      </p>

                      <div className="bg-white rounded-xl rounded-tl-sm p-3 shadow-sm">

                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {productPreview}
                        </p>

                        <p className="text-[10px] text-slate-400 text-right mt-2">
                          10:30 AM
                        </p>

                      </div>

                    </div>

                    

                    <div>

                      <p className="text-[11px] font-semibold text-slate-500 mb-1">
                        CART INQUIRY
                      </p>

                      <div className="bg-white rounded-xl rounded-tl-sm p-3 shadow-sm">

                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {cartPreview}
                        </p>

                        <p className="text-[10px] text-slate-400 text-right mt-2">
                          10:31 AM
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                

                <div className="bg-white border border-t-0 border-slate-200 rounded-b-2xl p-4">

                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="text-xs text-slate-500">
                        Connected Number
                      </p>

                      <p className="font-semibold text-slate-800 mt-1 break-all">
                        +{previewNumber}
                      </p>
                    </div>

                    <div
                      className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        settings.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {settings.enabled
                        ? "Active"
                        : "Inactive"}
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          

          <div className="bg-white border border-slate-200 rounded-2xl p-5">

            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
              <ShoppingBag size={20} />
            </div>

            <h3 className="font-bold text-slate-900">
              Product Inquiry
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-6">
              Customers can directly ask about a
              particular product through WhatsApp.
            </p>

          </div>

          

          <div className="bg-white border border-slate-200 rounded-2xl p-5">

            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <ShoppingCart size={20} />
            </div>

            <h3 className="font-bold text-slate-900">
              Cart Inquiry
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-6">
              Customers can send their complete
              cart details through WhatsApp.
            </p>

          </div>

          

          <div className="bg-white border border-slate-200 rounded-2xl p-5">

            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Settings size={20} />
            </div>

            <h3 className="font-bold text-slate-900">
              Easy Management
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-6">
              Change your WhatsApp number and inquiry
              messages anytime from admin panel.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminWhatsapp;