import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Package,
  FolderTree,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Users,
} from "lucide-react";

const AdminNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();



  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [siteName, setSiteName] = useState("MyStore");

  const profileRef = useRef(null);
  const notificationRef = useRef(null);



  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
          setUser(null);
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
      } catch (error) {
        console.error("ADMIN NAVBAR USER ERROR:", error);

        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  useEffect(() => {
    const loadSiteName = async () => {
      try {
        const response = await api.get("/settings");
        const name = response.data?.settings?.siteName?.trim();
        if (name) setSiteName(name);
      } catch (error) {
        console.error("ADMIN SITE NAME ERROR:", error?.message);
      }
    };

    const handleSiteNameUpdate = (event) => {
      if (event.detail) setSiteName(event.detail);
    };

    loadSiteName();
    window.addEventListener("site-name-updated", handleSiteNameUpdate);

    return () => {
      window.removeEventListener("site-name-updated", handleSiteNameUpdate);
    };
  }, []);



  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    setProfileOpen(false);
    setNotificationOpen(false);

    toast.success("Logged out successfully");

    navigate("/login", {
      replace: true,
    });
  };



  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      toast.error("Please enter something to search");
      return;
    }

    navigate(
      `/admin/products?search=${encodeURIComponent(value)}`
    );

    setSearch("");

    setProfileOpen(false);
    setNotificationOpen(false);
  };



  const closeProfile = () => {
    setProfileOpen(false);
  };



  const getInitial = () => {
    if (user?.name) {
      return String(user.name)
        .charAt(0)
        .toUpperCase();
    }

    if (user?.phone) {
      return String(user.phone).charAt(0);
    }

    return "A";
  };



  const userName =
    user?.name ||
    "Admin";

  const userRole =
    user?.role ||
    "admin";



  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      

      <div className="h-16 px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between gap-3">

          

          <div className="flex items-center gap-3 min-w-0">

            

            <button
              type="button"
              onClick={() => {
                if (typeof onMenuClick === "function") {
                  onMenuClick();
                }
              }}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
              aria-label="Open admin menu"
            >
              <Menu size={22} />
            </button>

            

            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <LayoutDashboard size={21} />
              </div>

              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-none">
                  {siteName}
                </h1>

                <p className="text-[10px] text-blue-600 font-semibold mt-1 uppercase tracking-wider">
                  Admin Panel
                </p>
              </div>
            </Link>
          </div>

          

          <form
            onSubmit={handleSearch}
            className="hidden md:block flex-1 max-w-xl mx-4"
          >
            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products, categories..."
                className="w-full h-10 pl-11 pr-4 bg-slate-100 border border-transparent rounded-xl outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />

            </div>
          </form>

          

          <div className="flex items-center gap-1 sm:gap-2">

            

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
              title="View Store"
            >
              <ExternalLink size={19} />
            </Link>

            

            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen(
                    (prev) => !prev
                  );

                  setProfileOpen(false);
                }}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                aria-label="Notifications"
              >
                <Bell size={20} />

                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 w-[320px] max-w-[calc(100vw-24px)] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">

                  

                  <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Notifications
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Admin notifications
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
                      3 New
                    </span>

                  </div>

                  

                  <div className="p-2">

                    

                    <Link
                      to="/admin/products"
                      onClick={() =>
                        setNotificationOpen(false)
                      }
                      className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                    >
                      <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Package size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Product Update
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Check your latest products.
                        </p>
                      </div>
                    </Link>

                    

                    <Link
                      to="/admin/categories"
                      onClick={() =>
                        setNotificationOpen(false)
                      }
                      className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                    >
                      <div className="w-9 h-9 shrink-0 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <FolderTree size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Categories
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Manage your categories.
                        </p>
                      </div>
                    </Link>

                    

                    <Link
                      to="/admin/whatsapp"
                      onClick={() =>
                        setNotificationOpen(false)
                      }
                      className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                    >
                      <div className="w-9 h-9 shrink-0 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                        <MessageCircle size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          WhatsApp
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Manage inquiry settings.
                        </p>
                      </div>
                    </Link>

                  </div>

                  

                  <div className="border-t border-slate-100 p-3">

                    <button
                      type="button"
                      onClick={() =>
                        setNotificationOpen(false)
                      }
                      className="w-full py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      Close Notifications
                    </button>

                  </div>

                </div>
              )}
            </div>

            

            <div
              ref={profileRef}
              className="relative"
            >

              

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(
                    (prev) => !prev
                  );

                  setNotificationOpen(false);
                }}
                className="flex items-center gap-2 ml-1 p-1 rounded-xl hover:bg-slate-100 transition"
                aria-label="Open profile menu"
              >

                

                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {getInitial()}
                </div>

                

                <div className="hidden lg:block text-left max-w-[120px]">

                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {userName}
                  </p>

                  <p className="text-[10px] text-blue-600 font-semibold uppercase">
                    {userRole}
                  </p>

                </div>

                <ChevronDown
                  size={16}
                  className={`hidden sm:block text-slate-400 transition ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />

              </button>

              

              {profileOpen && (
                <div className="absolute right-0 top-12 w-72 max-w-[calc(100vw-24px)] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">

                  

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">

                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow">
                        {getInitial()}
                      </div>

                      <div className="min-w-0">

                        <p className="font-bold text-slate-900 truncate">
                          {userName}
                        </p>

                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {user?.phone
                            ? `+91 ${user.phone}`
                            : "Administrator"}
                        </p>

                        <div className="flex items-center gap-1 mt-1">

                          <ShieldCheck
                            size={13}
                            className="text-green-600"
                          />

                          <span className="text-[10px] text-green-700 font-semibold">
                            Administrator
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                  

                  <div className="p-2">

                    

                    <Link
                      to="/admin/dashboard"
                      onClick={closeProfile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>

                    

                    <Link
                      to="/admin/users"
                      onClick={closeProfile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <Users size={18} />
                      Users
                    </Link>

                    

                    <Link
                      to="/admin/products"
                      onClick={closeProfile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <Package size={18} />
                      Products
                    </Link>

                    

                    <Link
                      to="/admin/categories"
                      onClick={closeProfile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition"
                    >
                      <FolderTree size={18} />
                      Categories
                    </Link>

                    

                    <Link
                      to="/profile"
                      onClick={closeProfile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <User size={18} />
                      My Profile
                    </Link>

                    

                    <Link
                      to="/admin/whatsapp"
                      onClick={closeProfile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-green-50 hover:text-green-600 transition"
                    >
                      <MessageCircle size={18} />
                      WhatsApp Settings
                    </Link>

                    

                    <Link
                      to="/admin/settings"
                      onClick={closeProfile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Settings size={18} />
                      Settings
                    </Link>

                    

                    <div className="my-2 border-t border-slate-100" />

                    

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      </div>

      

      <div className="md:hidden px-4 pb-3">

        <form onSubmit={handleSearch}>

          <div className="relative">

            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search admin panel..."
              className="w-full h-10 pl-10 pr-4 bg-slate-100 rounded-xl border border-transparent outline-none text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </form>

      </div>

    </header>
  );
};

export default AdminNavbar;