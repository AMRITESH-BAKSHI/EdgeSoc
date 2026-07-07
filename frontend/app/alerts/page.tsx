'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/Sidebar'; 

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
  const [filter, setFilter] = useState<string>('all');
  const pathname = usePathname();

  useEffect(() => {
    fetch('http://127.0.0.1:8000/alerts')
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'unprocessed') return !alert.processed;
    return alert.attack_type === filter;
  });

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-[#a1a1aa] font-sans antialiased overflow-hidden selection:bg-[#ff4500] selection:text-white">
      <Sidebar />
        {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white uppercase tracking-wider">Telemetry Alerts Log</h1>
          <p className="text-xs text-[#71717a] mt-1">Ingested event queue from signature engines</p>
        </div>

        {/* Filters */}
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

        {/* Data Matrix */}
        <div className="bg-[#111113] border border-[#1f1f22] rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-[#a1a1aa]">
            <thead className="bg-[#0a0a0b] text-[#71717a] font-medium border-b border-[#1f1f22]">
              <tr>
                <th className="px-6 py-4">ALERT ID</th>
                <th className="px-6 py-4">ATTACK VECTOR</th>
                <th className="px-6 py-4">SEVERITY</th>
                <th className="px-6 py-4">SOURCE IDENTIFIER</th>
                <th className="px-6 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f22]">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12">Streaming node logs...</td></tr>
              ) : filteredAlerts.map((alert) => (
                <tr key={alert.alert_id} className="hover:bg-[#1a1a1e] transition cursor-default">
                  <td className="px-6 py-4 font-mono text-[#ff4500]">{alert.alert_id}</td>
                  <td className="px-6 py-4 font-semibold capitalize text-white">{alert.attack_type.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      alert.severity === 'high' ? 'bg-[rgba(255,69,0,0.1)] text-[#ff4500]' : 'bg-[rgba(251,146,60,0.1)] text-orange-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-white">{alert.source_ip}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] ${
                      alert.processed ? 'bg-[#1a1a1e] text-[#71717a]' : 'bg-[rgba(255,69,0,0.1)] text-[#ff4500]'
                    }`}>
                      {alert.processed ? 'CONTAINED' : 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}