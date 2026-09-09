import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Package, RefreshCw, Store, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";

function AdminDropshipping() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/dropshipping-stores");
      setStores(response.data?.stores || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load dropshipping stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const totalProducts = stores.reduce((total, store) => total + store.products.length, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Business</p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Dropshipping Stores</h1>
            <p className="mt-2 text-sm text-slate-500">See who created each store and which products they added.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/users" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50">
              View All Users
            </Link>
            <button type="button" onClick={loadStores} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total stores</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{stores.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Products added to stores</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{totalProducts}</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading stores...</div>
        ) : stores.length ? (
          <div className="space-y-4">
            {stores.map((store) => {
              const isOpen = expanded === store._id;
              return (
                <section key={store._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <button type="button" onClick={() => setExpanded(isOpen ? null : store._id)} className="flex w-full items-center gap-4 p-5 text-left hover:bg-slate-50">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Store size={22} /></div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-black text-slate-900">{store.storeName}</h2>
                      <p className="truncate text-sm text-slate-500">/{store.storeSlug} · {store.products.length} products</p>
                      <p className="truncate text-xs font-semibold text-blue-600">Created by: {store.user?.name || store.username} · {store.user?.phone || "No phone"}</p>
                      {store.storeSlug && (
                        <a href={`/store/${encodeURIComponent(store.storeSlug)}`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="block max-w-md truncate text-xs font-semibold text-blue-600 hover:underline">
                          {window.location.origin}/store/{store.storeSlug}
                        </a>
                      )}
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="font-semibold text-slate-800">{store.user?.name || store.username}</p>
                      <p className="text-sm text-slate-500">{store.user?.phone || "No phone"}</p>
                    </div>
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-200 bg-slate-50 p-5">
                      <div className="mb-5 flex items-center gap-3 text-sm text-slate-600">
                        <User size={17} />
                        <span>Created by <strong>{store.user?.name || store.username}</strong> ({store.user?.phone || "No phone"})</span>
                      </div>
                      {store.products.length ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          {store.products.map((item) => (
                            <div key={item._id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Package size={19} /></div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-bold text-slate-900">{item.product?.name || "Product"}</p>
                                <p className="text-xs text-slate-500">Selling price: ₹{item.sellingPrice} · Stock: {item.product?.stock ?? 0}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-slate-500">No products added to this store.</p>}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No dropshipping stores created yet.</div>}
      </div>
    </main>
  );
}

export default AdminDropshipping;
