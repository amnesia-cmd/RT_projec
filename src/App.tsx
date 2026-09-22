import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { FilmViewer } from "./components/FilmViewer";
import { DefectInspectorPanel } from "./components/DefectInspectorPanel";
import { ScanUploader } from "./components/ScanUploader";
import { InspectionReportModal } from "./components/InspectionReportModal";
import { DefectAtlasModal } from "./components/DefectAtlasModal";
import { SAMPLE_RADIOGRAPHS } from "./data/samples";
import { ComponentInfo, InspectionReport, SampleRadiograph, DetectedDefect } from "./types";
import { convertToRasterImageDataUrl } from "./utils/imageUtils";
import { Sparkles, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"workspace" | "report" | "atlas">("workspace");
  const [currentImage, setCurrentImage] = useState<string>(SAMPLE_RADIOGRAPHS[0].imageUrl);
  const [selectedDefectId, setSelectedDefectId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Standard selector state
  const [standard, setStandard] = useState<"ASME_SEC_VIII" | "API_1104" | "ISO_5817" | "AWS_D1_1">(
    "ASME_SEC_VIII"
  );

  // Component Specification
  const [componentInfo, setComponentInfo] = useState<ComponentInfo>({
    tag: "WELD-JOINT-CRACK-01",
    joint_type: SAMPLE_RADIOGRAPHS[0].jointType,
    material: SAMPLE_RADIOGRAPHS[0].material,
    nominal_thickness_mm: SAMPLE_RADIOGRAPHS[0].thickness,
    weld_process: "GTAW Root + SMAW Fill/Cap (E7018)",
    standard: "ASME_SEC_VIII",
    diameter_nps: '12" NPS Schedule 80',
  });

  // Current Inspection Report
  const [inspectionReport, setInspectionReport] = useState<InspectionReport | null>(null);

  // Run initial interpretation on mount so the user has immediate insights
  useEffect(() => {
    handleRunAnalysis(SAMPLE_RADIOGRAPHS[0].imageUrl, {
      ...componentInfo,
      standard: standard,
    });
  }, []);

  // Update component info when standard selector in header changes
  useEffect(() => {
    setComponentInfo((prev) => ({
      ...prev,
      standard: standard,
    }));
  }, [standard]);

  // Main AI interpretation execution
  const handleRunAnalysis = async (
    imageToAnalyze: string = currentImage,
    spec: ComponentInfo = componentInfo
  ) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Ensure image is converted to raster JPEG if it's an SVG data URI
      const { dataUrl: preparedImage, mimeType: preparedMimeType } = await convertToRasterImageDataUrl(imageToAnalyze);

      const response = await fetch("/api/inspect-rt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: preparedImage,
          mimeType: preparedMimeType,
          componentInfo: {
            ...spec,
            standard: standard,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.report) {
        setInspectionReport(data.report);
      } else {
        throw new Error(data.error || "Failed to analyze radiographic film");
      }
    } catch (err: any) {
      console.error("Analysis execution error:", err);
      setAnalysisError(err?.message || "Failed to connect to inspection engine.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectImage = (imageDataUrl: string, sampleInfo?: SampleRadiograph) => {
    setCurrentImage(imageDataUrl);
    setSelectedDefectId(null);

    if (sampleInfo) {
      const newSpec: ComponentInfo = {
        tag: `JOINT-${sampleInfo.category.toUpperCase()}-01`,
        joint_type: sampleInfo.jointType,
        material: sampleInfo.material,
        nominal_thickness_mm: sampleInfo.thickness,
        weld_process: "GTAW Root + SMAW Fill/Cap",
        standard: standard,
      };
      setComponentInfo(newSpec);
      // Trigger automatic scan for sample selection
      handleRunAnalysis(imageDataUrl, newSpec);
    }
  };

  const currentDefects: DetectedDefect[] = inspectionReport?.defects_found || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Global Header & Nav */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasReport={!!inspectionReport}
        standard={standard}
        setStandard={setStandard}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        
        {/* Upper Action Bar: Presets & Upload */}
        <ScanUploader
          currentImage={currentImage}
          onSelectImage={handleSelectImage}
          componentInfo={componentInfo}
          onUpdateComponentInfo={setComponentInfo}
          onAnalyze={() => handleRunAnalysis()}
          isAnalyzing={isAnalyzing}
        />

        {/* Error notification banner if any */}
        {analysisError && (
          <div className="bg-rose-950/60 border border-rose-800 rounded-lg p-3 text-xs font-mono text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{analysisError}</span>
            </div>
            <button
              onClick={() => handleRunAnalysis()}
              className="underline hover:text-white font-bold"
            >
              Retry Inspection
            </button>
          </div>
        )}

        {/* Workspace Dual-Panel View: Film Viewer + Defect Inspector Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch" style={{ minHeight: "600px" }}>
          
          {/* Left / Center 8 Columns: Radiographic Film Viewer */}
          <div className="lg:col-span-8 flex flex-col">
            <FilmViewer
              imageUrl={currentImage}
              defects={currentDefects}
              selectedDefectId={selectedDefectId}
              onSelectDefect={setSelectedDefectId}
              isLoading={isAnalyzing}
            />
          </div>

          {/* Right 4 Columns: Defect Inspector & Evaluation Summary */}
          <div className="lg:col-span-4 flex flex-col">
            <DefectInspectorPanel
              defects={currentDefects}
              overallEvaluation={inspectionReport?.overall_evaluation || "REJECTED"}
              verdictSummary={
                inspectionReport?.verdict_summary ||
                "Inspecting radiographic film for weld joint & casting discontinuities..."
              }
              weldQualityGrade={
                inspectionReport?.weld_quality_grade || "ASME Sec VIII / API 1104"
              }
              selectedDefectId={selectedDefectId}
              onSelectDefect={setSelectedDefectId}
              onViewReport={() => setActiveTab("report")}
            />
          </div>

        </div>

      </main>

      {/* Modal / Overlay: Full Formal NDT Radiographic Examination Report */}
      {activeTab === "report" && inspectionReport && (
        <InspectionReportModal
          report={inspectionReport}
          onClose={() => setActiveTab("workspace")}
        />
      )}

      {/* Modal / Overlay: Defect Interpretation Atlas & Standards Knowledge Base */}
      {activeTab === "atlas" && (
        <DefectAtlasModal
          onClose={() => setActiveTab("workspace")}
          onSelectSampleType={(category) => {
            const matched = SAMPLE_RADIOGRAPHS.find((s) => s.category === category);
            if (matched) {
              handleSelectImage(matched.imageUrl, matched);
            }
            setActiveTab("workspace");
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            RT Scan Defect Detector &bull; ASME Section V &bull; API 1104 &bull; ISO 17636-1 Compliant Interpretation
          </span>
          <span className="text-slate-600">
            Powered by Gemini Multimodal Vision NDT Model
          </span>
        </div>
      </footer>

    </div>
  );
}
