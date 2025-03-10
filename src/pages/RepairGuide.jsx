import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AddRepairGuide from "../components/AddRepairGuide";

function RepairGuide() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchRepairGuides();
  }, []);

  const fetchRepairGuides = async () => {
    try {
      const { data, error } = await supabase.from("repair_guide").select("*");

      if (error) throw error;
      setGuides(data);
      console.log(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
            />
          </svg>
          Repair Guides
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
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
          Add New Guide
        </button>
      </div>

      {guides.map((guide) => (
        <div
          key={guide.id}
          className="bg-white rounded-lg shadow-md mb-6 p-6 border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            {guide.device_name}
          </h2>

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
      ))}

      {showAddModal && (
        <AddRepairGuide
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchRepairGuides();
          }}
        />
      )}
    </div>
  );
}

export default RepairGuide;
