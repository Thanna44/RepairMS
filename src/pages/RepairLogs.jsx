import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PenTool, AlertCircle, CheckCircle } from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";
import repairDefaultPartsConfig from "../config/repairDefaultParts.json";
import SearchFilters from "../components/SearchFilters";
import EditModal from "../components/EditModal";
import DeleteDialog from "../components/DeleteDialog";

export default function RepairLogs() {
  const [logs, setLogs] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [users, setUsers] = useState([]);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
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
      description: log.description,
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
        description: editForm.description,
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
      const partsToAdd = newSpareParts.filter(
        (newPart) =>
          !selectedSpareParts.some(
            (selected) => selected.spare_part_id === newPart.spare_part_id
          )
      );

      if (partsToAdd.length > 0) {
        setSelectedSpareParts([...selectedSpareParts, ...partsToAdd]);
      }
    }
  }, [editForm.title, spareParts]);

  const filteredLogs = logs.filter((log) => {
    const dateToCheck =
      dateField === "created_at" ? log.created_at : log.updated_at;
    const logDate = new Date(dateToCheck);

    const isInDateRange =
      ((!startDate || logDate >= startDate) &&
        (!endDate || logDate <= endDate)) ||
      (startDate &&
        endDate &&
        logDate.toDateString() === startDate.toDateString());

    const matchesSearch =
      !searchTerm ||
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());

    return isInDateRange && matchesSearch;
  });

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setDateField("created_at");
    setSearchTerm("");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Repair Logs</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          New Repair Log
        </button>
      </div>

      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateField={dateField}
        setDateField={setDateField}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        clearFilters={clearFilters}
      />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(log.status)}
                      <span className="ml-2 text-sm text-gray-900">
                        {log.status.replace("_", " ").charAt(0).toUpperCase() +
                          log.status.slice(1)}
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
                    {new Date(log.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(log)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(log)}
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

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        users={users}
        spareParts={spareParts}
        selectedSpareParts={selectedSpareParts}
        handleEditSubmit={handleEditSubmit}
        handleAddSparePart={handleAddSparePart}
        handleSparePartQuantityChange={handleSparePartQuantityChange}
        handleRemoveSparePart={handleRemoveSparePart}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
      />
    </div>
  );
}
