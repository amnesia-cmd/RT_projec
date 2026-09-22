import { SampleRadiograph } from "../types";

// Generates an SVG Data URI for an authentic industrial RT film
function createRadiographSvg(options: {
  title: string;
  defectType: string;
  defectRenderSvg: string;
  stationLabels?: string[];
  hasIqi?: boolean;
}): string {
  const { title, defectType, defectRenderSvg, stationLabels = ["0", "10", "20", "30", "40", "50"], hasIqi = true } = options;

  const width = 1000;
  const height = 480;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <!-- Base radiographic film noise -->
      <filter id="filmGrain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.18 0" />
        <feComposite in2="SourceGraphic" in="gl" operator="in" />
      </filter>

      <!-- Weld bead profile gradient -->
      <linearGradient id="weldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#14181f" />
        <stop offset="25%" stop-color="#1e242d" />
        <stop offset="35%" stop-color="#2d3540" />
        <stop offset="48%" stop-color="#475263" />
        <stop offset="52%" stop-color="#4d596b" />
        <stop offset="65%" stop-color="#2d3540" />
        <stop offset="75%" stop-color="#1e242d" />
        <stop offset="100%" stop-color="#14181f" />
      </linearGradient>

      <!-- Casting volumetric gradient -->
      <radialGradient id="castingGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#3d4554" />
        <stop offset="40%" stop-color="#2e3542" />
        <stop offset="80%" stop-color="#1a1e27" />
        <stop offset="100%" stop-color="#101319" />
      </radialGradient>
      
      <!-- Defect dark drop shadow/blur -->
      <filter id="softDefect" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" />
      </filter>
      <filter id="blurCorrosion" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6.0" />
      </filter>
    </defs>

    <!-- Radiographic Film Base Background (Density D=2.80) -->
    <rect width="${width}" height="${height}" fill="#0d1117" />
    
    <!-- Base metal plates -->
    <rect x="0" y="30" width="${width}" height="420" fill="#181d24" opacity="0.95" />

    <!-- Weld Joint Reinforcement Bead (Central band) -->
    ${defectType === "shrinkage_cavity" ? `
      <!-- Casting Wall Node -->
      <rect x="60" y="50" width="880" height="380" rx="8" fill="url(#castingGradient)" />
      <path d="M 60 140 Q 500 110 940 140" stroke="#4b5563" stroke-width="2" fill="none" opacity="0.4" />
      <path d="M 60 340 Q 500 370 940 340" stroke="#4b5563" stroke-width="2" fill="none" opacity="0.4" />
    ` : `
      <!-- Standard Pipe/Plate Butt Weld Bead -->
      <rect x="0" y="150" width="${width}" height="180" fill="url(#weldGradient)" />
      
      <!-- Weld ripples & HAZ boundaries -->
      <path d="M 0 150 L ${width} 150" stroke="#525e70" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.7" />
      <path d="M 0 330 L ${width} 330" stroke="#525e70" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.7" />
      <path d="M 0 165 L ${width} 165" stroke="#374151" stroke-width="1" opacity="0.5" />
      <path d="M 0 315 L ${width} 315" stroke="#374151" stroke-width="1" opacity="0.5" />
      
      <!-- Root pass center line reference -->
      <path d="M 0 240 L ${width} 240" stroke="#5b687c" stroke-width="2" stroke-dasharray="16,8" opacity="0.4" />
    `}

    <!-- Lead Station Numbers (Radiopaque bright marks: Lead Markers) -->
    <g fill="#f1f5f9" font-family="monospace" font-size="20" font-weight="bold" opacity="0.92">
      <text x="40" y="70">L</text>
      <text x="930" y="70">R</text>
      <text x="70" y="420">${stationLabels[0] || "0"}</text>
      <text x="250" y="420">${stationLabels[1] || "10"}</text>
      <text x="430" y="420">${stationLabels[2] || "20"}</text>
      <text x="610" y="420">${stationLabels[3] || "30"}</text>
      <text x="790" y="420">${stationLabels[4] || "40"}</text>
      <text x="910" y="420">${stationLabels[5] || "50"}</text>
    </g>

    <!-- DIN EN ISO Wire IQI (Image Quality Indicator) Penetrameter on film edge -->
    ${hasIqi ? `
    <g transform="translate(100, 70)" opacity="0.85">
      <rect x="-5" y="-5" width="130" height="42" fill="#0f141c" stroke="#374151" stroke-width="1" rx="3" />
      <text x="5" y="12" fill="#cbd5e1" font-family="monospace" font-size="9">10 FE ISO</text>
      <!-- 7 Wires of decreasing diameter (wire 10 to 16) -->
      <line x1="10" y1="20" x2="120" y2="20" stroke="#f8fafc" stroke-width="2.6" />
      <line x1="10" y1="23" x2="120" y2="23" stroke="#f1f5f9" stroke-width="2.0" />
      <line x1="10" y1="26" x2="120" y2="26" stroke="#e2e8f0" stroke-width="1.6" />
      <line x1="10" y1="29" x2="120" y2="29" stroke="#cbd5e1" stroke-width="1.2" />
      <line x1="10" y1="31" x2="120" y2="31" stroke="#94a3b8" stroke-width="0.9" />
      <line x1="10" y1="33" x2="120" y2="33" stroke="#64748b" stroke-width="0.6" />
      <line x1="10" y1="35" x2="120" y2="35" stroke="#475263" stroke-width="0.4" />
    </g>
    ` : ""}

    <!-- Film Identification Lead Stamp -->
    <g transform="translate(740, 70)" fill="#f8fafc" font-family="monospace" font-size="11" font-weight="600" opacity="0.9">
      <rect x="-6" y="-14" width="180" height="46" fill="#0f141c" stroke="#334155" stroke-width="1" rx="3" />
      <text x="0" y="0">ASTM A106 SCH80</text>
      <text x="0" y="14">JOINT: RT-WELD-04</text>
      <text x="0" y="27">SRC: X-RAY 200kV</text>
    </g>

    <!-- DEFECT INJECTION LAYER (Specific to each test case) -->
    <g id="defectLayer">
      ${defectRenderSvg}
    </g>

    <!-- Subtle simulated radiographic edge vignetting & film grain -->
    <rect width="${width}" height="${height}" fill="none" stroke="#000000" stroke-width="16" opacity="0.6" />
  </svg>`;

  const base64Svg = typeof btoa === "function" 
    ? btoa(unescape(encodeURIComponent(svg))) 
    : Buffer.from(svg, "utf-8").toString("base64");

  return `data:image/svg+xml;base64,${base64Svg}`;
}

// 1. Crack: Longitudinal HAZ Crack + Transverse Crack
const crackSvg = createRadiographSvg({
  title: "Weld Joint Longitudinal & Transverse Crack",
  defectType: "crack",
  defectRenderSvg: `
    <!-- Longitudinal HAZ Crack (Dark jagged irregular branching line) -->
    <g filter="url(#softDefect)">
      <path d="M 280 185 Q 315 190 350 182 T 420 188 T 490 180 T 560 186 T 610 184" 
            stroke="#05070a" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <path d="M 380 185 Q 400 172 430 170" 
            stroke="#07090d" stroke-width="2.2" fill="none" />
      <path d="M 480 182 Q 510 195 535 200" 
            stroke="#07090d" stroke-width="1.8" fill="none" />
    </g>
    <!-- Transverse microcrack cutting across root -->
    <g filter="url(#softDefect)">
      <path d="M 720 200 Q 724 235 722 265 T 726 295" 
            stroke="#05070a" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <path d="M 723 235 Q 735 242 745 248" 
            stroke="#080b10" stroke-width="1.5" fill="none" />
    </g>
    <!-- Secondary HAZ cold fissure -->
    <path d="M 290 186 L 350 183 L 420 189 L 490 181 L 560 187 L 605 185" 
          stroke="#000000" stroke-width="1.8" fill="none" />
    <path d="M 721 202 L 724 266 L 725 294" 
          stroke="#000000" stroke-width="1.5" fill="none" />
  `,
  stationLabels: ["0", "50", "100", "150", "200", "250"],
});

// 2. Porosity: Clustered Gas Pockets & Scattered Wormhole Pores
const porositySvg = createRadiographSvg({
  title: "Butt Weld Clustered & Scattered Porosity",
  defectType: "porosity",
  defectRenderSvg: `
    <!-- Dense Porosity Cluster (Dark rounded distinct gas pockets) -->
    <g filter="url(#softDefect)">
      <!-- Main cluster (center) -->
      <ellipse cx="480" cy="235" rx="8" ry="7" fill="#040508" />
      <ellipse cx="505" cy="225" rx="6" ry="6" fill="#05070a" />
      <ellipse cx="495" cy="250" rx="7" ry="6" fill="#040508" />
      <ellipse cx="525" cy="240" rx="5" ry="5" fill="#05070a" />
      <ellipse cx="465" cy="220" rx="4" ry="4" fill="#07090e" />
      <ellipse cx="470" cy="245" rx="5" ry="5" fill="#05070b" />
      <ellipse cx="515" cy="260" rx="4" ry="4" fill="#070a0f" />
      <ellipse cx="540" cy="230" rx="3.5" ry="3.5" fill="#090d14" />
      
      <!-- Scattered isolated pores -->
      <circle cx="280" cy="230" r="4.5" fill="#05070b" />
      <circle cx="340" cy="255" r="3.5" fill="#070a0f" />
      <circle cx="680" cy="220" r="5" fill="#05070b" />
      <circle cx="750" cy="245" r="4" fill="#06080d" />
      <circle cx="820" cy="235" r="3" fill="#090d14" />

      <!-- Piped / Wormhole linear porosity -->
      <path d="M 370 238 Q 395 240 415 236" stroke="#05070a" stroke-width="5" stroke-linecap="round" fill="none" />
    </g>
    <!-- Crisp dark cores for pores -->
    <ellipse cx="480" cy="235" rx="5.5" ry="5" fill="#000000" />
    <ellipse cx="495" cy="250" rx="4.5" ry="4" fill="#000000" />
    <ellipse cx="505" cy="225" rx="4" ry="4" fill="#000000" />
    <circle cx="280" cy="230" r="3" fill="#000000" />
    <circle cx="680" cy="220" r="3.5" fill="#000000" />
    <path d="M 373 238 L 412 236" stroke="#000000" stroke-width="3" stroke-linecap="round" fill="none" />
  `,
  stationLabels: ["100", "150", "200", "250", "300", "350"],
});

// 3. Slag Inclusions: Elongated Wagon-Track Slag & Irregular Jagged Inclusions
const slagSvg = createRadiographSvg({
  title: "Heavy Bevel Slag Inclusions & Wagon Tracks",
  defectType: "slag_inclusion",
  defectRenderSvg: `
    <!-- Wagon Tracks (Elongated slag along weld bevel boundaries with ragged edges) -->
    <g filter="url(#softDefect)">
      <!-- Top wagon track slag line -->
      <path d="M 220 205 Q 260 208 310 203 T 400 207 T 510 202 T 620 206 T 680 203" 
            stroke="#06090e" stroke-width="6.5" stroke-linecap="round" fill="none" />
      <!-- Bottom wagon track line -->
      <path d="M 240 272 Q 320 268 390 274 T 490 270 T 580 273" 
            stroke="#070a10" stroke-width="5.5" stroke-linecap="round" fill="none" />
      
      <!-- Isolated globular slag inclusions with blurred jagged edges -->
      <path d="M 750 230 C 758 225, 775 228, 780 238 C 785 248, 765 255, 755 250 C 745 245, 742 235, 750 230 Z" 
            fill="#05070a" />
      <path d="M 830 220 C 840 216, 855 222, 858 230 C 860 240, 842 246, 835 242 C 825 238, 822 225, 830 220 Z" 
            fill="#06080d" />
    </g>
    <!-- Ragged core lines -->
    <path d="M 230 205 Q 310 204 400 207 T 510 202 T 615 206 L 670 203" 
          stroke="#010204" stroke-width="3" fill="none" />
    <path d="M 250 272 Q 390 273 490 270 L 575 273" 
          stroke="#010204" stroke-width="2.5" fill="none" />
  `,
  stationLabels: ["0", "50", "100", "150", "200", "250"],
});

// 4. Lack of Penetration (LOP) & Lack of Fusion (LOF)
const lofLopSvg = createRadiographSvg({
  title: "Incomplete Root Penetration & Sidewall Lack of Fusion",
  defectType: "lack_of_penetration",
  defectRenderSvg: `
    <!-- Incomplete Root Penetration (Straight continuous dark centerline groove) -->
    <g filter="url(#softDefect)">
      <path d="M 160 240 L 580 240" stroke="#040507" stroke-width="6" stroke-linecap="butt" fill="none" />
      <!-- Razor sharp center core -->
      <path d="M 160 240 L 580 240" stroke="#000000" stroke-width="3" stroke-linecap="butt" fill="none" />
    </g>
    <!-- Sidewall Lack of Fusion (Straight dark line running along bevel slope) -->
    <g filter="url(#softDefect)">
      <path d="M 620 185 L 850 185" stroke="#040508" stroke-width="4.5" stroke-linecap="round" fill="none" />
      <path d="M 620 185 L 850 185" stroke="#000000" stroke-width="2" stroke-linecap="round" fill="none" />
    </g>
    <!-- Root gap indication -->
    <text x="320" y="225" fill="#f8fafc" font-family="monospace" font-size="10" opacity="0.3">ROOT RUN</text>
  `,
  stationLabels: ["0", "25", "50", "75", "100", "125"],
});

// 5. Shrinkage Cavity: Casting Feathery / Spongy Volumetric Voids
const shrinkageSvg = createRadiographSvg({
  title: "Valve Casting Volumetric Shrinkage Cavities",
  defectType: "shrinkage_cavity",
  defectRenderSvg: `
    <!-- Spongy/feathery dendritic shrinkage cavity (Irregular cooling voids) -->
    <g filter="url(#softDefect)">
      <!-- Main dendritic branching body -->
      <path d="M 380 210 Q 420 180 470 200 T 540 180 T 600 220 T 640 260 T 580 300 T 490 280 T 420 310 T 360 260 Z" 
            fill="#06090e" opacity="0.95" />
      <!-- Dark internal cavitation voids -->
      <path d="M 430 220 Q 470 190 510 210 T 570 230 T 550 270 T 480 260 T 420 240 Z" 
            fill="#030406" />
      <!-- Feathery branches -->
      <path d="M 470 200 Q 490 150 515 130" stroke="#05070a" stroke-width="4" stroke-linecap="round" fill="none" />
      <path d="M 540 180 Q 580 145 610 135" stroke="#06080c" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 600 220 Q 660 210 700 205" stroke="#05070b" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <path d="M 580 300 Q 630 335 660 360" stroke="#06080d" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 420 310 Q 380 345 350 365" stroke="#05070b" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <path d="M 360 260 Q 310 255 270 260" stroke="#07090e" stroke-width="3" stroke-linecap="round" fill="none" />
    </g>
    <!-- Ultra dark center voids -->
    <ellipse cx="485" cy="235" rx="18" ry="12" fill="#000000" />
    <ellipse cx="535" cy="245" rx="14" ry="10" fill="#000000" />
    <circle cx="440" cy="225" r="8" fill="#000000" />
  `,
  stationLabels: ["SEC A", "SEC B", "SEC C", "SEC D", "SEC E", "SEC F"],
});

// 6. Corrosion / Wall Loss: Process Pipeline Internal Thinning
const corrosionSvg = createRadiographSvg({
  title: "Process Pipeline Internal Corrosion & Wall Loss",
  defectType: "corrosion_wall_loss",
  defectRenderSvg: `
    <!-- Broad diffuse density shifts representing wall thinning (scalloped erosion) -->
    <g filter="url(#blurCorrosion)">
      <!-- Large severe wall loss scallop (density increase because metal is thinner) -->
      <ellipse cx="460" cy="240" rx="140" ry="60" fill="#040609" opacity="0.9" />
      <ellipse cx="680" cy="230" rx="90" ry="45" fill="#06080d" opacity="0.85" />
      <ellipse cx="260" cy="245" rx="80" ry="40" fill="#070a0f" opacity="0.8" />
    </g>
    <g filter="url(#softDefect)">
      <!-- Localized deep pitting pits inside the corrosion zone -->
      <circle cx="420" cy="230" r="12" fill="#010203" />
      <circle cx="475" cy="250" r="16" fill="#010203" />
      <circle cx="520" cy="225" r="10" fill="#010203" />
      <circle cx="660" cy="235" r="9" fill="#020305" />
      <circle cx="705" cy="220" r="11" fill="#020305" />
      <circle cx="280" cy="240" r="8" fill="#030406" />
      <!-- Stepped corrosion boundary contour -->
      <path d="M 320 210 Q 450 190 590 205 T 760 215" 
            stroke="#080c12" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.7" />
    </g>
    <!-- Deepest wall loss pits (near through-wall threshold) -->
    <circle cx="475" cy="250" r="9" fill="#000000" />
    <circle cx="420" cy="230" r="7" fill="#000000" />
    <circle cx="705" cy="220" r="6" fill="#000000" />
  `,
  stationLabels: ["0 mm", "100 mm", "200 mm", "300 mm", "400 mm", "500 mm"],
});

export const SAMPLE_RADIOGRAPHS: SampleRadiograph[] = [
  {
    id: "sample-crack-01",
    title: "Cracks in Butt Weld (HAZ & Transverse)",
    subtitle: "High-pressure Steam Pipe | Single V Butt Joint | 14.3 mm WT",
    category: "crack",
    jointType: "Pipe Circumferential Butt Joint",
    material: "ASTM A335 Grade P11 Low Alloy Steel",
    thickness: 14.3,
    imageUrl: crackSvg,
    defectsSummary: "Longitudinal HAZ cold crack (32.5 mm) & transverse cross-bead crack (18.2 mm).",
    highlightDefect: "Linear razor-thin dark branching discontinuities. Zero-tolerance rejection under ASME Sec VIII & API 1104.",
  },
  {
    id: "sample-porosity-02",
    title: "Cluster & Linear Porosity",
    subtitle: "Storage Tank Girth Seam | Double V Butt Joint | 19.0 mm WT",
    category: "porosity",
    jointType: "Plate Butt Joint (SMAW)",
    material: "ASTM A516 Grade 70 Pressure Vessel Plate",
    thickness: 19.0,
    imageUrl: porositySvg,
    defectsSummary: "Dense cluster of 8 gas pores (aggregate length 18 mm) and aligned wormhole porosity.",
    highlightDefect: "Rounded dark spots with sharp margins representing entrapped gas during shield loss.",
  },
  {
    id: "sample-slag-03",
    title: "Elongated Slag & Wagon Tracks",
    subtitle: "Cross-Country Gas Transmission Line | 24\" NPS | 12.7 mm WT",
    category: "slag_inclusion",
    jointType: "Pipe Circumferential Butt Joint (SMAW E6010/E8018)",
    material: "API 5L Grade X65 PSL2",
    thickness: 12.7,
    imageUrl: slagSvg,
    defectsSummary: "Dual parallel continuous slag inclusion lines (wagon tracks) totaling 120 mm length.",
    highlightDefect: "Elongated irregular dark ribbons with jagged, fuzzy edges caused by incomplete interpass deslagging.",
  },
  {
    id: "sample-loflop-04",
    title: "Incomplete Penetration & Lack of Fusion",
    subtitle: "Boiler Feedwater Header | 10\" NPS Sch 80 | 15.1 mm WT",
    category: "lack_of_penetration",
    jointType: "Single V Groove with 2.5 mm Root Face",
    material: "ASTM A106 Gr. B Carbon Steel",
    thickness: 15.1,
    imageUrl: lofLopSvg,
    defectsSummary: "Continuous straight dark line at root pass (LOP, 42 mm) and sidewall bevel lack of fusion (23 mm).",
    highlightDefect: "Sharp, straight linear dark discontinuities where weld metal failed to penetrate and bond.",
  },
  {
    id: "sample-shrinkage-05",
    title: "Casting Shrinkage Cavities",
    subtitle: "High-Pressure Turbine Valve Body | Cast Steel Node | 45.0 mm Section",
    category: "shrinkage_cavity",
    jointType: "Heavy Section Valve Body Casting",
    material: "ASTM A216 Grade WCB Cast Steel",
    thickness: 45.0,
    imageUrl: shrinkageSvg,
    defectsSummary: "Severe volumetric dendritic shrinkage cavity network spanning 62 mm across casting hub.",
    highlightDefect: "Feathery, branching dark voids formed during metal contraction during cooling/solidification.",
  },
  {
    id: "sample-corrosion-06",
    title: "Corrosion & Internal Wall Thinning",
    subtitle: "Crude Oil Flowline | 12\" NPS Standard Wall | 9.5 mm WT",
    category: "corrosion_wall_loss",
    jointType: "In-Service Seamless Pipe (Profile RT)",
    material: "API 5L Gr. B Carbon Steel Pipe",
    thickness: 9.5,
    imageUrl: corrosionSvg,
    defectsSummary: "Diffuse localized wall thinning with deep pitting. Wall thickness reduced from 9.5 mm down to 2.8 mm (70% wall loss).",
    highlightDefect: "Broad dark density variations with severe localized pitting indications posing burst risk.",
  },
];

// Knowledge base taxonomy for user reference
export interface DefectTaxonomyItem {
  type: string;
  name: string;
  radiographicAppearance: string;
  opticalDensitySignature: string;
  typicalCauses: string[];
  rejectionCriteria: {
    asme: string;
    api1104: string;
    iso5817: string;
  };
  differentiationTips: string;
}

export const DEFECT_KNOWLEDGE_BASE: DefectTaxonomyItem[] = [
  {
    type: "crack",
    name: "Cracks (Transverse, Longitudinal, Root, HAZ)",
    radiographicAppearance: "Thin, dark, jagged or straight linear indications, frequently with branching or tapered tips. Usually located along the weld centerline, weld toe, or heat-affected zone.",
    opticalDensitySignature: "Sharp localized increase in optical density (dark line), contrast depends strongly on beam orientation relative to crack plane.",
    typicalCauses: [
      "Hydrogen embrittlement / cold cracking in high-strength steels",
      "High joint restraint and excessive shrinkage stresses",
      "Inadequate preheat or rapid post-weld cooling rate",
      "Crater cracking from abruptly breaking the welding arc"
    ],
    rejectionCriteria: {
      asme: "ASME Section VIII Div 1 UW-51: Zero tolerance. Any crack of any length is strictly unacceptable.",
      api1104: "API 1104 Section 9.3.1: Cracks of any size or location are unacceptable and require repair or cutoff.",
      iso5817: "ISO 5817 Quality Levels B, C, D: Zero cracks permitted (not permitted in all quality levels)."
    },
    differentiationTips: "Cracks have distinct jagged, sharp branching paths compared to the straight, parallel edges of lack of penetration or undercut."
  },
  {
    type: "porosity",
    name: "Porosity (Scattered, Cluster, Piped / Wormholes)",
    radiographicAppearance: "Appears as rounded, spherical, or slightly elongated dark spots. May appear as isolated individual pores, dense localized clusters, or linear trails (piped/wormhole).",
    opticalDensitySignature: "High contrast dark spot with distinct smooth borders; density drops significantly inside the pore due to zero steel thickness.",
    typicalCauses: [
      "Loss of protective shielding gas coverage (drafts, low flow rate)",
      "Surface contamination: grease, oil, rust, primer, or moisture on bevel",
      "Damp electrodes or fluxes lacking proper baking/storage",
      "Excessive arc length or incorrect torch angle"
    ],
    rejectionCriteria: {
      asme: "ASME Section VIII Appendix 4: Evaluated by comparative charts; clusters > 12.7 mm or aggregate size exceeding limits are rejectable.",
      api1104: "API 1104 Section 9.3.8: Individual pore > 3.2 mm (1/8\") is rejectable. Cluster porosity > 12.7 mm aggregate diameter is rejectable.",
      iso5817: "ISO 5817 Level B: Max total projected pore area ≤ 1% of weld area, max single pore diameter ≤ 3 mm."
    },
    differentiationTips: "Look for circular or oval profiles with sharp boundaries. Unlike slag inclusions, gas pores lack ragged or tapered tails."
  },
  {
    type: "slag_inclusion",
    name: "Slag Inclusions (Elongated Wagon Tracks, Isolated)",
    radiographicAppearance: "Irregular dark areas with fuzzy, blurred, or jagged edges. Often elongated parallel to the weld seam (wagon tracks) along the fusion line between beads.",
    opticalDensitySignature: "Moderate to dark density drop with hazy boundaries reflecting the low radiographic absorption of vitreous flux slag (silicates).",
    typicalCauses: [
      "Improper interpass cleaning / failure to chip slag between passes",
      "Incorrect electrode manipulation causing molten slag to undercut and get trapped",
      "Too low heat input / inadequate arc force to float slag to surface",
      "Tight groove angle trapping slag in root corners"
    ],
    rejectionCriteria: {
      asme: "ASME Section VIII UW-51: Elongated slag > 6 mm for t ≤ 19 mm is rejectable.",
      api1104: "API 1104 Section 9.3.4: Elongated slag (ESI) > 50 mm in any 300 mm weld length is rejectable.",
      iso5817: "ISO 5817 Level B: Elongated inclusion length ≤ 20 mm or ≤ t, whichever is less."
    },
    differentiationTips: "Slag has irregular, ragged boundaries with varying density along its length, while lack of penetration has smooth, straight parallel boundaries."
  },
  {
    type: "lack_of_fusion",
    name: "Lack of Fusion (Sidewall, Interpass, Root)",
    radiographicAppearance: "A distinct, crisp linear dark discontinuity running along the weld bevel boundary or between weld passes. Often appears as a straight line with sharp edges.",
    opticalDensitySignature: "Consistent sharp dark band with crisp edge; density contrast is pronounced when beam is aligned with bevel angle.",
    typicalCauses: [
      "Insufficient heat input to melt bevel face or prior weld bead",
      "Electrode oriented incorrectly (favoring one side of bevel)",
      "High travel speed freezing molten puddle before melting base metal",
      "Presence of heavy oxide or mill scale on bevel face"
    ],
    rejectionCriteria: {
      asme: "ASME Section VIII UW-51: Strictly unacceptable regardless of length.",
      api1104: "API 1104 Section 9.3.3: Individual LOF indication length > 25 mm (1\") is rejectable.",
      iso5817: "ISO 5817 Level B & C: Zero lack of fusion permitted (not permitted)."
    },
    differentiationTips: "Always runs parallel to the bevel angle or interpass boundary; appears straighter than slag and thicker than cracks."
  },
  {
    type: "lack_of_penetration",
    name: "Incomplete Root Penetration (LOP / IP)",
    radiographicAppearance: "A continuous or intermittent straight dark linear band located exactly along the centerline of the weld root pass, corresponding to the unfused root faces.",
    opticalDensitySignature: "High optical density line (very dark) with crisp, uniform straight parallel edges mirroring the original machined root face.",
    typicalCauses: [
      "Root gap too narrow for electrode diameter",
      "Root face (land) excessively thick",
      "Low welding amperage during root pass",
      "Electrode travel speed too fast, failing to achieve root keyhole"
    ],
    rejectionCriteria: {
      asme: "ASME Section VIII UW-51: Any LOP is unacceptable for full penetration butt welds.",
      api1104: "API 1104 Section 9.3.2: LOP aggregate length > 25 mm in any 300 mm weld length is rejectable.",
      iso5817: "ISO 5817 Level B: Incomplete penetration not permitted."
    },
    differentiationTips: "Runs dead-center along the root bead with perfect parallel lines matching the original root gap."
  },
  {
    type: "shrinkage_cavity",
    name: "Shrinkage Cavities & Solidification Voids",
    radiographicAppearance: "Irregular, jagged, dendritic or feathery volumetric dark voids. In castings, they appear as extensive spongy networks; in welds, they appear in the crater or root.",
    opticalDensitySignature: "Varying gradient of darkness reflecting 3D volume loss inside the metal core, darker in the center with feathery lighter edges.",
    typicalCauses: [
      "Inadequate riser / feeder volume during casting solidification",
      "Abrupt transition between thick and thin sections causing differential cooling",
      "Failure to fill weld crater before extinguishing arc",
      "Excessive weld bead depth-to-width ratio causing centerline shrinkage"
    ],
    rejectionCriteria: {
      asme: "ASME Section VIII UW-51 & ASTM E446 / E186: Graded against Reference Radiograph Severity levels (Levels 1-5).",
      api1104: "API 1104 Section 9.3.7: Crater voids exceeding permissible rounded criteria are rejectable.",
      iso5817: "ISO 5817 Level B: Wormholes and shrinkage cavities not permitted."
    },
    differentiationTips: "Distinctive dendritic (tree branch or sponge-like) multi-directional morphology distinguishes shrinkage from straight linear weld defects."
  },
  {
    type: "corrosion_wall_loss",
    name: "Corrosion, Erosion & Internal Wall Loss",
    radiographicAppearance: "Broad, diffuse or patchy dark zones on profile radiographs (P-RT) or double-wall films. Localized thinning appears as darker clouds; pitting appears as deep dark crater dots.",
    opticalDensitySignature: "Progressive density gradient corresponding directly to thickness reduction (ΔD ∝ Δt / μ).",
    typicalCauses: [
      "Internal acid gas corrosion (CO2 sweet or H2S sour corrosion)",
      "Flow-accelerated erosion/corrosion at pipe bends, reducers, and tee junctions",
      "Microbiologically influenced corrosion (MIC) producing localized pits",
      "Under-deposit corrosion in stagnant process lines"
    ],
    rejectionCriteria: {
      asme: "ASME B31.3 / B31G: Remaining wall thickness must not drop below minimum design thickness (t_min).",
      api1104: "API 570 / API 579-1: Fitness-for-service assessment required if wall loss exceeds corrosion allowance.",
      iso5817: "EN 13480: Evaluated against minimum pressure containment wall calculations."
    },
    differentiationTips: "Unlike weld defects which are confined to the weld bead or HAZ, corrosion spreads across the base metal pipe wall in broad irregular shapes."
  },
];
