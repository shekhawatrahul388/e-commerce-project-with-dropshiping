import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, Package, Plus, X, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

const initialForm = {
  name: "",
  description: "",
  brand: "",
  category: "",
  price: "",
  salePrice: "",
  stock: "",
  image: null,
  isDropshipping: false,
  supplierName: "",
  supplierProductId: "",
  supplierUrl: "",
  supplierPrice: "",
};

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [forms, setForms] = useState([{ ...initialForm }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get("/product/mine"),
        api.get("/category"),
      ]);
      setProducts(productsResponse.data?.products || []);
      const categoryData = categoriesResponse.data?.categories || categoriesResponse.data?.data || categoriesResponse.data;
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load your products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (index, event) => {
    setForms((previous) => previous.map((form, formIndex) => (
      formIndex === index
        ? { ...form, [event.target.name]: event.target.value }
        : form
    )));
  };

  const handleImageChange = (index, event) => {
    const file = event.target.files?.[0] || null;

    if (file && (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) {
      toast.error("Choose an image smaller than 5 MB");
      event.target.value = "";
      return;
    }

    setForms((previous) => previous.map((form, formIndex) => (
      formIndex === index ? { ...form, image: file } : form
    )));
  };

  const addProductForm = () => {
    setForms((previous) => [...previous, { ...initialForm }]);
  };

  const removeProductForm = (index) => {
    setForms((previous) => previous.filter((_, formIndex) => formIndex !== index));
  };

  const submit = async (event) => {
    event.preventDefault();
    for (const form of forms) {
      if (!form.name.trim() || !form.description.trim() || !form.category || !form.image || Number(form.price) < 0) {
        toast.error("Complete name, description, category, price and image for every product");
        return;
      }

      if (form.isDropshipping && (!form.supplierName.trim() || !form.supplierUrl.trim() || form.supplierPrice === "" || Number(form.supplierPrice) < 0)) {
        toast.error("Complete supplier name, URL and supplier price for dropshipping products");
        return;
      }
    }

    try {
      setSaving(true);
      for (const form of forms) {
        const payload = new FormData();
        payload.append("name", form.name.trim());
        payload.append("description", form.description.trim());
        payload.append("brand", form.brand.trim());
        payload.append("category", form.category);
        payload.append("price", String(Number(form.price)));
        payload.append("salePrice", form.salePrice ? String(Number(form.salePrice)) : "");
        payload.append("stock", form.stock ? String(Number(form.stock)) : "0");
        payload.append("isDropshipping", String(form.isDropshipping));
        payload.append("supplierName", form.supplierName.trim());
        payload.append("supplierProductId", form.supplierProductId.trim());
        payload.append("supplierUrl", form.supplierUrl.trim());
        payload.append("supplierPrice", form.isDropshipping ? String(Number(form.supplierPrice)) : "0");
        payload.append("image", form.image);

        await api.post("/product/submit", payload);
      }

      setForms([{ ...initialForm }]);
      toast.success(`${forms.length} product${forms.length > 1 ? "s" : ""} sent for admin approval`);
      await loadData();
    } catch (error) {
      console.error(
        "PRODUCT SUBMIT ERROR:",
        error?.response?.data || error
      );
      toast.error(error?.response?.data?.message || "Product submission failed");
    } finally {
      setSaving(false);
    }
  };

  const statusIcon = (status) => {
    if (status === "approved") return <CheckCircle2 size={17} />;
    if (status === "rejected") return <XCircle size={17} />;
    return <Clock3 size={17} />;
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600">Seller tools</p>
            <h1 className="mt-1 text-3xl font-black text-gray-900">My Products</h1>
            <p className="mt-2 text-gray-500">Submit products and track admin approval.</p>
          </div>
          <Link to="/profile" className="text-sm font-bold text-blue-600">Back to profile</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form onSubmit={submit} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Plus size={21} /></div>
              <div><h2 className="text-xl font-black text-gray-900">Add Products</h2><p className="text-sm text-gray-500">Send one or more products for admin approval.</p></div>
            </div>
            <div className="space-y-4">
              {forms.map((form, index) => (
                <div key={index} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-black text-gray-800">Product {index + 1}</p>
                    {forms.length > 1 && (
                      <button type="button" onClick={() => removeProductForm(index)} disabled={saving} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50" title="Remove product">
                        <X size={17} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input name="name" value={form.name} onChange={(event) => handleChange(index, event)} placeholder="Product name *" className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500" />
                    <textarea name="description" value={form.description} onChange={(event) => handleChange(index, event)} placeholder="Description *" rows="4" className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-blue-500" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="brand" value={form.brand} onChange={(event) => handleChange(index, event)} placeholder="Brand" className="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500" />
                      <select name="category" value={form.category} onChange={(event) => handleChange(index, event)} className="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500"><option value="">Category *</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select>
                      <input name="price" value={form.price} onChange={(event) => handleChange(index, event)} type="number" min="0" placeholder="Price *" className="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500" />
                      <input name="salePrice" value={form.salePrice} onChange={(event) => handleChange(index, event)} type="number" min="0" placeholder="Sale price" className="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500" />
                      <input name="stock" value={form.stock} onChange={(event) => handleChange(index, event)} type="number" min="0" placeholder="Stock" className="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500" />
                    </div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <input name="isDropshipping" type="checkbox" checked={form.isDropshipping} onChange={(event) => handleChange(index, event)} />
                      This is a dropshipping product
                    </label>
                    {form.isDropshipping && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input name="supplierName" value={form.supplierName} onChange={(event) => handleChange(index, event)} placeholder="Supplier name *" className="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500" />
                        <input name="supplierProductId" value={form.supplierProductId} onChange={(event) => handleChange(index, event)} placeholder="Supplier product ID" className="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500" />
                        <input name="supplierUrl" value={form.supplierUrl} onChange={(event) => handleChange(index, event)} type="url" placeholder="Supplier product URL *" className="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500" />
                        <input name="supplierPrice" value={form.supplierPrice} onChange={(event) => handleChange(index, event)} type="number" min="0" placeholder="Supplier price *" className="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:border-blue-500" />
                      </div>
                    )}
                    <div>
                      <label htmlFor={`product-image-${index}`} className="mb-2 block text-sm font-bold text-gray-700">Product image *</label>
                      <input id={`product-image-${index}`} name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleImageChange(index, event)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm" />
                      {form.image && <p className="mt-1 text-xs text-gray-500">Selected: {form.image.name}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={addProductForm} disabled={saving} className="h-11 flex-1 rounded-xl border border-blue-200 font-bold text-blue-600 hover:bg-blue-50 disabled:opacity-60">+ Add another product</button>
                <button type="submit" disabled={saving} className="h-11 flex-1 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Submitting..." : `Submit ${forms.length} product${forms.length > 1 ? "s" : ""}`}</button>
              </div>
            </div>
          </form>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3"><Package className="text-blue-600" /><h2 className="text-xl font-black text-gray-900">Submission Status</h2></div>
            {loading ? <p className="text-gray-500">Loading products...</p> : products.length === 0 ? <p className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">You have not submitted any products yet.</p> : <div className="space-y-3">{products.map((product) => { const status = product.approvalStatus || "pending"; return <div key={product._id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"><div className="min-w-0">{status === "approved" ? <Link to={`/products/${product._id}`} className="truncate font-bold text-blue-600 hover:text-blue-700">{product.name}</Link> : <p className="truncate font-bold text-gray-900">{product.name}</p>}<p className="mt-1 text-sm text-gray-500">{product.category?.name || "Uncategorized"}</p></div><span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${status === "approved" ? "bg-green-50 text-green-700" : status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{statusIcon(status)} {status}</span></div>; })}</div>}
          </section>
        </div>
      </div>
    </main>
  );
}

export default MyProducts;
