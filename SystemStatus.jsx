import React, { useState, useEffect } from 'react';
import { getSystemStatus } from '../services/api';
import { CheckCircle2, XCircle, RefreshCw, Key, Database, Activity, ShieldAlert } from 'lucide-react';

export default function SystemStatus({ onStatusVerified }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSystemStatus();
      setStatusData(response.data);
      if (response.data.status === 'fully_operational') {
        onStatusVerified(true, response.data.secret_code);
      } else {
        onStatusVerified(false, null);
      }
    } catch (err) {
      console.error(err);
      setError('System Error - Verification Offline');
      setStatusData(null);
      onStatusVerified(false, null);
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkStatus();
    // Poll system status every 15 seconds to track heartbeat and updates
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const isOperational = statusData && statusData.status === 'fully_operational';

  return (
    <div className="w-full max-w-7xl mx-auto mb-6 px-4 mt-6">
      
      {/* Banner / Alert Box */}
      <div className={`p-4 rounded-xl border mb-6 transition-all duration-300 ${
        isOperational 
          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
          : 'bg-red-50 border-red-300 text-red-900 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isOperational ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
            )}
            <div>
              <h2 className="font-bold text-base tracking-wide text-slate-800">
                {isOperational ? 'Database Verification & Heartbeat Succeeded' : 'System Error - Verification Offline'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {isOperational 
                  ? 'Key fragments combined from PostgreSQL and SQLite. Daemon worker heartbeat is fresh.'
                  : 'Checks failed. Verify PostgreSQL configuration seeds or confirm background scheduler thread is running.'}
              </p>
            </div>
          </div>
          {isOperational && statusData.secret_code && (
            <div className="bg-white px-4 py-2 rounded-lg border-2 border-emerald-400 shadow-sm shrink-0 w-full md:w-auto text-center md:text-left">
              <span className="text-[9px] text-[#128807] block font-extrabold uppercase tracking-wider">Secret Clearance Code</span>
              <code className="text-sm font-mono font-extrabold text-[#0D5C3A] tracking-wider select-all">
                {statusData.secret_code}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* System Diagnostics Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0F2C59]" />
            <h3 className="font-bold text-slate-800 text-sm md:text-base">System Gateway Diagnostic Checks</h3>
          </div>
          <button 
            onClick={checkStatus} 
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Checks
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Key A Check */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 flex items-start gap-3">
            <Key className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-700">PostgreSQL Config</span>
                {statusData?.checks?.key_a_present ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-red-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Failed
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Key A read successfully from system_config.</p>
            </div>
          </div>

          {/* Key B Check */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 flex items-start gap-3">
            <Database className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-700">SQLite Vault Key</span>
                {statusData?.checks?.key_b_present ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-red-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Failed
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Key B fragment resolved from vault_keys.</p>
            </div>
          </div>

          {/* Heartbeat Check */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 flex items-start gap-3">
            <Activity className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-700">Scheduler Heartbeat</span>
                {statusData?.checks?.heartbeat_fresh ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-red-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Inactive
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {statusData?.time_diff_seconds !== null && statusData?.time_diff_seconds !== undefined
                  ? `Last heartbeat tick: ${Math.round(statusData.time_diff_seconds)} seconds ago.`
                  : "Worker heartbeat timestamp stale or offline."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 text-[9px] text-slate-400 border-t border-slate-100 pt-3">
          <span>Encryption: AES-256-CBC Decryption enabled using SHA-256 key hashing</span>
          <span>Last Diagnostic Sync: {lastChecked || 'None'}</span>
        </div>
      </div>
    </div>
  );
}
