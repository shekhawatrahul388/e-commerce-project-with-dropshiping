import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

function PublicStore() {
  const { storeSlug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/store/${encodeURIComponent(storeSlug)}`), api.get(`/store/${encodeURIComponent(storeSlug)}/products`)]).then(([storeResponse, productsResponse]) => { if (!active) return; setStore(storeResponse.data.store); setProducts(productsResponse.data.products || []); }).catch((requestError) => { if (active) setError(requestError?.response?.status === 404 ? "Store not found" : "Unable to load this store"); }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [storeSlug]);
  if (loading) return <main className="mx-auto max-w-6xl px-4 py-20 text-center text-gray-500">Loading store...</main>;
  if (error) return <main className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-3xl font-black">{error}</h1><Link className="mt-5 inline-block font-bold text-blue-600" to="/">Return home</Link></main>;
  return <main className={`min-h-screen pb-12 ${store.theme === "dark" ? "bg-slate-950 text-white" : store.theme === "modern" ? "bg-blue-50" : "bg-gray-50"}`}><section className="relative overflow-hidden bg-blue-600 text-white">{store.banner && <img src={store.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}<div className="relative mx-auto max-w-6xl px-4 py-14"><div className="flex items-center gap-4">{store.logo ? <img src={store.logo} alt={store.storeName} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/30" /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15"><ShoppingBag size={34} /> </div>}<div><p className="text-sm font-bold uppercase tracking-wider text-blue-100">Independent storefront</p><h1 className="text-3xl font-black sm:text-5xl">{store.storeName}</h1></div></div></div></section><section className="mx-auto max-w-6xl px-4 py-10"><div className="mb-7 flex items-end justify-between"><div><h2 className="text-2xl font-black">Shop the collection</h2><p className="mt-1 opacity-70">{products.length} selected product{products.length === 1 ? "" : "s"}</p></div><Link to="/cart" className="rounded-xl border px-4 py-2 text-sm font-bold">Cart</Link></div>{products.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.storeProductId || product.productId} product={{ ...product, storeSlug: store.storeSlug }} />)}</div> : <div className="rounded-2xl border border-dashed p-12 text-center opacity-70">This store has no products yet.</div>}</section></main>;
}

export default PublicStore;