import React, { useState } from "react";
import { BookOpen, AlertCircle, CheckCircle, ShieldAlert, Sparkles, X, ChevronRight } from "lucide-react";
import { DEFECT_KNOWLEDGE_BASE, DefectTaxonomyItem } from "../data/samples";

interface DefectAtlasModalProps {
  onClose: () => void;
  onSelectSampleType?: (type: string) => void;
}

export const DefectAtlasModal: React.FC<DefectAtlasModalProps> = ({
  onClose,
  onSelectSampleType,
}) => {
  const [selectedItem, setSelectedItem] = useState<DefectTaxonomyItem>(DEFECT_KNOWLEDGE_BASE[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-base font-bold text-white">
                Radiographic Testing (RT) Defect Interpretation Atlas
              </h2>
              <p className="text-xs text-slate-400">
                Industry reference guide for weld & casting discontinuities under ASME, API 1104, and ISO 5817 standards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Navigation: Defect List */}
          <div className="w-full md:w-72 border-r border-slate-800 bg-slate-950/60 overflow-y-auto p-3 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1.5 font-bold">
              Discontinuity Classifications
            </div>

            {DEFECT_KNOWLEDGE_BASE.map((item) => {
              const isSelected = selectedItem.type === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-cyan-600 text-white font-bold shadow"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <span className="truncate">{item.name.split("(")[0].trim()}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-slate-600"}`} />
                </button>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/90">
            
            {/* Title Block */}
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wide">
                DISCONTINUITY TYPE: {selectedItem.type.replace(/_/g, " ")}
              </span>
              <h3 className="text-xl font-bold font-serif text-white mt-1">
                {selectedItem.name}
              </h3>
            </div>

            {/* Visual Appearance & Density Signature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Radiographic Film Appearance</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedItem.radiographicAppearance}
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Optical Density Signature (D)</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedItem.opticalDensitySignature}
                </p>
              </div>
            </div>

            {/* Typical Metallurgical Root Causes */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2.5">
                Typical Metallurgical & Welding Causes
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {selectedItem.typicalCauses.map((cause, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {cause}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rejection / Acceptance Criteria Standards Comparison */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Standard Acceptance & Rejection Limits
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="font-bold text-slate-200">ASME Section VIII Div 1: </span>
                  <span className="text-slate-300">{selectedItem.rejectionCriteria.asme}</span>
                </div>

                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="font-bold text-slate-200">API Standard 1104: </span>
                  <span className="text-slate-300">{selectedItem.rejectionCriteria.api1104}</span>
                </div>

                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="font-bold text-slate-200">ISO 5817 Quality Levels: </span>
                  <span className="text-slate-300">{selectedItem.rejectionCriteria.iso5817}</span>
                </div>
              </div>
            </div>

            {/* Radiographer's Differentiation Tip */}
            <div className="bg-cyan-950/30 border border-cyan-800/60 rounded-xl p-4">
              <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase mb-1">
                Radiographer's Differentiation Tip
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedItem.differentiationTips}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
