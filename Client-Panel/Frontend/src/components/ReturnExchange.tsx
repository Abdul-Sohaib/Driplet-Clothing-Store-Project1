/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import Loading from "./Loading";


interface Order {
  id: string;
  productId: string | number;
  size: string;
  quantity: number;
}

const ReturnExchange: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<"return" | "exchange">("return");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("/client/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };
  fetchOrders();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !reason.trim()) {
      toast.error("Please select an order and provide a valid reason.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/client/return-exchange", { orderId: selectedOrder, reason, action });
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} request submitted successfully!`);
      setReason("");
      setSelectedOrder("");
    } catch (err) {
      console.error("Error submitting return/exchange:", (err as any)?.response?.data?.message || (err as any)?.message);
      toast.error(`Failed to submit ${action} request. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex w-screen justify-center items-center"><Loading /></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen h-[90vh] inset-0 bg-[#F5F5DC] navfonts">  
      <h1 className="text-3xl font-bold text-black mb-6 uppercase textheading">Return / Exchange</h1>
      <div className="bg-transparent border-2 border-[#0F1912] rounded-lg p-6 w-full max-w-md shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-black">Select Order</label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="border-2 border-[#0F1912] rounded-md p-2 text-sm text-black focus:outline-none focus:border-[#0F1912]"
            >
              <option value="">Select an order</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  Order {order.id} (Product ID: {order.productId}, Size: {order.size})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-black">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as "return" | "exchange")}
              className="border-2 border-[#0F1912] rounded-md p-2 text-sm text-black focus:outline-none focus:border-[#0F1912]"
            >
              <option value="return">Return</option>
              <option value="exchange">Exchange</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-black">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border-2 border-[#0F1912] rounded-md p-2 text-sm text-black focus:outline-none focus:border-[#0F1912]"
              rows={4}
              placeholder="Enter reason for return/exchange"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative group bg-transparent outline-none cursor-pointer uppercase w-full font-bold navfonts"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-[#0F1912] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
            <div className="relative flex items-center justify-center py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-blue-400 gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#0F1912] hover:border-purple-500 active:border-purple-700">
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReturnExchange;