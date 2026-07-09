'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Alerts', path: '/alerts' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <aside className="w-64 bg-[#111113] border-r border-[#1f1f22] flex flex-col justify-between shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8 text-white font-bold tracking-widest text-sm">
          <span>EDGE • SOC</span>
        </div>
        
        <nav className="space-y-2">
          {links.map((item) => (
            <button
              key={item.name}
              onClick={() => window.location.href = item.path}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition ${
                pathname === item.path 
                  ? 'bg-[#1a1a1e] text-white border-l-2 border-[#ff4500]' 
                  : 'text-[#71717a] hover:bg-[#1a1a1e] hover:text-white'
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}