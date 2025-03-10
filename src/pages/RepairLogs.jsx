import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import repairDefaultPartsConfig from "../config/repairDefaultParts.json";
import FilterSection from "../components/RepairLogs/FilterSection";
import EditModal from "../components/RepairLogs/EditModal";
import DeleteModal from "../components/RepairLogs/DeleteModal";
import RepairGuideModal from "../components/RepairLogs/RepairGuideModal";
import RepairLogsTable from "../components/RepairLogs/RepairLogsTable";

export default function RepairLogs() {
  const [logs, setLogs] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    fetchRepairLogsInitial();
    fetchUsers();
    fetchSpareParts();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchRepairLogs();
    }
  }, [searchTerm, startDate, endDate, dateField]);

  useEffect(() => {
    console.log("Users:", users);
  }, [users]);

  async function fetchRepairLogsInitial() {
    setInitialLoading(true);
    try {
      const { data, error } = await supabase
        .from("repair_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching repair logs:", error);
      setError("Error fetching repair logs data");
    } finally {
      setInitialLoading(false);
    }
  }

  async function fetchRepairLogs() {
    setLoading(true);
    try {
      let query = supabase.from("repair_logs").select("*");

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,issue.ilike.%${searchTerm}%`
        );
      }

      if (startDate) {
        query = query.gte(dateField, startDate.toISOString());
      }
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt(dateField, nextDay.toISOString());
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching repair logs:", error);
      setError("Error fetching repair logs data");
    } finally {
      setLoading(false);
    }
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

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      </div>
    );
  }

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
        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          dateField={dateField}
          setDateField={setDateField}
          clearFilters={clearFilters}
        />

        <RepairLogsTable
          logs={logs}
          users={users}
          onRowClick={handleRowClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        selectedLog={selectedLog}
        editForm={editForm}
        setEditForm={setEditForm}
        handleSubmit={handleEditSubmit}
        users={users}
        sparePartSearch={sparePartSearch}
        setSparePartSearch={setSparePartSearch}
        spareParts={spareParts}
        handleAddSparePart={handleAddSparePart}
        selectedSpareParts={selectedSpareParts}
        handleSparePartQuantityChange={handleSparePartQuantityChange}
        handleRemoveSparePart={handleRemoveSparePart}
      />

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
      />

      <RepairGuideModal
        isOpen={isRepairGuideModalOpen}
        onClose={() => {
          setIsRepairGuideModalOpen(false);
          setSelectedGuide(null);
        }}
        guide={selectedGuide}
      />
    </div>
  );
}
