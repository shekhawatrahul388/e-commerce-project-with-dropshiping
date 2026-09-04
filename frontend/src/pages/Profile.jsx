import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Phone,
  Save,
  Loader2,
  MapPin,
  Heart,
  ShoppingCart,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Package
} from "lucide-react";

import { toast } from "react-hot-toast";
import api from "../api/axios";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);



  const getProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/user/profile"
      );

      console.log(
        "PROFILE RESPONSE:",
        response.data
      );

      const profile =
        response.data?.user ||
        response.data?.data ||
        response.data;

      if (!profile) {
        throw new Error(
          "Profile data not found"
        );
      }

      setUser(profile);

      setFormData({
        name: profile?.name || "",
        phone: profile?.phone
          ? String(profile.phone)
          : "",
      });

      localStorage.setItem(
        "user",
        JSON.stringify(profile)
      );

    } catch (error) {
      console.error(
        "PROFILE ERROR:",
        error
      );

      if (
        error?.response?.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        toast.error(
          "Session expired. Please login again."
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      toast.error(
        error?.response?.data?.message ||
          "Unable to load profile"
      );

    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    getProfile();
  }, []);



  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    if (name === "phone") {
      const number = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        phone: number,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const name =
      formData.name.trim();

    const phone =
      formData.phone
        .replace(/\D/g, "")
        .slice(0, 10);


    if (!name) {
      toast.error(
        "Please enter your name"
      );
      return;
    }

    if (name.length < 2) {
      toast.error(
        "Name must be at least 2 characters"
      );
      return;
    }


    if (!phone) {
      toast.error(
        "Please enter your phone number"
      );
      return;
    }

    if (phone.length !== 10) {
      toast.error(
        "Phone number must be 10 digits"
      );
      return;
    }

    try {
      setSaving(true);




      const response = await api.put(
        "/user/editprofile",
        {
          name,
          phone,
        }
      );

      console.log(
        "UPDATE PROFILE RESPONSE:",
        response.data
      );

      const updatedUser =
        response.data?.user ||
        response.data?.data ||
        {
          ...user,
          name,
          phone,
        };

      setUser(updatedUser);

      setFormData({
        name:
          updatedUser?.name ||
          name,

        phone: updatedUser?.phone
          ? String(updatedUser.phone)
          : phone,
      });

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      toast.success(
        response.data?.message ||
          "Profile updated successfully"
      );

    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      if (
        error?.response?.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        toast.error(
          "Session expired. Please login again."
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      toast.error(
        error?.response?.data?.message ||
          "Unable to update profile"
      );

    } finally {
      setSaving(false);
    }
  };



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    sessionStorage.removeItem(
      "loginPhone"
    );

    sessionStorage.removeItem(
      "loginName"
    );

    sessionStorage.removeItem(
      "registerPhone"
    );

    sessionStorage.removeItem(
      "registerName"
    );

    sessionStorage.removeItem(
      "devOtp"
    );

    toast.success(
      "Logged out successfully"
    );

    navigate("/login", {
      replace: true,
    });
  };



  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <Loader2
            size={40}
            className="animate-spin text-blue-600 mx-auto"
          />

          <p className="text-gray-500 mt-3">
            Loading profile...
          </p>

        </div>

      </main>
    );
  }



  const initial =
    formData.name
      ? formData.name
          .charAt(0)
          .toUpperCase()
      : "U";



  return (
    <main className="min-h-screen bg-gray-50">

      
      
      

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

            <div>

              <p className="text-blue-100 text-sm font-medium">
                My Account
              </p>

              <h1 className="text-3xl sm:text-4xl font-black mt-1">
                My Profile
              </h1>

              <p className="text-blue-100 mt-2">
                Manage your account information
              </p>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-black">
              {initial}
            </div>

          </div>

        </div>

      </section>

      
      
      

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid lg:grid-cols-3 gap-6">

          
          
          

          <div className="lg:col-span-1 space-y-5">

            

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-black">
                  {initial}
                </div>

                <div className="min-w-0">

                  <h2 className="font-black text-gray-900 truncate">
                    {formData.name ||
                      "User"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    +91 {formData.phone}
                  </p>

                </div>

              </div>

              <div className="mt-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-bold">
                <ShieldCheck size={17} />
                Account Verified
              </div>

            </div>

            

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">

              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold"
              >
                <User size={19} />
                My Profile
              </Link>

              <Link
                to="/address"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                <MapPin size={19} />
                My Addresses
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                <Heart size={19} />
                Wishlist
              </Link>

              <Link
                to="/cart"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                <ShoppingCart size={19} />
                My Cart
              </Link>

              <Link
                to="/store-dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                <Package size={19} />
                My Store
              </Link>

              <div className="border-t my-2" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition"
              >
                <LogOut size={19} />
                Logout
              </button>

            </div>

          </div>

          
          
          

          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

              

              <div className="p-5 sm:p-6 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Edit3 size={21} />
                  </div>

                  <div>

                    <h2 className="text-xl font-black text-gray-900">
                      Personal Information
                    </h2>

                    <p className="text-sm text-gray-500">
                      Update your account details
                    </p>

                  </div>

                </div>

              </div>

              

              <form
                onSubmit={handleSubmit}
                className="p-5 sm:p-6"
              >

                <div className="grid sm:grid-cols-2 gap-5">

                  

                  <div>

                    <label
                      htmlFor="profile-name"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Full Name
                    </label>

                    <div className="relative">

                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="profile-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={
                          handleChange
                        }
                        placeholder="Your name"
                        disabled={saving}
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition disabled:opacity-60"
                      />

                    </div>

                  </div>

                  

                  <div>

                    <label
                      htmlFor="profile-phone"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Mobile Number
                    </label>

                    <div className="relative">

                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="profile-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={
                          handleChange
                        }
                        maxLength={10}
                        inputMode="numeric"
                        disabled={saving}
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition disabled:opacity-60"
                      />

                    </div>

                  </div>

                </div>

                

                <div className="mt-7 flex justify-end">

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !formData.name.trim() ||
                      formData.phone.length !== 10
                    }
                    className="w-full sm:w-auto px-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed transition"
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
                        Save Changes
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

            

            <Link
              to="/address"
              className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <MapPin size={21} />
                </div>

                <div>

                  <h3 className="font-black text-gray-900">
                    Manage Addresses
                  </h3>

                  <p className="text-sm text-gray-500">
                    Add or update your delivery
                    addresses
                  </p>

                </div>

              </div>

              <ArrowRight
                size={20}
                className="text-gray-400"
              />

            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Profile;