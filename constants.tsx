
import { SlideContent } from './types';

export const INITIAL_SLIDES: SlideContent[] = [
  {
    id: 1,
    type: 'hero',
    title: 'NEONATAL JAUNDICE DISEASE',
    subtitle: 'Clinical Protocol & Management Atlas | Group B 2025',
    phases: [
      { 
        id: 'p1', 
        title: 'Title Overview', 
        description: 'Comprehensive analysis of neonatal hyperbilirubinemia.', 
        icon: 'Activity',
        image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2000&auto=format&fit=crop'
      }
    ],
    accentColor: 'blue'
  },
  {
    id: 2,
    type: 'summary',
    title: 'PROTOCOL OUTLINE',
    subtitle: 'Core Diagnostic & Therapeutic Modules',
    phases: [
      { id: 'o1', title: 'Foundations', description: 'Physiology, Types, and Risk Factors.', icon: 'Brain' },
      { id: 'o2', title: 'Clinical Suite', description: 'Assessment, Diagnosis, and Features.', icon: 'Stethoscope' },
      { id: 'o3', title: 'Intervention', description: 'Management, Prevention, and Care Procedures.', icon: 'Zap' },
      { id: 'o4', title: 'Nursing', description: 'Bedside roles and psychological support.', icon: 'Heart' }
    ],
    accentColor: 'indigo'
  },
  {
    id: 3,
    type: 'spotlight',
    title: 'INTRODUCTION',
    subtitle: 'Understanding Hyperbilirubinemia',
    phases: [
      { 
        id: 'i1', 
        title: 'Definition', 
        description: 'Yellowing of the skin/sclera due to high bilirubin levels. Most common in the first week.', 
        clinicalPearl: 'Early detection prevents neurological toxicity.',
        medicalValue: 'TSB > 5mg/dL',
        icon: 'AlertCircle',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1110503?q=80&w=2000&auto=format&fit=crop'
      },
      { 
        id: 'i2', 
        title: 'Core Etiology', 
        description: 'Imbalance between RBC breakdown and immature liver processing.', 
        technicalDetail: 'RBC breakdown leads to unconjugated bilirubin release.',
        icon: 'Activity'
      }
    ],
    accentColor: 'gold'
  },
  {
    id: 4,
    type: 'comparison',
    title: 'PHYSIOLOGY OF BILIRUBIN',
    subtitle: 'The Metabolic Transition',
    phases: [
      { 
        id: 'ph1', 
        title: 'Unconjugated (UCB)', 
        description: 'Lipid-soluble, not water-soluble. Circulates tightly bound to albumin.', 
        medicalValue: 'Lipid Soluble',
        clinicalPearl: 'Can cross the blood-brain barrier if unbound.',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2000&auto=format&fit=crop',
        icon: 'Dna'
      },
      { 
        id: 'ph2', 
        title: 'Conjugated (CB)', 
        description: 'Water-soluble after hepatic processing. Excreted in bile and urine.', 
        medicalValue: 'Water Soluble',
        clinicalPearl: 'Presence in urine suggests cholestasis.',
        image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2000&auto=format&fit=crop',
        icon: 'CheckCircle2'
      }
    ],
    accentColor: 'emerald'
  },
  {
    id: 5,
    type: 'summary',
    title: 'TYPES OF JAUNDICE',
    subtitle: 'Differential Clinical Classification',
    phases: [
      { 
        id: 't1', 
        title: 'Physiological', 
        description: 'Mild, self-limiting. Resolves without intervention after first days.', 
        icon: 'Activity', 
        medicalValue: 'Benign' 
      },
      { 
        id: 't2', 
        title: 'Pathological', 
        description: 'Early onset (<24h), rapid rise. Requires urgent evaluation.', 
        icon: 'AlertTriangle', 
        medicalValue: 'Urgent' 
      },
      { 
        id: 't3', 
        title: 'Lactation-Related', 
        description: 'Includes breastfeeding and breast milk jaundice subtypes.', 
        icon: 'Heart', 
        medicalValue: 'Monitoring' 
      }
    ],
    accentColor: 'rose'
  },
  {
    id: 6,
    type: 'summary',
    title: 'FIVE RISK FACTORS',
    subtitle: 'Predictors of Severe Hyperbilirubinemia',
    phases: [
      { id: 'rf1', title: 'Prematurity', description: 'Immature liver and decreased albumin binding.', icon: 'Clock' },
      { id: 'rf2', title: 'Birth Trauma', description: 'Bruising, cephalohematoma, pooled blood breakdown.', icon: 'Activity' },
      { id: 'rf3', title: 'ABO & Rh', description: 'Immune-mediated hemolysis by maternal antibodies.', icon: 'ShieldAlert' },
      { id: 'rf4', title: 'G6PD Deficiency', description: 'Enzyme deficiency leading to sudden RBC breakdown.', icon: 'Dna' },
      { id: 'rf5', title: 'Poor Feeding', description: 'Dehydration and increased enterohepatic circulation.', icon: 'Utensils' }
    ],
    accentColor: 'crimson'
  },
  {
    id: 7,
    type: 'spotlight',
    title: 'CLINICAL FEATURES',
    subtitle: 'Signs & Symptomatology Progression',
    phases: [
      { 
        id: 'cf1', 
        title: 'Cephalocaudal Spread', 
        description: 'Yellowing starts at the face/eyes and progresses to abdomen and legs.', 
        clinicalPearl: 'Palms and soles involvement indicates very high levels.',
        medicalValue: 'Kramer Scale',
        icon: 'Activity',
        image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=2000&auto=format&fit=crop'
      },
      { 
        id: 'cf2', 
        title: 'Neurological Impact', 
        description: 'Lethargy, poor feeding, high-pitched cry, and irritability.', 
        clinicalPearl: 'Early signs of bilirubin-induced neurological dysfunction (BIND).',
        icon: 'Brain'
      }
    ],
    accentColor: 'cyan'
  },
  {
    id: 8,
    type: 'summary',
    title: 'ASSESSMENT & DIAGNOSIS',
    subtitle: 'The Diagnostic Workflow',
    phases: [
      { id: 'ad1', title: 'History', description: 'Birth trauma, feeding patterns, family hemolytic history.', icon: 'FileText' },
      { id: 'ad2', title: 'Physical Exam', description: 'Skin inspection, hydration status (fontanelle, urine), vitals.', icon: 'Stethoscope' },
      { id: 'ad3', title: 'Investigations', description: 'TSB (Gold Standard), TcB (Screening), CBC, Coombs Test.', icon: 'Beaker', medicalValue: 'TSB/TcB' }
    ],
    accentColor: 'amber'
  },
  {
    id: 9,
    type: 'summary',
    title: 'DIFFERENTIAL DIAGNOSIS',
    subtitle: 'Identifying Pathological Causes',
    phases: [
      { id: 'dd1', title: 'Biliary Atresia', description: 'Prolonged jaundice with pale stools. Requires early surgery.', icon: 'AlertCircle' },
      { id: 'dd2', title: 'Sepsis', description: 'Jaundice with systemic illness and infection markers.', icon: 'ShieldAlert' },
      { id: 'dd3', title: 'Metabolic Disorders', description: 'Persistent jaundice requiring early metabolic screening.', icon: 'Dna' }
    ],
    accentColor: 'purple'
  },
  {
    id: 10,
    type: 'comparison',
    title: 'MANAGEMENT STRATEGIES',
    subtitle: 'Interventional Modalities',
    phases: [
      { 
        id: 'mgt1', 
        title: 'Phototherapy', 
        description: 'First-line treatment. Converts UCB to water-soluble forms (Lumirubin).', 
        medicalValue: '460-490nm',
        clinicalPearl: 'Maximize skin exposure and ensure eye protection.',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2000&auto=format&fit=crop',
        icon: 'Zap'
      },
      { 
        id: 'mgt2', 
        title: 'Exchange Transfusion', 
        description: 'For dangerously high levels. Removes bilirubin and antibody-coated RBCs.', 
        medicalValue: 'Double Volume',
        clinicalPearl: 'High-risk procedure performed in specialized units.',
        image: 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?q=80&w=2000&auto=format&fit=crop',
        icon: 'Activity'
      }
    ],
    accentColor: 'blue'
  },
  {
    id: 11,
    type: 'spotlight',
    title: 'CRITICAL COMPLICATIONS',
    subtitle: 'Neurological Risks of Toxic Bilirubin',
    phases: [
      { 
        id: 'com1', 
        title: 'Acute Encephalopathy', 
        description: 'Lethargy, poor feeding, hypotonia, and high-pitched cry.', 
        clinicalPearl: 'Potentially reversible if treated aggressively.',
        icon: 'Brain',
        image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2000&auto=format&fit=crop'
      },
      { 
        id: 'com2', 
        title: 'Kernicterus', 
        description: 'Irreversible brain damage, hearing loss, cerebral palsy, and gaze palsy.', 
        medicalValue: 'Permanent Damage',
        icon: 'AlertTriangle'
      }
    ],
    accentColor: 'crimson'
  },
  {
    id: 12,
    type: 'summary',
    title: 'PREVENTION & SCREENING',
    subtitle: 'Safeguarding the Neonate',
    phases: [
      { id: 'pr1', title: 'Supportive Care', description: 'Early breastfeeding, adequate intake, hydration maintenance.', icon: 'Heart' },
      { id: 'pr2', title: 'Routine Screening', description: 'Universal screening before discharge using nomograms.', icon: 'Activity', medicalValue: 'Nomogram' },
      { id: 'pr3', title: 'Education', description: 'Training parents to recognize worsening discoloration.', icon: 'Accessibility' }
    ],
    accentColor: 'emerald'
  },
  {
    id: 13,
    type: 'summary',
    title: 'CLINICAL PROCEDURE',
    subtitle: 'Phototherapy Guidelines',
    phases: [
      { id: 'proc1', title: 'Preparation', description: 'Gather supplies: unit, eye shields, diaper, thermometer.', icon: 'Activity' },
      { id: 'proc2', title: 'Implementation', description: 'Positioning, height adjustment, and thermal monitoring.', icon: 'Zap' },
      { id: 'proc3', title: 'Post-Procedure', description: 'Gentle eye shield removal, skin assessment, and hygiene.', icon: 'CheckCircle2' }
    ],
    accentColor: 'cyan'
  },
  {
    id: 14,
    type: 'spotlight',
    title: 'NURSING ROLE',
    subtitle: 'Bedside Excellence & Advocacy',
    phases: [
      { 
        id: 'nur1', 
        title: 'Detection & Monitoring', 
        description: 'Visual inspection under adequate lighting and TcB tracking.', 
        clinicalPearl: 'Always track cephalocaudal progression daily.',
        icon: 'Stethoscope',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2000&auto=format&fit=crop'
      },
      { 
        id: 'nur2', 
        title: 'Family Support', 
        description: 'Reassuring parents, explaining rationale, and psychological support.', 
        clinicalPearl: 'Encourage skin-to-skin contact during breaks.',
        icon: 'Accessibility'
      }
    ],
    accentColor: 'rose'
  },
  {
    id: 15,
    type: 'hero',
    title: 'SUMMARY & FOLLOW-UP',
    subtitle: 'Ensuring Long-Term Safety Post-Discharge',
    phases: [
      { 
        id: 'end1', 
        title: 'Post-Discharge', 
        description: 'Bilirubin check within 24-48 hours after hospital exit.', 
        icon: 'CheckCircle2',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2000&auto=format&fit=crop'
      }
    ],
    accentColor: 'blue'
  }
];
