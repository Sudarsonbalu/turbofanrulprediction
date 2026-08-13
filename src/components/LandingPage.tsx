import React from 'react';
import {
  Database,
  Cpu,
  Bot,
  ArrowRight,
  Shield,
  Check,
  Server,
  Lock,
  Layers,
  Activity,
  Code,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { TurbofanLogo } from './TurbofanLogo';
import { EngineCutaway } from './EngineCutaway';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#16191C] font-sans antialiased selection:bg-[#A6362A]/20 selection:text-[#A6362A]">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#DDD8D3]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <TurbofanLogo size={26} showWordmark={true} />

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 font-sans text-xs text-[#5A594F]">
            <button
              onClick={() => scrollToSection('product')}
              className="hover:text-[#16191C] transition-colors cursor-pointer"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#16191C] transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('docs')}
              className="hover:text-[#16191C] transition-colors cursor-pointer"
            >
              Docs & API
            </button>
          </nav>

          {/* Primary CTA / Log in button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onEnterApp}
              className="px-4 py-2 bg-[#16191C] text-white hover:bg-[#2C3136] text-xs font-sans font-medium rounded-sm border border-[#16191C] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Log in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-12">
        {/* ========================================================================= */}
        {/* SECTION 1: PRODUCT (HERO & CAPABILITY STRIP) */}
        {/* ========================================================================= */}
        <section id="product" className="scroll-mt-16 bg-white border border-[#DDD8D3] rounded-sm overflow-hidden">
          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#DDD8D3]">
            {/* Left Column (55%) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-block font-mono text-xs uppercase tracking-wider text-[#A6362A] font-semibold">
                NASA C-MAPSS VALIDATED BENCHMARK
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[#16191C] leading-[1.15]">
                Turbomachinery Predictive Maintenance & Remaining Useful Life Intelligence
              </h1>

              <p className="text-sm md:text-base text-[#5A594F] leading-relaxed max-w-2xl font-normal">
                High-frequency multi-sensor telemetry diagnostics, machine learning cycle degradation forecasting, and Hermes AI agentic reasoning for commercial turbofan fleet reliability.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={onEnterApp}
                  className="px-5 py-2.5 bg-[#16191C] text-white hover:bg-[#2C3136] text-xs font-sans font-medium rounded-sm border border-[#16191C] transition-colors flex items-center gap-2 cursor-pointer shadow-none"
                >
                  <span>Analyze Fleet Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-xs font-sans font-medium text-[#16191C] underline underline-offset-4 hover:text-[#A6362A] transition-colors cursor-pointer"
                >
                  View System Architecture →
                </button>
              </div>
            </div>

            {/* Right Column (45%): Original Engine Cutaway SVG Illustration */}
            <div className="lg:col-span-5">
              <EngineCutaway />
            </div>
          </div>

          {/* Capability Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#DDD8D3] bg-[#FAF9F6]">
            <div className="p-5 space-y-1">
              <h4 className="font-sans text-xs font-semibold text-[#16191C] uppercase tracking-wide">
                C-MAPSS Telemetry Ingestion
              </h4>
              <p className="text-xs text-[#5A594F] leading-relaxed">
                Automated parsing and 21-sensor profiling for NASA run-to-failure benchmark datasets with missing value validation.
              </p>
            </div>

            <div className="p-5 space-y-1">
              <h4 className="font-sans text-xs font-semibold text-[#16191C] uppercase tracking-wide">
                ML RUL Predictive Engine
              </h4>
              <p className="text-xs text-[#5A594F] leading-relaxed">
                Dual-model evaluation using Random Forest and Linear Regression with rolling statistical feature extraction.
              </p>
            </div>

            <div className="p-5 space-y-1">
              <h4 className="font-sans text-xs font-semibold text-[#16191C] uppercase tracking-wide">
                Hermes AI Diagnostic Agent
              </h4>
              <p className="text-xs text-[#5A594F] leading-relaxed">
                Read-only tool protocol enabling autonomous agentic reasoning over fleet risk states and telemetry anomalies.
              </p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 2: HOW IT WORKS (REAL PIPELINE PHASES) */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="scroll-mt-16 bg-white border border-[#DDD8D3] rounded-sm p-6 md:p-8 space-y-6">
          <div className="border-b border-[#DDD8D3] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] text-[#A6362A] font-semibold uppercase tracking-wider block">
                SYSTEM PIPELINE ARCHITECTURE
              </span>
              <h2 className="text-xl font-semibold text-[#16191C] tracking-tight">
                How TurbofanAI Works: The 3-Phase Execution Engine
              </h2>
            </div>
            <span className="font-mono text-xs text-[#5A594F]">
              NASA C-MAPSS FD001 SPECIFICATION
            </span>
          </div>

          <div className="divide-y divide-[#DDD8D3]">
            {/* Phase 1 */}
            <div className="py-6 first:pt-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 flex items-start gap-3">
                <div className="w-9 h-9 bg-[#FAF9F6] border border-[#DDD8D3] flex items-center justify-center text-[#16191C] shrink-0 rounded-sm">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-semibold text-[#A6362A] uppercase tracking-wider block">
                    PHASE 1
                  </span>
                  <h3 className="text-base font-semibold text-[#16191C] font-sans">
                    Dataset Workspace & Quality
                  </h3>
                </div>
              </div>

              <div className="md:col-span-8 space-y-3 text-xs text-[#5A594F]">
                <p className="text-[#16191C] font-normal leading-relaxed">
                  Ingests and parses raw space-separated text logs (`train_FD001.txt`) or CSV files into structured numeric matrices. Runs automated row-by-row quality inspections before downstream predictive models execute.
                </p>
                <ul className="space-y-1.5 font-mono text-[11px] text-[#16191C]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2F6E5C] shrink-0" />
                    <span>21-sensor channel profiling with min/max/mean/variance metrics.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2F6E5C] shrink-0" />
                    <span>Quality checks for NaN, infinity values, non-positive cycles, and duplicate rows.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2F6E5C] shrink-0" />
                    <span>Raw row preview and instant dataset validation status assignment.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 flex items-start gap-3">
                <div className="w-9 h-9 bg-[#FAF9F6] border border-[#DDD8D3] flex items-center justify-center text-[#16191C] shrink-0 rounded-sm">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-semibold text-[#A6362A] uppercase tracking-wider block">
                    PHASE 2
                  </span>
                  <h3 className="text-base font-semibold text-[#16191C] font-sans">
                    ML RUL Predictive Pipeline
                  </h3>
                </div>
              </div>

              <div className="md:col-span-8 space-y-3 text-xs text-[#5A594F]">
                <p className="text-[#16191C] font-normal leading-relaxed">
                  Extracts strictly backward-looking rolling statistics, cumulative degradation deltas, and trend rates. Trains Random Forest and Ridge Linear Regression models on engine trajectories to forecast remaining cycles without data leakage.
                </p>
                <ul className="space-y-1.5 font-mono text-[11px] text-[#16191C]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2F6E5C] shrink-0" />
                    <span>Engine-aware 80/20 split preventing cross-unit contamination during training.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2F6E5C] shrink-0" />
                    <span>Automated optimal model selection based on MAE, RMSE, and R² score comparison.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2F6E5C] shrink-0" />
                    <span>Fleet risk classification: Critical ≤ 30 cycles, Warning ≤ 70 cycles, Healthy &gt; 70 cycles.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="py-6 last:pb-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 flex items-start gap-3">
                <div className="w-9 h-9 bg-[#FAF9F6] border border-[#DDD8D3] flex items-center justify-center text-[#16191C] shrink-0 rounded-sm">
                  <Bot className="w-4 h-4 text-[#A6362A]" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-semibold text-[#A6362A] uppercase tracking-wider block">
                    PHASE 3
                  </span>
                  <h3 className="text-base font-semibold text-[#16191C] font-sans">
                    Hermes AI Agentic Intelligence
                  </h3>
                </div>
              </div>

              <div className="md:col-span-8 space-y-3 text-xs text-[#5A594F]">
                <p className="text-[#16191C] font-normal leading-relaxed">
                  Integrates Nous Portal and Upstage Solar Pro 4 model reasoning over fleet risk states. Enforces a strict read-only tool call protocol so the AI agent accesses datasets without modifying records.
                </p>
                <ul className="space-y-1.5 font-mono text-[11px] text-[#16191C]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2F6E5C] shrink-0" />
                    <span>9 authenticated read-only tool definitions (`get_engine_details`, `compare_engines`, etc.).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2F6E5C] shrink-0" />
                    <span>Server-side API key proxying preventing credentials from reaching browser code.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2F6E5C] shrink-0" />
                    <span>Deterministic fallback runner when offline or local proxy disconnected.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 3: DOCS & API REFERENCE */}
        {/* ========================================================================= */}
        <section id="docs" className="scroll-mt-16 bg-white border border-[#DDD8D3] rounded-sm p-6 md:p-8 space-y-6">
          <div className="border-b border-[#DDD8D3] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] text-[#2F6E5C] font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" /> API ENDPOINT SPECIFICATION
              </span>
              <h2 className="text-xl font-semibold text-[#16191C] tracking-tight">
                Express Server API Reference (`server.ts`)
              </h2>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#5A594F] bg-[#FAF9F6] border border-[#DDD8D3] px-2.5 py-1">
              <Lock className="w-3.5 h-3.5 text-[#2F6E5C]" />
              <span>Hermes Routes Proxied Server-Side (No Client API Keys Exposed)</span>
            </div>
          </div>

          {/* Group 1: Datasets */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase text-[#16191C] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#16191C]" />
              <span>Phase 1 — Dataset Endpoints</span>
            </h3>

            <div className="overflow-x-auto border border-[#DDD8D3] rounded-none">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3] w-24">Method</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3] w-64">Endpoint Path</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#2F6E5C]">POST</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/dataset/upload</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Upload and parse raw C-MAPSS text/CSV telemetry log file.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#2F6E5C]">POST</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/dataset/sample</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Seed official NASA C-MAPSS 100-engine FD001 benchmark dataset.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/datasets</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">List all uploaded datasets in current workspace.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/dataset/:id</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Retrieve summary metadata for a specific dataset ID.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/dataset/:id/preview</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Fetch preview of raw dataset observations (default first 20 rows).</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/dataset/:id/quality</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Retrieve data quality report (NaN check, row duplicates, invalid values).</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/dataset/:id/columns</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Get statistical column profiling (min/max/mean/types/null counts).</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#A6362A]">DELETE</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#A6362A]">/api/dataset/:id</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Permanently remove uploaded dataset from server disk storage.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Group 2: Analysis */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono font-semibold uppercase text-[#16191C] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#16191C]" />
              <span>Phase 2 — Telemetry & Sensor Analysis Endpoints</span>
            </h3>

            <div className="overflow-x-auto border border-[#DDD8D3] rounded-none">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3] w-24">Method</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3] w-64">Endpoint Path</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#2F6E5C]">POST</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/analysis/run</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Trigger full multi-sensor variance and correlation matrix calculation.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/analysis/:dataset_id</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Fetch cached analysis summary for active dataset.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/analysis/:id/sensors</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Retrieve sensor variance, standard deviation, and min/max statistics.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/analysis/:id/correlation</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Get 21-sensor Pearson correlation coefficient matrix.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/analysis/:id/engines/:engine_id</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Get per-engine cycle history and sensor degradation trajectory.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Group 3: ML RUL Prediction */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono font-semibold uppercase text-[#16191C] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#16191C]" />
              <span>Phase 2 — ML RUL Predictive Endpoints</span>
            </h3>

            <div className="overflow-x-auto border border-[#DDD8D3] rounded-none">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3] w-24">Method</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3] w-64">Endpoint Path</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#2F6E5C]">POST</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/prediction/train</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Train Random Forest & Ridge Regression models with hyperparameter config.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#2F6E5C]">POST</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/prediction/run</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Execute full predictive pipeline and update fleet risk classification.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/prediction/:id/results</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Fetch cached engine RUL predictions and risk buckets.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/prediction/:id/metrics</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Get model evaluation metrics (MAE, RMSE, R² score).</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/prediction/:id/model-comparison</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Retrieve Random Forest vs. Linear Regression comparative matrix.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/prediction/:id/feature-importance</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Get feature predictive weights derived from variance gain.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Group 4: Hermes Agent */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono font-semibold uppercase text-[#16191C] flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#A6362A]" />
              <span>Phase 3 — Hermes AI Copilot Endpoints</span>
            </h3>

            <div className="overflow-x-auto border border-[#DDD8D3] rounded-none">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#DDD8D3] bg-[#FAF9F6] text-[#5A594F] uppercase text-[10px]">
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3] w-24">Method</th>
                    <th className="py-2.5 px-3 border-r border-[#DDD8D3] w-64">Endpoint Path</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8D3] bg-white text-[#16191C]">
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/hermes/status</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Check local Hermes proxy connection and provider status.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#16191C]">GET</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/hermes/capabilities</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">List authorized read-only tool protocols (`get_engine_details`, etc.).</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#2F6E5C]">POST</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/hermes/chat</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Process natural language diagnostic prompt with read-only tool calls.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#2F6E5C]">POST</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/hermes/analyze-engine</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Agentic evaluation of engine degradation trajectories and RUL risk.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold text-[#2F6E5C]">POST</td>
                    <td className="py-2 px-3 border-r border-[#DDD8D3] font-semibold">/api/hermes/compare-engines</td>
                    <td className="py-2 px-3 text-[#5A594F] font-sans text-[11px]">Agentic fleet risk ranking identifying critical turbofan units.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Developer Credits Section */}
        <section className="bg-white border border-[#DDD8D3] rounded-sm p-6 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 border-b border-[#DDD8D3] pb-2">
            <User className="w-4 h-4 text-[#A6362A]" />
            <h3 className="font-semibold text-[#16191C] uppercase text-xs">
              DEVELOPER & SYSTEM CREDITS
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm space-y-1">
              <span className="text-[#5A594F] text-[10px] uppercase block">Lead Developer</span>
              <span className="text-[#16191C] font-bold text-sm block">Sudarson B</span>
              <span className="text-[#A6362A] text-[11px] font-medium block">AI & DS Student</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm space-y-1">
              <span className="text-[#5A594F] text-[10px] uppercase block flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#16191C]" /> Direct Email
              </span>
              <a href="mailto:sudarsonbalu@gmail.com" className="text-[#16191C] font-semibold underline block hover:text-[#A6362A] transition-colors">
                sudarsonbalu@gmail.com
              </a>
              <span className="text-[#5A594F] text-[10px] block">Official Developer Contact</span>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#DDD8D3] rounded-sm space-y-1">
              <span className="text-[#5A594F] text-[10px] uppercase block flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#16191C]" /> Mobile Number
              </span>
              <a href="tel:+919361138890" className="text-[#16191C] font-semibold block hover:text-[#A6362A] transition-colors">
                +91 9361138890
              </a>
              <span className="text-[#5A594F] text-[10px] block">Verified Contact Line</span>
            </div>
          </div>
        </section>
      </main>

      {/* Landing Footer */}
      <footer className="border-t border-[#DDD8D3] bg-white mt-12 py-8 text-xs font-mono text-[#5A594F]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <TurbofanLogo size={22} showWordmark={true} />
            <span className="hidden sm:inline">•</span>
            <span>Developed by <strong className="text-[#16191C]">Sudarson B</strong> (AI&DS)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span>sudarsonbalu@gmail.com</span>
            <span>•</span>
            <span>+91 9361138890</span>
            <span>•</span>
            <button onClick={onEnterApp} className="text-[#16191C] font-semibold underline cursor-pointer">
              Launch Platform →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
