"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/config";

export default function HealthMonitor() {
  const [health, setHealth] = useState({
    status: "CHECKING",
    status_code: 0,
    latency_ms: 0,
  });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch(API_BASE_URL + "/health-status");
        const data = await res.json();
        setHealth(data);
      } catch (error) {
        console.error("Health check failed:", error);
        setHealth({ status: "DOWN", status_code: 0, latency_ms: 0 });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (health.status === "UP") return "text-green-500";
    if (health.status === "DEGRADED") return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-md w-80">
      <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">
        System Health
      </h3>
      
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-3xl font-bold ${getStatusColor()}`}>
            {health.status}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            HTTP {health.status_code !== 0 ? health.status_code : "ERROR"}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-mono text-white">
            {health.latency_ms}<span className="text-sm text-gray-500">ms</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">Latency</p>
        </div>
      </div>
    </div>
  );
}