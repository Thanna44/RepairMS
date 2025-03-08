import React from "react";
import { X } from "lucide-react";

export default function RepairGuideModal({ isOpen, onClose, guide }) {
  if (!isOpen || !guide) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-blue-600">
            {guide.device_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-xl text-red-600 mb-6">Issue: {guide.issue}</div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Repair Steps:</h3>
          <ul className="space-y-2">
            {guide.steps.steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="font-medium mr-2">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Required Parts:</h3>
          <div className="flex flex-wrap gap-2">
            {guide.parts.parts.map((part, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-blue-600 bg-blue-50 border border-blue-200"
              >
                {part.name} ({part.quantity})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
