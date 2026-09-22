import React, { useState } from "react";
import {
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { InspectionReport } from "../types";

interface InspectionReportModalProps {
  report: InspectionReport;
  onClose: () => void;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  report,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `
================================================================================
RADIOGRAPHIC EXAMINATION REPORT (NDT - RT)
Standard: ${report.component_info.standard}
Report ID: ${report.report_id} | Date: ${report.date}
Component: ${report.component_info.tag} (${report.component_info.joint_type})
Material: ${report.component_info.material} | Thickness: ${report.component_info.nominal_thickness_mm} mm
Verdict: ${report.overall_evaluation} - ${report.weld_quality_grade}
================================================================================
SUMMARY:
${report.verdict_summary}

DISCONTINUITIES DETECTED (${report.defects_found.length}):
${report.defects_found
  .map(
    (d, i) =>
      `[${i + 1}] ${d.id}: ${d.label}
   - Station: ${d.location.station_x_mm} mm (${d.location.weld_zone})
   - Size: ${d.dimensions.length_mm} x ${d.dimensions.width_mm} mm
   - Evaluation: ${d.standard_compliance.disposition} (${d.standard_compliance.code_reference})
   - Repair: ${d.repair_recommendation}`
  )
  .join("\n\n")}

REMEDIATION PLAN:
${report.remediation_plan.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Lead Inspector: ${report.inspector_name} (${report.certification})
================================================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.report_id}_NDT_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Container Dialog */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white text-slate-100 print:text-black">
        
        {/* Modal Action Bar (Hidden during print) */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-sm font-semibold text-white">
              Official Radiographic Examination Report #{report.report_id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              title="Print to PDF or Paper"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
              title="Export Raw Inspection Data as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formal Engineering Report Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 bg-slate-900 print:bg-white print:text-black print:p-0">
          
          {/* Engineering Header Block */}
          <div className="border-b-2 border-slate-700 print:border-black pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase print:text-black">
                  NON-DESTRUCTIVE TESTING EXAMINATION DIVISION
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-white print:text-black mt-1">
                  RADIOGRAPHIC TEST (RT) INSPECTION REPORT
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                  In accordance with ASME Section V Art. 2 / ASME Sec VIII Div 1 UW-51 / API 1104 / ISO 17636-1
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs space-y-1">
                <div>
                  <span className="text-slate-400 print:text-slate-600">REPORT NO: </span>
                  <span className="font-bold text-white print:text-black">{report.report_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600">DATE: </span>
                  <span className="text-white print:text-black">{report.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600">EXAM METHOD: </span>
                  <span className="text-cyan-400 print:text-black font-bold">RT (Film Radiography)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Joint Evaluation Verdict Ribbon */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:border-black ${
              report.overall_evaluation === "REJECTED"
                ? "bg-rose-950/40 border-rose-700/80 text-rose-200 print:bg-slate-100 print:text-black"
                : report.overall_evaluation === "CONDITIONAL_REPAIR"
                ? "bg-amber-950/40 border-amber-700/80 text-amber-200 print:bg-slate-100 print:text-black"
                : "bg-emerald-950/40 border-emerald-700/80 text-emerald-200 print:bg-slate-100 print:text-black"
            }`}
          >
            <div className="flex items-center gap-3">
              {report.overall_evaluation === "REJECTED" ? (
                <XCircle className="w-8 h-8 text-rose-400 print:text-black shrink-0" />
              ) : report.overall_evaluation === "CONDITIONAL_REPAIR" ? (
                <AlertTriangle className="w-8 h-8 text-amber-400 print:text-black shrink-0" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 print:text-black shrink-0" />
              )}
              <div>
                <div className="font-mono font-bold text-sm tracking-wider uppercase">
                  OVERALL JOINT DISPOSITION: {report.overall_evaluation}
                </div>
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                  {report.verdict_summary}
                </p>
              </div>
            </div>

            <div className="shrink-0 font-mono text-xs px-3 py-1.5 rounded bg-slate-950/80 print:bg-white print:border print:border-black text-cyan-300 print:text-black border border-slate-700">
              {report.weld_quality_grade}
            </div>
          </div>

          {/* Technical Data Grid: Component & Radiographic Technique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            
            {/* Component Specification Table */}
            <div className="border border-slate-800 print:border-black rounded-lg p-3.5 bg-slate-950/50 print:bg-white">
              <h3 className="font-bold text-cyan-400 print:text-black uppercase text-[11px] mb-2.5 pb-1 border-b border-slate-800 print:border-black">
                1. Test Piece & Component Data
              </h3>
              <div className="space-y-1.5 text-slate-300 print:text-black">
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Component Tag:</span>
                  <span className="font-semibold text-white print:text-black">{report.component_info.tag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Joint Configuration:</span>
                  <span>{report.component_info.joint_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Base Material:</span>
                  <span>{report.component_info.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Nominal Wall Thickness:</span>
                  <span>{report.component_info.nominal_thickness_mm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Welding Process:</span>
                  <span>{report.component_info.weld_process}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Governing Standard:</span>
                  <span className="font-bold text-cyan-400 print:text-black">{report.component_info.standard}</span>
                </div>
              </div>
            </div>

            {/* Radiographic Technique Specification Table */}
            <div className="border border-slate-800 print:border-black rounded-lg p-3.5 bg-slate-950/50 print:bg-white">
              <h3 className="font-bold text-cyan-400 print:text-black uppercase text-[11px] mb-2.5 pb-1 border-b border-slate-800 print:border-black">
                2. Radiographic Technique Record
              </h3>
              <div className="space-y-1.5 text-slate-300 print:text-black">
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Radiation Source:</span>
                  <span className="font-semibold text-white print:text-black">{report.radiographic_technique.radiation_source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Source to Film Distance (SFD):</span>
                  <span>{report.radiographic_technique.sfd_mm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Industrial Film Brand / Class:</span>
                  <span>{report.radiographic_technique.film_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">IQI (Penetrameter) Type:</span>
                  <span>{report.radiographic_technique.iqi_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Radiographic Sensitivity:</span>
                  <span className="text-emerald-400 print:text-black font-bold">
                    {report.radiographic_technique.sensitivity_achieved_percent}% (Compliant &lt; 2.0%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 print:text-slate-600">Mean Optical Density (H&D):</span>
                  <span>{report.radiographic_technique.average_optical_density} D</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Discontinuity Findings Table */}
          <div className="border border-slate-800 print:border-black rounded-lg overflow-hidden">
            <div className="bg-slate-950 print:bg-slate-100 px-4 py-2 border-b border-slate-800 print:border-black flex justify-between items-center">
              <h3 className="font-mono font-bold text-xs text-white print:text-black uppercase">
                3. Tabular Discontinuity Findings & Code Disposition
              </h3>
              <span className="font-mono text-[11px] text-slate-400 print:text-black">
                Total Indications: {report.defects_found.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950/80 print:bg-slate-200 text-slate-400 print:text-black border-b border-slate-800 print:border-black text-[11px]">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Type & Description</th>
                    <th className="p-2.5">Station (Zone)</th>
                    <th className="p-2.5">Size (L x W)</th>
                    <th className="p-2.5">Density</th>
                    <th className="p-2.5">Code Reference</th>
                    <th className="p-2.5">Disposition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-black">
                  {report.defects_found.map((d, index) => (
                    <tr key={d.id} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                      <td className="p-2.5 font-bold text-white print:text-black">{d.id}</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-200 print:text-black">{d.label}</span>
                          {d.subtype && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                              {d.subtype}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 print:text-slate-600 line-clamp-1">{d.location.description}</div>
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-slate-300 print:text-black">
                        {d.location.station_x_mm} mm <span className="text-[10px] opacity-75">({d.location.weld_zone})</span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-cyan-300 print:text-black font-semibold">
                        {d.dimensions.length_mm} × {d.dimensions.width_mm} mm
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-slate-300 print:text-black">
                        {d.optical_density.defect_od} D
                      </td>
                      <td className="p-2.5 text-[11px] text-slate-300 print:text-black">
                        {d.standard_compliance.code_reference}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.standard_compliance.disposition === "REJECT"
                              ? "bg-rose-950 text-rose-300 border border-rose-800 print:text-black"
                              : d.standard_compliance.disposition === "REPAIR_REQUIRED"
                              ? "bg-amber-950 text-amber-300 border border-amber-800 print:text-black"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800 print:text-black"
                          }`}
                        >
                          {d.standard_compliance.disposition}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Corrective Action & Repair Protocol */}
          <div className="border border-slate-800 print:border-black rounded-lg p-4 bg-slate-950/40 print:bg-white text-xs font-mono">
            <h3 className="font-bold text-cyan-400 print:text-black uppercase text-[11px] mb-2 pb-1 border-b border-slate-800 print:border-black">
              4. Certified Remediation & Weld Repair Sequence
            </h3>
            <ol className="space-y-1.5 text-slate-300 print:text-black list-decimal list-inside leading-relaxed">
              {report.remediation_plan.map((step, idx) => (
                <li key={idx} className="pl-1">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Certification Signature & Stamp Footer */}
          <div className="pt-6 border-t border-slate-800 print:border-black grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-mono">
            <div>
              <div className="text-slate-400 print:text-slate-600 text-[11px] mb-1">
                DISCLAIMER & REGULATORY COMPLIANCE:
              </div>
              <p className="text-[10px] text-slate-500 print:text-slate-700 leading-normal">
                {report.disclaimer}
              </p>
            </div>

            <div className="flex flex-col sm:items-end justify-end space-y-1">
              <div className="w-56 border-b border-slate-600 print:border-black pb-1 text-center font-bold text-white print:text-black">
                {report.inspector_name}
              </div>
              <div className="text-[11px] text-cyan-400 print:text-black font-bold">
                {report.certification}
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600">
                Official ASNT / ISO 9712 Examination Record
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
