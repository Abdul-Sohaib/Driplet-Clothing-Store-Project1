/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, ShoppingBag, MapPin, Mail, Calendar, ShieldCheck, Clock } from "lucide-react";
import noorders from "@/assets/ordersgif.gif";

interface OrderItem {
  name: string;
  quantity: number;
  size: string;
  price: number;
  productId?: string;
  image?: string;
}

interface OrderData {
  _id?: string;
  paymentOrderId?: string;
  amount?: number;
  date?: string;
  status?: string;
  paymentStatus?: string;
  items?: OrderItem[];
  customer?: {
    name?: string;
    email?: string;
    address?: string;
  };
  category?: string;
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order: OrderData | null = location.state?.order || null;

  const [countdown, setCountdown] = useState(6);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, isPaused]);

  const items = order?.items || [];
  const totalAmount = order?.amount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderId = order?._id || order?.paymentOrderId || "DRIP-" + Math.floor(100000 + Math.random() * 900000);
  const orderDate = order?.date ? new Date(order.date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }) : new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen w-screen bg-[#F5F5DC] py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center navfonts">
      <div className="max-w-3xl w-full space-y-8 mt-10 mb-10">
        
        {/* Success Header Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#FAF3E0] border-2 border-black rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Confetti-like ambient background glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-200/50 rounded-full blur-2xl pointer-events-none" />

          {/* Animated Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg border-4 border-black"
          >
            <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white stroke-[2.5]" />
          </motion.div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-black uppercase tracking-wider textheading mt-5">
            Order Confirmed!
          </h1>
          <p className="text-sm sm:text-base text-gray-700 mt-2 font-medium">
            Thank you for shopping with <span className="font-bold text-purple-700">Driplet</span>. Your payment was successful and your order has been placed.
          </p>

          {/* Order Meta Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs sm:text-sm font-semibold">
            <span className="bg-[#101A13] text-white px-3.5 py-1.5 rounded-full border border-black flex items-center gap-1.5">
              <Package className="w-4 h-4" /> Order #{orderId}
            </span>
            <span className="bg-purple-100 text-purple-900 px-3.5 py-1.5 rounded-full border border-purple-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {orderDate}
            </span>
            <span className="bg-green-100 text-green-900 px-3.5 py-1.5 rounded-full border border-green-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Payment Paid
            </span>
          </div>

          {/* Redirect Countdown Banner */}
          <div
            className="mt-6 bg-[#F3E6CB] border-2 border-black rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow">
                {countdown}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-black">
                  Redirecting to <span className="text-purple-700 underline">My Orders</span> page automatically...
                </p>
                <p className="text-[11px] text-gray-600">
                  {isPaused ? "Timer paused (hovering)" : "Sit back or click below to view your order history."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => navigate("/orders")}
                className="bg-black hover:bg-purple-700 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow cursor-pointer w-full sm:w-auto justify-center"
              >
                View Orders <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Order Details & Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Items Purchased (2 Cols) */}
          <div className="md:col-span-2 bg-[#FAF3E0] border-2 border-black rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b-2 border-black/10 pb-3 textheading">
              <ShoppingBag className="w-5 h-5 text-purple-700" /> Items in this Order ({items.length})
            </h2>

            {items.length === 0 ? (
              <p className="text-sm text-gray-600">Order items details processed.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-white/70 p-3 rounded-2xl border border-black/15 shadow-sm"
                  >
                    <img
                      src={item.image || noorders}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl border border-black flex-shrink-0 bg-gray-100"
                      onError={(e) => {
                        e.currentTarget.src = noorders;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-black truncate">{item.name}</h3>
                      <p className="text-xs text-gray-600 mt-0.5 font-medium">
                        Size: <span className="font-bold text-black uppercase">{item.size}</span> | Qty: <span className="font-bold text-black">{item.quantity}</span>
                      </p>
                      <p className="text-sm font-extrabold text-purple-800 mt-1">
                        ₹{item.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Estimated Delivery Notification */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-3 text-purple-900 text-xs font-semibold">
              <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span>Estimated Delivery: <strong>3 to 5 business days</strong> to your shipping address.</span>
            </div>
          </div>

          {/* Shipping & Payment Summary (1 Col) */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-[#FAF3E0] border-2 border-black rounded-3xl p-5 shadow-md space-y-3">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b-2 border-black/10 pb-2 textheading">
                <MapPin className="w-4 h-4 text-purple-700" /> Delivery Address
              </h3>
              <p className="text-xs font-bold text-black">{order?.customer?.name || "Customer"}</p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {order?.customer?.address || "Delivery address verified on checkout."}
              </p>
              {order?.customer?.email && (
                <p className="text-xs text-gray-600 flex items-center gap-1.5 pt-1">
                  <Mail className="w-3.5 h-3.5 text-purple-600" /> {order.customer.email}
                </p>
              )}
            </div>

            {/* Payment & Total Card */}
            <div className="bg-[#FAF3E0] border-2 border-black rounded-3xl p-5 shadow-md space-y-3">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black/10 pb-2 textheading">
                Payment Summary
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-700">FREE</span>
                </div>
                <div className="border-t border-black/10 pt-2 flex justify-between text-sm font-extrabold text-black">
                  <span>Total Paid</span>
                  <span className="text-purple-900 text-base">₹{totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate("/orders")}
            className="button-add text-sm sm:text-base font-bold py-3 px-8 rounded-xl text-black border-2 border-black navfonts uppercase tracking-wider cursor-pointer shadow-md hover:shadow-xl transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Package className="w-5 h-5" /> Go to My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-white hover:bg-gray-100 text-black text-sm sm:text-base font-bold py-3 px-8 rounded-xl border-2 border-black navfonts uppercase tracking-wider cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <ShoppingBag className="w-5 h-5" /> Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
