import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Menu,
  X,
  User,
  LogOut,
  ShoppingCart,
  Heart,
  Search,
  ChevronDown,
  ShoppingBag,
  LayoutDashboard,
  MapPin,
  
} from "lucide-react";

import { toast } from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const API_URL = (import.meta.env.VITE_API_URL || "https://dropshiping-products-backend-3.onrender.com/api").replace(/\/api\/?$/, "");

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();



  const auth = useAuth() || {};

  const {
    user: contextUser,
    isAuthenticated: contextAuthenticated,
    isAdmin: contextIsAdmin,
    logout: contextLogout,
  } = auth;

  const getStoredUser = () => {
    try {
      const data = localStorage.getItem("user");

      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error("USER PARSE ERROR:", error);
      return null;
    }
  };

  const token = localStorage.getItem("token");
  const storedUser = getStoredUser();

  const user = contextUser || storedUser || null;

  const isAuthenticated =
    Boolean(contextAuthenticated) ||
    Boolean(token && user);

  const isAdmin =
    Boolean(contextIsAdmin) ||
    user?.role === "admin";



  const cartContext = useCart() || {};

  const {
    cartCount = 0,
  } = cartContext;



  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const [search, setSearch] = useState("");

  const [navLinks, setNavLinks] = useState([]);

  const [navbarLoading, setNavbarLoading] = useState(true);

  const [logo, setLogo] = useState("");

  const [siteName, setSiteName] = useState("MyStore");

  const [siteTagline, setSiteTagline] =
    useState("Shop smarter");

  const userMenuRef = useRef(null);



  const defaultLinks = [
    {
      _id: "home",
      title: "Home",
      url: "/",
    },
    {
      _id: "products",
      title: "Products",
      url: "/products",
    },
    {
      _id: "categories",
      title: "Categories",
      url: "/categories",
    },
  ];



  useEffect(() => {
    let mounted = true;

    const fetchNavbar = async () => {
      try {
        setNavbarLoading(true);

        const response = await axios.get(
          `${API_URL}/api/menu`,
          {
            timeout: 5000,
          }
        );

        if (!mounted) return;

        console.log(
          "NAVBAR API RESPONSE:",
          response.data
        );

        const data = response.data || {};



        let links = [];

        if (Array.isArray(data.data)) {
          links = data.data;
        } else if (Array.isArray(data.menus)) {
          links = data.menus;
        } else if (Array.isArray(data.links)) {
          links = data.links;
        } else if (
          Array.isArray(data.data?.navbar)
        ) {
          links = data.data.navbar;
        } else if (
          Array.isArray(data.data?.links)
        ) {
          links = data.data.links;
        }



        const apiLogo =
          data.logo ||
          data.logoUrl ||
          data.logoImage ||
          data.image ||
          data.settings?.logo ||
          data.settings?.logoUrl ||
          data.data?.logo ||
          data.data?.logoUrl ||
          "";



        const apiSiteName =
          data.siteName ||
          data.name ||
          data.settings?.siteName ||
          data.settings?.name ||
          data.data?.siteName ||
          data.data?.name ||
          "";



        const apiTagline =
          data.tagline ||
          data.subtitle ||
          data.settings?.tagline ||
          data.data?.tagline ||
          "";

        if (apiLogo) {
          setLogo(apiLogo);
        }

        if (apiSiteName) {
          setSiteName(apiSiteName);
        }

        if (apiTagline) {
          setSiteTagline(apiTagline);
        }

        setNavLinks(
          Array.isArray(links)
            ? links.filter(
                (item) =>
                  item?.title &&
                  item?.url
              )
            : []
        );
      } catch (error) {
        console.error(
          "NAVBAR FETCH ERROR:",
          error?.response?.data ||
            error?.message
        );

        if (mounted) {
          setNavLinks([]);
        }
      } finally {
        if (mounted) {
          setNavbarLoading(false);
        }
      }
    };

    fetchNavbar();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    axios
      .get(`${API_URL}/api/settings`, { timeout: 5000 })
      .then((response) => {
        if (!mounted) return;

        const settings = response.data?.settings || {};
        if (settings.logo) setLogo(settings.logo);
        if (settings.siteName) setSiteName(settings.siteName);
      })
      .catch((error) => {
        console.error("SITE SETTINGS ERROR:", error?.response?.data || error.message);
      });

    return () => {
      mounted = false;
    };
  }, []);



  const finalNavLinks = [
    ...defaultLinks.map((defaultLink) => {
      const savedLink = navLinks.find(
        (link) =>
          link.url === defaultLink.url ||
          (defaultLink.url === "/categories" &&
            link.url === "/category")
      );

      return savedLink
        ? { ...defaultLink, ...savedLink }
        : defaultLink;
    }),
    ...navLinks.filter(
      (link) =>
        !defaultLinks.some(
          (defaultLink) =>
            defaultLink.url === link.url ||
            (defaultLink.url === "/categories" &&
              link.url === "/category")
        )
    ),
  ];



  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenu(false);
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



  useEffect(() => {
    setMobileMenu(false);
    setUserMenu(false);
  }, [location.pathname]);



  useEffect(() => {
    document.body.style.overflow = mobileMenu
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);



  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      toast.error("Please enter a product name");
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(value)}`
    );

    setSearch("");
    setMobileMenu(false);
  };



  const handleLogout = () => {
    try {
      if (typeof contextLogout === "function") {
        contextLogout();
      }
    } catch (error) {
      console.error("CONTEXT LOGOUT ERROR:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("wishlist");

    setUserMenu(false);
    setMobileMenu(false);

    toast.success("Logged out successfully");

    navigate("/verify-otp", {
      replace: true,
    });
  };



  const isActive = (path) => {
    if (!path) return false;

    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };



  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.phone?.toString()?.charAt(0) ||
    "U";



  const handleLogoError = () => {
    setLogo("");
  };

  const logoSource = logo && /^(https?:|data:)/i.test(logo)
    ? logo
    : logo
      ? `${API_URL}${logo.startsWith("/") ? logo : `/${logo}`}`
      : "";



  return (
    <header className="sticky top-0 z-100 bg-white border-b border-gray-200 shadow-sm">

      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="h-17 flex items-center justify-between gap-3">

          

          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="relative">

              {logoSource ? (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition">

                  <img
                    src={logoSource}
                    alt={siteName}
                    onError={handleLogoError}
                    className="w-full h-full object-contain p-1.5"
                  />

                </div>
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition">

                  <ShoppingBag
                    size={22}
                    strokeWidth={2.3}
                  />

                </div>
              )}

              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />

            </div>

            <div className="hidden sm:block">

              <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-none tracking-tight">
                {siteName}
              </h1>

              <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium mt-1">
                {siteTagline}
              </p>

            </div>

          </Link>

          

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg lg:max-w-xl mx-2 lg:mx-6"
          >
            <div className="relative w-full">

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
                placeholder="Search products..."
                className="w-full h-11 pl-11 pr-14 rounded-xl bg-gray-100 border border-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
              />

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition"
              >
                <Search size={16} />
              </button>

            </div>
          </form>

          

          <nav className="hidden lg:flex items-center gap-1">

            {navbarLoading ? (
              <>
                <div className="w-14 h-8 bg-gray-100 rounded-lg animate-pulse" />
                <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
              </>
            ) : (
              finalNavLinks.map((link, index) => {

                const linkUrl =
                  link?.url || "/";

                const linkTitle =
                  link?.title || "Link";

                return (
                  <Link
                    key={
                      link?._id ||
                      `${linkUrl}-${index}`
                    }
                    to={linkUrl}
                    target={
                      link?.openInNewTab
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      link?.openInNewTab
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      isActive(linkUrl)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {linkTitle}
                  </Link>
                );
              })
            )}

          </nav>

          

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            

            <Link
              to="/wishlist"
              className={`hidden sm:flex w-10 h-10 items-center justify-center rounded-xl transition ${
                isActive("/wishlist")
                  ? "bg-red-50 text-red-500"
                  : "text-gray-600 hover:bg-red-50 hover:text-red-500"
              }`}
            >
              <Heart size={21} />
            </Link>

            

            <Link
              to="/cart"
              className={`relative flex w-10 h-10 items-center justify-center rounded-xl transition ${
                isActive("/cart")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <ShoppingCart size={21} />

              {Number(cartCount) > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.75 h-4.75 px-1 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                  {Number(cartCount) > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            

            {isAuthenticated ? (
              <div
                ref={userMenuRef}
                className="relative hidden sm:block"
              >

                <button
                  type="button"
                  onClick={() =>
                    setUserMenu((prev) => !prev)
                  }
                  className="ml-1 flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition"
                >

                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm">
                    {userInitial}
                  </div>

                  <div className="hidden xl:block text-left max-w-26.25">

                    <p className="text-sm font-bold text-gray-800 truncate">
                      {user?.name || "User"}
                    </p>

                    <p className="text-[10px] text-gray-400 capitalize">
                      {user?.role || "user"}
                    </p>

                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${
                      userMenu
                        ? "rotate-180"
                        : ""
                    }`}
                  />

                </button>

                {userMenu && (
                  <div className="absolute right-0 top-13.5 w-72 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden">

                    <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 border-b border-blue-100">

                      <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg">
                          {userInitial}
                        </div>

                        <div className="min-w-0">

                          <p className="font-black text-gray-900 truncate">
                            {user?.name || "User"}
                          </p>

                          <p className="text-xs text-gray-500 truncate">
                            {user?.phone
                              ? `+91 ${user.phone}`
                              : "My Account"}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="p-2">

                      <DropdownLink
                        to="/profile"
                        icon={<User size={18} />}
                        title="My Profile"
                        subtitle="Manage your account"
                      />


                      <DropdownLink
                        to="/address"
                        icon={<MapPin size={18} />}
                        title="My Addresses"
                        subtitle="Manage delivery addresses"
                      />

                      <DropdownLink
                        to="/cart"
                        icon={<ShoppingCart size={18} />}
                        title="My Cart"
                        subtitle={`${cartCount} items`}
                      />

                      {isAdmin && (
                        <>
                          <div className="my-2 border-t border-gray-100" />

                          <DropdownLink
                            to="/admin/dashboard"
                            icon={
                              <LayoutDashboard
                                size={18}
                              />
                            }
                            title="Admin Dashboard"
                            subtitle="Manage store"
                          />
                        </>
                      )}

                      <div className="my-2 border-t border-gray-100" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut size={18} />

                        <span className="text-sm font-bold">
                          Logout
                        </span>
                      </button>

                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 ml-1">

                <Link
                  to="/verify-otp"
                  className="px-3 lg:px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition"
                >
                  Login
                </Link>

                <Link
                  to="/send-otp"
                  className="px-4 lg:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition"
                >
                  Register
                </Link>

              </div>
            )}

            

            <button
              type="button"
              onClick={() =>
                setMobileMenu((prev) => !prev)
              }
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition"
            >
              {mobileMenu ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>

          </div>

        </div>
      </div>

      

      {mobileMenu && (
        <div className="lg:hidden fixed inset-x-0 top-17 bottom-0 bg-black/30 backdrop-blur-sm">

          <div className="bg-white border-t border-gray-100 shadow-xl max-h-[calc(100vh-68px)] overflow-y-auto">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

              

              <form
                onSubmit={handleSearch}
                className="mb-5"
              >
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
                    placeholder="Search products..."
                    className="w-full h-12 pl-11 pr-12 rounded-xl bg-gray-100 border border-transparent outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-sm"
                  />

                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center"
                  >
                    <Search size={17} />
                  </button>

                </div>
              </form>

              

              {isAuthenticated && (
                <div className="mb-4 p-4 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black">
                      {userInitial}
                    </div>

                    <div>

                      <p className="font-black text-gray-900">
                        {user?.name || "User"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {user?.phone
                          ? `+91 ${user.phone}`
                          : "Welcome back"}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              

              <div className="space-y-1">

                {finalNavLinks.map((link, index) => {

                  const linkUrl =
                    link?.url || "/";

                  const linkTitle =
                    link?.title || "Link";

                  return (
                    <Link
                      key={
                        link?._id ||
                        `${linkUrl}-${index}`
                      }
                      to={linkUrl}
                      onClick={() =>
                        setMobileMenu(false)
                      }
                      className={`flex items-center px-4 py-3.5 rounded-xl font-semibold ${
                        isActive(linkUrl)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {linkTitle}
                    </Link>
                  );
                })}

                <Link
                  to="/wishlist"
                  onClick={() =>
                    setMobileMenu(false)
                  }
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 font-semibold"
                >
                  <Heart size={19} />
                  Wishlist
                </Link>

                <Link
                  to="/cart"
                  onClick={() =>
                    setMobileMenu(false)
                  }
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-semibold"
                >

                  <span className="flex items-center gap-3">
                    <ShoppingCart size={19} />
                    Cart
                  </span>

                  {Number(cartCount) > 0 && (
                    <span className="min-w-6 h-6 px-2 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">
                      {Number(cartCount) > 99
                        ? "99+"
                        : cartCount}
                    </span>
                  )}

                </Link>

                <div className="border-t border-gray-100 my-3" />

                {isAuthenticated ? (
                  <>
                    <MobileLink
                      to="/profile"
                      icon={<User size={19} />}
                      title="My Profile"
                      onClick={() =>
                        setMobileMenu(false)
                      }
                    />

                    <MobileLink
                      to="/address"
                      icon={<MapPin size={19} />}
                      title="My Addresses"
                      onClick={() =>
                        setMobileMenu(false)
                      }
                    />

                

                    {isAdmin && (
                      <MobileLink
                        to="/admin/dashboard"
                        icon={
                          <LayoutDashboard
                            size={19}
                          />
                        }
                        title="Admin Dashboard"
                        onClick={() =>
                          setMobileMenu(false)
                        }
                      />
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 font-semibold"
                    >
                      <LogOut size={19} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">

                    <Link
                      to="/verify-otp"
                      onClick={() =>
                        setMobileMenu(false)
                      }
                      className="flex items-center justify-center py-3 rounded-xl border border-gray-200 text-gray-700 font-bold"
                    >
                      Login
                    </Link>

                    <Link
                      to="/send-otp"
                      onClick={() =>
                        setMobileMenu(false)
                      }
                      className="flex items-center justify-center py-3 rounded-xl bg-blue-600 text-white font-bold"
                    >
                      Register
                    </Link>

                  </div>
                )}

              </div>

              

              <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">

                <div className="flex items-center gap-2 text-xs text-gray-500">

                  {logo ? (
                    <img
                      src={logo}
                      alt={siteName}
                      className="w-5 h-5 object-contain"
                      onError={handleLogoError}
                    />
                  ) : (
                    <ShoppingBag
                      size={16}
                      className="text-blue-600"
                    />
                  )}

                  <span>
                    {siteTagline ||
                      `Shop smarter with ${siteName}`}
                  </span>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}



function DropdownLink({
  to,
  icon,
  title,
  subtitle,
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
    >
      {icon}

      <span>
        <span className="block text-sm font-semibold">
          {title}
        </span>

        <span className="block text-[10px] text-gray-400">
          {subtitle}
        </span>
      </span>
    </Link>
  );
}



function MobileLink({
  to,
  icon,
  title,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-semibold"
    >
      {icon}
      {title}
    </Link>
  );
}

export default Navbar;
