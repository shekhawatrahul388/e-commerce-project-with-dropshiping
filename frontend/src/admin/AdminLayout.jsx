import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image,
  PanelBottom,
  Truck,
  MessageCircle,
  X,
  ChevronRight,
  Home,
  Settings,
  Users,
  Store,
  ExternalLink,
} from "lucide-react";

import AdminNavbar from "./AdminNavbar";

function AdminLayout() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);



  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);



  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);



  const menuGroups = [
    {
      title: "MAIN",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin/dashboard",
        },
      ],
    },

    {
      title: "CATALOG",
      items: [
        {
          label: "Products",
          icon: Package,
          path: "/admin/products",
        },
        {
          label: "Categories",
          icon: FolderTree,
          path: "/admin/categories",
        },
        {
          label: "Banners",
          icon: Image,
          path: "/admin/banners",
        },
      ],
    },

    {
      title: "WEBSITE",
      items: [
        {
          label: "Footer",
          icon: PanelBottom,
          path: "/admin/footer",
        },
      ],
    },

    {
      title: "BUSINESS",
      items: [
        {
          label: "Suppliers",
          icon: Truck,
          path: "/admin/suppliers",
        },
        {
          label: "WhatsApp",
          icon: MessageCircle,
          path: "/admin/whatsapp",
        },
      ],
    },

    {
      title: "ACCOUNT",
      items: [
        {
          label: "Users",
          icon: Users,
          path: "/admin/users",
        },
        {
          label: "Settings",
          icon: Settings,
          path: "/admin/settings",
        },
      ],
    },
  ];



  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };



  const getCurrentPage = () => {
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (isActive(item.path)) {
          return item.label;
        }
      }
    }

    return "Admin Panel";
  };



  const handleMenuClick = () => {
    setSidebarOpen(true);
  };



  const closeSidebar = () => {
    setSidebarOpen(false);
  };



  return (
    <div className="min-h-screen bg-slate-50">
      

      <AdminNavbar onMenuClick={handleMenuClick} />

      

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      

      <aside
        className={`
          fixed
          top-16
          bottom-0
          left-0
          z-[70]
          bg-white
          border-r
          border-slate-200
          shadow-sm
          transition-all
          duration-300
          ease-in-out

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0

          ${
            collapsed
              ? "lg:w-[76px]"
              : "lg:w-[260px]"
          }

          w-[280px]
        `}
      >
        

        <div
          className={`
            h-16
            px-4
            border-b
            border-slate-200
            flex
            items-center
            ${
              collapsed
                ? "lg:justify-center"
                : "justify-between"
            }
          `}
        >
          

          {!collapsed && (
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-slate-900">
                Admin Navigation
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Manage your store
              </p>
            </div>
          )}

          

          <div className="lg:hidden">
            <p className="text-sm font-bold text-slate-900">
              Admin Navigation
            </p>

            <p className="text-[11px] text-slate-500 mt-0.5">
              Manage your store
            </p>
          </div>

          <div className="flex items-center gap-1">
            

            <button
              type="button"
              onClick={closeSidebar}
              className="
                lg:hidden
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                text-slate-500
                hover:bg-slate-100
                transition
              "
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>

            

            <button
              type="button"
              onClick={() =>
                setCollapsed((prev) => !prev)
              }
              className="
                hidden
                lg:flex
                w-9
                h-9
                rounded-xl
                items-center
                justify-center
                text-slate-500
                hover:bg-slate-100
                transition
              "
              title={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              <ChevronRight
                size={18}
                className={`
                  transition-transform
                  duration-300
                  ${
                    collapsed
                      ? ""
                      : "rotate-180"
                  }
                `}
              />
            </button>
          </div>
        </div>

        

        <div
          className="
            h-[calc(100%-8rem)]
            overflow-y-auto
            px-3
            py-4
          "
        >
          {menuGroups.map((group) => (
            <div
              key={group.title}
              className="mb-5"
            >
              

              {!collapsed && (
                <p
                  className="
                    px-3
                    mb-2
                    text-[10px]
                    font-bold
                    tracking-[0.15em]
                    text-slate-400
                  "
                >
                  {group.title}
                </p>
              )}

              

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSidebar}
                      title={
                        collapsed
                          ? item.label
                          : undefined
                      }
                      className={`
                        group
                        relative
                        flex
                        items-center
                        ${
                          collapsed
                            ? "lg:justify-center"
                            : "gap-3"
                        }
                        px-3
                        py-2.5
                        rounded-xl
                        text-sm
                        font-medium
                        transition-all
                        duration-200

                        ${
                          active
                            ? `
                              bg-blue-600
                              text-white
                              shadow-sm
                              shadow-blue-200
                            `
                            : `
                              text-slate-600
                              hover:bg-slate-100
                              hover:text-blue-600
                            `
                        }
                      `}
                    >
                      

                      {active && (
                        <span
                          className="
                            absolute
                            left-0
                            top-1/2
                            -translate-y-1/2
                            w-1
                            h-6
                            rounded-r-full
                            bg-white/90
                          "
                        />
                      )}

                      

                      <Icon
                        size={19}
                        className={`
                          shrink-0

                          ${
                            active
                              ? "text-white"
                              : "text-slate-500 group-hover:text-blue-600"
                          }
                        `}
                      />

                      

                      {!collapsed && (
                        <>
                          <span className="flex-1">
                            {item.label}
                          </span>

                          {active && (
                            <ChevronRight
                              size={15}
                              className="text-white/80"
                            />
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            p-3
            bg-white
            border-t
            border-slate-200
          "
        >
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex
              items-center
              ${
                collapsed
                  ? "justify-center"
                  : "gap-3"
              }
              px-3
              py-2.5
              rounded-xl
              text-sm
              font-medium
              text-slate-600
              hover:bg-blue-50
              hover:text-blue-600
              transition
            `}
            title={
              collapsed
                ? "View Store"
                : undefined
            }
          >
            <Store size={19} />

            {!collapsed && (
              <>
                <span className="flex-1">
                  View Store
                </span>

                <ExternalLink size={15} />
              </>
            )}
          </a>
        </div>
      </aside>

      

      <div
        className={`
          min-h-[calc(100vh-4rem)]
          transition-all
          duration-300

          ${
            collapsed
              ? "lg:ml-[76px]"
              : "lg:ml-[260px]"
          }
        `}
      >
        

        <div className="hidden sm:block px-4 sm:px-6 lg:px-8 pt-5">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Home size={14} />

              <ChevronRight size={13} />

              <span>Admin</span>

              <ChevronRight size={13} />

              <span className="font-semibold text-slate-700">
                {getCurrentPage()}
              </span>
            </div>
          </div>
        </div>

        

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;