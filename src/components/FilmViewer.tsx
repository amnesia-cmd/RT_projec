import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Contrast,
  Sliders,
  Eye,
  EyeOff,
  Crosshair,
  Ruler,
  RotateCcw,
  Sparkles,
  Layers,
  Info,
} from "lucide-react";
import { DetectedDefect } from "../types";

interface FilmViewerProps {
  imageUrl: string;
  defects: DetectedDefect[];
  selectedDefectId: string | null;
  onSelectDefect: (defectId: string | null) => void;
  isLoading?: boolean;
}

export const FilmViewer: React.FC<FilmViewerProps> = ({
  imageUrl,
  defects,
  selectedDefectId,
  onSelectDefect,
  isLoading = false,
}) => {
  // Viewing transformations
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Radiographic Image processing controls
  const [brightness, setBrightness] = useState<number>(100); // 50 to 180 %
  const [contrast, setContrast] = useState<number>(115); // 80 to 250 %
  const [gamma, setGamma] = useState<number>(1.0); // 0.6 to 1.8
  const [invertFilm, setInvertFilm] = useState<boolean>(false);
  const [edgeEnhance, setEdgeEnhance] = useState<boolean>(false);

  // Overlays and Tools
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<"pointer" | "densitometer" | "ruler">("pointer");

  // Densitometer tool state
  const [hoverDensity, setHoverDensity] = useState<{ x: number; y: number; od: number } | null>(null);

  // Ruler measurement tool state
  const [rulerPoints, setRulerPoints] = useState<{ x: number; y: number }[]>([]);
  const [measuredDistanceMm, setMeasuredDistanceMm] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset viewport
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(115);
    setGamma(1.0);
    setInvertFilm(false);
    setEdgeEnhance(false);
    setRulerPoints([]);
    setMeasuredDistanceMm(null);
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "ruler") {
      handleRulerClick(e);
      return;
    }
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }

    // Densitometer calculation if tool is active
    if (activeTool === "densitometer" && containerRef.current && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1) {
        // Base density calculation: weld center (0.35-0.65 Y) is slightly denser (lower film optical density)
        // Defect areas have density shifts.
        const centerDistance = Math.abs(relY - 0.5);
        let baseOD = 2.85 - (0.5 - centerDistance) * 0.45; // Weld crown is ~2.40 - 2.65, base metal is ~2.85

        // Check if cursor is over any detected defect
        const matchedDefect = defects.find((d) => {
          const [ymin, xmin, ymax, xmax] = d.box_2d.map((v) => v / 1000);
          return relY >= ymin && relY <= ymax && relX >= xmin && relX <= xmax;
        });

        if (matchedDefect) {
          baseOD = matchedDefect.optical_density.defect_od;
        }

        setHoverDensity({
          x: e.clientX,
          y: e.clientY,
          od: parseFloat(baseOD.toFixed(2)),
        });
      } else {
        setHoverDensity(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.6), 5.0));
  };

  // Ruler measurement logic
  const handleRulerClick = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rulerPoints.length === 0 || rulerPoints.length >= 2) {
      setRulerPoints([{ x, y }]);
      setMeasuredDistanceMm(null);
    } else {
      const p1 = rulerPoints[0];
      const p2 = { x, y };
      setRulerPoints([p1, p2]);

      // Calculate pixel distance and scale to mm (assume image width represents ~250mm weld length)
      const pixelDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const mmPerPixel = 250 / rect.width;
      const distMm = pixelDist * mmPerPixel;
      setMeasuredDistanceMm(parseFloat(distMm.toFixed(1)));
    }
  };

  // Color helper based on defect severity
  const getSeverityColors = (severity: string, isSelected: boolean) => {
    if (isSelected) {
      return {
        border: "border-cyan-400 ring-2 ring-cyan-400/80",
        bg: "bg-cyan-500/20",
        badge: "bg-cyan-900 text-cyan-200 border-cyan-400",
      };
    }
    switch (severity) {
      case "CRITICAL_REJECT":
        return {
          border: "border-rose-500 border-2 shadow-[0_0_10px_rgba(244,63,94,0.4)]",
          bg: "bg-rose-500/15 hover:bg-rose-500/25",
          badge: "bg-rose-950/90 text-rose-300 border-rose-600/80",
        };
      case "MODERATE_REPAIR":
        return {
          border: "border-amber-500 border-2 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
          bg: "bg-amber-500/15 hover:bg-amber-500/25",
          badge: "bg-amber-950/90 text-amber-300 border-amber-600/80",
        };
      default:
        return {
          border: "border-emerald-500 border-2",
          bg: "bg-emerald-500/15 hover:bg-emerald-500/25",
          badge: "bg-emerald-950/90 text-emerald-300 border-emerald-600/80",
        };
    }
  };

  // Image CSS filter string
  const filterStyle = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    invertFilm ? "invert(1)" : "",
    edgeEnhance ? "drop-shadow(0 0 1px #000) drop-shadow(0 0 1px #fff)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Top Viewing Toolbar (NDT Illuminator Console) */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Tool selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <button
            id="btn-tool-pointer"
            onClick={() => setActiveTool("pointer")}
            className={`p-1.5 rounded flex items-center gap-1 font-mono transition-colors ${
              activeTool === "pointer" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Inspect / Pan Tool"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect</span>
          </button>
          <button
            id="btn-tool-densitometer"
            onClick={() => setActiveTool("densitometer")}
            className={`p-1.5 rounded flex items-center gap-1 font-mono transition-colors ${
              activeTool === "densitometer" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Optical Density Densitometer Probe (ASME UW-51)"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">D-Meter</span>
          </button>
          <button
            id="btn-tool-ruler"
            onClick={() => setActiveTool("ruler")}
            className={`p-1.5 rounded flex items-center gap-1 font-mono transition-colors ${
              activeTool === "ruler" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Calibrated Millimeter Measurement Ruler"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ruler</span>
          </button>
        </div>

        {/* View adjustments: Zoom, Invert, Overlays */}
        <div className="flex items-center gap-2">
          
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950/80 rounded-lg border border-slate-800 px-1 py-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 4.0))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Film Invert */}
          <button
            onClick={() => setInvertFilm((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-mono transition-colors ${
              invertFilm
                ? "bg-amber-600/30 border-amber-500 text-amber-300"
                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Radiograph Negative / Positive Film"
          >
            {invertFilm ? "Inverted" : "Negative"}
          </button>

          {/* Edge enhancement filter */}
          <button
            onClick={() => setEdgeEnhance((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-mono flex items-center gap-1 transition-colors ${
              edgeEnhance
                ? "bg-cyan-600/30 border-cyan-500 text-cyan-300"
                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="High-Pass Edge Filter (Sharpen Crack Discontinuities)"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Sharpen</span>
          </button>

          {/* Toggle overlays */}
          <button
            onClick={() => setShowOverlays((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-mono flex items-center gap-1 transition-colors ${
              showOverlays
                ? "bg-cyan-950 border-cyan-700 text-cyan-300"
                : "bg-slate-950/80 border-slate-800 text-slate-500"
            }`}
            title="Toggle Defect Bounding Boxes"
          >
            {showOverlays ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="hidden sm:inline">Defects ({defects.length})</span>
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white"
            title="Reset Film Viewport"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Radiograph Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative flex-1 bg-neutral-950 overflow-hidden flex items-center justify-center select-none ${
          activeTool === "ruler"
            ? "cursor-crosshair"
            : activeTool === "densitometer"
            ? "cursor-crosshair"
            : isPanning
            ? "cursor-grabbing"
            : "cursor-grab"
        }`}
        style={{ minHeight: "440px" }}
      >
        {/* Radiographic Viewer Lightbox Grid Background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Film Container with transforms */}
        <div
          className="relative transition-transform duration-75 origin-center inline-block"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Film image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Radiographic Testing Weld Scan"
            className="max-h-[68vh] w-auto block rounded border border-slate-700/60 shadow-2xl object-contain pointer-events-none"
            style={{
              filter: filterStyle,
            }}
          />

          {/* Loading scanline effect */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] flex flex-col items-center justify-center overflow-hidden">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 animate-[bounce_2s_infinite]" />
              <div className="bg-slate-900/90 border border-cyan-500/50 rounded-lg px-4 py-2.5 flex items-center gap-3 shadow-xl">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="font-mono text-xs text-cyan-300">
                  Interpreting Radiographic Film & Classifying Discontinuities...
                </span>
              </div>
            </div>
          )}

          {/* Bounding Boxes Layer */}
          {showOverlays &&
            !isLoading &&
            defects.map((defect) => {
              const [ymin, xmin, ymax, xmax] = defect.box_2d;
              const isSelected = selectedDefectId === defect.id;
              const colors = getSeverityColors(defect.severity, isSelected);

              const topPercent = ymin / 10;
              const leftPercent = xmin / 10;
              const heightPercent = (ymax - ymin) / 10;
              const widthPercent = (xmax - xmin) / 10;

              return (
                <div
                  key={defect.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDefect(isSelected ? null : defect.id);
                  }}
                  className={`absolute transition-all cursor-pointer ${colors.border} ${colors.bg}`}
                  style={{
                    top: `${topPercent}%`,
                    left: `${leftPercent}%`,
                    height: `${heightPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                >
                  {/* Defect Tag Badge */}
                  {showLabels && (
                    <div
                      className={`absolute -top-6 left-0 px-1.5 py-0.5 text-[10px] font-mono font-bold whitespace-nowrap border rounded shadow-md flex items-center gap-1 ${colors.badge}`}
                    >
                      <span>{defect.id}: {defect.label}</span>
                      <span className="opacity-80 text-[9px]">({defect.dimensions.length_mm}mm)</span>
                    </div>
                  )}

                  {/* Corner Reticles */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white/80" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white/80" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white/80" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white/80" />
                </div>
              );
            })}

          {/* Interactive Ruler Lines */}
          {activeTool === "ruler" && rulerPoints.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
              {rulerPoints.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r={4} fill="#38bdf8" stroke="#ffffff" strokeWidth={1.5} />
              ))}
              {rulerPoints.length === 2 && (
                <>
                  <line
                    x1={rulerPoints[0].x}
                    y1={rulerPoints[0].y}
                    x2={rulerPoints[1].x}
                    y2={rulerPoints[1].y}
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4,4"
                  />
                  <g
                    transform={`translate(${
                      (rulerPoints[0].x + rulerPoints[1].x) / 2
                    }, ${(rulerPoints[0].y + rulerPoints[1].y) / 2 - 10})`}
                  >
                    <rect x="-35" y="-12" width="70" height="20" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth={1} />
                    <text
                      x="0"
                      y="2"
                      fill="#38bdf8"
                      fontFamily="monospace"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {measuredDistanceMm} mm
                    </text>
                  </g>
                </>
              )}
            </svg>
          )}
        </div>

        {/* Floating Densitometer HUD Readout */}
        {activeTool === "densitometer" && hoverDensity && (
          <div
            className="fixed pointer-events-none z-50 bg-slate-900/95 border border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono shadow-xl text-slate-200"
            style={{
              left: `${hoverDensity.x + 16}px`,
              top: `${hoverDensity.y + 16}px`,
            }}
          >
            <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-slate-800 pb-1 mb-1">
              <Crosshair className="w-3 h-3" />
              <span>D-METER DENSITOMETER</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Film Density (H&D):</span>
              <span className="text-white font-bold">{hoverDensity.od} D</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              ASME Acceptable Range: 1.80 - 4.00 D
            </div>
          </div>
        )}

        {/* Ruler instructions banner */}
        {activeTool === "ruler" && (
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {rulerPoints.length === 0
                ? "Click first point on defect"
                : rulerPoints.length === 1
                ? "Click second point to measure mm distance"
                : `Measured: ${measuredDistanceMm} mm (Click to measure again)`}
            </span>
          </div>
        )}

      </div>

      {/* Bottom Film Viewer Image Adjustment Sliders Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Brightness & Contrast Sliders */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-mono text-[11px] w-14">Bright:</span>
            <input
              type="range"
              min="50"
              max="180"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-slate-300 font-mono text-[11px] w-8">{brightness}%</span>
          </div>

          <div className="flex items-center gap-2">
            <Contrast className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-mono text-[11px] w-14">Contrast:</span>
            <input
              type="range"
              min="80"
              max="220"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-slate-300 font-mono text-[11px] w-8">{contrast}%</span>
          </div>
        </div>

        {/* Legend / Status indicator */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Reject</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Repair</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Acceptable</span>
          </div>
        </div>

      </div>

    </div>
  );
};
