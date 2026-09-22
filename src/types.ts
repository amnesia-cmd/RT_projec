export type DefectType =
  | 'crack'
  | 'porosity'
  | 'slag_inclusion'
  | 'lack_of_fusion'
  | 'lack_of_penetration'
  | 'shrinkage_cavity'
  | 'corrosion_wall_loss'
  | 'tungsten_inclusion'
  | 'undercut'
  | 'burn_through'
  | 'misalignment_hi_lo'
  | 'other_discontinuity';

export type DefectSeverity = 'CRITICAL_REJECT' | 'MODERATE_REPAIR' | 'ACCEPTABLE_MINOR';

export type JointEvaluation = 'REJECTED' | 'ACCEPTED' | 'CONDITIONAL_REPAIR';

export interface DefectLocation {
  station_x_mm: number;
  weld_zone: 'CAP' | 'ROOT' | 'FILL_PASS' | 'HAZ' | 'BASE_METAL';
  description: string;
}

export interface DefectDimensions {
  length_mm: number;
  width_mm: number;
  depth_estimate?: string;
}

export interface DefectOpticalDensity {
  film_background_od: number;
  defect_od: number;
  contrast_type: 'DARKER_LOW_DENSITY_MATERIAL' | 'LIGHTER_HIGH_DENSITY_MATERIAL';
}

export interface StandardCompliance {
  standard: 'ASME_SEC_VIII' | 'API_1104' | 'ISO_5817' | 'AWS_D1_1';
  code_reference: string;
  disposition: 'REJECT' | 'ACCEPT' | 'REPAIR_REQUIRED';
  reason: string;
}

export interface DetectedDefect {
  id: string;
  type: DefectType;
  subtype?: string;
  label: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000 scale
  confidence: number;
  severity: DefectSeverity;
  location: DefectLocation;
  dimensions: DefectDimensions;
  optical_density: DefectOpticalDensity;
  standard_compliance: StandardCompliance;
  metallurgical_cause: string;
  repair_recommendation: string;
}

export interface ComponentInfo {
  tag: string;
  joint_type: string;
  material: string;
  nominal_thickness_mm: number;
  weld_process: string;
  diameter_nps?: string;
  standard: 'ASME_SEC_VIII' | 'API_1104' | 'ISO_5817' | 'AWS_D1_1';
}

export interface RadiographicTechnique {
  radiation_source: string;
  sfd_mm: number;
  film_type: string;
  iqi_type: string;
  sensitivity_achieved_percent: number;
  average_optical_density: number;
  geometric_unsharpness_mm: number;
}

export interface InspectionReport {
  report_id: string;
  date: string;
  inspector_name: string;
  certification: string;
  component_info: ComponentInfo;
  radiographic_technique: RadiographicTechnique;
  overall_evaluation: JointEvaluation;
  verdict_summary: string;
  weld_quality_grade: string;
  defects_found: DetectedDefect[];
  defect_counts: Record<string, number>;
  remediation_plan: string[];
  disclaimer: string;
}

export interface InspectionRequest {
  image: string; // Base64 data url or base64 string
  mimeType?: string;
  componentInfo: ComponentInfo;
  technique?: Partial<RadiographicTechnique>;
}

export interface InspectionResponse {
  success: boolean;
  report?: InspectionReport;
  error?: string;
  executionTimeMs?: number;
}

export interface SampleRadiograph {
  id: string;
  title: string;
  subtitle: string;
  category: DefectType;
  jointType: string;
  material: string;
  thickness: number;
  imageUrl: string;
  defectsSummary: string;
  highlightDefect: string;
}
