import React from "react";

export default function EditModal({
  isOpen,
  onClose,
  editForm,
  setEditForm,
  users,
  spareParts,
  selectedSpareParts,
  handleEditSubmit,
  handleAddSparePart,
  handleSparePartQuantityChange,
  handleRemoveSparePart,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Repair Log</h2>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Not Assigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Spare Parts
              </label>
              <div className="mt-1 space-y-4">
                <div className="flex space-x-2">
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value=""
                    onChange={(e) => handleAddSparePart(e.target.value)}
                  >
                    <option value="">Select a spare part...</option>
                    {spareParts
                      .filter(
                        (sp) =>
                          !selectedSpareParts.some(
                            (selected) => selected.spare_part_id === sp.id
                          )
                      )
                      .map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.name} ({sp.part_number})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  {selectedSpareParts.map((sp) => (
                    <div
                      key={sp.spare_part_id}
                      className="flex items-center space-x-2 bg-gray-50 p-2 rounded"
                    >
                      <span className="flex-1">{sp.spare_part.name}</span>
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
                        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSparePart(sp.spare_part_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
