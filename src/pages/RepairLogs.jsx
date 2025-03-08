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
    fetchRepairLogs();
  }, [searchTerm, startDate, endDate, dateField]);

  useEffect(() => {
    console.log("Users:", users);
  }, [users]);

  async function fetchRepairLogs() {
    let query = supabase.from("repair_logs").select("*");

    // Apply search filter
    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,issue.ilike.%${searchTerm}%`
      );
    }

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

    // Order by created date
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

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
