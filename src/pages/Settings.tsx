import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bot,
  Sliders,
  Shield,
  RefreshCw,
  CheckCircle2,
  Save
} from 'lucide-react';
import { fetchHermesStatus } from '../services/hermesApi';
import { HermesStatusResponse } from '../../backend/app/hermes/schemas';

export const SettingsPage: React.FC = () => {
  const [hermesStatus, setHermesStatus] = useState<HermesStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  // Editable settings state
  const [criticalThreshold, setCriticalThreshold] = useState<number>(30);
  const [warningThreshold, setWarningThreshold] = useState<number>(70);
  const [nEstimators, setNEstimators] = useState<number>(15);
  const [maxDepth, setMaxDepth] = useState<number>(8);
  const [readOnlyMode, setReadOnlyMode] = useState<boolean>(true);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetchHermesStatus();
      setHermesStatus(res);
    } catch {
      setHermesStatus({
        status: 'OFFLINE',
        enabled: true,
        provider: 'Nous Portal',
        model: 'upstage/solar-pro4',
        message: 'Unreachable',
        base_url: 'http://127.0.0.1:8650/v1',
        capabilities: []
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DDD8D3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#16191C] text-white rounded-none">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-xs font-mono text-[#5A594F]">C-MAPSS MRO Console</span>
          </div>
          <h1 className="text-xl font-semibold text-[#16191C] tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#16191C]" />
            <span>Platform Parameters & System Settings</span>
          </h1>
          <p className="text-xs text-[#5A594F] mt-0.5 font-mono">
            Configure RUL prediction risk thresholds, Hermes AI tool enforcement, and environment parameters.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-[#16191C] text-white hover:bg-[#2C3136] text-xs font-sans font-medium rounded-sm border border-[#16191C] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#2F6E5C]" />
              <span>SETTINGS SAVED</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>SAVE CONFIGURATION</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML RUL Threshold Configuration */}
        <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD8D3] pb-3">
            <h3 className="text-xs font-semibold text-[#16191C] flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4 text-[#16191C]" />
              <span>RUL Predictive Thresholds & Parameters</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-[#16191C] font-semibold block text-[11px] uppercase">
                Critical Risk Threshold (Cycles):
              </label>
              <input
                type="number"
                value={criticalThreshold}
                onChange={e => setCriticalThreshold(Number(e.target.value))}
                className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-3 py-1.5 text-[#A6362A] font-bold focus:outline-none"
              />
              <p className="text-[10px] text-[#5A594F]">
                Engines with predicted RUL at or below this value are classified as CRITICAL (red).
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[#16191C] font-semibold block text-[11px] uppercase">
                Warning Risk Threshold (Cycles):
              </label>
              <input
                type="number"
                value={warningThreshold}
                onChange={e => setWarningThreshold(Number(e.target.value))}
                className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-3 py-1.5 text-[#B8791A] font-bold focus:outline-none"
              />
              <p className="text-[10px] text-[#5A594F]">
                Engines with predicted RUL between critical and warning values are marked as WARNING (amber).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[#16191C] font-semibold block text-[11px] uppercase">
                  RF Estimators:
                </label>
                <input
                  type="number"
                  value={nEstimators}
                  onChange={e => setNEstimators(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-3 py-1.5 text-[#16191C] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#16191C] font-semibold block text-[11px] uppercase">
                  RF Max Depth:
                </label>
                <input
                  type="number"
                  value={maxDepth}
                  onChange={e => setMaxDepth(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] border border-[#DDD8D3] rounded-none px-3 py-1.5 text-[#16191C] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hermes Agent Integration Status */}
        <div className="bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD8D3] pb-3">
            <h3 className="text-xs font-semibold text-[#16191C] flex items-center gap-2 font-mono">
              <Bot className="w-4 h-4 text-[#A6362A]" />
              <span>Hermes Agent Protocol Status</span>
            </h3>
            <button
              onClick={loadStatus}
              className="p-1 text-[#5A594F] hover:text-[#16191C]"
              title="Re-check Hermes Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#5A594F]">Connection:</span>
                <span
                  className={`font-semibold ${
                    hermesStatus?.status === 'CONNECTED' || hermesStatus?.status === 'ONLINE'
                      ? 'text-[#2F6E5C]'
                      : 'text-[#B8791A]'
                  }`}
                >
                  {hermesStatus?.status || 'OFFLINE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5A594F]">Base URL:</span>
                <span className="text-[#16191C]">{hermesStatus?.base_url || 'http://127.0.0.1:8650/v1'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5A594F]">Model:</span>
                <span className="text-[#A6362A] font-semibold">{hermesStatus?.model || 'upstage/solar-pro4'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#DDD8D3]">
              <div>
                <span className="text-[#16191C] font-semibold block font-sans">Read-Only Tool Protocol</span>
                <span className="text-[10px] text-[#5A594F] block">
                  Restricts Hermes Agent strictly to read-only database queries.
                </span>
              </div>
              <input
                type="checkbox"
                checked={readOnlyMode}
                onChange={e => setReadOnlyMode(e.target.checked)}
                className="w-4 h-4 accent-[#16191C] rounded-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Security & Environment Setup */}
        <div className="lg:col-span-2 bg-white border border-[#DDD8D3] rounded-sm p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#DDD8D3] pb-3">
            <Shield className="w-4 h-4 text-[#2F6E5C]" />
            <h3 className="text-xs font-semibold text-[#16191C] font-mono">
              Environment Variables & Service Binding
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] space-y-1">
              <span className="text-[#5A594F] block font-semibold">HERMES_BASE_URL</span>
              <code className="text-[#16191C] text-[11px] font-bold">http://127.0.0.1:8650/v1</code>
              <p className="text-[10px] text-[#5A594F]">Local Hermes Proxy OpenAI-compatible endpoint</p>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] space-y-1">
              <span className="text-[#5A594F] block font-semibold">HERMES_API_KEY</span>
              <code className="text-[#B8791A] text-[11px] font-bold">sk-unused</code>
              <p className="text-[10px] text-[#5A594F]">Server-side proxy authentication credential</p>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] space-y-1">
              <span className="text-[#5A594F] block font-semibold">HERMES_MODEL</span>
              <code className="text-[#A6362A] text-[11px] font-bold">upstage/solar-pro4</code>
              <p className="text-[10px] text-[#5A594F]">Target Nous Portal model alias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
