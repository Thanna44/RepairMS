import React, { useState } from "react";
import {
  BarChart,
  Users,
  PenTool as Tool,
  Package,
  Search,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Dashboard() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateField, setDateField] = useState("created_at");
  const [searchTerm, setSearchTerm] = useState("");

  const stats = [
    {
      name: "Active Repairs",
      value: "12",
      icon: Tool,
      change: "+2.1%",
      changeType: "positive",
    },
    {
      name: "Spare Parts",
      value: "245",
      icon: Package,
      change: "-0.7%",
      changeType: "negative",
    },
    {
      name: "Technicians",
      value: "8",
      icon: Users,
      change: "0.0%",
      changeType: "neutral",
    },
    {
      name: "Completed This Month",
      value: "38",
      icon: BarChart,
      change: "+4.3%",
      changeType: "positive",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
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
    </div>
  );
}
