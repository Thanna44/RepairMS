import React from "react";

export default function EditModal({
  isOpen,
  onClose,
  selectedLog,
  editForm,
  setEditForm,
  handleSubmit,
  users,
  sparePartSearch,
  setSparePartSearch,
  spareParts,
  handleAddSparePart,
  selectedSpareParts,
  handleSparePartQuantityChange,
  handleRemoveSparePart,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl m-4">
        <h2 className="text-xl font-semibold mb-4">
          {selectedLog?.id ? "Edit Repair Log" : "Add New Repair Log"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100vh-200px)] overflow-y-auto"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Device name
              </label>
              <input
                type="text"
                value={editForm.device_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, device_name: e.target.value })
                }
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Issue
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
                  .map((part) => {
                    const isSelected = selectedSpareParts.some(
                      (sp) => sp.spare_part_id === part.id
                    );
                    return (
                      <div
                        key={part.id}
                        className={`flex items-center justify-between p-2 ${
                          isSelected
                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                            : "hover:bg-gray-50 cursor-pointer"
                        }`}
                        onClick={() => {
                          if (!isSelected) {
                            handleAddSparePart(part.id);
                          }
                        }}
                      >
                        <div>
                          <div className="font-medium">{part.name}</div>
                          <div className="text-sm text-gray-500">
                            {part.part_number}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-sm text-gray-500 mr-2">
                            ${part.price}
                          </div>
                          {isSelected && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Added
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="space-y-2">
                {selectedSpareParts.map((sp) => (
                  <div
                    key={sp.spare_part_id}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <div>
                      <div className="font-medium">{sp.spare_part.name}</div>
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
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
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
              onClick={onClose}
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
  );
}
