import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Package, X } from "lucide-react";

export default function SpareParts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPart, setNewPart] = useState({
    name: "",
    description: "",
    nsn: "",
    part_number: "",
    quantity: 0,
    price: 0,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState(null);

  useEffect(() => {
    fetchSpareParts();
  }, []);

  async function fetchSpareParts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("spare_parts")
        .select("*")
        .order("name");

      if (error) throw error;
      setParts(data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
      setError("Error fetching spare parts data");
    } finally {
      setLoading(false);
    }
  }

  const handleAddPart = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("spare_parts")
      .insert([newPart])
      .select();

    if (error) {
      console.error("Error adding spare part:", error);
      return;
    }

    // Refresh the parts list
    fetchSpareParts();
    // Reset form and close modal
    setNewPart({
      name: "",
      description: "",
      nsn: "",
      part_number: "",
      quantity: 0,
      price: 0,
    });
    setIsAddModalOpen(false);
  };

  const handleEditPart = async (e) => {
    e.preventDefault();
    if (!editingPart) return;

    const { error } = await supabase
      .from("spare_parts")
      .update({
        name: editingPart.name,
        description: editingPart.description,
        nsn: editingPart.nsn,
        part_number: editingPart.part_number,
        quantity: editingPart.quantity,
        price: editingPart.price,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingPart.id);

    if (error) {
      console.error("Error updating spare part:", error);
      return;
    }

    console.log("Successfully updated spare part:", {
      id: editingPart.id,
      name: editingPart.name,
      updated_at: new Date().toISOString(),
    });

    fetchSpareParts();
    setIsEditModalOpen(false);
    setEditingPart(null);
  };

  const handleDeletePart = async (partId) => {
    const { error } = await supabase
      .from("spare_parts")
      .delete()
      .eq("id", partId);

    if (error) {
      console.error("Error deleting spare part:", error);
      return;
    }

    console.log("Successfully deleted spare part:", partId);
    fetchSpareParts();
    setIsDeleteModalOpen(false);
    setPartToDelete(null);
  };

  const filteredParts = parts.filter((part) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      part.name.toLowerCase().includes(searchLower) ||
      part.nsn.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Spare Parts</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Part
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อหรือ NSN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredParts.map((part) => (
          <div
            key={part.id}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {part.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {part.quantity}
                      </div>
                      <div className="ml-2 text-sm font-semibold text-gray-500">
                        in stock
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  NSN : {part.nsn}
                </div>
                <div className="font-medium text-gray-900">
                  Part number : {part.part_number}
                </div>
                <div className="font-medium text-gray-900">
                  ${part.price.toFixed(2)}
                </div>
                <div className="text-gray-500 mt-1">{part.description}</div>
              </div>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={() => {
                    setEditingPart(part);
                    setIsEditModalOpen(true);
                  }}
                  className="flex-1 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setPartToDelete(part);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex-1 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Spare Part</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddPart}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newPart.name}
                    onChange={(e) =>
                      setNewPart({ ...newPart, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={newPart.description}
                    onChange={(e) =>
                      setNewPart({ ...newPart, description: e.target.value })
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    NSN
                  </label>
                  <input
                    type="text"
                    required
                    value={newPart.nsn}
                    onChange={(e) =>
                      setNewPart({ ...newPart, nsn: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Part Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newPart.part_number}
                    onChange={(e) =>
                      setNewPart({ ...newPart, part_number: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPart.quantity}
                    onChange={(e) =>
                      setNewPart({
                        ...newPart,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newPart.price}
                    onChange={(e) =>
                      setNewPart({
                        ...newPart,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Spare Part</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPart(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditPart}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPart.name}
                    onChange={(e) =>
                      setEditingPart({ ...editingPart, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={editingPart.description}
                    onChange={(e) =>
                      setEditingPart({
                        ...editingPart,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    NSN
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPart.nsn}
                    onChange={(e) =>
                      setEditingPart({ ...editingPart, nsn: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Part Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPart.part_number}
                    onChange={(e) =>
                      setEditingPart({
                        ...editingPart,
                        part_number: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingPart.quantity}
                    onChange={(e) =>
                      setEditingPart({
                        ...editingPart,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editingPart.price}
                    onChange={(e) =>
                      setEditingPart({
                        ...editingPart,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingPart(null);
                  }}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Update Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && partToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPartToDelete(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the part "{partToDelete.name}"?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPartToDelete(null);
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePart(partToDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
