import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { DetectedDefect, JointEvaluation } from "../types";

interface DefectInspectorPanelProps {
  defects: DetectedDefect[];
  overallEvaluation: JointEvaluation;
  verdictSummary: string;
  weldQualityGrade: string;
  selectedDefectId: string | null;
  onSelectDefect: (id: string | null) => void;
  onViewReport: () => void;
}

export const DefectInspectorPanel: React.FC<DefectInspectorPanelProps> = ({
  defects,
  overallEvaluation,
  verdictSummary,
  weldQualityGrade,
  selectedDefectId,
  onSelectDefect,
  onViewReport,
}) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [expandedDefectId, setExpandedDefectId] = useState<string | null>(null);

  // Grouping defects by severity
  const criticalCount = defects.filter((d) => d.severity === "CRITICAL_REJECT").length;
  const repairCount = defects.filter((d) => d.severity === "MODERATE_REPAIR").length;
  const minorCount = defects.filter((d) => d.severity === "ACCEPTABLE_MINOR").length;

  // Filtered defects
  const filteredDefects = defects.filter((d) => {
    if (filterType === "ALL") return true;
    if (filterType === "REJECT") return d.severity === "CRITICAL_REJECT";
    if (filterType === "REPAIR") return d.severity === "MODERATE_REPAIR";
    return d.type === filterType;
  });

  const getDefectTypeBadge = (type: string) => {
    switch (type) {
      case "crack":
        return "bg-rose-950/80 text-rose-300 border-rose-800";
      case "porosity":
        return "bg-blue-950/80 text-blue-300 border-blue-800";
      case "slag_inclusion":
        return "bg-amber-950/80 text-amber-300 border-amber-800";
      case "lack_of_fusion":
      case "lack_of_penetration":
        return "bg-purple-950/80 text-purple-300 border-purple-800";
      case "shrinkage_cavity":
        return "bg-orange-950/80 text-orange-300 border-orange-800";
      case "corrosion_wall_loss":
        return "bg-red-950/80 text-red-300 border-red-800";
      default:
        return "bg-slate-900 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      
      {/* Overall Joint Evaluation Card Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Joint Evaluation Verdict
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            {weldQualityGrade}
          </span>
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            overallEvaluation === "REJECTED"
              ? "bg-rose-950/40 border-rose-800/80 text-rose-200"
              : overallEvaluation === "CONDITIONAL_REPAIR"
              ? "bg-amber-950/40 border-amber-800/80 text-amber-200"
              : "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
          }`}
        >
          {overallEvaluation === "REJECTED" ? (
            <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
          ) : overallEvaluation === "CONDITIONAL_REPAIR" ? (
            <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-wide">
                {overallEvaluation === "REJECTED"
                  ? "JOINT REJECTED (REPAIR REQUIRED)"
                  : overallEvaluation === "CONDITIONAL_REPAIR"
                  ? "CONDITIONAL ACCEPTANCE / REWORK"
                  : "JOINT ACCEPTED (CODE COMPLIANT)"}
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
              {verdictSummary}
            </p>
          </div>
        </div>

        {/* Metric counts */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-md p-1.5">
            <div className="text-base font-bold font-mono text-rose-400">{criticalCount}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Rejectable</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-md p-1.5">
            <div className="text-base font-bold font-mono text-amber-400">{repairCount}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Repairable</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-md p-1.5">
            <div className="text-base font-bold font-mono text-emerald-400">{minorCount}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Acceptable</div>
          </div>
        </div>
      </div>

      {/* Discontinuity Findings Subheader & Filter */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono font-semibold text-slate-200">
            Detected Discontinuities ({defects.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 text-slate-300 font-mono text-[11px] rounded border border-slate-800 px-1.5 py-0.5 focus:outline-none"
          >
            <option value="ALL">All ({defects.length})</option>
            <option value="REJECT">Rejectable ({criticalCount})</option>
            <option value="REPAIR">Repairable ({repairCount})</option>
            <option value="crack">Cracks</option>
            <option value="porosity">Porosity</option>
            <option value="slag_inclusion">Slag</option>
            <option value="lack_of_fusion">Lack of Fusion</option>
            <option value="lack_of_penetration">Lack of Pen.</option>
            <option value="shrinkage_cavity">Shrinkage</option>
            <option value="corrosion_wall_loss">Corrosion</option>
          </select>
        </div>
      </div>

      {/* Discontinuity Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredDefects.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No discontinuities found matching the selected filter.
          </div>
        ) : (
          filteredDefects.map((defect) => {
            const isSelected = selectedDefectId === defect.id;
            const isExpanded = expandedDefectId === defect.id || isSelected;

            return (
              <div
                key={defect.id}
                onClick={() => onSelectDefect(isSelected ? null : defect.id)}
                className={`rounded-lg border p-3 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-400/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                {/* Card Title Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-white">
                        {defect.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getDefectTypeBadge(
                          defect.type
                        )}`}
                      >
                        {defect.type.replace(/_/g, " ").toUpperCase()}
                      </span>
                      {defect.subtype && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-800/60">
                          {defect.subtype}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          defect.severity === "CRITICAL_REJECT"
                            ? "bg-rose-950 text-rose-300"
                            : defect.severity === "MODERATE_REPAIR"
                            ? "bg-amber-950 text-amber-300"
                            : "bg-emerald-950 text-emerald-300"
                        }`}
                      >
                        {defect.severity === "CRITICAL_REJECT" ? "REJECT" : defect.severity === "MODERATE_REPAIR" ? "REPAIR" : "ACCEPT"}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 mt-1">
                      {defect.label}
                    </h4>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedDefectId(isExpanded ? null : defect.id);
                    }}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Key Technical Properties */}
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/70 text-[11px] font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">STATION:</span>
                    <span>{defect.location.station_x_mm} mm ({defect.location.weld_zone})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">SIZE (L x W):</span>
                    <span className="text-cyan-300 font-semibold">{defect.dimensions.length_mm} × {defect.dimensions.width_mm} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">DENSITY:</span>
                    <span>{defect.optical_density.defect_od} D (Δ{parseFloat((defect.optical_density.defect_od - defect.optical_density.film_background_od).toFixed(2))})</span>
                  </div>
                </div>

                {/* Expanded Details: Code reference, metallurgical cause, repair plan */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-2 text-xs">
                    
                    {/* Code rule */}
                    <div className="bg-slate-900/90 rounded p-2 border border-slate-800">
                      <div className="text-[10px] font-mono text-cyan-400 font-bold">
                        STANDARD EVALUATION ({defect.standard_compliance.standard}):
                      </div>
                      <div className="text-slate-300 text-[11px] mt-0.5">
                        <span className="font-semibold text-slate-200">{defect.standard_compliance.code_reference}: </span>
                        {defect.standard_compliance.reason}
                      </div>
                    </div>

                    {/* Root Cause */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        Metallurgical Root Cause:
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                        {defect.metallurgical_cause}
                      </p>
                    </div>

                    {/* Repair Recommendation */}
                    <div className="bg-amber-950/20 border border-amber-900/50 rounded p-2">
                      <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono font-bold">
                        <Wrench className="w-3 h-3" />
                        <span>REPAIR ACTION REQUIRED:</span>
                      </div>
                      <p className="text-slate-200 text-[11px] mt-0.5 leading-relaxed">
                        {defect.repair_recommendation}
                      </p>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Button to View Full Formal Report */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <button
          onClick={onViewReport}
          className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white text-xs font-mono font-bold rounded-lg shadow transition-all flex items-center justify-center gap-2"
        >
          <span>Generate Full NDT Radiographic Report</span>
        </button>
      </div>

    </div>
  );
};
