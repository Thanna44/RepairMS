import React, { useState, useEffect } from "react";
import {
  BarChart as BarChartIcon,
  Users,
  PenTool as Tool,
  Package,
  Search,
  Calendar,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateField, setDateField] = useState("created_at");
  const [searchTerm, setSearchTerm] = useState("");
  const [repairStats, setRepairStats] = useState({
    active: 0,
    completed: 0,
    pending: 0,
    total: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [repairJobs, setRepairJobs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
  }, [startDate, endDate, dateField]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch basic repair stats with more details
      let query = supabase
        .from("repair_logs")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply date filter
      if (startDate) {
        query = query.gte(dateField, startDate.toISOString());
      }
      if (endDate) {
        // Add 1 day to include the end date fully
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt(dateField, nextDay.toISOString());
      }

      const { data: repairLogs, error: statsError } = await query;

      if (statsError) throw statsError;

      setRepairJobs(repairLogs);

      // Calculate repair statistics
      const stats = {
        active: repairLogs.filter((log) => log.status === "in_progress").length,
        completed: repairLogs.filter((log) => log.status === "completed")
          .length,
        pending: repairLogs.filter((log) => log.status === "pending").length,
        total: repairLogs.length,
      };
      setRepairStats(stats);

      // Calculate status distribution for pie chart
      const distribution = [
        { name: "In Progress", value: stats.active },
        { name: "Completed", value: stats.completed },
        { name: "Pending", value: stats.pending },
      ];
      setStatusDistribution(distribution);

      // Calculate monthly statistics
      const monthlyData = {};
      repairLogs.forEach((log) => {
        const date = new Date(log[dateField]);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { total: 0, completed: 0 };
        }
        monthlyData[monthYear].total += 1;
        if (log.status === "completed") {
          monthlyData[monthYear].completed += 1;
        }
      });

      const monthlyStatsArray = Object.entries(monthlyData).map(
        ([month, data]) => ({
          month,
          total: data.total,
          completed: data.completed,
        })
      );

      setMonthlyStats(monthlyStatsArray.slice(-6)); // Last 6 months
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const stats = [
    {
      name: "Active Repairs",
      value: repairStats.active.toString(),
      icon: Tool,
      change: "+2.1%",
      changeType: "positive",
    },
    {
      name: "Completed Repairs",
      value: repairStats.completed.toString(),
      icon: BarChartIcon,
      change: "+4.3%",
      changeType: "positive",
    },
    {
      name: "Pending Repairs",
      value: repairStats.pending.toString(),
      icon: Calendar,
      change: "-0.7%",
      changeType: "negative",
    },
    {
      name: "Total Repairs",
      value: repairStats.total.toString(),
      icon: Package,
      change: "+3.2%",
      changeType: "positive",
    },
  ];

  const COLORS = ["#4F46E5", "#22C55E", "#EAB308"];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={dateField}
            onChange={(e) => setDateField(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="created_at">Created At</option>
            <option value="updated_at">Updated At</option>
          </select>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Start date"
            className="border rounded-lg p-2"
          />
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            placeholderText="End date"
            className="border rounded-lg p-2"
          />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {item.value}
              </p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === "positive"
                    ? "text-green-600"
                    : item.changeType === "negative"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Repair Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Repair Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#4F46E5" name="Total Repairs" />
                <Bar dataKey="completed" fill="#22C55E" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repair Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Repair Status Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Repair Jobs Table Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Repair Jobs List</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search repairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {dateField === "created_at" ? "Created At" : "Updated At"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {repairJobs
                .filter(
                  (job) =>
                    job.title
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    job.issue?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500">{job.issue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : job.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {job.status === "in_progress"
                          ? "In Progress"
                          : job.status === "completed"
                          ? "Completed"
                          : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.priority === "high"
                            ? "text-red-600 bg-red-100"
                            : job.priority === "medium"
                            ? "text-yellow-600 bg-yellow-100"
                            : "text-green-600 bg-green-100"
                        }`}
                      >
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {users.find((user) => user.id === job.assigned_user_id)
                        ?.full_name || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job[dateField]).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
