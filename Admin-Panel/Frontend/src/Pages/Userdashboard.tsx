/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Pages/Userdashboard.tsx
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useAuth } from "@clerk/clerk-react";
import type { Category } from "./Categories";
import Loading from "@/Components/Loading";

type AnalyticsData = { name: string; income: number; spending: number }[];
type StatsData = { name: string; value: number; color: string }[];
type Transaction = { id: number; name: string; date: string; amount: number; status: "Credited" | "Debited" };
type Mail = { id: number; name: string; unread: boolean };

type Props = { categories: Category[] };

// eslint-disable-next-line no-empty-pattern
const Userdashboard = ({ }: Props) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>([]);
  const [statsData, setStatsData] = useState<StatsData>([]);
  const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
  const [mailsData, setMailsData] = useState<Mail[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalSpending, setTotalSpending] = useState(0);
  const [incomeChange, setIncomeChange] = useState(0);
  const [spendingChange, setSpendingChange] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedTransactionPeriod, setSelectedTransactionPeriod] = useState("1 Nov - 30 Nov");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) throw new Error("Authentication token is missing");

        // Fetch analytics data
        const analyticsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analytics/sales?year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");
        const analytics = await analyticsRes.json();
        setAnalyticsData(analytics);

        // Fetch stats data
        const statsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analytics/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        const stats = await statsRes.json();
        setStatsData(stats);

        // Fetch transactions
        const [startDate, endDate] = selectedTransactionPeriod.split(" - ");
        const start = new Date(`${startDate} ${selectedYear}`);
        const end = new Date(`${endDate} ${selectedYear}`);
        const transactionsRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/transactions?startDate=${start.toISOString()}&endDate=${end.toISOString()}&year=${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!transactionsRes.ok) throw new Error("Failed to fetch transactions");
        const transactions = await transactionsRes.json();
        // Sort transactions by date in descending order
        const sortedTransactions = transactions.sort((a: Transaction, b: Transaction) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactionsData(sortedTransactions);

        // Fetch mails
        const mailsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/mails`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mailsRes.ok) throw new Error("Failed to fetch mails");
        const mails = await mailsRes.json();
        setMailsData(mails);

        // Fetch orders for total income
        const ordersRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ordersRes.ok) {
          const errorData = await ordersRes.json().catch(() => ({ message: `Failed to fetch orders: ${ordersRes.status}` }));
          throw new Error(errorData.message);
        }
        const orders = await ordersRes.json();
        interface Order {
          id: string;
          total: number;
          paymentStatus: "Paid" | "Pending" | "Failed";
          [key: string]: any;
        }
        const totalInc = orders.reduce(
          (acc: number, order: Order) => {
            const amount = typeof order.total === 'number' && !isNaN(order.total) ? order.total : 0;
            return acc + (order.paymentStatus === "Paid" ? amount : 0);
          },
          0
        );
        setTotalIncome(totalInc);

        // Calculate spending (using mock ratio or adjust with real data)
        const totalSpend = totalInc * 0.5; // Example: 50% of income as spending
        setTotalSpending(totalSpend);

        // Calculate percentage change (mocked for now; adjust with historical data)
        setIncomeChange(10); // Example: +10%
        setSpendingChange(-5); // Example: -5%
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedTransactionPeriod, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-white">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen text-gray-800">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Clothing Store Admin Dashboard</h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex items-center justify-between transition-transform hover:scale-105">
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Income</p>
              <h2 className="text-xl sm:text-2xl font-bold">₹{totalIncome.toLocaleString()}</h2>
            </div>
            <span className={`text-lg flex items-center gap-1 ${incomeChange > 0 ? "text-green-600" : "text-red-600"}`}>
              {incomeChange > 0 ? <FaArrowUp /> : <FaArrowDown />}: {Math.abs(incomeChange)}%
            </span>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex items-center justify-between transition-transform hover:scale-105">
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Spending</p>
              <h2 className="text-xl sm:text-2xl font-bold">₹{totalSpending.toLocaleString()}</h2>
            </div>
            <span className={`text-lg flex items-center gap-1 ${spendingChange > 0 ? "text-green-600" : "text-red-600"}`}>
              {spendingChange > 0 ? <FaArrowUp /> : <FaArrowDown />}: {Math.abs(spendingChange)}%
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Graph */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6 flex flex-col items-center justify-center gap-5">
        <div className="flex justify-between items-center w-full">
          <h3 className="text-lg sm:text-xl font-bold">Sales Analytics</h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="mt-2 sm:mt-0 border rounded px-2 py-1 text-sm text-gray-600"
            aria-label="Select year for analytics"
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <div className="w-full overflow-x-auto flex justify-center items-center">
          <BarChart
            width={700}
            height={300}
            data={analyticsData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            className="w-full flex"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#000" />
            <XAxis dataKey="name" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderColor: "#d1d5db", borderRadius: "8px" }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Bar dataKey="income" fill="#4ade80" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spending" fill="#f87171" name="Spending" radius={[4, 4, 0, 0]} />
          </BarChart>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold">Recent Transactions</h3>
            <select
              value={selectedTransactionPeriod}
              onChange={(e) => setSelectedTransactionPeriod(e.target.value)}
              className="mt-2 sm:mt-0 border rounded px-2 py-1 text-sm text-gray-600"
              aria-label="Select transaction period"
            >
              <option value="1 Jan - 31 Jan">January</option>
              <option value="1 Feb - 28 Feb">February</option>
              <option value="1 Mar - 31 Mar">March</option>
              <option value="1 Apr - 30 Apr">April</option>
              <option value="1 May - 31 May">May</option>
              <option value="1 Jun - 30 Jun">June</option>
              <option value="1 Jul - 31 Jul">July</option>
              <option value="1 Aug - 31 Aug">August</option>
              <option value="1 Sep - 30 Sep">September</option>
              <option value="1 Oct - 31 Oct">October</option>
              <option value="1 Nov - 30 Nov">November</option>
              <option value="1 Dec - 31 Dec">December</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="flex w-full ml-4 border-b">
                <tr className="text-gray-600 flex w-full text-center">
                  <th className="pb-3 font-semibold basis-1/4">Name</th>
                  <th className="pb-3 font-semibold basis-1/4">Date</th>
                  <th className="pb-3 font-semibold basis-1/4">Amount</th>
                  <th className="pb-3 font-semibold basis-1/4">Status</th>
                </tr>
              </thead>
              <tbody className="h-[60vh] flex flex-col overflow-y-auto w-full">
                {transactionsData.length > 0 ? (
                  transactionsData.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-t hover:bg-gray-50 flex w-full text-center items-center"
                    >
                      <td className="py-3 font-medium basis-1/4">{txn.name}</td>
                      <td className="py-3 basis-1/4">{txn.date}</td>
                      <td className="py-3 basis-1/4">₹{txn.amount.toLocaleString()}</td>
                      <td
                        className={`py-3 font-medium basis-1/4 ${
                          txn.status === "Credited" ? "text-purple-600" : "text-red-600"
                        }`}
                      >
                        {txn.status}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="flex w-full">
                    <td colSpan={4} className="py-3 text-center text-gray-600 w-full">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics & Mails */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-2 sm:p-6 rounded-xl shadow-md flex flex-col w-full justify-center gap-6 items-center h-full">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Category Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-between w-full">
              <div className="flex justify-center">
                <PieChart width={300} height={300}>
                  <Pie
                    data={statsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#d1d5db",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </div>
              <div className="flex flex-col items-start justify-center">
                <ul className="text-sm space-y-2">
                  {statsData.map((item) => (
                    <li key={item.name} className="flex items-center">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      {item.name}
                    </li>
                  ))}
                </ul>
                <button className="mt-4 px-4 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded-lg transition-colors">
                  View More
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Recent Mails</h3>
            <ul className="space-y-3">
              {mailsData.length > 0 ? (
                mailsData.map((mail) => (
                  <li key={mail.id} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        mail.unread ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <span className={mail.unread ? "font-semibold" : ""}>{mail.name}</span>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-600">No recent mails</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Userdashboard;