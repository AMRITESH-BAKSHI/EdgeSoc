'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { API_BASE_URL } from '../../lib/config';

interface Alert {
  alert_id: string;
  attack_type: 'sql_injection' | 'brute_force' | 'ddos';
  severity: 'low' | 'medium' | 'high';
  source_ip: string;
  processed: boolean;
  timestamp?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetch(API_BASE_URL + '/alerts')
      .then((res) => res.json())
      .then((data: Alert[]) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // -----------------------------
  // FILTER ALERTS
  // -----------------------------
  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;

    if (filter === 'unprocessed') {
      return !alert.processed;
    }

    return alert.attack_type === filter;
  });

  // -----------------------------
  // SORT FILTERED ALERTS
  // -----------------------------
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (
          new Date(b.timestamp || 0).getTime() -
          new Date(a.timestamp || 0).getTime()
        );

      case 'oldest':
        return (
          new Date(a.timestamp || 0).getTime() -
          new Date(b.timestamp || 0).getTime()
        );

      case 'severity': {
        const severityRank = {
          high: 3,
          medium: 2,
          low: 1,
        };

        return severityRank[b.severity] - severityRank[a.severity];
      }

      case 'type':
        return a.attack_type.localeCompare(b.attack_type);

      case 'ip':
        return a.source_ip.localeCompare(b.source_ip);

      default:
        return 0;
    }
  });

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-[#a1a1aa] font-sans antialiased overflow-hidden">
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Telemetry Alerts Log
            </h1>

            <p className="text-xs text-[#71717a] mt-2">
              Ingested event queue from signature engines
            </p>
          </div>

          {/* SORT */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#111113] border border-[#27272a] rounded-md px-4 py-2 text-xs text-[#a1a1aa] outline-none cursor-pointer hover:border-[#3f3f46] focus:border-[#ff4500]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="severity">Severity</option>
            <option value="type">Attack Type</option>
            <option value="ip">Source IP</option>
          </select>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            { label: 'All Events', value: 'all' },
            { label: 'SQL Injection', value: 'sql_injection' },
            { label: 'Brute Force', value: 'brute_force' },
            { label: 'DDoS', value: 'ddos' },
            { label: 'Pending AI', value: 'unprocessed' },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
                filter === btn.value
                  ? 'border-[#ff4500] text-white bg-[rgba(255,69,0,0.1)]'
                  : 'border-[#1f1f22] text-[#71717a] hover:border-[#71717a]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* DATA MATRIX */}
        <div className="bg-[#111113] border border-[#1f1f22] rounded-xl overflow-hidden shadow-lg">

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#a1a1aa]">

              {/* TABLE HEADER */}
              <thead className="bg-[#0a0a0b] text-[#71717a] font-medium border-b border-[#1f1f22]">
                <tr>
                  <th className="px-6 py-4">ALERT ID</th>
                  <th className="px-6 py-4">ATTACK VECTOR</th>
                  <th className="px-6 py-4">SEVERITY</th>
                  <th className="px-6 py-4">SOURCE IDENTIFIER</th>
                  <th className="px-6 py-4">TIMESTAMP</th>
                  <th className="px-6 py-4">STATUS</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-[#1f1f22]">

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-[#71717a]"
                    >
                      Streaming node logs...
                    </td>
                  </tr>
                ) : sortedAlerts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-[#71717a]"
                    >
                      No matching alerts detected.
                    </td>
                  </tr>
                ) : (
                  sortedAlerts.map((alert) => (
                    <tr
                      key={alert.alert_id}
                      className="hover:bg-[#1a1a1e] transition cursor-default"
                    >

                      {/* ALERT ID */}
                      <td className="px-6 py-4 font-mono text-[#ff4500] whitespace-nowrap">
                        {alert.alert_id}
                      </td>

                      {/* ATTACK TYPE */}
                      <td className="px-6 py-4 font-semibold capitalize text-white whitespace-nowrap">
                        {alert.attack_type.replace('_', ' ')}
                      </td>

                      {/* SEVERITY */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            alert.severity === 'high'
                              ? 'bg-[rgba(255,69,0,0.1)] text-[#ff4500]'
                              : alert.severity === 'medium'
                              ? 'bg-[rgba(251,146,60,0.1)] text-orange-400'
                              : 'bg-[rgba(34,197,94,0.1)] text-green-400'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </td>

                      {/* SOURCE IP */}
                      <td className="px-6 py-4 font-mono text-white whitespace-nowrap">
                        {alert.source_ip}
                      </td>

                      {/* TIMESTAMP */}
                      <td className="px-6 py-4 font-mono text-[#71717a] whitespace-nowrap">
                        {alert.timestamp
                          ? new Date(alert.timestamp).toLocaleString()
                          : '—'}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] ${
                            alert.processed
                              ? 'bg-[#1a1a1e] text-[#71717a]'
                              : 'bg-[rgba(255,69,0,0.1)] text-[#ff4500]'
                          }`}
                        >
                          {alert.processed ? 'CONTAINED' : 'PENDING'}
                        </span>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}