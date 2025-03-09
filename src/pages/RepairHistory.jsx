import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { History } from "lucide-react";

export default function RepairHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRepairHistory();
  }, []);

  async function fetchRepairHistory() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("repair_history")
        .select(
          `
          *,
          repair_logs (
            title
          ),
          users (
            full_name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching repair history:", error);
      setError("Error fetching repair history data");
    } finally {
      setLoading(false);
    }
  }

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
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Repair History
      </h1>

      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {history.map((item, itemIdx) => (
            <li key={item.id}>
              <div className="relative pb-8">
                {itemIdx !== history.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                      <History className="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        {item.action}{" "}
                        <span className="font-medium text-gray-900">
                          {item.repair_logs.title}
                        </span>
                      </p>
                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-500">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <div>{item.users.full_name}</div>
                      <time dateTime={item.created_at}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
