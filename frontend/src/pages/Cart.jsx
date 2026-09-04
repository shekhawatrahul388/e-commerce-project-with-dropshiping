import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Package,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";

function Cart() {
  const navigate = useNavigate();



  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [clearLoading, setClearLoading] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);



  const loadCart = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setLoading(false);
      setCart(null);
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart");

      console.log("GET CART RESPONSE:", response.data);

      const data =
        response.data?.cart ||
        response.data?.data ||
        response.data;

      if (data && !Array.isArray(data)) {
        setCart(data);

        const cartItems = data.items || [];

        setItems(
          Array.isArray(cartItems)
            ? cartItems
            : []
        );
      } else {
        setCart(null);
        setItems([]);
      }
    } catch (error) {
      console.error(
        "GET CART ERROR:",
        error?.response?.data || error.message
      );

      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {
        localStorage.removeItem("token");

        toast.error("Please login first");

        navigate("/login");

        return;
      }

      setError(
        error?.response?.data?.message ||
          "Unable to load cart"
      );
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadCart();
  }, []);



  const getProduct = (item) => {
    if (!item) return null;

    return item.product || null;
  };



  const getProductId = (item) => {
    const product = getProduct(item);

    if (!product) return null;

    if (typeof product === "string") {
      return product;
    }

    return (
      product._id ||
      product.id ||
      null
    );
  };



  const getQuantity = (item) => {
    return Number(item?.quantity || 1);
  };



  const getPrice = (item) => {
    const product = getProduct(item);

    return Number(item?.unitPrice ?? product?.price ?? 0);
  };



  const getImage = (item) => {
    const product = getProduct(item);

    let image =
      product?.image ||
      product?.images?.[0] ||
      product?.thumbnail ||
      "";

    if (typeof image === "object") {
      image =
        image?.url ||
        image?.secure_url ||
        image?.path ||
        "";
    }

    if (!image) {
      return "";
    }

    const imageString = String(image);


    if (
      imageString.startsWith("data:") ||
      imageString.startsWith("https://")
    ) {
      return imageString;
    }

    if (imageString.startsWith("http://")) {
      return imageString.replace("http://", "https://");
    }

    const apiUrl =
      import.meta.env.VITE_API_URL ||
      "https://dropshiping-products-backend-3.onrender.com/api";

    const baseUrl = apiUrl.replace(/\/api\/?$/, "");

    return `${baseUrl}/${imageString.replace(/^\/+/, "")}`;
  };



  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      return (
        total +
        getPrice(item) * getQuantity(item)
      );
    }, 0);
  }, [items]);

  const grandTotal = subtotal;

  const totalItems = useMemo(() => {
    return items.reduce((total, item) => {
      return total + getQuantity(item);
    }, 0);
  }, [items]);



  const updateQuantity = async (
    item,
    newQuantity
  ) => {
    const productId = getProductId(item);

    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    if (newQuantity < 1) {
      return;
    }

    const product = getProduct(item);

    const stock = Number(
      product?.stock ?? 999999
    );

    if (
      stock > 0 &&
      newQuantity > stock
    ) {
      toast.error(
        `Only ${stock} items available`
      );
      return;
    }

    try {
      setUpdatingId(productId);

      const response = await api.put(
        `/cart/update/${productId}`,
        {
          quantity: newQuantity,
        }
      );

      console.log(
        "UPDATE CART RESPONSE:",
        response.data
      );

      const updatedCart =
        response.data?.cart ||
        response.data?.data;

      if (updatedCart) {
        setCart(updatedCart);

        setItems(
          Array.isArray(updatedCart.items)
            ? updatedCart.items
            : []
        );
      }

      toast.success("Cart updated");
    } catch (error) {
      console.error(
        "UPDATE CART ERROR:",
        error?.response?.data ||
          error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update cart"
      );
    } finally {
      setUpdatingId(null);
    }
  };



  const removeItem = async (item) => {
    const productId = getProductId(item);

    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    try {
      setRemovingId(productId);

      const response = await api.delete(
        `/cart/remove/${productId}`
      );

      console.log(
        "REMOVE CART RESPONSE:",
        response.data
      );

      const updatedCart =
        response.data?.cart ||
        response.data?.data;

      if (updatedCart) {
        setCart(updatedCart);

        setItems(
          Array.isArray(updatedCart.items)
            ? updatedCart.items
            : []
        );
      } else {
        setItems((prev) =>
          prev.filter(
            (cartItem) =>
              getProductId(cartItem) !==
              productId
          )
        );
      }

      toast.success(
        "Product removed from cart"
      );
    } catch (error) {
      console.error(
        "REMOVE CART ERROR:",
        error?.response?.data ||
          error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to remove product"
      );
    } finally {
      setRemovingId(null);
    }
  };



  const clearCart = async () => {
    if (items.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearLoading(true);

      await api.delete("/cart/clear");

      setItems([]);
      setCart(null);

      toast.success(
        "Cart cleared successfully"
      );
    } catch (error) {
      console.error(
        "CLEAR CART ERROR:",
        error?.response?.data ||
          error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to clear cart"
      );
    } finally {
      setClearLoading(false);
    }
  };



  const sendCartInquiry = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setInquiryLoading(true);

      const response = await api.post(
        "/whatsapp/cart-inquiry",
        {
          items: items.map((item) => ({
            productId: getProductId(item),
            quantity: getQuantity(item),
          })),
        }
      );

      console.log(
        "WHATSAPP RESPONSE:",
        response.data
      );

      const data =
        response.data?.data ||
        response.data?.inquiry ||
        response.data;



      const whatsappUrl =
        data?.whatsappUrl ||
        response.data?.whatsappUrl;

      if (whatsappUrl) {
        window.open(
          whatsappUrl,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }



      const whatsappNumber =
        data?.phone ||
        data?.whatsappNumber ||
        data?.number ||
        response.data?.phone ||
        response.data?.whatsappNumber;

      const backendMessage =
        data?.message ||
        response.data?.message;

      if (
        whatsappNumber &&
        backendMessage
      ) {
        const cleanNumber =
          String(whatsappNumber).replace(
            /\D/g,
            ""
          );

        const url =
          `https://wa.me/${cleanNumber}` +
          `?text=${encodeURIComponent(
            backendMessage
          )}`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }



      const settingsResponse =
        await api.get(
          "/whatsapp/settings"
        );

      const settings =
        settingsResponse.data?.settings ||
        settingsResponse.data?.data ||
        settingsResponse.data;

      const number =
        settings?.phone ||
        settings?.whatsappNumber ||
        settings?.number;

      if (!number) {
        toast.error(
          "WhatsApp number is not configured"
        );

        return;
      }

      const cleanNumber =
        String(number).replace(
          /\D/g,
          ""
        );



      let messageText =
        "Hello, I want to inquire about these products:\n\n";

      items.forEach((item, index) => {
        const product = getProduct(item);

        const name =
          product?.name || "Product";

        const quantity =
          getQuantity(item);

        const price =
          getPrice(item);

        messageText +=
          `${index + 1}. ${name}\n` +
          `Quantity: ${quantity}\n` +
          `Price: ₹${price.toLocaleString(
            "en-IN"
          )}\n\n`;
      });

      messageText +=
        `Total: ₹${grandTotal.toLocaleString(
          "en-IN"
        )}`;

      const url =
        `https://wa.me/${cleanNumber}` +
        `?text=${encodeURIComponent(
          messageText
        )}`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(
        "WHATSAPP INQUIRY ERROR:",
        error?.response?.data ||
          error.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to send inquiry"
      );

      if (
        error?.response?.data?.message ===
        "Please add a default address before sending inquiry"
      ) {
        navigate("/address");
      }
    } finally {
      setInquiryLoading(false);
    }
  };



  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />

          <div className="grid lg:grid-cols-3 gap-6 mt-8">

            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-2xl p-5 flex gap-4"
                >
                  <div className="w-28 h-28 bg-gray-200 rounded-xl animate-pulse" />

                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />

                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />

                    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 h-80 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded mt-6" />
              <div className="h-4 bg-gray-200 rounded mt-4" />
              <div className="h-12 bg-gray-200 rounded-xl mt-8" />
            </div>

          </div>
        </div>
      </main>
    );
  }



  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">

          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart size={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mt-6">
            Login to View Cart
          </h1>

          <p className="text-gray-500 mt-2 leading-6">
            Please login to access your
            shopping cart and manage your
            products.
          </p>

          <div className="flex gap-3 mt-7">

            <Link
              to="/products"
              className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50"
            >
              Continue Shopping
            </Link>

            <Link
              to="/login"
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-center"
            >
              Login
            </Link>

          </div>
        </div>
      </main>
    );
  }



  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">

          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle size={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mt-5">
            Something Went Wrong
          </h1>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={loadCart}
            className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            <RefreshCw size={18} />
            Try Again
          </button>

        </div>
      </main>
    );
  }



  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="min-h-[65vh] flex items-center justify-center">

            <div className="text-center max-w-md">

              <div className="w-28 h-28 mx-auto rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingCart size={52} />
              </div>

              <h1 className="text-3xl font-black text-gray-900 mt-7">
                Your Cart is Empty
              </h1>

              <p className="text-gray-500 mt-3 leading-7">
                Looks like you haven't added
                anything to your cart yet.
                Explore our products and find
                something you like.
              </p>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 mt-7 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black"
              >
                <ShoppingBag size={19} />
                Start Shopping
              </Link>

            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      

      <section className="bg-white border-b border-gray-100">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-semibold"
              >
                <ArrowLeft size={17} />
                Continue Shopping
              </Link>

              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">
                Shopping Cart
              </h1>

              <p className="text-gray-500 mt-1">
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}{" "}
                in your cart
              </p>

            </div>

            <button
              onClick={clearCart}
              disabled={clearLoading}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold disabled:opacity-50"
            >
              {clearLoading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={17} />
              )}

              Clear Cart
            </button>

          </div>
        </div>
      </section>

      

      <section className="py-7 sm:py-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

            

            <div className="lg:col-span-2">

              <div className="space-y-4">

                {items.map((item, index) => {

                  const product =
                    getProduct(item);

                  const productId =
                    getProductId(item);

                  const quantity =
                    getQuantity(item);

                  const price =
                    getPrice(item);

                  const image =
                    getImage(item);

                  const stock =
                    Number(
                      product?.stock ??
                        999999
                    );

                  const isUpdating =
                    updatingId ===
                    productId;

                  const isRemoving =
                    removingId ===
                    productId;

                  return (
                    <div
                      key={
                        productId ||
                        index
                      }
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
                    >

                      <div className="flex gap-4">

                        

                        <Link
                          to={`/products/${productId}`}
                          className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={
                                product?.name ||
                                "Product"
                              }
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <Package
                              size={40}
                              className="text-gray-300"
                            />
                          )}
                        </Link>

                        

                        <div className="flex-1 min-w-0">

                          <div className="flex justify-between gap-3">

                            <div className="min-w-0">

                              <Link
                                to={`/products/${productId}`}
                                className="font-black text-gray-900 text-base sm:text-lg hover:text-blue-600 line-clamp-2"
                              >
                                {product?.name ||
                                  "Product"}
                              </Link>

                              {product?.brand && (
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                  {product.brand}
                                </p>
                              )}

                            </div>

                            <button
                              onClick={() =>
                                removeItem(item)
                              }
                              disabled={
                                isRemoving
                              }
                              className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                              title="Remove"
                            >
                              {isRemoving ? (
                                <Loader2
                                  size={18}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={18}
                                />
                              )}
                            </button>

                          </div>

                          

                          <div className="mt-3">

                            <span className="text-lg sm:text-xl font-black text-gray-900">
                              ₹
                              {price.toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            <span className="text-xs text-gray-500 ml-2">
                              per item
                            </span>

                          </div>

                          

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">

                            

                            <div className="flex items-center">

                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    quantity - 1
                                  )
                                }
                                disabled={
                                  quantity <= 1 ||
                                  isUpdating
                                }
                                className="w-9 h-9 rounded-l-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                              >
                                <Minus size={15} />
                              </button>

                              <div className="w-12 h-9 border-y border-gray-200 flex items-center justify-center text-sm font-black">

                                {isUpdating ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  quantity
                                )}

                              </div>

                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    quantity + 1
                                  )
                                }
                                disabled={
                                  quantity >= stock ||
                                  isUpdating
                                }
                                className="w-9 h-9 rounded-r-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                              >
                                <Plus size={15} />
                              </button>

                            </div>

                            

                            <div className="text-left sm:text-right">

                              <p className="text-xs text-gray-500">
                                Item Total
                              </p>

                              <p className="font-black text-gray-900 text-lg">
                                ₹
                                {(
                                  price *
                                  quantity
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                            </div>

                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>

              

              <div className="grid sm:grid-cols-3 gap-3 mt-6">

                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <ShieldCheck
                    size={22}
                    className="text-green-600"
                  />

                  <p className="font-black text-sm mt-2">
                    Secure Shopping
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Your information is protected
                  </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <RefreshCw
                    size={22}
                    className="text-blue-600"
                  />

                  <p className="font-black text-sm mt-2">
                    Easy Management
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Update quantity anytime
                  </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <MessageCircle
                    size={22}
                    className="text-green-600"
                  />

                  <p className="font-black text-sm mt-2">
                    WhatsApp Support
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Ask about your products
                  </p>
                </div>

              </div>
            </div>

            

            <aside className="lg:col-span-1">

              <div className="lg:sticky lg:top-24">

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                  

                  <div className="p-6 border-b border-gray-100">

                    <h2 className="text-xl font-black text-gray-900">
                      Cart Summary
                    </h2>

                  </div>

                  

                  <div className="p-6">

                    <div className="space-y-4">

                      <div className="flex justify-between gap-4 text-sm">

                        <span className="text-gray-500">
                          Items
                        </span>

                        <span className="font-bold text-gray-900">
                          {totalItems}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4 text-sm">

                        <span className="text-gray-500">
                          Subtotal
                        </span>

                        <span className="font-bold text-gray-900">
                          ₹
                          {subtotal.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4 text-sm">

                        <span className="text-gray-500">
                          Shipping
                        </span>

                        <span className="font-bold text-green-600">
                          Contact for details
                        </span>

                      </div>

                    </div>

                    <div className="border-t border-gray-100 my-5" />

                    <div className="flex items-center justify-between">

                      <span className="font-black text-gray-900">
                        Estimated Total
                      </span>

                      <span className="text-2xl font-black text-blue-600">
                        ₹
                        {grandTotal.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                    

                    <button
                      onClick={sendCartInquiry}
                      disabled={inquiryLoading}
                      className="w-full mt-6 min-h-[54px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-black flex items-center justify-center gap-2 transition disabled:opacity-60"
                    >
                      {inquiryLoading ? (
                        <Loader2
                          size={20}
                          className="animate-spin"
                        />
                      ) : (
                        <>
                          <MessageCircle
                            size={20}
                          />
                          Send WhatsApp Inquiry
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-3 leading-5">
                      Your cart details will be
                      sent for inquiry on WhatsApp.
                    </p>

                  </div>
                </div>

                

                <Link
                  to="/products"
                  className="mt-4 w-full min-h-[50px] bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-2 font-bold text-gray-700 hover:bg-gray-50"
                >
                  <ShoppingBag size={18} />
                  Continue Shopping
                </Link>

              </div>
            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}

export default Cart;