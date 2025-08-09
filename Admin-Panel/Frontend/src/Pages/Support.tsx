// src/Pages/Support.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";



export type SupportTicket = {
  id: number;
  customer: string;
  email: string;
  subject: string;
  message: string;
  orderId?: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "High" | "Medium" | "Low";
  date: string;
  assignedTo?: string;
};

const Support = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/support-tickets`)
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    fetchTickets();
  }, []);

  const updateTicket = async (id: number, updates: Partial<SupportTicket>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/support-tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("clerk-jwt")}`,
        },
        body: JSON.stringify(updates),
      });
      const updated = await response.json();
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleStatusChange = (id: number, status: SupportTicket["status"]) => {
    updateTicket(id, { status });
  };

  const handlePriorityChange = (id: number, priority: SupportTicket["priority"]) => {
    updateTicket(id, { priority });
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/support-tickets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("clerk-jwt")}`,
        },
      });
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-7">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all duration-300 cursor-pointer"
        >
          Back to Home
        </button>
        <h1 className="text-3xl font-bold text-black">Support</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Subject</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Priority</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-4">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{ticket.id}</td>
                  <td className="p-2 border">{ticket.customer}</td>
                  <td className="p-2 border">{ticket.email}</td>
                  <td className="p-2 border">{ticket.subject}</td>
                  <td className="p-2 border">{ticket.message}</td>
                  <td className="p-2 border">{ticket.orderId || "N/A"}</td>
                  <td className="p-2 border">
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(ticket.id, e.target.value as SupportTicket["status"])
                      }
                      className="border rounded p-1"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="p-2 border">
                    <select
                      value={ticket.priority}
                      onChange={(e) =>
                        handlePriorityChange(ticket.id, e.target.value as SupportTicket["priority"])
                      }
                      className="border rounded p-1"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </td>
                  <td className="p-2 border">{new Date(ticket.date).toLocaleDateString()}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
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

export default Support;
