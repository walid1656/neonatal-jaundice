
export type SlideType = 
  | 'hero' 
  | 'metabolism-map' 
  | 'risk-factors'
  | 'kramer-sim' 
  | 'lab-suite'
  | 'complications-grid'
  | 'treatment-ops'
  | 'nursing-table'
  | 'summary'
  | 'comparison'
  | 'timeline'
  | 'dashboard'
  | 'pathway'
  | 'cycle'
  | 'split-vertical'
  | 'spotlight'
  | 'gallery';

export type AccentColor = 'blue' | 'gold' | 'emerald' | 'rose' | 'purple' | 'cyan' | 'crimson' | 'amber' | 'indigo';
export type BackgroundStyle = 'mesh' | 'glass-gradient' | 'deep-solid';
export type CardSize = 'sm' | 'md' | 'lg';

export interface Hotspot {
  x: number;
  y: number;
  label: string;
  detail: string;
}

export interface SlidePhase {
  id: string;
  title: string;
  description: string;
  clinicalPearl?: string; 
  technicalDetail?: string; 
  image?: string;
  icon?: string;
  medicalValue?: string;
  hotspots?: Hotspot[];
  size?: CardSize;
}

export interface SlideContent {
  id: number;
  type: SlideType;
  title: string;
  subtitle?: string;
  phases: SlidePhase[];
  accentColor?: AccentColor;
  backgroundStyle?: BackgroundStyle;
  glassIntensity?: number; // 0 to 1
}
