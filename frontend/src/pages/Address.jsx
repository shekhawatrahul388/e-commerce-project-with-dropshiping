import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Check,
  Loader2,
  Home,
  Building2,
  MapPinned,
  User,
  Phone,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  type: "Home",
};

function Address() {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [defaultLoadingId, setDefaultLoadingId] =
    useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);



  const getAddresses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/address");

      console.log("Addresses:", response.data);

      const list =
        response.data?.addresses ||
        response.data?.data ||
        response.data ||
        [];

      setAddresses(
        Array.isArray(list) ? list : []
      );
    } catch (error) {
      console.log(
        "Address error:",
        error?.response?.data || error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to load addresses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAddresses();
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const clean = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        phone: clean,
      }));

      return;
    }

    if (name === "pincode") {
      const clean = value
        .replace(/\D/g, "")
        .slice(0, 6);

      setFormData((prev) => ({
        ...prev,
        pincode: clean,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const openCreate = () => {
    setEditId(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  };



  const openEdit = (address) => {
    setEditId(address._id);

    setFormData({
      name: address.name || "",
      phone: address.phone
        ? String(address.phone)
        : "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode
        ? String(address.pincode)
        : "",
      landmark: address.landmark || "",
      type: address.type || "Home",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };



  const validate = () => {
    if (!formData.name.trim()) {
      toast.error("Enter receiver name");
      return false;
    }

    if (formData.phone.length !== 10) {
      toast.error(
        "Enter valid 10-digit phone number"
      );
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Enter complete address");
      return false;
    }

    if (!formData.city.trim()) {
      toast.error("Enter city");
      return false;
    }

    if (!formData.state.trim()) {
      toast.error("Enter state");
      return false;
    }

    if (formData.pincode.length !== 6) {
      toast.error(
        "Enter valid 6-digit pincode"
      );
      return false;
    }

    return true;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode,
        landmark: formData.landmark.trim(),
        type: formData.type,
      };

      let response;

      if (editId) {
        response = await api.put(
          `/address/update/${editId}`,
          payload
        );
      } else {
        response = await api.post(
          "/address/create",
          payload
        );
      }

      console.log(
        "Address response:",
        response.data
      );

      toast.success(
        response.data?.message ||
          (editId
            ? "Address updated successfully"
            : "Address added successfully")
      );

      setShowForm(false);
      setEditId(null);
      setFormData({ ...emptyForm });

      await getAddresses();
    } catch (error) {
      console.log(
        "Save address error:",
        error?.response?.data || error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to save address"
      );
    } finally {
      setSaving(false);
    }
  };



  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await api.delete(
        `/address/delete/${id}`
      );

      toast.success(
        response.data?.message ||
          "Address deleted successfully"
      );

      setAddresses((prev) =>
        prev.filter(
          (item) => item._id !== id
        )
      );
    } catch (error) {
      console.log(
        "Delete address error:",
        error?.response?.data || error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to delete address"
      );
    } finally {
      setDeletingId(null);
    }
  };



  const handleDefault = async (id) => {
    try {
      setDefaultLoadingId(id);

      const response = await api.put(
        `/address/default/${id}`
      );

      toast.success(
        response.data?.message ||
          "Default address updated"
      );

      setAddresses((prev) =>
        prev.map((item) => ({
          ...item,
          isDefault: item._id === id,
        }))
      );
    } catch (error) {
      console.log(
        "Default address error:",
        error?.response?.data || error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to set default address"
      );
    } finally {
      setDefaultLoadingId(null);
    }
  };



  const getTypeIcon = (type) => {
    if (
      String(type).toLowerCase() === "work"
    ) {
      return <Building2 size={21} />;
    }

    return <Home size={21} />;
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
            Loading addresses...
          </p>
        </div>
      </main>
    );
  }



  return (
    <main className="min-h-screen bg-gray-50">

      
      
      

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

            <div>

              <Link
                to="/profile"
                className="inline-flex items-center gap-2 text-blue-100 hover:text-white text-sm font-medium mb-3"
              >
                <ArrowLeft size={16} />
                Back to Profile
              </Link>

              <h1 className="text-3xl sm:text-4xl font-black">
                My Addresses
              </h1>

              <p className="text-blue-100 mt-2">
                Manage your delivery addresses
              </p>

            </div>

            <button
              onClick={openCreate}
              className="w-full sm:w-auto px-5 h-12 rounded-xl bg-white text-blue-700 font-black flex items-center justify-center gap-2 hover:bg-blue-50 transition shadow-lg"
            >
              <Plus size={20} />
              Add New Address
            </button>

          </div>

        </div>

      </section>

      
      
      

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        
        
        

        {showForm && (
          <div className="mb-7 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            

            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {editId ? (
                    <Edit3 size={21} />
                  ) : (
                    <Plus size={21} />
                  )}
                </div>

                <div>

                  <h2 className="text-xl font-black text-gray-900">
                    {editId
                      ? "Edit Address"
                      : "Add New Address"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Enter your complete delivery
                    details
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setFormData({
                    ...emptyForm,
                  });
                }}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={21} />
              </button>

            </div>

            

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >

              <div className="grid sm:grid-cols-2 gap-5">

                

                <div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Receiver Name
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full name"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                

                <div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mobile Number
                  </label>

                  <div className="relative">

                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="10-digit number"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                

                <div className="sm:col-span-2">

                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Complete Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="House no, street, area, colony..."
                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none resize-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                

                <div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                

                <div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                

                <div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    placeholder="6-digit pincode"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                

                <div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Landmark
                    <span className="text-gray-400 font-normal">
                      {" "}
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Near school, temple..."
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                

                <div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Address Type
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    {["Home", "Work"].map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setFormData(
                              (prev) => ({
                                ...prev,
                                type,
                              })
                            )
                          }
                          className={`h-12 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                            formData.type === type
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {type === "Home" ? (
                            <Home size={18} />
                          ) : (
                            <Building2
                              size={18}
                            />
                          )}

                          {type}
                        </button>
                      )
                    )}

                  </div>

                </div>

              </div>

              

              <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setFormData({
                      ...emptyForm,
                    });
                  }}
                  className="h-12 px-6 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-60"
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
                      {editId
                        ? "Update Address"
                        : "Save Address"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        )}

        
        
        

        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-16 text-center">

            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin size={38} />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mt-6">
              No addresses yet
            </h2>

            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Add your delivery address so
              you can quickly use it when
              making an inquiry.
            </p>

            <button
              onClick={openCreate}
              className="mt-6 px-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black inline-flex items-center gap-2"
            >
              <Plus size={19} />
              Add Address
            </button>

          </div>
        ) : (

          
          
          

          <div className="grid md:grid-cols-2 gap-5">

            {addresses.map((item) => (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition hover:shadow-md ${
                  item.isDefault
                    ? "border-blue-300 ring-1 ring-blue-100"
                    : "border-gray-100"
                }`}
              >

                

                <div className="p-5 border-b border-gray-100">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>

                    <div>

                      <div className="flex items-center gap-2">

                        <h3 className="font-black text-gray-900">
                          {item.type || "Address"}
                        </h3>

                        {item.isDefault && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-black">
                            DEFAULT
                          </span>
                        )}

                      </div>

                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.name}
                      </p>

                    </div>

                  </div>

                </div>

                

                <div className="p-5">

                  <div className="flex gap-3">

                    <MapPinned
                      size={19}
                      className="text-gray-400 shrink-0 mt-0.5"
                    />

                    <div className="text-sm text-gray-600 leading-6">

                      <p>
                        {item.address}
                      </p>

                      <p>
                        {item.city},{" "}
                        {item.state} -{" "}
                        {item.pincode}
                      </p>

                      {item.landmark && (
                        <p className="text-gray-400">
                          Near {item.landmark}
                        </p>
                      )}

                    </div>

                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">

                    <Phone
                      size={17}
                      className="text-gray-400"
                    />

                    <span className="text-sm font-semibold text-gray-700">
                      +91 {item.phone}
                    </span>

                  </div>

                </div>

                

                <div className="px-5 pb-5">

                  <div className="grid grid-cols-2 gap-3">

                    

                    <button
                      onClick={() =>
                        openEdit(item)
                      }
                      className="h-10 rounded-xl border border-gray-200 text-gray-700 font-bold flex items-center justify-center gap-2 hover:bg-gray-50"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    

                    <button
                      onClick={() =>
                        handleDelete(item._id)
                      }
                      disabled={
                        deletingId === item._id
                      }
                      className="h-10 rounded-xl border border-red-100 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === item._id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      Delete
                    </button>

                  </div>

                  

                  {!item.isDefault && (
                    <button
                      onClick={() =>
                        handleDefault(item._id)
                      }
                      disabled={
                        defaultLoadingId ===
                        item._id
                      }
                      className="w-full h-10 mt-3 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 disabled:opacity-50"
                    >
                      {defaultLoadingId ===
                      item._id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Check size={16} />
                      )}

                      Set as Default
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}

export default Address;