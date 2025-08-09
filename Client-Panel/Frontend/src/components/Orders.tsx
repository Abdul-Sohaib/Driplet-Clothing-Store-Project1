/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import noorders from '@/assets/ordersgif.gif';
import Loading from "./Loading";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Order {
  _id: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  date: string;
  amount: number;
  status: string;
  paymentStatus: string;
  items: {
    name: string;
    quantity: number;
    size: string;
    price: number;
    productId: string;
    image: string; // Added for product image
  }[];
  category: string;
  statusHistory: { status: string; date: string }[];
  createdAt: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE}/client/orders`, {
          withCredentials: true,
        });
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error("Error fetching orders:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        toast.error("Failed to fetch orders. Please try again.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, source: string) => {
    console.error(`Failed to load image: ${source}`);
    e.currentTarget.src = noorders; // Fallback to noorders image
  };

  if (loading) {
    return <div className="flex w-screen justify-center items-center"><Loading /></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen h-full   bg-[#F5F5DC] navfonts">
      <h1 className="text-3xl font-bold text-black mb-6 uppercase textheading mt-20">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center text-black flex flex-col items-center">
          No orders found.
          <img src={noorders} alt="No Orders" className="w-60 mt-4" onError={(e) => handleImageError(e, noorders)} />
        </div>
      ) : (
        <div className="w-full max-w-fit h-[70vh] overflow-y-auto scroll-smooth p-2">
        <div className="columns-1 sm:columns-2 gap-4 space-y-4">
  {orders.map((order) => (
    <div
      key={order._id}
      className="break-inside-avoid bg-[#F3E6CB] p-4 border-2 border-black shadow-xl rounded-md"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-black">Order ID: {order._id}</p>
          <p className="text-sm text-gray-600">
            Date: {new Date(order.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">Category: {order.category}</p>
          <p className="text-sm text-gray-600">
            Payment Status: {order.paymentStatus}
          </p>

          <div className="mt-2">
            <p className="text-sm font-semibold text-black">Items:</p>
            {order.items.map((item, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 flex items-center space-x-4 mt-2"
              >
                <img
                  src={item.image || noorders}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md border-2 border-black"
                  onError={(e) => handleImageError(e, item.image)}
                />
                <div>
                  <p>Name: {item.name}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-black">Status: {order.status}</p>
        </div>
      </div>
    </div>
  ))}
</div>

        </div>
      )}
    </div>
  );
};

export default Orders;