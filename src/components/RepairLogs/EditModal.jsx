import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RepairTaskPDF from "./RepairTaskPDF";

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

  const pdfData = {
    ...editForm,
    spare_parts: selectedSpareParts.map((sp) => ({
      name: sp.spare_part.name,
      part_number: sp.spare_part.part_number,
      quantity: sp.quantity,
    })),
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header - Fixed at top */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedLog?.id ? "Edit Repair Log" : "Add New Repair Log"}
              </h2>
              {selectedLog?.id && (
                <PDFDownloadLink
                  document={<RepairTaskPDF data={pdfData} users={users} />}
                  fileName={`repair-task-${selectedLog.id}.pdf`}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {({ blob, url, loading, error }) =>
                    loading ? "Loading document..." : "Export PDF"
                  }
                </PDFDownloadLink>
              )}
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Device name
                    </label>
                    <input
                      type="text"
                      value={editForm.device_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          device_name: e.target.value,
                        })
                      }
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue
                    </label>
                    <textarea
                      value={editForm.issue}
                      onChange={(e) =>
                        setEditForm({ ...editForm, issue: e.target.value })
                      }
                      rows={3}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value })
                        }
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
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
                        className="flex-1 border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-40 overflow-y-auto">
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
                                className={`flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                  isSelected
                                    ? "bg-gray-100 cursor-not-allowed opacity-60"
                                    : "cursor-pointer"
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
                    </div>
                    <div className="mt-4 space-y-2">
                      {selectedSpareParts.map((sp) => (
                        <div
                          key={sp.spare_part_id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <div>
                            <div className="font-medium">
                              {sp.spare_part.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {sp.spare_part.part_number}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
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
                              className="w-20 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveSparePart(sp.spare_part_id);
                              }}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {selectedLog?.id ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
