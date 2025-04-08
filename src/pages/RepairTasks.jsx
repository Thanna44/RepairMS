import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import repairDefaultPartsConfig from "../config/repairDefaultParts.json";
import FilterSection from "../components/RepairLogs/FilterSection";
import EditModal from "../components/RepairLogs/EditModal";
import DeleteModal from "../components/RepairLogs/DeleteModal";
import RepairGuideModal from "../components/RepairLogs/RepairManualModal";
import RepairLogsTable from "../components/RepairLogs/RepairLogsTable";
import toast, { Toaster } from "react-hot-toast";

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
    device_name: "",
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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchRepairTasksInitial();
    fetchUsers();
    fetchSpareParts();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchRepairTasks();
    }
  }, [searchTerm, startDate, endDate, dateField]);

  useEffect(() => {
    console.log("Users:", users);
  }, [users]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users_profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }

  async function fetchRepairTasksInitial() {
    setInitialLoading(true);
    try {
      let query = supabase
        .from("repair_tasks")
        .select("*")
        .neq("status", "completed")
        .order("created_at", { ascending: false });

      // Filter by assigned user if not admin
      if (currentUser && currentUser.role !== "admin") {
        query = query.eq("assigned_user_id", currentUser.id);
      }

      const { data, error } = await query;

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

  async function fetchRepairTasks() {
    setLoading(true);
    try {
      let query = supabase
        .from("repair_tasks")
        .select("*")
        .neq("status", "completed");

      // Filter by assigned user if not admin
      if (currentUser && currentUser.role !== "admin") {
        query = query.eq("assigned_user_id", currentUser.id);
      }

      if (searchTerm) {
        query = query.or(
          `device_name.ilike.%${searchTerm}%,issue.ilike.%${searchTerm}%`
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
      const { data, error } = await supabase.from("users_profile").select("*");

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
      device_name: log.device_name,
      issue: log.issue,
      status: log.status,
      priority: log.priority,
      assigned_user_id: log.assigned_user_id || "",
    });

    // Load saved spare parts if they exist
    if (log.spare_parts) {
      const savedSpareParts = log.spare_parts.map((sp) => {
        const sparePart = spareParts.find(
          (part) => part.name === sp.name && part.part_number === sp.part_number
        );

        return {
          spare_part_id: sparePart?.id,
          quantity: sp.quantity,
          spare_part: {
            id: sparePart?.id,
            name: sp.name,
            nsn: sp.nsn,
            part_number: sp.part_number,
            price: sp.price,
          },
        };
      });
      setSelectedSpareParts(savedSpareParts);
    } else {
      setSelectedSpareParts([]);
    }

    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (log) => {
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      device_name: editForm.device_name,
      issue: editForm.issue,
      status: editForm.status,
      priority: editForm.priority,
      assigned_user_id: editForm.assigned_user_id || null,
      updated_at: new Date().toISOString(),
    };

    try {
      let error;

      // Format spare parts data for saving
      const formattedSpareParts = selectedSpareParts.map((sp) => ({
        name: sp.spare_part.name,
        nsn: sp.spare_part.nsn,
        part_number: sp.spare_part.part_number,
        quantity: sp.quantity,
        price: sp.spare_part.price,
      }));

      // Add spare parts to form data
      formData.spare_parts = formattedSpareParts;

      if (selectedLog?.id) {
        // Get existing spare parts data for comparison
        const { data: existingLog, error: fetchError } = await supabase
          .from("repair_tasks")
          .select("spare_parts")
          .eq("id", selectedLog.id)
          .single();

        if (fetchError) {
          console.error("Error fetching existing log:", fetchError);
          toast.error("Error fetching repair log data");
          return;
        }

        const existingParts = existingLog.spare_parts || [];

        // Calculate stock adjustments
        const stockAdjustments = [];

        // Check for quantity changes in existing parts
        existingParts.forEach((oldPart) => {
          const newPart = formattedSpareParts.find(
            (p) =>
              p.name === oldPart.name && p.part_number === oldPart.part_number
          );

          if (newPart) {
            // If quantity changed, we need to adjust stock
            if (newPart.quantity !== oldPart.quantity) {
              stockAdjustments.push({
                name: oldPart.name,
                part_number: oldPart.part_number,
                // Positive means we return to stock, negative means we take from stock
                adjustment: oldPart.quantity - newPart.quantity,
              });
            }
          } else {
            // Part was removed, return stock
            stockAdjustments.push({
              name: oldPart.name,
              part_number: oldPart.part_number,
              adjustment: oldPart.quantity, // Return full quantity to stock
            });
          }
        });

        // Check for new parts added
        formattedSpareParts.forEach((newPart) => {
          const oldPart = existingParts.find(
            (p) =>
              p.name === newPart.name && p.part_number === newPart.part_number
          );

          if (!oldPart) {
            // New part added, need to reduce stock
            stockAdjustments.push({
              name: newPart.name,
              part_number: newPart.part_number,
              adjustment: -newPart.quantity, // Negative because we're reducing stock
            });
          }
        });

        // Update existing log
        const { error: updateError } = await supabase
          .from("repair_tasks")
          .update(formData)
          .eq("id", selectedLog.id);
        error = updateError;

        // Apply stock adjustments
        for (const adjustment of stockAdjustments) {
          // Get current stock
          const { data: currentStock, error: stockFetchError } = await supabase
            .from("spare_parts")
            .select("quantity")
            .eq("name", adjustment.name)
            .eq("part_number", adjustment.part_number)
            .single();

          if (stockFetchError) {
            console.error("Error fetching current stock:", stockFetchError);
            toast.error(`Error fetching stock for part: ${adjustment.name}`);
            continue;
          }

          // Calculate new quantity (add adjustment - positive adds to stock, negative reduces)
          const newQuantity = currentStock.quantity + adjustment.adjustment;

          // Update stock
          const { error: stockError } = await supabase
            .from("spare_parts")
            .update({ quantity: newQuantity })
            .eq("name", adjustment.name)
            .eq("part_number", adjustment.part_number);

          if (stockError) {
            console.error("Error updating stock:", stockError);
            toast.error(`Error updating stock for part: ${adjustment.name}`);
          }
        }
      } else {
        // Insert new log
        const { error: insertError } = await supabase
          .from("repair_tasks")
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
          });
        error = insertError;

        // For new logs, reduce stock for all parts
        for (const sp of selectedSpareParts) {
          const { data: currentStock, error: fetchError } = await supabase
            .from("spare_parts")
            .select("quantity")
            .eq("name", sp.spare_part.name)
            .eq("part_number", sp.spare_part.part_number)
            .single();

          if (fetchError) {
            console.error("Error fetching current stock:", fetchError);
            toast.error(`Error fetching stock for part: ${sp.spare_part.name}`);
            continue;
          }

          const newQuantity = currentStock.quantity - sp.quantity;

          const { error: stockError } = await supabase
            .from("spare_parts")
            .update({ quantity: newQuantity })
            .eq("name", sp.spare_part.name)
            .eq("part_number", sp.spare_part.part_number);

          if (stockError) {
            console.error("Error updating stock:", stockError);
            toast.error(`Error updating stock for part: ${sp.spare_part.name}`);
          }
        }
      }

      if (error) {
        console.error("Error saving repair log:", error);
        toast.error("Error saving repair log");
        return;
      }

      toast.success(
        selectedLog?.id
          ? "Repair log updated successfully"
          : "New repair log created successfully"
      );
      setIsEditModalOpen(false);
      fetchRepairTasks();
      fetchSpareParts(); // Refresh spare parts list to show updated quantities
    } catch (err) {
      console.error("Error in handleEditSubmit:", err);
      toast.error("An unexpected error occurred");
    }
  };

  const handleDelete = async () => {
    if (!selectedLog) return;

    try {
      // First, get the repair task's spare parts before deletion
      const { data: taskData, error: fetchError } = await supabase
        .from("repair_tasks")
        .select("spare_parts")
        .eq("id", selectedLog.id)
        .single();

      if (fetchError) {
        console.error("Error fetching repair task data:", fetchError);
        toast.error("Error fetching repair task data");
        return;
      }

      // Delete the repair task
      const { error: deleteError } = await supabase
        .from("repair_tasks")
        .delete()
        .eq("id", selectedLog.id);

      if (deleteError) {
        console.error("Error deleting repair log:", deleteError);
        toast.error("Error deleting repair log");
        return;
      }

      // If the task had spare parts, restore them to stock
      if (taskData?.spare_parts && taskData.spare_parts.length > 0) {
        for (const part of taskData.spare_parts) {
          // Get current stock quantity
          const { data: currentStock, error: stockFetchError } = await supabase
            .from("spare_parts")
            .select("quantity")
            .eq("name", part.name)
            .eq("part_number", part.part_number)
            .single();

          if (stockFetchError) {
            console.error("Error fetching current stock:", stockFetchError);
            toast.error(`Error fetching stock for part: ${part.name}`);
            continue;
          }

          // Calculate new quantity (return the used quantity back to stock)
          const newQuantity = currentStock.quantity + part.quantity;

          // Update stock
          const { error: stockUpdateError } = await supabase
            .from("spare_parts")
            .update({ quantity: newQuantity })
            .eq("name", part.name)
            .eq("part_number", part.part_number);

          if (stockUpdateError) {
            console.error("Error updating stock:", stockUpdateError);
            toast.error(`Error updating stock for part: ${part.name}`);
          }
        }
      }

      toast.success("Repair log deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchRepairTasks();
      fetchSpareParts(); // Refresh spare parts list to show updated quantities
    } catch (err) {
      console.error("Error in handleDelete:", err);
      toast.error("An unexpected error occurred");
    }
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
      (config) => config.device_name === editForm.device_name
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
  }, [editForm.device_name]);

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setDateField("created_at");
    setSearchTerm("");
  };

  const handleRowClick = async (log) => {
    try {
      const { data, error } = await supabase
        .from("repair_manuals")
        .select("*")
        .eq("device_name", log.device_name)
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

  const handleAutoAssign = async (log) => {
    try {
      // Get assignment rule for this task title
      const { data: rule, error: ruleError } = await supabase
        .from("assignment_rules")
        .select("*")
        .eq("device_name", log.device_name)
        .single();

      if (ruleError) {
        console.error("Error fetching assignment rule:", ruleError);
        toast.error("No assignment rule found for this task");
        return;
      }

      if (!rule || !rule.assigned_user_id) {
        toast.error("No user assigned in the rule");
        return;
      }

      // Check if technician already has 3 or more pending tasks
      const { data: existingTasks, error: tasksError } = await supabase
        .from("repair_tasks")
        .select("id")
        .eq("assigned_user_id", rule.assigned_user_id)
        .neq("status", "completed");

      if (tasksError) {
        console.error("Error checking existing tasks:", tasksError);
        toast.error("Error checking technician's workload");
        return;
      }

      if (existingTasks && existingTasks.length >= 3) {
        toast.error(
          "Technician already has 3 or more incomplete tasks. Cannot assign more work."
        );
        return;
      }

      // Update the task with the assigned user
      const { error: updateError } = await supabase
        .from("repair_tasks")
        .update({
          assigned_user_id: rule.assigned_user_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", log.id);

      if (updateError) {
        console.error("Error updating task assignment:", updateError);
        toast.error("Failed to assign task");
        return;
      }

      // Add to repair history
      const { error: historyError } = await supabase
        .from("repair_history")
        .insert({
          repair_task_id: log.id,
          action: "Auto-assigned task",
          user_id: rule.assigned_user_id,
          created_at: new Date().toISOString(),
        });

      if (historyError) {
        console.error("Error adding to history:", historyError);
      }

      toast.success("Task assigned successfully");
      fetchRepairTasks(); // Refresh the task list
    } catch (err) {
      console.error("Error in handleAutoAssign:", err);
      toast.error("An unexpected error occurred");
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
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Repair Tasks</h1>
        {currentUser?.role &&
          (currentUser.role === "admin" || currentUser.role === "officer") && (
            <button
              onClick={() =>
                handleEditClick({
                  device_name: "",
                  issue: "",
                  status: "pending",
                  priority: "low",
                })
              }
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add New Task
            </button>
          )}
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
          onAutoAssign={handleAutoAssign}
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
