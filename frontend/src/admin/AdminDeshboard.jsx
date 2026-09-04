import { useEffect, useState } from "react";
import {
  Users,
  Package,
  FolderTree,
  ShoppingCart,
  Heart,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  UserCheck,
  Truck,
  Star,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";



const defaultDashboard = {
  users: {
    total: 0,
    users: 0,
    admins: 0,
  },

  products: {
    total: 0,
    active: 0,
    dropshipping: 0,
    featured: 0,
    newArrival: 0,
    bestSeller: 0,
  },

  categories: {
    total: 0,
  },

  cart: {
    totalItems: 0,
    totalCarts: 0,
  },

  wishlist: {
    totalItems: 0,
    totalWishlists: 0,
  },

  addresses: {
    total: 0,
  },

  orders: {
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0,
  },
};



const toNumber = (value) => {
  const num = Number(value);

  return Number.isFinite(num) ? num : 0;
};

const StatCard = ({ title, value, icon: Icon, description, link }) => {
  const content = (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
          {toNumber(value).toLocaleString("en-IN")}
        </p>
        <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
        <Icon size={23} />
      </div>
    </div>
  );

  const className = "block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900";

  return link ? <Link to={link} className={className}>{content}</Link> : <div className={className}>{content}</div>;
};



const AdminDashboard = () => {
  const [dashboard, setDashboard] =
    useState(defaultDashboard);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);



  const loadDashboard = async () => {
    try {
      setRefreshing(true);

      const response = await api.get(
        "/admin/dashboard"
      );

      console.log(
        "DASHBOARD RESPONSE:",
        response.data
      );

      if (!response.data?.success) {
        toast.error(
          response.data?.message ||
            "Dashboard data not found"
        );

        return;
      }

      const data =
        response.data?.dashboard || {};



      const users = {
        total: toNumber(
          data.users?.total ??
            data.totalUsers
        ),

        users: toNumber(
          data.users?.users ??
            data.totalUsers
        ),

        admins: toNumber(
          data.users?.admins
        ),
      };



      const products = {
        total: toNumber(
          data.products?.total ??
            data.totalProducts
        ),

        active: toNumber(
          data.products?.active ??
            data.totalProducts
        ),

        dropshipping: toNumber(
          data.products?.dropshipping
        ),

        featured: toNumber(
          data.products?.featured
        ),

        newArrival: toNumber(
          data.products?.newArrival
        ),

        bestSeller: toNumber(
          data.products?.bestSeller
        ),
      };



      const categories = {
        total: toNumber(
          data.categories?.total ??
            data.totalCategories
        ),
      };



      const cart = {
        totalItems: toNumber(
          data.cart?.totalItems
        ),

        totalCarts: toNumber(
          data.cart?.totalCarts
        ),
      };



      const wishlist = {
        totalItems: toNumber(
          data.wishlist?.totalItems
        ),

        totalWishlists: toNumber(
          data.wishlist?.totalWishlists
        ),
      };



      const addresses = {
        total: toNumber(
          data.addresses?.total
        ),
      };



      const orders = {
        total: toNumber(
          data.totalOrders
        ),

        pending: toNumber(
          data.pendingOrders
        ),

        delivered: toNumber(
          data.deliveredOrders
        ),

        cancelled: toNumber(
          data.cancelledOrders
        ),

        revenue: toNumber(
          data.totalRevenue
        ),
      };



      setDashboard({
        users,
        products,
        categories,
        cart,
        wishlist,
        addresses,
        orders,
      });
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error?.response?.data ||
          error?.message ||
          error
      );

      const status =
        error?.response?.status;

      if (status === 401) {
        toast.error(
          "Login required. Please login again."
        );
      } else if (status === 403) {
        toast.error(
          "Admin access required."
        );
      } else if (status === 404) {
        toast.error(
          "Dashboard API not found."
        );
      } else {
        toast.error(
          error?.response?.data
            ?.message ||
            "Dashboard load nahi ho raha"
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      

      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={30}
                  className="text-blue-600"
                />

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
              </div>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your store from one place
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60 transition"
            >
              <RefreshCcw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Users"
              value={dashboard.users.total}
              icon={Users}
              description={`${dashboard.users.users} normal users`}
              link="/admin/users"
            />

            <StatCard
              title="Products"
              value={dashboard.products.total}
              icon={Package}
              description={`${dashboard.products.active} active`}
              link="/admin/products"
            />

            <StatCard
              title="Categories"
              value={
                dashboard.categories.total
              }
              icon={FolderTree}
              description="Total categories"
              link="/admin/categories"
            />

            <StatCard
              title="Admins"
              value={dashboard.users.admins}
              icon={ShieldCheck}
              description="Admin accounts"
              link="/admin/users"
            />
          </div>
        </section>

        

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Product Statistics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Active Products"
              value={
                dashboard.products.active
              }
              icon={Package}
              description="Currently active"
            />

            <StatCard
              title="Featured"
              value={
                dashboard.products.featured
              }
              icon={Star}
              description="Featured products"
            />

            <StatCard
              title="New Arrivals"
              value={
                dashboard.products.newArrival
              }
              icon={Plus}
              description="New products"
            />

            <StatCard
              title="Best Sellers"
              value={
                dashboard.products.bestSeller
              }
              icon={TrendingUp}
              description="Best seller products"
            />
          </div>
        </section>

        

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Store Statistics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Dropshipping"
              value={
                dashboard.products
                  .dropshipping
              }
              icon={Truck}
              description="Supplier products"
              link="/admin/products?source=dropshipping"
            />

            <StatCard
              title="Cart Items"
              value={
                dashboard.cart.totalItems
              }
              icon={ShoppingCart}
              description={`${dashboard.cart.totalCarts} carts`}
            />

            <StatCard
              title="Wishlist Items"
              value={
                dashboard.wishlist
                  .totalItems
              }
              icon={Heart}
              description={`${dashboard.wishlist.totalWishlists} wishlists`}
            />

            <StatCard
              title="Addresses"
              value={
                dashboard.addresses.total
              }
              icon={MapPin}
              description="Saved addresses"
            />
          </div>
        </section>

        

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                <Package size={20} />
              </div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Products
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage products
                </p>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
                <FolderTree size={20} />
              </div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Categories
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage categories
                </p>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 text-green-600">
                <UserCheck size={20} />
              </div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Users
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage users
                </p>
              </div>
            </Link>

          </div>
        </section>

        

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                  <Users size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Users
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Account overview
                  </p>
                </div>
              </div>

              <Link
                to="/admin/users"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Users
                </span>

                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.users.total.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Normal Users
                </span>

                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.users.users.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Admins
                </span>

                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.users.admins.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 text-green-600">
                <TrendingUp size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Store Summary
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current store statistics
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Products
                </span>

                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.products.total.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Categories
                </span>

                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.categories.total.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Cart Items
                </span>

                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.cart.totalItems.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Wishlist Items
                </span>

                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.wishlist.totalItems.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Addresses
                </span>

                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.addresses.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;