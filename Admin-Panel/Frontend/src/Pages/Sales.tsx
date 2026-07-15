/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/Pages/Sales.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import type { Category } from "./Dashboard";

type Order = {
  id: string;
  productName: string;
  customer: string;
  category: string;
  quantity: number;
  total: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Paid" | "Pending" | "Failed";
  date: string;
};

type SalesSummary = {
  totalOrders: number;
  totalRevenue: number;
  title: string;
};

const Sales: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({
    totalOrders: 0,
    totalRevenue: 0,
    title: "Sales Overview",
  });
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: "All",
    paymentStatus: "All",
    dateRange: "7",
    category: "All",
  });
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      const mapped = data.map((cat: any) => ({
        id: cat._id || cat.id,
        name: cat.name,
        ID: cat.ID,
        parent: cat.parent,
        gender: cat.gender,
        clothingType: cat.clothingType,
        description: cat.description,
        imageUrl: cat.imageUrl,
      }));
      setCategories(mapped);
    } catch (err: any) {
      console.error("Error fetching categories:", err.message || err);
      setError("Failed to load categories");
    }
  }, [getToken]);

  const fetchSalesSummary = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sales/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sales summary");
      const data = await res.json();
      setSalesSummary(data);
    } catch (err: any) {
      console.error("Error fetching sales summary:", err.message || err);
      setError("Failed to load sales summary");
    }
  }, [getToken]);

  useEffect(() => {
    fetchCategories();
    fetchSalesSummary();
  }, [fetchCategories, fetchSalesSummary]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        const token = await getToken();
        const queryParams = new URLSearchParams({
          ...filters,
          category: filters.category === "All" ? "All" : encodeURIComponent(filters.category),
        });
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to fetch orders: ${response.status}` }));
          throw new Error(errorData.message);
        }
        const data = await response.json();
        // Sort orders by category name (primary) and date (secondary, descending)
        const sortedOrders = data.sort((a: Order, b: Order) => {
          const categoryComparison = a.category.localeCompare(b.category);
          if (categoryComparison !== 0) return categoryComparison;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setOrders(sortedOrders);
      } catch (error: any) {
        console.error("Failed to fetch orders:", error.message || error);
        setError(`Failed to load orders: ${error.message}`);
      }
    };

    fetchOrders();
  }, [filters, getToken]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const downloadExcel = () => {
    const groupedOrders = orders.reduce((acc, order) => {
      const category = order.category || "N/A";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(order);
      return acc;
    }, {} as Record<string, Order[]>);

    const worksheetData: any[] = [];
    Object.entries(groupedOrders)
      .sort(([catA], [catB]) => catA.localeCompare(catB))
      .forEach(([category, categoryOrders]) => {
        // Sort orders within each category by date (descending)
        categoryOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        worksheetData.push({
          "Order ID": `Category: ${category}`,
          Product: "",
          Customer: "",
          Category: "",
          Quantity: "",
          Total: "",
          Status: "",
          "Payment Status": "",
          Date: "",
        });
        categoryOrders.forEach((order) => {
          worksheetData.push({
            "Order ID": order.id,
            Product: order.productName,
            Customer: order.customer,
            Category: order.category,
            Quantity: order.quantity,
            Total: `₹${order.total.toLocaleString()}`,
            Status: order.status,
            "Payment Status": order.paymentStatus,
            Date: new Date(order.date).toLocaleDateString(),
          });
        });
      });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

    type WorksheetDataKey =
      | "Order ID"
      | "Product"
      | "Customer"
      | "Category"
      | "Quantity"
      | "Total"
      | "Status"
      | "Payment Status"
      | "Date";

    const colWidths = Object.keys(worksheetData[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...worksheetData.map((row) => String(row[key as WorksheetDataKey]).length)
      ),
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `Sales_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="p-6 space-y-4 flex flex-col">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all duration-300 cursor-pointer"
        >
          Back to Home
        </button>
        <h1 className="text-3xl font-bold text-black">{salesSummary.title}</h1>
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all duration-300 cursor-pointer"
        >
          Download Excel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="p-1 w-full border border-gray-300 rounded px-2 py-2 text-sm"
        >
          <option value="">Select Status</option>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          name="paymentStatus"
          value={filters.paymentStatus}
          onChange={handleFilterChange}
          className="p-1 w-full border border-gray-300 rounded px-2 py-2 text-sm"
        >
          <option value="">Select Payment Status</option>
          <option value="All">All</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="p-1 w-full border border-gray-300 rounded px-2 py-2 text-sm"
        >
          <option value="">Select Category</option>
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.ID} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          name="dateRange"
          value={filters.dateRange}
          onChange={handleFilterChange}
          className="p-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">Select Date Range</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      <div className="mt-4">
        <p>Total Orders: {salesSummary.totalOrders}</p>
        <p>Total Revenue: ₹{salesSummary.totalRevenue.toLocaleString()}</p>
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border-b">Order ID</th>
              <th className="p-2 border-b">Product</th>
              <th className="p-2 border-b">Customer</th>
              <th className="p-2 border-b">Category</th>
              <th className="p-2 border-b">Quantity</th>
              <th className="p-2 border-b">Total</th>
              <th className="p-2 border-b">Status</th>
              <th className="p-2 border-b">Payment</th>
              <th className="p-2 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-4">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-100">
                  <td className="p-2 border-b">{order.id}</td>
                  <td className="p-2 border-b">{order.productName}</td>
                  <td className="p-2 border-b">{order.customer}</td>
                  <td className="p-2 border-b">{order.category}</td>
                  <td className="p-2 border-b">{order.quantity}</td>
                  <td className="p-2 border-b">₹{order.total.toLocaleString()}</td>
                  <td className="p-2 border-b">{order.status}</td>
                  <td className="p-2 border-b">{order.paymentStatus}</td>
                  <td className="p-2 border-b">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;