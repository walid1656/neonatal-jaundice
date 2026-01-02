
import React, { useState, useEffect } from 'react';
import { SlideContent, SlidePhase, AccentColor, BackgroundStyle } from '../types';
import { IconRenderer } from './Icons';

interface Props {
  slide: SlideContent;
  currentPhase: number;
}

const colorMap = {
  blue: { primary: 'blue-500', bg: 'blue-600', glow: 'rgba(59, 130, 246, 0.4)' },
  gold: { primary: 'yellow-500', bg: 'yellow-600', glow: 'rgba(234, 179, 8, 0.4)' },
  emerald: { primary: 'emerald-500', bg: 'emerald-600', glow: 'rgba(16, 185, 129, 0.4)' },
  rose: { primary: 'rose-500', bg: 'rose-600', glow: 'rgba(244, 63, 94, 0.4)' },
  purple: { primary: 'purple-500', bg: 'purple-600', glow: 'rgba(168, 85, 247, 0.4)' },
  cyan: { primary: 'cyan-400', bg: 'cyan-600', glow: 'rgba(34, 211, 238, 0.4)' },
  crimson: { primary: 'red-500', bg: 'red-700', glow: 'rgba(239, 68, 68, 0.4)' },
  amber: { primary: 'amber-500', bg: 'amber-600', glow: 'rgba(245, 158, 11, 0.4)' },
  indigo: { primary: 'indigo-500', bg: 'indigo-600', glow: 'rgba(99, 102, 241, 0.4)' }
};

