'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { API_BASE_URL } from '../../lib/config';

interface ReportItem {
  filename: string;
}

export default function ReportsPage() {
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Overview');

  // 1. Fetch the list of available text files on load
  useEffect(() => {
    fetch(API_BASE_URL + '/reports')
      .then(res => res.json())
      .then((data: ReportItem[]) => {
        setReportsList(data);
        if (data.length > 0) {
          handleSelectReport(data[0].filename);
        }
      })
      .catch(err => console.error("Failed to load reports index:", err));
  }, []);

  // 2. Fetch the specific file content when clicked
  const handleSelectReport = async (filename: string) => {
    setSelectedFilename(filename);
    setLoadingContent(true);
    setReportContent('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/reports/${filename}`);
      const data = await res.json();
      if (data.error) {
        setReportContent(data.error);
      } else {
        setReportContent(data.content);
      }
    } catch {
      setReportContent("Failed to fetch report content from backend.");
    } finally {
      setLoadingContent(false);
    }
  };

  // Helper to extract a clean title from the filename
  const formatIncidentTitle = (filename: string) => {
    const clean = filename.replace('report_', '').replace('.txt', '').split('_')[0];
    return `Incident - ${clean || 'Unknown'}`;
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-[#a1a1aa] font-sans antialiased overflow-hidden select-none">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* TOP HEADER */}
        <div className="px-8 pt-6 pb-4 border-b border-[#1f1f23]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-xs text-[#71717a] font-medium tracking-wide">
              <span>🏠</span> <span>›</span> <span>Incidents</span> <span>›</span> <span className="text-[#e4e4e7]">{selectedFilename ? selectedFilename.substring(0, 8) : 'Queue'}</span>
            </div>
            <button className="bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-xs font-medium text-[#f4f4f5] py-1.5 px-4 rounded transition flex items-center gap-2">
              Download report <span>↓</span>
            </button>
          </div>

          <h1 className="text-2xl font-semibold text-[#f4f4f5] tracking-tight mb-6">Incident details</h1>

          {/* METADATA INFO BAR */}
          {selectedFilename && (
            <div className="flex items-center justify-between text-[11px] font-mono border-t border-[#1f1f23] pt-4">
              <div className="flex gap-10">
                <div>
                  <p className="text-[#52525b] uppercase tracking-wider text-[10px] mb-0.5">Assignee</p>
                  <p className="text-[#e4e4e7] font-medium">Unassigned</p>
                </div>
                <div>
                  <p className="text-[#52525b] uppercase tracking-wider text-[10px] mb-0.5">Created</p>
                  <p className="text-[#e4e4e7] font-medium">2026-06-30</p>
                </div>
                <div>
                  <p className="text-[#52525b] uppercase tracking-wider text-[10px] mb-0.5">Fix Date</p>
                  <p className="text-[#e4e4e7] font-medium">N/A</p>
                </div>
                <div>
                  <p className="text-[#52525b] uppercase tracking-wider text-[10px] mb-0.5">Last Update</p>
                  <p className="text-[#e4e4e7] font-medium">Just now</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="px-2 py-1 bg-[#18181b] border border-[#27272a] rounded text-[#e4e4e7] cursor-pointer hover:bg-[#27272a]">
                  Contained ▾
                </span>
                <span className="px-2 py-1 bg-[#18181b] border border-[#27272a] rounded text-[#ef4444] font-semibold cursor-pointer hover:bg-[#27272a] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span> High ▾
                </span>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE WORKSPACE LAYOUT */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
          
          {/* LEFT INDEX: File Logs Selection */}
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
            <div className="bg-[#121214] border border-[#1f1f23] rounded-xl p-5 flex flex-col overflow-hidden shadow-2xl h-full">
              <h3 className="text-[#f4f4f5] text-xs font-semibold tracking-wider uppercase mb-3 text-[#71717a]">Available Target Items ({reportsList.length})</h3>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {reportsList.length === 0 ? (
                  <div className="text-xs text-[#52525b] py-8 text-center font-mono">No telemetry files indexed...</div>
                ) : (
                  reportsList.map((item) => (
                    <button
                      key={item.filename}
                      onClick={() => handleSelectReport(item.filename)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1 ${
                        selectedFilename === item.filename
                          ? 'bg-[#1c1917] border-[#ea580c]/50 text-white shadow-inner'
                          : 'bg-black/20 border-[#1f1f22] hover:border-[#3f3f46] text-[#a1a1aa]'
                      }`}
                    >
                      <span className="text-xs font-semibold tracking-tight text-[#e4e4e7]">
                        {formatIncidentTitle(item.filename)}
                      </span>
                      <span className="font-mono text-[10px] text-[#52525b] block truncate">
                        {item.filename}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT VIEWPORT: Content Reader Area */}
          <div className="lg:col-span-8 bg-[#121214] border border-[#1f1f23] rounded-xl flex flex-col overflow-hidden shadow-2xl">
            {selectedFilename ? (
              <div className="flex flex-col h-full">
                
                {/* TABS INTERFACE */}
                <div className="px-6 border-b border-[#1f1f23] bg-black/10 flex items-center justify-between shrink-0">
                  <div className="flex gap-2 pt-3">
                    {['Overview', 'Detections', 'Notes', 'Logs', 'Respond'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-t-md border-t border-x transition-all ${
                          activeTab === tab
                            ? 'bg-[#121214] border-[#1f1f23] text-white font-semibold'
                            : 'bg-transparent border-transparent text-[#52525b] hover:text-[#e4e4e7]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest">{formatIncidentTitle(selectedFilename)}</span>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6 flex flex-col">
                  
                  {/* COMPACT METADATA GRID */}
                  <div className="bg-black/20 border border-[#1f1f23] rounded-lg p-4 shrink-0">
                    <h4 className="text-[#e4e4e7] text-xs font-semibold mb-3">Target Node Context</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] font-mono">
                      <div><span className="text-[#52525b] block">Incident type:</span><span className="text-white font-medium">Finding</span></div>
                      <div><span className="text-[#52525b] block">Status:</span><span className="text-emerald-500 font-bold">Contained</span></div>
                      <div><span className="text-[#52525b] block">Origin Network:</span><span className="text-white font-medium">Cloud DB</span></div>
                      <div><span className="text-[#52525b] block">Core Detections:</span><span className="text-[#ea580c] font-bold">3 Analysis Blocks</span></div>
                    </div>
                  </div>

                  {/* FULL WIDTH LOG TEXT CONTAINER */}
                  <div className="flex flex-col flex-1 h-full min-h-0">
                    <h4 className="text-[#e4e4e7] text-xs font-semibold mb-2 uppercase tracking-wider text-[#52525b]">Raw Forensic String Compilation</h4>
                    <div className="bg-black/40 border border-[#1f1f22] rounded-lg p-5 font-mono text-[11px] leading-relaxed text-[#c9d1d9] flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
                      {loadingContent ? (
                        <div className="flex items-center justify-center h-full py-20 text-[#52525b] animate-pulse">
                          Reading direct disk allocation sectors...
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-[#a1a1aa] selection:bg-[#ea580c]/30">{reportContent}</pre>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#52525b] font-mono text-xs">
                <span>📁</span>
                <p className="mt-2">Select an item from the left tracking catalog.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}