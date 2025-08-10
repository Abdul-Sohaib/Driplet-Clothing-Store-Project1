/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "react-toastify";
import AddressManager from "../components/AddressManager";
import CartItems from "../components/CartItems";
import axios from "axios";
import { VscFoldDown, VscFoldUp } from "react-icons/vsc";
import { IoClose } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
declare global {
  interface Window {
    Razorpay: any;
  }
}

export type CartItem = {
  productId: string;
  quantity: number;
  size: string;
  variantIndex?: number;
  product: {
    name: string;
    price: number;
    imageUrls: string[];
  };
};

interface User {
  name: string;
  email: string;
  _id: string;
}

type Address = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

interface CheckoutPageProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  user: User | null;
  setSelectedAddress: (address: Address | null) => void;
  selectedAddress: Address | null;
  setCartItems: ((items: CartItem[]) => void) | undefined;
}

const CheckoutPage = ({
  isOpen,
  onClose,
  cartItems,
  user,
  selectedAddress,
  setSelectedAddress,
  setCartItems,
}: CheckoutPageProps) => {
  const [showCartItems, setShowCartItems] = useState(false);

  if (!isOpen) return null;

  console.log("CheckoutPage props:", { setCartItems: typeof setCartItems });

  const total = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handlePay = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (!user) {
      toast.error("User information not available.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Cart is empty.");
      return;
    }
    try {
      console.log("Initiating payment at:", `${API_BASE}/client/orders/initiate`);
      const { data } = await axios.post(
        `${API_BASE}/client/orders/initiate`,
        { amount: total * 100 },
        { withCredentials: true }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        order_id: data.orderId,
        name: "Driplet",
        description: "Order Checkout",
        handler: async function (response: {
          razorpay_payment_id: any;
          razorpay_order_id: any;
          razorpay_signature: any;
        }) {
          try {
            console.log("Completing order at:", `${API_BASE}/client/orders/complete`);
            await axios.post(
              `${API_BASE}/client/orders/complete`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                cartItems,
                address: selectedAddress,
                category: cartItems[0]?.product?.name?.split(" ")[0] || "Clothing",
                customer: {
                  name: user.name,
                  email: user.email,
                  address: `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}, ${selectedAddress.country}`,
                },
                paymentStatus: "Paid",
                status: "Placed",
                date: new Date().toISOString().split("T")[0],
              },
              { withCredentials: true }
            );
            if (typeof setCartItems === "function") {
              setCartItems([]);
            } else {
              console.warn("setCartItems is not a function, skipping cart clear");
            }
            toast.success("Payment Successful! Order placed.");
            onClose();
          } catch (err: any) {
            console.error("Order completion error:", {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
            });
            toast.error("Failed to complete order. Please try again.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#9155FD" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment initiation error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <div className="relative w-[95vw] sm:w-[90vw] max-w-3xl inset-0 bg-[#F5F5DC] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-lg overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 sm:right-4 text-2xl sm:text-3xl font-bold cursor-pointer z-50"
      >
        <IoClose className="text-red-400 hover:text-red-600"/>
      </button>
      <button
        onClick={() => setShowCartItems(!showCartItems)}
        className="absolute top-2 sm:top-4 right-12 sm:right-20 text-sm sm:text-md font-bold cursor-pointer z-50"
      >
        {showCartItems ? <VscFoldUp /> : <VscFoldDown />}
      </button>
      <AnimatePresence>
        {showCartItems && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full bg-[#F5F5DC] border-b-2 border-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 z-40 shadow-md"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 textheading tracking-wider text-center">Your Cart</h2>
            <CartItems cartItems={cartItems} />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={`transition-opacity duration-300 ${
          showCartItems ? "opacity-20 pointer-events-none blur-sm" : "opacity-100"
        }`}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 uppercase textheading tracking-wider">Checkout</h2>
        <div className="grid grid-cols-1 items-start justify-center transition-all duration-300">
          <div className="col-span-1">
            <AddressManager
              user={user}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
            />
          </div>
        </div>
        <div className="my-4 sm:my-6 font-bold text-lg sm:text-xl text-center navheading tracking-wider uppercase">
          Total: ₹{total}
        </div>
        <div className="flex justify-center">
          <button
            className="button-add font-bold rounded-md navheading tracking-wider text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            onClick={handlePay}
          >
            Pay &amp; Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;