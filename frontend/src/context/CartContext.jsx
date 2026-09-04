import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "./AuthContext";



const CartContext = createContext(null);



const getCartData = (response) => {
  const data = response?.data;

  if (!data) return null;



  return (
    data?.cart ||
    data?.data ||
    data
  );
};

const getCartItems = (cartData) => {
  if (!cartData) return [];


  if (Array.isArray(cartData)) {
    return cartData;
  }


  if (Array.isArray(cartData.items)) {
    return cartData.items;
  }


  if (Array.isArray(cartData.products)) {
    return cartData.products;
  }

  return [];
};



export function CartProvider({ children }) {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);



  const resetCart = useCallback(() => {
    setCart(null);
    setCartItems([]);
  }, []);



  const updateCartState = useCallback(
    (cartData) => {
      if (!cartData) {
        resetCart();
        return;
      }

      setCart(cartData);

      const items = getCartItems(cartData);

      setCartItems(items);
    },
    [resetCart]
  );



  const getCart = useCallback(
    async (showLoader = true) => {
      const token = localStorage.getItem("token");

      if (!isAuthenticated || !token) {
        resetCart();
        return null;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        const response = await api.get("/cart");

        console.log(
          "GET CART RESPONSE:",
          response.data
        );

        const cartData = getCartData(response);

        updateCartState(cartData);

        return cartData;
      } catch (error) {
        console.error(
          "GET CART ERROR:",
          error?.response?.data ||
            error?.message
        );


        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          resetCart();
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      isAuthenticated,
      resetCart,
      updateCartState,
    ]
  );



  useEffect(() => {
    if (isAuthenticated) {
      getCart();
    } else {
      resetCart();
    }
  }, [
    isAuthenticated,
    user?._id,
    getCart,
    resetCart,
  ]);



  const addToCart = async (
    productId,
    quantity = 1
  ) => {
    if (!isAuthenticated) {
      toast.error(
        "Please login to add product"
      );

      return {
        success: false,
      };
    }

    if (!productId) {
      toast.error(
        "Product ID is required"
      );

      return {
        success: false,
      };
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      toast.error(
        "Quantity must be at least 1"
      );

      return {
        success: false,
      };
    }

    try {
      setAdding(true);

      const response = await api.post(
        "/cart/add",
        {
          productId,
          quantity: qty,
        }
      );

      console.log(
        "ADD CART RESPONSE:",
        response.data
      );

      const cartData =
        getCartData(response);

      if (cartData) {
        updateCartState(cartData);
      } else {
        await getCart(false);
      }

      toast.success(
        response.data?.message ||
          "Product added to cart"
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "ADD CART ERROR:",
        error?.response?.data ||
          error?.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to add product"
      );

      return {
        success: false,
        error,
      };
    } finally {
      setAdding(false);
    }
  };



  const getProductId = (item) => {
    return (
      item?.product?._id ||
      item?.product?.id ||
      item?.productId?._id ||
      item?.productId ||
      item?._id ||
      item?.id ||
      null
    );
  };



  const updateQuantity = async (
    productId,
    quantity
  ) => {
    if (!isAuthenticated) {
      toast.error(
        "Please login first"
      );

      return {
        success: false,
      };
    }

    if (!productId) {
      toast.error(
        "Product ID is required"
      );

      return {
        success: false,
      };
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty)) {
      toast.error(
        "Invalid quantity"
      );

      return {
        success: false,
      };
    }


    if (qty <= 0) {
      return removeFromCart(productId);
    }

    try {
      setUpdating(true);

      const response = await api.put(
        `/cart/update/${productId}`,
        {
          quantity: qty,
        }
      );

      console.log(
        "UPDATE CART RESPONSE:",
        response.data
      );

      const cartData =
        getCartData(response);

      if (cartData) {
        updateCartState(cartData);
      } else {
        await getCart(false);
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "UPDATE CART ERROR:",
        error?.response?.data ||
          error?.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update cart"
      );

      return {
        success: false,
        error,
      };
    } finally {
      setUpdating(false);
    }
  };



  const increaseQuantity = async (
    item
  ) => {
    const productId =
      getProductId(item);

    if (!productId) {
      toast.error(
        "Product ID not found"
      );

      return {
        success: false,
      };
    }

    const currentQuantity =
      Number(item?.quantity || 1);

    return updateQuantity(
      productId,
      currentQuantity + 1
    );
  };



  const decreaseQuantity = async (
    item
  ) => {
    const productId =
      getProductId(item);

    if (!productId) {
      toast.error(
        "Product ID not found"
      );

      return {
        success: false,
      };
    }

    const currentQuantity =
      Number(item?.quantity || 1);

    if (currentQuantity <= 1) {
      return removeFromCart(
        productId
      );
    }

    return updateQuantity(
      productId,
      currentQuantity - 1
    );
  };



  const removeFromCart = async (
    productId
  ) => {
    if (!isAuthenticated) {
      toast.error(
        "Please login first"
      );

      return {
        success: false,
      };
    }

    if (!productId) {
      toast.error(
        "Product ID is required"
      );

      return {
        success: false,
      };
    }

    try {
      setUpdating(true);

      const response =
        await api.delete(
          `/cart/remove/${productId}`
        );

      console.log(
        "REMOVE CART RESPONSE:",
        response.data
      );

      const cartData =
        getCartData(response);

      if (cartData) {
        updateCartState(cartData);
      } else {
        await getCart(false);
      }

      toast.success(
        response.data?.message ||
          "Product removed from cart"
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "REMOVE CART ERROR:",
        error?.response?.data ||
          error?.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to remove product"
      );

      return {
        success: false,
        error,
      };
    } finally {
      setUpdating(false);
    }
  };



  const clearCart = async () => {
    if (!isAuthenticated) {
      toast.error(
        "Please login first"
      );

      return {
        success: false,
      };
    }

    try {
      setUpdating(true);

      const response =
        await api.delete(
          "/cart/clear"
        );

      console.log(
        "CLEAR CART RESPONSE:",
        response.data
      );

      resetCart();

      toast.success(
        response.data?.message ||
          "Cart cleared"
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "CLEAR CART ERROR:",
        error?.response?.data ||
          error?.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to clear cart"
      );

      return {
        success: false,
        error,
      };
    } finally {
      setUpdating(false);
    }
  };



  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        return (
          total +
          Number(
            item?.quantity || 1
          )
        );
      },
      0
    );
  }, [cartItems]);



  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        const product =
          item?.product || item;

        const price = Number(
          item?.unitPrice ?? product?.price ?? 0
        );

        const quantity = Number(
          item?.quantity || 1
        );

        return (
          total +
          price * quantity
        );
      },
      0
    );
  }, [cartItems]);



  const cartCount = totalItems;



  const isCartEmpty =
    cartItems.length === 0;



  const value = {

    cart,
    cartItems,


    loading,
    adding,
    updating,


    totalItems,
    cartCount,
    totalPrice,


    isCartEmpty,


    getCart,
    addToCart,

    updateQuantity,
    increaseQuantity,
    decreaseQuantity,

    removeFromCart,
    clearCart,


    resetCart,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}



export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}



export default CartContext;