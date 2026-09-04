import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  Save,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
} from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";



const API_URL =
  import.meta.env.VITE_API_URL || "https://dropshiping-products-backend-3.onrender.com/api";



const initialForm = {
  companyName: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
  copyright: "",
};



const AdminFooter = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(initialForm);



  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        "Content-Type": "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
    };
  };



  const setFooterData = (footer) => {
    setForm({
      companyName: footer?.companyName || "",
      description: footer?.description || "",
      phone: footer?.phone || "",
      email: footer?.email || "",
      address: footer?.address || "",
      facebook: footer?.facebook || "",
      instagram: footer?.instagram || "",
      twitter: footer?.twitter || "",
      youtube: footer?.youtube || "",
      copyright: footer?.copyright || "",
    });
  };



  const getFooter = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/footer`,
        getConfig()
      );

      console.log("GET FOOTER RESPONSE:", response.data);




      const footer =
        response.data?.footer ||
        response.data?.data ||
        response.data;

      if (footer) {
        setFooterData(footer);
      }
    } catch (error) {
      console.error(
        "GET FOOTER ERROR:",
        error.response?.data || error.message
      );

      if (error.response?.status === 404) {
        toast.error("Footer API route nahi mila");
      } else if (error.response?.status === 401) {
        toast.error("Please login again");
      } else if (error.response?.status === 403) {
        toast.error("Admin permission required");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Footer load nahi ho raha"
        );
      }
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    getFooter();
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyName.trim()) {
      toast.error("Company name required hai");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        companyName: form.companyName.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        facebook: form.facebook.trim(),
        instagram: form.instagram.trim(),
        twitter: form.twitter.trim(),
        youtube: form.youtube.trim(),
        copyright: form.copyright.trim(),
      };

      console.log("=================================");
      console.log("FOOTER PAYLOAD:");
      console.log(payload);
      console.log("=================================");

      const response = await axios.put(
        `${API_URL}/footer/update`,
        payload,
        getConfig()
      );

      console.log(
        "UPDATE FOOTER RESPONSE:",
        response.data
      );

      if (response.data?.success) {
        toast.success(
          response.data?.message ||
            "Footer successfully update ho gaya"
        );

        const footer =
          response.data?.footer ||
          response.data?.data;

        if (footer) {
          setFooterData(footer);
        } else {
          setForm(payload);
        }

        window.dispatchEvent(new CustomEvent("site-name-updated", {
          detail: payload.companyName,
        }));
      } else {
        toast.success(
          response.data?.message ||
            "Footer successfully update ho gaya"
        );
      }
    } catch (error) {
      console.error(
        "UPDATE FOOTER ERROR:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        toast.error("Please login again");
      } else if (error.response?.status === 403) {
        toast.error("Admin permission required");
      } else if (error.response?.status === 404) {
        toast.error("Footer update API route nahi mila");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Footer update nahi ho raha"
        );
      }
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-blue-600" />

          <p className="text-sm text-slate-500">
            Loading footer...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto">

        

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText size={24} />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Footer Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Website footer information manage karein
              </p>
            </div>

          </div>
        </div>

        

        <form onSubmit={handleSubmit}>

          

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Company Information
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Footer me company ki basic information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Company Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <Building2
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="My Ecommerce"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Phone
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="support@example.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Address
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Jaipur, Rajasthan, India"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

            </div>

            

            <div className="mt-5">

              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Company ke baare me description..."
                className="w-full rounded-xl border border-slate-200 bg-white p-4 outline-none text-sm resize-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Social Media Links
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Apne social media profile links add karein
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                  <FaFacebook className="text-blue-600" />
                  Facebook
                </label>

                <input
                  type="url"
                  name="facebook"
                  value={form.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                  <FaInstagram className="text-pink-500" />
                  Instagram
                </label>

                <input
                  type="url"
                  name="instagram"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                  <FaTwitter className="text-sky-500" />
                  Twitter / X
                </label>

                <input
                  type="url"
                  name="twitter"
                  value={form.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                  <FaYoutube className="text-red-500" />
                  YouTube
                </label>

                <input
                  type="url"
                  name="youtube"
                  value={form.youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

          </div>

          

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">

            <h2 className="mb-2 text-lg font-bold text-slate-800">
              Copyright
            </h2>

            <p className="text-sm text-slate-500 mb-5">
              Website ke footer me copyright text
            </p>

            <input
              type="text"
              name="copyright"
              value={form.copyright}
              onChange={handleChange}
              placeholder="© 2026 My Ecommerce. All rights reserved."
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          

          <div className="flex justify-end pb-8">

            <button
              type="submit"
              disabled={saving}
              className="h-11 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:cursor-not-allowed"
            >

              {saving ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={19} />

                  Save Footer
                </>
              )}

            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminFooter;