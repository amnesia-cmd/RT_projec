import React from "react";
import { Scan, FileText, BookOpen, ShieldCheck, Activity } from "lucide-react";

interface HeaderProps {
  activeTab: "workspace" | "report" | "atlas";
  setActiveTab: (tab: "workspace" | "report" | "atlas") => void;
  hasReport: boolean;
  standard: string;
  setStandard: (std: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasReport,
  standard,
  setStandard,
}) => {
  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo and Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-white font-mono">
                  RT-SCAN DEFECT DETECTOR
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  ASME / API / ISO NDT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Radiographic Testing Film Interpretation & Automated Examination Reporting
              </p>
            </div>
          </div>

          {/* Standards & Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Standard Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="standard-selector" className="text-slate-400 font-medium whitespace-nowrap">Standard:</label>
              <select
                id="standard-selector"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="ASME_SEC_VIII" className="bg-slate-900 text-slate-200">
                  ASME Sec VIII Div 1 (UW-51/52)
                </option>
                <option value="API_1104" className="bg-slate-900 text-slate-200">
                  API 1104 (Welding of Pipelines)
                </option>
                <option value="ISO_5817" className="bg-slate-900 text-slate-200">
                  ISO 5817 Quality Level B
                </option>
                <option value="AWS_D1_1" className="bg-slate-900 text-slate-200">
                  AWS D1.1 (Structural Steel)
                </option>
              </select>
            </div>

            {/* Navigation Buttons */}
            <nav className="flex items-center rounded-lg bg-slate-950/80 p-1 border border-slate-800">
              <button
                id="tab-workspace"
                onClick={() => setActiveTab("workspace")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "workspace"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Scan Workspace</span>
              </button>

              <button
                id="tab-report"
                onClick={() => setActiveTab("report")}
                disabled={!hasReport}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  !hasReport
                    ? "text-slate-600 cursor-not-allowed"
                    : activeTab === "report"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
                title={hasReport ? "View detailed NDT report" : "Run an inspection to view report"}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Inspection Report</span>
              </button>

              <button
                id="tab-atlas"
                onClick={() => setActiveTab("atlas")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "atlas"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Defect Atlas</span>
              </button>
            </nav>

          </div>

        </div>
      </div>
    </header>
  );
};
