
import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Activity, 
  Heart, 
  AlertCircle, 
  Stethoscope, 
  Clock, 
  Zap, 
  ShieldAlert, 
  Dna, 
  Utensils, 
  FileText, 
  Beaker, 
  AlertTriangle, 
  Brain, 
  Accessibility,
  CheckCircle2,
  Trash2,
  PanelRightClose
} from 'lucide-react';

export const Icons = {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Activity,
  Heart,
  AlertCircle,
  Stethoscope,
  Clock,
  Zap,
  ShieldAlert,
  Dna,
  Utensils,
  FileText,
  Beaker,
  AlertTriangle,
  Brain,
  Accessibility,
  CheckCircle2,
  Trash2,
  PanelRightClose
};

export const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name];
  return IconComponent ? <IconComponent className={className} /> : null;
};
