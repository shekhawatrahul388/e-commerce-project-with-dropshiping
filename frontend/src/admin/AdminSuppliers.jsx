import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

import api from "../api/axios";

function AdminSuppliers() {


  const initialForm = {
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    notes: "",
    active: true,
  };



  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const suppliersPerPage = 8;



  const loadSuppliers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/supplier/all");

      const data = response?.data;

      const supplierData =
        data?.suppliers ||
        data?.data ||
        (Array.isArray(data) ? data : []);

      setSuppliers(
        Array.isArray(supplierData)
          ? supplierData
          : []
      );
    } catch (error) {
      console.error(
        "Supplier loading error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load suppliers"
      );

      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);



  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };



  const openCreate = () => {
    setEditingSupplier(null);
    setForm({ ...initialForm });
    setShowModal(true);
  };



  const openEdit = (supplier) => {
    setEditingSupplier(supplier);

    setForm({
      name: supplier?.name || "",

      companyName:
        supplier?.companyName || "",

      phone:
        supplier?.phone !== undefined &&
        supplier?.phone !== null
          ? String(supplier.phone)
          : "",

      email:
        supplier?.email || "",

      address:
        supplier?.address || "",

      city:
        supplier?.city || "",

      state:
        supplier?.state || "",

      pincode:
        supplier?.pincode !== undefined &&
        supplier?.pincode !== null
          ? String(supplier.pincode)
          : "",

      gstNumber:
        supplier?.gstNumber || "",

      notes:
        supplier?.notes || "",

      active:
        supplier?.active !== false,
    });

    setShowModal(true);
  };



  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSupplier(null);
    setForm({ ...initialForm });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = String(form.name || "").trim();
    const phone = String(form.phone || "").trim();

    if (!name) {
      toast.error("Supplier name is required");
      return;
    }

    if (!phone) {
      toast.error("Phone number is required");
      return;
    }


    if (!/^[0-9+\-\s()]{7,15}$/.test(phone)) {
      toast.error("Enter a valid phone number");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,

        companyName: String(
          form.companyName || ""
        ).trim(),

        phone,

        email: String(
          form.email || ""
        )
          .trim()
          .toLowerCase(),

        address: String(
          form.address || ""
        ).trim(),

        city: String(
          form.city || ""
        ).trim(),

        state: String(
          form.state || ""
        ).trim(),

        pincode: String(
          form.pincode || ""
        ).trim(),

        gstNumber: String(
          form.gstNumber || ""
        )
          .trim()
          .toUpperCase(),

        notes: String(
          form.notes || ""
        ).trim(),

        active: Boolean(form.active),
      };

      if (editingSupplier?._id) {
        await api.put(
          `/supplier/update/${editingSupplier._id}`,
          payload
        );

        toast.success(
          "Supplier updated successfully"
        );
      } else {
        await api.post(
          "/supplier/create",
          payload
        );

        toast.success(
          "Supplier created successfully"
        );
      }


      setShowModal(false);
      setEditingSupplier(null);
      setForm({ ...initialForm });

      setCurrentPage(1);

      await loadSuppliers();
    } catch (error) {
      console.error(
        "Supplier save error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to save supplier"
      );
    } finally {
      setSaving(false);
    }
  };



  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await api.delete(
        `/supplier/delete/${id}`
      );

      toast.success(
        "Supplier deleted successfully"
      );

      await loadSuppliers();


      setCurrentPage((prev) => {
        const remaining =
          filteredSuppliers.length - 1;

        const newTotalPages = Math.max(
          1,
          Math.ceil(
            remaining /
              suppliersPerPage
          )
        );

        return Math.min(
          prev,
          newTotalPages
        );
      });
    } catch (error) {
      console.error(
        "Delete supplier error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete supplier"
      );
    } finally {
      setDeletingId(null);
    }
  };



  const handleToggle = async (supplier) => {
    if (!supplier?._id) return;

    try {
      setTogglingId(supplier._id);

      await api.put(
        `/supplier/toggle/${supplier._id}`
      );

      toast.success(
        supplier.active === false
          ? "Supplier activated"
          : "Supplier deactivated"
      );

      await loadSuppliers();
    } catch (error) {
      console.error(
        "Toggle supplier error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update supplier status"
      );
    } finally {
      setTogglingId(null);
    }
  };



  const filteredSuppliers = useMemo(() => {
    const keyword = String(
      search || ""
    )
      .toLowerCase()
      .trim();

    return suppliers.filter(
      (supplier) => {
        const name = String(
          supplier?.name || ""
        ).toLowerCase();

        const company = String(
          supplier?.companyName || ""
        ).toLowerCase();

        const phone = String(
          supplier?.phone || ""
        ).toLowerCase();

        const email = String(
          supplier?.email || ""
        ).toLowerCase();

        const gst = String(
          supplier?.gstNumber || ""
        ).toLowerCase();

        const matchesSearch =
          !keyword ||
          name.includes(keyword) ||
          company.includes(keyword) ||
          phone.includes(keyword) ||
          email.includes(keyword) ||
          gst.includes(keyword);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" &&
            supplier?.active !== false) ||
          (statusFilter === "inactive" &&
            supplier?.active === false);

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    suppliers,
    search,
    statusFilter,
  ]);



  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);



  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSuppliers.length /
        suppliersPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) *
    suppliersPerPage;

  const currentSuppliers =
    filteredSuppliers.slice(
      startIndex,
      startIndex +
        suppliersPerPage
    );

  const changePage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };



  const totalSuppliers =
    suppliers.length;

  const activeSuppliers =
    suppliers.filter(
      (supplier) =>
        supplier?.active !== false
    ).length;

  const inactiveSuppliers =
    suppliers.filter(
      (supplier) =>
        supplier?.active === false
    ).length;



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto animate-pulse">
            <Truck size={28} />
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-500">
            Loading suppliers...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">

      
      
      

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  Suppliers
                </h1>

                <p className="text-xs text-gray-400 mt-1">
                  Manage your product suppliers
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={loadSuppliers}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>

              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm"
              >
                <Plus size={18} />
                Add Supplier
              </button>

            </div>

          </div>

        </div>
      </div>

      
      
      

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        
        
        

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-black text-gray-400 uppercase">
                  Total Suppliers
                </p>

                <p className="text-3xl font-black text-gray-900 mt-1">
                  {totalSuppliers}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck size={23} />
              </div>

            </div>
          </div>

          

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-black text-gray-400 uppercase">
                  Active
                </p>

                <p className="text-3xl font-black text-green-600 mt-1">
                  {activeSuppliers}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle size={23} />
              </div>

            </div>
          </div>

          

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-black text-gray-400 uppercase">
                  Inactive
                </p>

                <p className="text-3xl font-black text-red-600 mt-1">
                  {inactiveSuppliers}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle size={23} />
              </div>

            </div>
          </div>

        </div>

        
        
        

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search supplier, company, phone, GST..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-blue-500 text-sm"
            >

              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>

        
        
        

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          

          <div className="hidden lg:block overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b border-gray-100">

                <tr>

                  <th className="text-left px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Supplier
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Contact
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Location
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    GST
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Status
                  </th>

                  <th className="text-right px-5 py-4 text-[11px] font-black text-gray-400 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {currentSuppliers.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="py-16 text-center"
                    >

                      <Truck
                        size={42}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 font-bold text-gray-500">
                        No suppliers found
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Try changing your search or filter
                      </p>

                    </td>
                  </tr>

                ) : (

                  currentSuppliers.map(
                    (supplier) => (

                      <tr
                        key={supplier._id}
                        className="hover:bg-gray-50/70 transition"
                      >

                        

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3 min-w-[220px]">

                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                              {supplier?.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "S"}
                            </div>

                            <div className="min-w-0">

                              <p className="font-bold text-sm text-gray-900 truncate">
                                {supplier?.name ||
                                  "Unnamed Supplier"}
                              </p>

                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {supplier?.companyName ||
                                  "Supplier"}
                              </p>

                            </div>

                          </div>

                        </td>

                        

                        <td className="px-5 py-4">

                          <div className="space-y-1">

                            {supplier?.phone && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Phone size={13} />

                                {String(
                                  supplier.phone
                                )}
                              </div>
                            )}

                            {supplier?.email && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 max-w-[190px] truncate">
                                <Mail size={13} />

                                {supplier.email}
                              </div>
                            )}

                          </div>

                        </td>

                        

                        <td className="px-5 py-4">

                          <div className="flex items-start gap-2 max-w-[200px]">

                            <MapPin
                              size={14}
                              className="text-gray-400 mt-0.5 shrink-0"
                            />

                            <p className="text-xs text-gray-500">

                              {[
                                supplier?.city,
                                supplier?.state,
                                supplier?.pincode,
                              ]
                                .filter(Boolean)
                                .join(", ") ||
                                "No location"}

                            </p>

                          </div>

                        </td>

                        

                        <td className="px-5 py-4">

                          <span className="text-xs font-semibold text-gray-600">

                            {supplier?.gstNumber ||
                              "—"}

                          </span>

                        </td>

                        

                        <td className="px-5 py-4">

                          <button
                            onClick={() =>
                              handleToggle(
                                supplier
                              )
                            }
                            disabled={
                              togglingId ===
                              supplier._id
                            }
                            className="disabled:opacity-50"
                          >

                            {togglingId ===
                            supplier._id ? (

                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black">
                                <RefreshCw
                                  size={12}
                                  className="animate-spin"
                                />
                                Updating
                              </span>

                            ) : supplier?.active !==
                              false ? (

                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black">
                                <CheckCircle size={12} />
                                Active
                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black">
                                <XCircle size={12} />
                                Inactive
                              </span>

                            )}

                          </button>

                        </td>

                        

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openEdit(
                                  supplier
                                )
                              }
                              className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  supplier._id
                                )
                              }
                              disabled={
                                deletingId ===
                                supplier._id
                              }
                              className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center disabled:opacity-50 transition"
                              title="Delete"
                            >

                              {deletingId ===
                              supplier._id ? (

                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />

                              ) : (

                                <Trash2
                                  size={16}
                                />

                              )}

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          
          
          

          <div className="lg:hidden divide-y divide-gray-100">

            {currentSuppliers.length === 0 ? (

              <div className="py-16 text-center">

                <Truck
                  size={42}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 font-bold text-gray-500">
                  No suppliers found
                </p>

              </div>

            ) : (

              currentSuppliers.map(
                (supplier) => (

                  <div
                    key={supplier._id}
                    className="p-4"
                  >

                    <div className="flex items-start gap-3">

                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">

                        {supplier?.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "S"}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between gap-2">

                          <div>

                            <h3 className="font-bold text-gray-900">
                              {supplier?.name ||
                                "Unnamed Supplier"}
                            </h3>

                            <p className="text-xs text-gray-400 mt-1">
                              {supplier?.companyName ||
                                "Supplier"}
                            </p>

                          </div>

                          {supplier?.active !==
                          false ? (

                            <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-[9px] font-black">
                              Active
                            </span>

                          ) : (

                            <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 text-[9px] font-black">
                              Inactive
                            </span>

                          )}

                        </div>

                        <div className="mt-3 space-y-2">

                          {supplier?.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">

                              <Phone size={14} />

                              {String(
                                supplier.phone
                              )}

                            </div>
                          )}

                          {supplier?.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 break-all">

                              <Mail size={14} />

                              {supplier.email}

                            </div>
                          )}

                          {(supplier?.city ||
                            supplier?.state ||
                            supplier?.pincode) && (

                            <div className="flex items-start gap-2 text-xs text-gray-500">

                              <MapPin
                                size={14}
                                className="mt-0.5"
                              />

                              <span>

                                {[
                                  supplier?.city,
                                  supplier?.state,
                                  supplier?.pincode,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}

                              </span>

                            </div>

                          )}

                          {supplier?.gstNumber && (
                            <div className="text-xs text-gray-500">
                              <span className="font-bold">
                                GST:
                              </span>{" "}
                              {supplier.gstNumber}
                            </div>
                          )}

                        </div>

                      </div>

                    </div>

                    <div className="flex gap-2 mt-4">

                      <button
                        onClick={() =>
                          openEdit(
                            supplier
                          )
                        }
                        className="flex-1 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Edit size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleToggle(
                            supplier
                          )
                        }
                        disabled={
                          togglingId ===
                          supplier._id
                        }
                        className="px-4 h-10 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs disabled:opacity-50"
                      >
                        {togglingId ===
                        supplier._id
                          ? "..."
                          : "Toggle"}
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            supplier._id
                          )
                        }
                        disabled={
                          deletingId ===
                          supplier._id
                        }
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-50"
                      >

                        {deletingId ===
                        supplier._id ? (

                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />

                        ) : (

                          <Trash2 size={16} />

                        )}

                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

          
          
          

          {filteredSuppliers.length >
            suppliersPerPage && (

            <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">

              <p className="text-xs text-gray-400">

                Showing{" "}

                <span className="font-bold text-gray-700">
                  {startIndex + 1}
                </span>

                {" - "}

                <span className="font-bold text-gray-700">
                  {Math.min(
                    startIndex +
                      suppliersPerPage,
                    filteredSuppliers.length
                  )}
                </span>

                {" of "}

                <span className="font-bold text-gray-700">
                  {filteredSuppliers.length}
                </span>

              </p>

              <div className="flex items-center gap-1">

                <button
                  disabled={
                    safePage === 1
                  }
                  onClick={() =>
                    changePage(
                      safePage - 1
                    )
                  }
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft size={17} />
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                )
                  .slice(
                    Math.max(
                      0,
                      safePage - 3
                    ),
                    safePage + 2
                  )
                  .map((page) => (

                    <button
                      key={page}
                      onClick={() =>
                        changePage(
                          page
                        )
                      }
                      className={`
                        w-9
                        h-9
                        rounded-lg
                        text-xs
                        font-bold
                        ${
                          page ===
                          safePage
                            ? "bg-blue-600 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      {page}
                    </button>

                  ))}

                <button
                  disabled={
                    safePage ===
                    totalPages
                  }
                  onClick={() =>
                    changePage(
                      safePage + 1
                    )
                  }
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight size={17} />
                </button>

              </div>

            </div>

          )}

        </div>

      </main>

      
      
      

      {showModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">

          

          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!saving) {
                closeModal();
              }
            }}
          />

          

          <div className="relative w-full max-w-3xl max-h-[95vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">

            

            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-black text-gray-900">

                  {editingSupplier
                    ? "Edit Supplier"
                    : "Add Supplier"}

                </h2>

                <p className="text-xs text-gray-400 mt-1">

                  {editingSupplier
                    ? "Update supplier information"
                    : "Add a new supplier to your store"}

                </p>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Supplier Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Supplier name"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

                </div>

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="companyName"
                    value={
                      form.companyName
                    }
                    onChange={handleChange}
                    placeholder="Company name"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

                </div>

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Phone *
                  </label>

                  <div className="relative">

                    <Phone
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                    />

                  </div>

                </div>

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Email
                  </label>

                  <div className="relative">

                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="supplier@example.com"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                    />

                  </div>

                </div>

                

                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Complete supplier address"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm resize-none"
                  />

                </div>

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Jaipur"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

                </div>

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Rajasthan"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

                </div>

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="302001"
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />

                </div>

                

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    GST Number
                  </label>

                  <input
                    type="text"
                    name="gstNumber"
                    value={form.gstNumber}
                    onChange={handleChange}
                    placeholder="GSTIN"
                    maxLength={15}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm uppercase"
                  />

                </div>

                

                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Additional notes..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm resize-none"
                  />

                </div>

                

                <div className="md:col-span-2">

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">

                    <input
                      type="checkbox"
                      name="active"
                      checked={form.active}
                      onChange={handleChange}
                      className="w-4 h-4 accent-blue-600"
                    />

                    <div>

                      <p className="text-sm font-bold text-gray-800">
                        Active Supplier
                      </p>

                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Enable this supplier
                        for your store.
                      </p>

                    </div>

                  </label>

                </div>

              </div>

              

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-7 pt-5 border-t border-gray-100">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 px-5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >

                  {saving ? (

                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>

                  ) : (

                    <>
                      <Save size={17} />

                      {editingSupplier
                        ? "Update Supplier"
                        : "Create Supplier"}
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminSuppliers;