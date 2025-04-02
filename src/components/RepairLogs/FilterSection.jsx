import React from "react";
import { Search } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FilterSection({
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  dateField,
  setDateField,
  clearFilters,
}) {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
          <select
            value={dateField}
            onChange={(e) => setDateField(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="created_at">Created At</option>
            <option value="updated_at">Updated At</option>
          </select>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