const SafeImage: React.FC<{ src?: string; alt: string; className: string; showScan?: boolean; active?: boolean }> = ({ src, alt, className, showScan, active }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  if (!src || error) {
    return (
      <div className={`${className} bg-slate-900 flex items-center justify-center border-2 border-white/5 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="text-center z-10 px-6">
          <IconRenderer name="Activity" className="w-8 h-8 text-blue-500/40 mx-auto mb-2" />
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Visual Missing</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden transition-transform duration-[4s] ${active ? 'scale-110' : 'scale-100'}`}>
      {loading && (
        <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center z-20">
          <IconRenderer name="Clock" className="w-8 h-8 text-blue-500/20 animate-spin" />
        </div>
      )}
      {showScan && <div className="scan-line"></div>}
      <img
        src={src}
        alt={alt}
        className={`${className} ${active ? 'ken-burns' : ''} transition-all duration-[2000ms] ${loading ? 'opacity-0 blur-2xl' : 'opacity-100 blur-0'}`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

const SlideRenderer: React.FC<Props> = ({ slide, currentPhase }) => {
  const accent = slide.accentColor || 'blue';
  const theme = (colorMap as any)[accent] || colorMap.blue;
  const glassAlpha = slide.glassIntensity ?? 0.6;
  const activePhase = slide.phases[currentPhase] || slide.phases[0];

  const renderPhaseDetails = (phase: SlidePhase, active: boolean) => (
    <div className={`mt-4 space-y-4 transition-all duration-1000 ${active ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-6 h-0 overflow-hidden'}`}>
      {phase.clinicalPearl && (
        <div className={`p-4 rounded-[1.5rem] bg-${theme.primary}/10 border border-${theme.primary}/30 flex gap-4 items-start shadow-lg`}>
          <div className={`p-1.5 rounded-lg bg-${theme.primary}/20`}>
            <IconRenderer name="Zap" className={`w-4 h-4 text-${theme.primary}`} />
          </div>
          <div className="flex-1">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-1">Clinical Deep-Dive</span>
             <p className="text-xs text-slate-200 leading-relaxed font-medium italic">"{phase.clinicalPearl}"</p>
          </div>
        </div>
      )}
      
      {phase.medicalValue && (
        <div className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-white/5">
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Indicator</span>
              <span className="text-[10px] font-bold text-slate-300">Evidence Level A</span>
           </div>
           <div className="flex flex-col items-end">
              <span className={`text-xl font-black text-${theme.primary} atlas-title glow-pulse`}>{phase.medicalValue}</span>
              <span className="text-[7px] font-bold text-white/20 uppercase">Units/Grade</span>
           </div>
        </div>
      )}

      {active && phase.technicalDetail && (
          <div className="animate-in slide-in-from-bottom duration-700 delay-300">
             <p className="text-[10px] text-slate-400 font-light leading-relaxed border-l-2 border-white/10 pl-3">{phase.technicalDetail}</p>
          </div>
      )}
    </div>
  );

  const renderHero = () => (
    <div className="h-full w-full flex overflow-hidden relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <SafeImage 
          src={activePhase.image || "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2000&auto=format&fit=crop"}
          alt="Immersive Background"
          active={true}
          className="w-full h-full object-cover opacity-20 grayscale brightness-50 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col justify-center px-24">
        <div className="space-y-12 max-w-5xl">
          <div className="flex items-center gap-6 animate-pulse">
            <div className={`w-24 h-px bg-${theme.primary}`}></div>
            <span className={`text-[9px] font-black uppercase tracking-[0.8em] text-${theme.primary}`}>Diagnostics Protocol 2025</span>
          </div>
          
          <div className="space-y-3">
              <h1 className="atlas-title text-[90px] font-black leading-[0.85] text-white text-reveal">
                {slide.title.split(' ')[0]}<br/>
                <span className={`text-transparent border-t-4 border-${theme.primary} pt-4 inline-block`} style={{ WebkitTextStroke: '1.5px white' }}>
                   {slide.title.split(' ').slice(1).join(' ')}
                </span>
              </h1>
          </div>

          <p className="text-2xl text-slate-400 font-light tracking-wide max-w-3xl leading-relaxed text-reveal [animation-delay:0.4s]">
            {slide.subtitle}
          </p>

          <div className="flex gap-16 pt-8 overflow-visible">
            {slide.phases.map((phase, i) => (
              <div key={phase.id} className={`transition-all duration-[1.5s] delay-${i * 200} ${i <= currentPhase ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                <div className="flex items-center gap-6 group relative">
                  <span className={`text-6xl font-black transition-all duration-1000 ${i === currentPhase ? `text-${theme.primary} scale-125 translate-x-2` : 'text-white/5 grayscale'}`}>0{i+1}</span>
                  <div className={`h-16 w-px transition-colors duration-1000 ${i === currentPhase ? `bg-${theme.primary}/60` : 'bg-white/5'}`}></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Protocol Node</span>
                    <span className={`text-xl font-black uppercase transition-all duration-1000 ${i === currentPhase ? 'text-white translate-x-1' : 'text-slate-700'}`}>{phase.title}</span>
                  </div>
                  {i === currentPhase && (
                      <div className={`absolute -left-8 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-${theme.primary} animate-ping`}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStandardGrid = () => (
    <div className="h-full w-full flex flex-col justify-center px-16 gap-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none transition-all duration-[2s]">
          <img 
            src={activePhase.image} 
            key={activePhase.id + '_bg'} 
            className="w-full h-full object-cover blur-[100px] scale-125 animate-in fade-in duration-[2000ms]" 
          />
      </div>

      <div className="space-y-6 relative z-20">
        <h2 className="atlas-title text-[140px] font-black text-white leading-none -ml-4 opacity-5 absolute -top-24 left-0 pointer-events-none select-none uppercase">{slide.title}</h2>
        <div className="relative space-y-4">
           <h3 className="atlas-title text-7xl font-black text-white uppercase text-reveal tracking-tighter">{slide.title}</h3>
           <div className="flex items-center gap-8">
              <div className={`w-32 h-2 bg-${theme.primary} shadow-[0_0_30px_${theme.glow}]`}></div>
              <p className={`text-xl font-black text-${theme.primary} uppercase tracking-[0.6em] text-reveal [animation-delay:0.3s]`}>{slide.subtitle}</p>
           </div>
        </div>
      </div>

      <div className="flex gap-8 items-end overflow-visible pb-12 relative z-20">
        {slide.phases.map((phase, i) => {
          const isActive = i === currentPhase;
          return (
            <div 
              key={phase.id}
              style={{ backgroundColor: `rgba(15, 23, 42, ${isActive ? 0.9 : glassAlpha})` }}
              className={`phase-card rounded-[3rem] backdrop-blur-[60px] border transition-all duration-1000 flex flex-col relative overflow-visible
                ${i <= currentPhase ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-40'}
                ${isActive ? `phase-card-active border-${theme.primary} w-[550px]` : `phase-card-inactive border-white/5 w-[320px]`}
              `}
            >
              {phase.image && (
                  <div className={`relative transition-all duration-1000 ${isActive ? 'h-[320px]' : 'h-40'} -mx-1 -mt-1 overflow-hidden rounded-t-[3rem] border-b border-white/10`}>
                    <SafeImage src={phase.image} alt={phase.title} active={isActive} showScan={isActive} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    {isActive && (
                      <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-2xl">
                         HD Insight
                      </div>
                    )}
                  </div>
              )}
              
              <div className={`p-10 space-y-6 transition-all duration-700 ${isActive ? 'scale-100' : 'scale-95'}`}>
                 <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-1000
                      ${isActive ? `bg-${theme.primary} shadow-[0_0_40px_${theme.glow}] scale-110` : 'bg-white/5'}
                    `}>
                      <IconRenderer name={phase.icon || 'Activity'} className={`transition-all duration-1000 ${isActive ? 'w-7 h-7 text-white' : 'w-6 h-6 text-white/20'}`} />
                    </div>
                    <div className="flex flex-col">
                       <span className={`text-[10px] font-black uppercase tracking-widest mb-0.5 transition-colors ${isActive ? `text-${theme.primary}` : 'text-slate-600'}`}>Node 0{i+1}</span>
                       <h4 className={`text-3xl font-black text-white atlas-title leading-tight transition-all uppercase ${isActive ? 'scale-105 origin-left' : ''}`}>{phase.title}</h4>
                    </div>
                 </div>
                 <p className={`text-slate-400 leading-relaxed font-light transition-all duration-1000 ${isActive ? 'text-lg' : 'text-sm'}`}>{phase.description}</p>
                 {renderPhaseDetails(phase, isActive)}
              </div>

              {isActive && (
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-24 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 flex flex-col items-center justify-center gap-2 animate-in slide-in-from-right duration-700">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${theme.primary} animate-bounce`}></div>
                      <div className={`w-1.5 h-1.5 rounded-full bg-${theme.primary}/40 animate-bounce [animation-delay:0.1s]`}></div>
                      <div className={`w-1.5 h-1.5 rounded-full bg-${theme.primary}/20 animate-bounce [animation-delay:0.2s]`}></div>
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderComparison = () => (
    <div className="h-full w-full flex items-center justify-center px-16 gap-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 flex opacity-10 pointer-events-none">
            <div className="flex-1 overflow-hidden relative border-r border-white/5">
                <img src={slide.phases[0]?.image} className="w-full h-full object-cover blur-2xl scale-125 ken-burns" />
            </div>
            <div className="flex-1 overflow-hidden relative">
                <img src={slide.phases[1]?.image} className="w-full h-full object-cover blur-2xl scale-125 ken-burns" style={{ animationDirection: 'reverse' }} />
            </div>
        </div>

      {slide.phases.slice(0, 2).map((phase, i) => {
          const isActive = i === currentPhase || (currentPhase >= 2 && i === 1);
          return (
            <div key={phase.id} className={`flex-1 h-[75vh] rounded-[4rem] border transition-all duration-[1.5s] overflow-hidden relative z-10
                ${isActive ? `border-${theme.primary} scale-105 z-20 shadow-[0_0_80px_rgba(0,0,0,1)]` : 'border-white/5 opacity-20 scale-95 blur-[2px]'}
                ${i <= currentPhase ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}
            `}>
               <SafeImage src={phase.image} alt={phase.title} showScan={isActive} active={isActive} className="w-full h-full object-cover grayscale brightness-50 hover:grayscale-0 transition-all duration-[2s]" />
               <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-${theme.bg}/20 to-${theme.bg}/95`}></div>
               <div className="absolute inset-0 p-16 flex flex-col justify-end gap-6">
                 <div className={`w-16 h-16 rounded-[2rem] bg-${theme.primary} flex items-center justify-center shadow-2xl shadow-${theme.primary}/40 pulse-medical`}>
                   <IconRenderer name={phase.icon || 'Activity'} className="w-8 h-8 text-white" />
                 </div>
                 <div className="space-y-4">
                    <h3 className="atlas-title text-5xl font-black text-white uppercase text-reveal tracking-tighter">{phase.title}</h3>
                    <p className={`text-xl text-slate-200 leading-relaxed font-light transition-all duration-[1.2s] ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>{phase.description}</p>
                 </div>
                 {renderPhaseDetails(phase, isActive)}
               </div>
            </div>
          );
      })}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
         <div className="w-24 h-24 rounded-full bg-slate-950 border-4 border-white/20 flex items-center justify-center text-xl font-black text-white/50 tracking-[0.3em] shadow-[0_0_80px_rgba(0,0,0,1)] hover:scale-110 transition-transform cursor-pointer">VS</div>
      </div>
    </div>
  );

  const renderSpotlight = () => (
    <div className="h-full w-full flex items-center justify-center px-16 gap-24 relative overflow-hidden">
       <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden transition-all duration-[3s]">
            <img 
                src={activePhase.image} 
                key={activePhase.id + '_glow'}
                className="w-full h-full object-cover blur-[150px] scale-150 animate-in fade-in zoom-in-150 duration-[3000ms]" 
            />
       </div>

       <div className={`flex-[1.5] h-[75vh] rounded-[5rem] overflow-hidden border border-white/10 relative shadow-[0_0_120px_rgba(0,0,0,0.8)] transition-all duration-[1.8s] ${currentPhase >= 0 ? 'scale-100 opacity-100 rotate-0' : 'scale-90 opacity-0 rotate-3 translate-x-16'}`}>
          <SafeImage src={activePhase.image} alt={activePhase.title} showScan={true} active={true} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          <div className="absolute bottom-16 left-16 space-y-6">
             <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-full bg-${theme.primary}/20 border border-${theme.primary}/40 backdrop-blur-3xl mb-2 shadow-2xl`}>
                <div className={`w-3 h-3 rounded-full bg-${theme.primary} animate-ping`}></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Clinical Telemetry</span>
             </div>
             <h3 className="atlas-title text-8xl font-black text-white uppercase text-reveal leading-[0.8] tracking-tighter">{activePhase.title}</h3>
          </div>
       </div>

       <div className="w-[450px] space-y-8 z-10 pr-6">
          {slide.phases.map((phase, i) => {
            const isActive = i === currentPhase;
            return (
                <div 
                  key={phase.id}
                  className={`p-10 rounded-[3rem] border transition-all duration-[1.2s] relative
                    ${i <= currentPhase ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-40'}
                    ${isActive ? `bg-${theme.primary}/10 border-${theme.primary} scale-110 shadow-[0_30px_80px_rgba(0,0,0,0.6)]` : 'bg-white/5 border-transparent opacity-10 grayscale scale-90 blur-sm'}
                  `}
                >
                   <div className="flex items-center gap-6 mb-4">
                      <span className={`text-5xl font-black transition-all duration-1000 ${isActive ? `text-${theme.primary} scale-110` : 'text-white/5'}`}>0{i+1}</span>
                      <h4 className={`text-3xl font-black text-white atlas-title uppercase transition-all duration-1000 ${isActive ? 'translate-x-1' : ''}`}>{phase.title}</h4>
                   </div>
                   <p className={`text-slate-400 leading-relaxed font-light transition-all duration-1000 ${isActive ? 'text-lg opacity-100' : 'text-sm opacity-40'}`}>{phase.description}</p>
                   {renderPhaseDetails(phase, isActive)}

                   {isActive && (
                       <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-24 bg-white/20 rounded-full overflow-hidden">
                           <div className={`w-full bg-${theme.primary} animate-progress-vertical h-full shadow-[0_0_15px_${theme.glow}]`}></div>
                       </div>
                   )}
                </div>
            );
          })}
       </div>
    </div>
  );

  switch (slide.type) {
    case 'hero': return renderHero();
    case 'comparison': return renderComparison();
    case 'spotlight': return renderSpotlight();
    default: return renderStandardGrid();
  }
};

export default SlideRenderer;
