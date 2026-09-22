import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileSearch,
} from "lucide-react";
import { SAMPLE_RADIOGRAPHS } from "../data/samples";
import { ComponentInfo, SampleRadiograph } from "../types";

interface ScanUploaderProps {
  currentImage: string;
  onSelectImage: (imageDataUrl: string, sampleInfo?: SampleRadiograph) => void;
  componentInfo: ComponentInfo;
  onUpdateComponentInfo: (info: ComponentInfo) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const ScanUploader: React.FC<ScanUploaderProps> = ({
  currentImage,
  onSelectImage,
  componentInfo,
  onUpdateComponentInfo,
  onAnalyze,
  isAnalyzing,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("sample-crack-01");
  const [showConfig, setShowConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onSelectImage(event.target.result as string);
        setSelectedSampleId(""); // Custom upload
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SampleRadiograph) => {
    setSelectedSampleId(sample.id);
    onSelectImage(sample.imageUrl, sample);
    onUpdateComponentInfo({
      ...componentInfo,
      tag: `JOINT-${sample.category.toUpperCase()}-01`,
      joint_type: sample.jointType,
      material: sample.material,
      nominal_thickness_mm: sample.thickness,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-200 space-y-4">
      
      {/* Upper section: Sample Radiographs & Custom Upload */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Radiograph Film or Upload Scan</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {selectedSampleId ? "Standard Reference Scan Loaded" : "Custom Scan Loaded"}
          </span>
        </div>

        {/* 6 Curated Industrial Radiograph Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SAMPLE_RADIOGRAPHS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`flex flex-col text-left p-2 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-cyan-950/80 border-cyan-500 ring-1 ring-cyan-500/80 shadow-md"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                {/* Mini Film Thumbnail preview */}
                <div className="w-full h-12 bg-neutral-950 rounded overflow-hidden mb-1.5 border border-slate-800 flex items-center justify-center">
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-200 truncate block">
                  {sample.category.replace(/_/g, " ").toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {sample.jointType.split("(")[0].trim()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* File Dropzone & Component Info Row */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        
        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 border-2 border-dashed rounded-lg p-3 transition-colors cursor-pointer flex items-center justify-center gap-3 text-center ${
            dragActive
              ? "border-cyan-400 bg-cyan-950/30"
              : "border-slate-700 hover:border-slate-600 bg-slate-950/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.dcm,.tiff,.bmp"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="text-left">
            <div className="text-xs font-mono font-semibold text-slate-200">
              Drop RT Film Image Here or <span className="text-cyan-400 underline">Browse Files</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Supports weld radiographs, profile RT, casting scans (PNG, JPG, TIFF)
            </div>
          </div>
        </div>

        {/* Toggle Inspection Specs */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`px-3 py-2 rounded-lg border text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
            showConfig
              ? "bg-slate-800 border-cyan-500 text-cyan-300"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showConfig ? "Hide Specs" : "Joint Specs"}</span>
        </button>

        {/* Big Action Button: Run AI Radiographic Detection */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !currentImage}
          className={`px-6 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shrink-0 shadow-lg ${
            isAnalyzing
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/30 cursor-pointer"
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Scanning Film...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Detect Defects &amp; Report</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Joint Configuration Drawer */}
      {showConfig && (
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">COMPONENT TAG:</label>
            <input
              type="text"
              value={componentInfo.tag}
              onChange={(e) =>
                onUpdateComponentInfo({ ...componentInfo, tag: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">JOINT TYPE:</label>
            <input
              type="text"
              value={componentInfo.joint_type}
              onChange={(e) =>
                onUpdateComponentInfo({ ...componentInfo, joint_type: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">THICKNESS (MM):</label>
            <input
              type="number"
              value={componentInfo.nominal_thickness_mm}
              onChange={(e) =>
                onUpdateComponentInfo({
                  ...componentInfo,
                  nominal_thickness_mm: parseFloat(e.target.value) || 12.7,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">MATERIAL GRADE:</label>
            <input
              type="text"
              value={componentInfo.material}
              onChange={(e) =>
                onUpdateComponentInfo({ ...componentInfo, material: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      )}

    </div>
  );
};
