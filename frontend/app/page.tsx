'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';

interface Alert {
  alert_id: string;
  attack_type: string;
  severity: 'low' | 'medium' | 'high';
  source_ip: string;
  processed: boolean;
  timestamp?: string;
}

interface HealthData {
  status: string;
  latency_ms: number;
  status_code?: number;
}

export default function EdgeSocDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [health, setHealth] = useState<HealthData>({ status: 'CHECKING', latency_ms: 0 });
  const [loading, setLoading] = useState(true);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    const fetchAlerts = () => {
      fetch('http://127.0.0.1:8000/alerts')
        .then((res) => res.json())
        .then((data: Alert[]) => {
          setAlerts(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    const fetchHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/health-status');
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth({ status: 'DOWN', latency_ms: 0, status_code: 500 });
      }
    };

    fetchAlerts();
    fetchHealth();

    const interval = setInterval(() => {
      fetchAlerts();
      fetchHealth();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const triggerInvestigation = async () => {
    setIsInvestigating(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/investigate');
      const data = await res.json();
      setStatusMessage(`Success: ${data.processed_alerts} alerts processed.`);
      const updated = await fetch('http://127.0.0.1:8000/alerts').then((r) => r.json());
      setAlerts(updated);
    } catch {
      setStatusMessage('Error: Failed to connect to engine.');
    } finally {
      setIsInvestigating(false);
      setTimeout(() => setStatusMessage(null), 5000); // Auto-close after 5s
    }
  };
  const manualHealthCheck = async () => {
    setHealth({ status: 'CHECKING', latency_ms: 0 });

    try {
      const res = await fetch('http://127.0.0.1:8000/health-status');
      const data = await res.json();
      // 2. Add a tiny 600ms delay so the user actually sees the "CHECKING" animation
      setTimeout(() => setHealth(data), 600);
    } catch {
      setTimeout(() => setHealth({ status: 'DOWN', latency_ms: 0 }), 600);
    }
  };
  // --- DYNAMIC THREAT-HEALTH LOGIC ---
  const highSeverityCount = alerts.filter(a => a.severity === 'high').length;
  const unprocessedCount = alerts.filter(a => !a.processed).length;
  const totalThreatScore = (highSeverityCount * 2) + unprocessedCount;

  let threatState = { color: 'text-green-500', bg: 'bg-[rgba(34,197,94,0.1)]', border: 'border-green-500/30', label: 'SECURE' };

  if (health.status === 'CHECKING') {
    threatState = { color: 'text-[#58a6ff]', bg: 'bg-[rgba(88,166,255,0.1)]', border: 'border-[#58a6ff]/30', label: 'PINGING...' };
  } else if (totalThreatScore > 10 || health.status === 'DOWN') {
    threatState = { color: 'text-[#ff4500]', bg: 'bg-[rgba(255,69,0,0.1)]', border: 'border-[#ff4500]/50', label: 'CRITICAL' };
  } else if (totalThreatScore > 3) {
    threatState = { color: 'text-orange-400', bg: 'bg-[rgba(251,146,60,0.1)]', border: 'border-orange-400/40', label: 'ELEVATED' };
  }

  const ddosCount = alerts.filter(a => a.attack_type === 'ddos').length;
  const sqliCount = alerts.filter(a => a.attack_type === 'sql_injection').length;
  const bruteCount = alerts.filter(a => a.attack_type === 'brute_force').length;
  const threatCapacity = Math.min(100, Math.round((totalThreatScore / 20) * 100));

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-[#a1a1aa] font-sans antialiased overflow-hidden selection:bg-[#ff4500] selection:text-white">

      <Sidebar />
      {statusMessage && (
        <div className="fixed bottom-6 right-6 bg-[#111113] border border-[#ff4500] text-white px-6 py-4 rounded-xl shadow-2xl z-50">
          <p className="text-sm font-medium">{statusMessage}</p>
          <button onClick={() => setStatusMessage(null)} className="absolute top-2 right-2 text-[#71717a] hover:text-white text-xs">✕</button>
        </div>
      )}
      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">

        {/* Top Header Section */}
        {/* Top Header Section */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#71717a] mb-2 font-medium">
                <span>🏠</span> <span>›</span> <span>Dashboard</span> <span>›</span> <span className="text-white">Overview</span>
              </div>
              <h1 className="text-2xl font-semibold text-white">Global Telemetry</h1>
            </div>

            {/* Investigation Button - Aligned Right */}
            <button 
              onClick={triggerInvestigation}
              disabled={isInvestigating}
              className="bg-[#ff4500] hover:bg-[#ff571a] text-white text-sm font-medium py-2 px-6 rounded-lg transition shadow-[0_0_15px_rgba(255,69,0,0.3)] disabled:opacity-50"
            >
              {isInvestigating ? 'Analyzing...' : 'Run Investigation'}
            </button>
          </div>

          {/* Incident Info Bar */}
          <div className="flex flex-wrap gap-8 items-center text-xs pb-6 border-b border-[#1f1f22]">
            <div>
              <p className="text-[#71717a] mb-1 uppercase tracking-wider">Total Events</p>
              <p className="text-white font-medium text-sm">{loading ? '...' : alerts.length}</p>
            </div>
            <div>
              <p className="text-[#71717a] mb-1 uppercase tracking-wider">Unprocessed</p>
              <p className="text-white font-medium text-sm">{unprocessedCount}</p>
            </div>
            <div>
              <p className="text-[#71717a] mb-1 uppercase tracking-wider">Critical Threats</p>
              <p className="text-[#ff4500] font-medium text-sm">{highSeverityCount}</p>
            </div>
            <div className="ml-auto flex gap-3">
              <span className="px-3 py-1 bg-[#1a1a1e] border border-[#27272a] rounded text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live Sync
              </span>
              <span className="px-3 py-1 bg-[rgba(255,69,0,0.1)] border border-[#ff4500] rounded text-[#ff4500] flex items-center gap-2">
                Engine Vector ▾
              </span>
            </div>
          </div>
        </div>

        {/* 3. DASHBOARD GRID */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column (Health & Stats) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Dynamic Health Monitor */}
            <div className="bg-[#111113] border border-[#1f1f22] rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-sm font-medium">Environment Status</h3>

                {/* REFRESH BUTTON */}
                <button
                  onClick={manualHealthCheck}
                  className={`text-[#71717a] hover:text-white transition text-lg leading-none ${health.status === 'CHECKING' ? 'animate-spin' : ''}`}
                  title="Force Ping"
                >
                  ↻
                </button>
              </div>

              <div className={`p-4 rounded-lg border ${threatState.bg} ${threatState.border} transition-colors duration-500`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-bold tracking-wider ${threatState.color}`}>
                    {threatState.label}
                  </span>
                  <span className="text-xs text-white bg-black/40 px-2 py-1 rounded">
                    {health.status === 'CHECKING'
                      ? 'WAIT'
                      : health.status_code
                        ? `HTTP ${health.status_code}`
                        : 'INITIALIZING'}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <h4 className={`text-3xl font-bold ${threatState.color}`}>
                    {health.status}
                  </h4>
                  <div className="text-right">
                    <p className="text-xl font-mono text-white">{health.latency_ms}<span className="text-xs text-[#71717a]">ms</span></p>
                  </div>
                </div>
              </div>
            </div>
            {/* Daily Stats Panel */}
            <div className="bg-[#111113] border border-[#1f1f22] rounded-xl p-5 shadow-lg">
              <h3 className="text-white text-sm font-medium mb-6">Threat Distribution</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a] text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff4500]"></span> DDoS Attempts
                  </span>
                  <span className="text-white text-sm font-mono">{ddosCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a] text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span> SQL Injections
                  </span>
                  <span className="text-white text-sm font-mono">{sqliCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a] text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Brute Force
                  </span>
                  <span className="text-white text-sm font-mono">{bruteCount}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1f1f22]">
                  <div className="w-full bg-[#1a1a1e] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${threatCapacity > 75 ? 'bg-[#ff4500]' : threatCapacity > 40 ? 'bg-orange-400' : 'bg-green-500'
                        }`}
                      style={{ width: `${threatCapacity}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-[#71717a] mt-2 text-right">{threatCapacity}% Threat Capacity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Entities Table) */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-[#111113] border border-[#1f1f22] rounded-xl p-0 shadow-lg h-full overflow-hidden flex flex-col">
              <div className="p-5 border-b border-[#1f1f22] flex justify-between items-center">
                <h3 className="text-white text-sm font-medium">Network Entities & Alerts</h3>
                <span className="text-xs text-[#71717a] cursor-pointer hover:text-white">Sort by ▾</span>
              </div>

              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-[#71717a] bg-[#0a0a0b] sticky top-0">
                    <tr>
                      <th className="px-5 py-3 font-medium">ID</th>
                      <th className="px-5 py-3 font-medium">TYPE</th>
                      <th className="px-5 py-3 font-medium">SEVERITY</th>
                      <th className="px-5 py-3 font-medium">IP / HEX</th>
                      <th className="px-5 py-3 font-medium">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f22]">
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-8 text-[#71717a]">Syncing telemetry...</td></tr>
                    ) : alerts.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-[#71717a]">No incidents detected. System secure.</td></tr>
                    ) : (
                      alerts.map((alert) => (
                        <tr key={alert.alert_id} className="hover:bg-[#1a1a1e] transition group">
                          <td className="px-5 py-4 text-[#a1a1aa] font-mono text-xs">{alert.alert_id.substring(0, 8)}...</td>
                          <td className="px-5 py-4 text-white capitalize">{alert.attack_type.replace('_', ' ')}</td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-2 text-xs">
                              <span className={`w-1.5 h-1.5 rounded-full ${alert.severity === 'high' ? 'bg-[#ff4500]' :
                                alert.severity === 'medium' ? 'bg-orange-400' : 'bg-green-400'
                                }`}></span>
                              {alert.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[#a1a1aa] font-mono text-xs">{alert.source_ip}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-medium tracking-wider ${alert.processed
                              ? 'bg-[#1a1a1e] text-[#a1a1aa] border border-[#27272a]'
                              : 'bg-[rgba(255,69,0,0.1)] text-[#ff4500] border border-[rgba(255,69,0,0.3)]'
                              }`}>
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
          </div>

        </div>
      </main>
    </div>
  );
}