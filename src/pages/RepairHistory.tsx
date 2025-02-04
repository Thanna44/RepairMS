import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { History } from 'lucide-react';

type RepairHistoryItem = {
  id: string;
  repair_log_id: string;
  action: string;
  notes: string;
  created_at: string;
  repair_logs: {
    title: string;
  };
  users: {
    full_name: string;
  };
};

export default function RepairHistory() {
  const [history, setHistory] = useState<RepairHistoryItem[]>([]);

  useEffect(() => {
    fetchRepairHistory();
  }, []);

  async function fetchRepairHistory() {
    const { data, error } = await supabase
      .from('repair_history')
      .select(`
        *,
        repair_logs (
          title
        ),
        users (
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching repair history:', error);
      return;
    }

    setHistory(data || []);
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
                        {item.action}{' '}
                        <span className="font-medium text-gray-900">
                          {item.repair_logs.title}
                        </span>
                      </p>
                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-500">{item.notes}</p>
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