import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Edit2, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import DeleteModal from "../components/RepairLogs/DeleteModal";

export default function AssignmentRules() {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    assigned_user_id: "",
  });

  useEffect(() => {
    fetchRules();
    fetchUsers();
    fetchDevices();
  }, []);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from("assignment_rules")
        .select(
          `
          *,
          users:assigned_user_id (
            id,
            full_name
          )
        `
        )
        .order("title");

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error("Error fetching rules:", error);
      toast.error("Failed to load assignment rules");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users_profile")
        .select("*")
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const fetchDevices = async () => {
    try {
      // Get unique device names from repair_tasks
      const { data, error } = await supabase
        .from("repair_tasks")
        .select("title")
        .order("title");

      if (error) throw error;

      // Get unique device names
      const uniqueDevices = [...new Set(data.map((item) => item.title))];
      setDevices(uniqueDevices || []);
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast.error("Failed to load devices");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRule) {
        // Update existing rule
        const { error } = await supabase
          .from("assignment_rules")
          .update({
            title: formData.title,
            assigned_user_id: formData.assigned_user_id,
          })
          .eq("id", selectedRule.id);

        if (error) throw error;
        toast.success("Rule updated successfully");
      } else {
        // Create new rule
        const { error } = await supabase.from("assignment_rules").insert({
          title: formData.title,
          assigned_user_id: formData.assigned_user_id,
        });

        if (error) throw error;
        toast.success("Rule created successfully");
      }

      setIsModalOpen(false);
      setSelectedRule(null);
      setFormData({ title: "", assigned_user_id: "" });
      fetchRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save rule");
    }
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setFormData({
      title: rule.title,
      assigned_user_id: rule.assigned_user_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("assignment_rules")
        .delete()
        .eq("id", selectedRule.id);

      if (error) throw error;
      toast.success("Rule deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedRule(null);
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Failed to delete rule");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Device Assignment Rules
        </h1>
        <button
          onClick={() => {
            setSelectedRule(null);
            setFormData({ title: "", assigned_user_id: "" });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Rule
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Technician
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {rule.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {rule.users?.full_name || "Unassigned"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center justify-center mr-4"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRule(rule);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-900 inline-flex items-center justify-center"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedRule ? "Edit Assignment Rule" : "Create Assignment Rule"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Device Name
                  </label>
                  <select
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">Select Device</option>
                    {devices.map((device) => (
                      <option key={device} value={device}>
                        {device}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assign Technician
                  </label>
                  <select
                    value={formData.assigned_user_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assigned_user_id: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">Select Technician</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {selectedRule ? "Update Rule" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRule(null);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
