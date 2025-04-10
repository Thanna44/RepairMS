import React, { useState } from "react";
import { supabase } from "../lib/supabase";

function EditRepairGuide({ onClose, onSuccess, guide }) {
  const [formData, setFormData] = useState({
    device_name: guide.device_name,
    issue: guide.issue,
    steps: guide.steps.steps,
    parts: guide.parts.parts,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formattedData = {
        device_name: formData.device_name,
        issue: formData.issue,
        steps: { steps: formData.steps.filter((step) => step.trim() !== "") },
        parts: {
          parts: formData.parts.filter((part) => part.name.trim() !== ""),
        },
      };

      const { data, error } = await supabase
        .from("repair_manuals")
        .update(formattedData)
        .eq("id", guide.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ""],
    }));
  };

  const removeStep = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, index) => index !== indexToRemove),
    }));
  };

  const updateStep = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData((prev) => ({
      ...prev,
      steps: newSteps,
    }));
  };

  const addPart = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [...prev.parts, { name: "", quantity: "" }],
    }));
  };

  const removePart = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, index) => index !== indexToRemove),
    }));
  };

  const updatePart = (index, field, value) => {
    const newParts = [...formData.parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      parts: newParts,
    }));
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Repair Guide
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Name
                  </label>
                  <input
                    type="text"
                    value={formData.device_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        device_name: e.target.value,
                      }))
                    }
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue
                  </label>
                  <input
                    type="text"
                    value={formData.issue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        issue: e.target.value,
                      }))
                    }
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Repair Steps
                    </label>
                    <button
                      type="button"
                      onClick={addStep}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Step
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-8 text-sm font-medium text-gray-700 pt-2">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => updateStep(index, e.target.value)}
                          className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 mr-2"
                          placeholder={`Step ${index + 1}`}
                        />
                        {formData.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="px-2 py-2 text-red-600 hover:text-red-800 rounded"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Required Parts
                    </label>
                    <button
                      type="button"
                      onClick={addPart}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Part
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.parts.map((part, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="flex-shrink-0 w-8 text-sm font-medium text-gray-700">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={part.name}
                          onChange={(e) =>
                            updatePart(index, "name", e.target.value)
                          }
                          className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500"
                          placeholder="Part name"
                        />
                        <input
                          type="number"
                          min="1"
                          value={part.quantity}
                          onChange={(e) =>
                            updatePart(index, "quantity", e.target.value)
                          }
                          className="w-24 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500"
                          placeholder="Qty"
                        />
                        {formData.parts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePart(index)}
                            className="px-2 py-2 text-red-600 hover:text-red-800 rounded"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditRepairGuide;
