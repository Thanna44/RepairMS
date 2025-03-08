import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PenTool, AlertCircle, CheckCircle, Search, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import repairDefaultPartsConfig from "../config/repairDefaultParts.json";

export default function RepairLogs() {
  const [logs, setLogs] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRepairGuideModalOpen, setIsRepairGuideModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [users, setUsers] = useState([]);
  const [editForm, setEditForm] = useState({
    title: "",
    issue: "",
    status: "",
    priority: "",
    assigned_user_id: "",
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateField, setDateField] = useState("created_at");
  const [searchTerm, setSearchTerm] = useState("");
  const [spareParts, setSpareParts] = useState([]);
  const [selectedSpareParts, setSelectedSpareParts] = useState([]);
  const [sparePartSearch, setSparePartSearch] = useState("");

  useEffect(() => {
    fetchRepairLogs();
    fetchUsers();
    fetchSpareParts();
  }, []);

  useEffect(() => {
    console.log("Users:", users);
  }, [users]);

  async function fetchRepairLogs() {
    const { data, error } = await supabase
      .from("repair_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching repair logs:", error);
      return;
    }

    setLogs(data || []);
  }

  async function fetchUsers() {
    try {
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function fetchSpareParts() {
    const { data, error } = await supabase.from("spare_parts").select("*");

    if (error) {
      console.error("Error fetching spare parts:", error);
      return;
    }

    setSpareParts(data || []);
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "in_progress":
        return <PenTool className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const handleEditClick = (log) => {
    setSelectedLog(log);
    setEditForm({
      title: log.title,
      issue: log.issue,
      status: log.status,
      priority: log.priority,
      assigned_user_id: log.assigned_user_id || "",
    });
    setSelectedSpareParts(log.spare_parts || []);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (log) => {
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLog) return;

    const { error: updateError } = await supabase
      .from("repair_logs")
      .update({
        title: editForm.title,
        issue: editForm.issue,
        status: editForm.status,
        priority: editForm.priority,
        assigned_user_id: editForm.assigned_user_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedLog.id);

    if (updateError) {
      console.error("Error updating repair log:", updateError);
      return;
    }

    setIsEditModalOpen(false);
    fetchRepairLogs();
  };

  const handleDelete = async () => {
    if (!selectedLog) return;

    const { error } = await supabase
      .from("repair_logs")
      .delete()
      .eq("id", selectedLog.id);

    if (error) {
      console.error("Error deleting repair log:", error);
      return;
    }

    setIsDeleteDialogOpen(false);
    fetchRepairLogs();
  };

  const handleAddSparePart = (sparePartId) => {
    const sparePart = spareParts.find((sp) => sp.id === sparePartId);
    if (!sparePart) return;

    setSelectedSpareParts([
      ...selectedSpareParts,
      {
        spare_part_id: sparePart.id,
        quantity: 1,
        spare_part: sparePart,
      },
    ]);
  };

  const handleSparePartQuantityChange = (sparePartId, quantity) => {
    setSelectedSpareParts(
      selectedSpareParts.map((sp) =>
        sp.spare_part_id === sparePartId ? { ...sp, quantity } : sp
      )
    );
  };

  const handleRemoveSparePart = (sparePartId) => {
    setSelectedSpareParts(
      selectedSpareParts.filter((sp) => sp.spare_part_id !== sparePartId)
    );
  };

  useEffect(() => {
    const defaultConfig = repairDefaultPartsConfig.defaultParts.find(
      (config) => config.title === editForm.title
    );

    if (defaultConfig) {
      const defaultParts = spareParts.filter((sp) =>
        defaultConfig.part_number.includes(sp.part_number)
      );

      const newSpareParts = defaultParts.map((part) => ({
        spare_part_id: part.id,
        quantity: 1,
        spare_part: part,
      }));

      // Only add parts that aren't already selected
      const existingPartIds = selectedSpareParts.map((sp) => sp.spare_part_id);
      const partsToAdd = newSpareParts.filter(
        (part) => !existingPartIds.includes(part.spare_part_id)
      );

      setSelectedSpareParts([...selectedSpareParts, ...partsToAdd]);
    }
  }, [editForm.title]);

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setDateField("created_at");
    setSearchTerm("");
  };

  const handleRowClick = async (log) => {
    try {
      const { data, error } = await supabase
        .from("repair_guide")
        .select("*")
        .eq("device_name", log.title)
        .eq("issue", log.issue)
        .single();
      if (error) {
        console.error("Error fetching repair guide:", error);
        return;
      }

      if (data) {
        setSelectedGuide(data);
        setIsRepairGuideModalOpen(true);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Repair Logs</h1>
        <button
          onClick={() =>
            handleEditClick({
              title: "",
              issue: "",
              status: "pending",
              priority: "low",
            })
          }
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Log
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
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
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(log)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.title}
                    </div>
                    <div className="text-sm text-gray-500">{log.issue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(log.status)}
                      <span className="ml-2 text-sm text-gray-900">
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                        log.priority
                      )}`}
                    >
                      {log.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {users.find((user) => user.id === log.assigned_user_id)
                      ?.full_name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(log);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(log);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {selectedLog?.id ? "Edit Repair Log" : "Add New Repair Log"}
            </h2>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    issue
                  </label>
                  <textarea
                    value={editForm.issue}
                    onChange={(e) =>
                      setEditForm({ ...editForm, issue: e.target.value })
                    }
                    rows={3}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                      className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) =>
                        setEditForm({ ...editForm, priority: e.target.value })
                      }
                      className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assigned To
                  </label>
                  <select
                    value={editForm.assigned_user_id}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        assigned_user_id: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spare Parts
                  </label>
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="text"
                      value={sparePartSearch}
                      onChange={(e) => setSparePartSearch(e.target.value)}
                      placeholder="Search spare parts..."
                      className="flex-1 border rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 mb-4">
                    {spareParts
                      .filter((part) =>
                        part.name
                          .toLowerCase()
                          .includes(sparePartSearch.toLowerCase())
                      )
                      .map((part) => (
                        <div
                          key={part.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleAddSparePart(part.id)}
                        >
                          <div>
                            <div className="font-medium">{part.name}</div>
                            <div className="text-sm text-gray-500">
                              {part.part_number}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            ${part.price}
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="space-y-2">
                    {selectedSpareParts.map((sp) => (
                      <div
                        key={sp.spare_part_id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div>
                          <div className="font-medium">
                            {sp.spare_part.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sp.spare_part.part_number}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={sp.quantity}
                            onChange={(e) =>
                              handleSparePartQuantityChange(
                                sp.spare_part_id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-20 border rounded p-1"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSparePart(sp.spare_part_id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {selectedLog?.id ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this repair log?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(false);
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isRepairGuideModalOpen && selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-blue-600">
                {selectedGuide.device_name}
              </h2>
              <button
                onClick={() => {
                  setIsRepairGuideModalOpen(false);
                  setSelectedGuide(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-xl text-red-600 mb-6">
              Issue: {selectedGuide.issue}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Repair Steps:</h3>
              <ul className="space-y-2">
                {selectedGuide.steps.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Required Parts:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedGuide.parts.parts.map((part, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-blue-600 bg-blue-50 border border-blue-200"
                  >
                    {part.name} ({part.quantity})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
