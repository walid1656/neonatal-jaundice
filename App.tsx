
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_SLIDES } from './constants';
import SlideRenderer from './components/SlideRenderer';
import { IconRenderer, Icons } from './components/Icons';
import { SlideContent, SlideType, AccentColor, CardSize, BackgroundStyle } from './types';
import { GoogleGenAI } from "@google/genai";

const EDITOR_PASSWORD = 'Sohila@@Admin@@';

function App() {
  const [slides, setSlides] = useState<SlideContent[]>(() => {
    const saved = localStorage.getItem('atlas_slides_v10');
    return saved ? JSON.parse(saved) : INITIAL_SLIDES;
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const activeSlide = slides[currentSlide];

  const progress = useMemo(() => {
    const totalSlides = slides.length;
    if (totalSlides === 0) return 0;
    const currentSlideProgress = currentSlide / totalSlides;
    const phaseProgress = (currentPhase + 1) / (activeSlide.phases.length * totalSlides);
    return (currentSlideProgress + phaseProgress) * 100;
  }, [currentSlide, currentPhase, activeSlide.phases.length, slides.length]);

  useEffect(() => {
    localStorage.setItem('atlas_slides_v10', JSON.stringify(slides));
  }, [slides]);

  const handleEditModeRequest = () => {
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError('');
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === EDITOR_PASSWORD) {
      setIsEditMode(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('كلمة المرور غير صحيحة');
      setPasswordInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  const handleNext = useCallback(() => {
    if (currentPhase < activeSlide.phases.length - 1) {
      setCurrentPhase(prev => prev + 1);
    } else if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
      setCurrentPhase(0);
    }
  }, [currentPhase, currentSlide, activeSlide.phases.length, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentPhase > 0) {
      setCurrentPhase(prev => prev - 1);
    } else if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setCurrentPhase(slides[currentSlide - 1].phases.length - 1);
    }
  }, [currentPhase, currentSlide, slides]);

  const handleGlobalClick = (e: React.MouseEvent) => {
    if (isEditMode) return;
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.edit-panel')) return;
    handleNext();
  };

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    if (isEditMode) return;
    e.preventDefault();
    handlePrev();
  };

  const updateActiveSlide = (updated: Partial<SlideContent>) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = { ...activeSlide, ...updated };
    setSlides(newSlides);
  };

  const updatePhase = (idx: number, updated: any) => {
    const newPhases = [...activeSlide.phases];
    newPhases[idx] = { ...newPhases[idx], ...updated };
    updateActiveSlide({ phases: newPhases });
  };

  const generateAIVisual = async (phaseIdx: number) => {
    const phase = activeSlide.phases[phaseIdx];
    if (isProcessingImage) return;
    setIsProcessingImage(phase.id);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `A professional, high-quality clinical 3D medical illustration for a medical presentation. Subject: ${phase.title}. Context: ${phase.description}. Style: Clean, educational, scientific, photorealistic medical visualization, soft clinical lighting, isolated on a deep dark professional background.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          updatePhase(phaseIdx, { image: imageUrl });
          break;
        }
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI Image generation failed. Please check your network or API quota.");
    } finally {
      setIsProcessingImage(null);
    }
  };

  const removeBackground = async (phaseIdx: number, imageUrl: string) => {
    if (!imageUrl || isProcessingImage) return;
    setIsProcessingImage(activeSlide.phases[phaseIdx].id);
    
    try {
      const responseImg = await fetch(imageUrl);
      const blob = await responseImg.blob();
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      const base64Data = await base64Promise;
      const cleanBase64 = base64Data.split(',')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: blob.type } },
            { text: "Remove the background of this image. Keep only the central medical subject. Ensure the background is pure black or transparent if possible. Maintain high detail on the subject." }
          ]
        }
      });

      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
          const newUrl = `data:image/png;base64,${part.inlineData.data}`;
          updatePhase(phaseIdx, { image: newUrl });
          break;
        }
      }
    } catch (error) {
      console.error("AI BG Removal failed:", error);
      alert("Failed to process image. Ensure the URL is accessible.");
    } finally {
      setIsProcessingImage(null);
    }
  };

  const addSlide = () => {
    const newSlide: SlideContent = {
      id: Date.now(),
      type: 'summary',
      title: 'NEW CLINICAL SLIDE',
      subtitle: 'New Subtitle Content',
      accentColor: 'blue',
      glassIntensity: 0.6,
      backgroundStyle: 'mesh',
      phases: [{ id: 'p'+Date.now(), title: 'Phase 1', description: 'Content here...', icon: 'Activity' }]
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
    setCurrentPhase(0);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== currentSlide);
    setSlides(newSlides);
    setCurrentSlide(Math.max(0, currentSlide - 1));
    setCurrentPhase(0);
  };

  return (
    <div 
      className="relative h-screen w-full bg-[#050a15] text-white overflow-hidden panoramic-bg select-none"
      onClick={handleGlobalClick}
      onContextMenu={handleGlobalContextMenu}
    >
      {/* Editor Panel */}
      {isEditMode && (
        <div className="edit-panel fixed inset-y-0 right-0 w-[450px] bg-slate-950/98 backdrop-blur-[80px] z-[150] border-l border-white/10 p-8 overflow-y-auto shadow-[-50px_0_120px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500 no-scrollbar" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h2 className="atlas-title text-xl font-black text-blue-400 uppercase tracking-tighter">Clinical Editor Suite</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Architect Mode Active</p>
            </div>
            <div className="flex gap-2">
               <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                  <button 
                    onClick={addSlide} 
                    title="Add New Slide"
                    className="p-3 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                  >
                    <IconRenderer name="Activity" className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={deleteSlide} 
                    title="Delete Current Slide"
                    className="p-3 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                  >
                    <IconRenderer name="Trash2" className="w-5 h-5" />
                  </button>
               </div>
               <button 
                onClick={() => setIsEditMode(false)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-all"
                title="Close Editor"
               >
                 <IconRenderer name="X" className="w-5 h-5" />
               </button>
            </div>
          </div>
          
          <div className="space-y-8">
            <section className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Architecture</label>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">System Accent Palette</span>
                  <div className="flex flex-wrap gap-2">
                    {(['blue', 'gold', 'emerald', 'rose', 'purple', 'cyan', 'crimson', 'amber', 'indigo'] as AccentColor[]).map(c => (
                      <button 
                        key={c}
                        onClick={() => updateActiveSlide({ accentColor: c })}
                        className={`w-7 h-7 rounded-full border-2 ${activeSlide.accentColor === c ? 'border-white scale-110' : 'border-transparent'} bg-${c === 'gold' ? 'yellow' : c === 'emerald' ? 'emerald' : c === 'rose' ? 'rose' : c === 'purple' ? 'purple' : c === 'cyan' ? 'cyan' : c === 'crimson' ? 'red' : c === 'amber' ? 'amber' : c === 'indigo' ? 'indigo' : 'blue'}-500 shadow-xl transition-all hover:scale-105`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Background</span>
                      <select 
                        className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-colors"
                        value={activeSlide.backgroundStyle || 'mesh'}
                        onChange={e => updateActiveSlide({ backgroundStyle: e.target.value as BackgroundStyle })}
                      >
                        <option value="mesh">Interactive Mesh</option>
                        <option value="glass-gradient">Glass Gradient</option>
                        <option value="deep-solid">Clinical Solid</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Layout</span>
                      <select 
                        className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-colors"
                        value={activeSlide.type}
                        onChange={e => updateActiveSlide({ type: e.target.value as SlideType })}
                      >
                        <optgroup label="Core Designs">
                            <option value="hero">Cinematic Hero</option>
                            <option value="summary">Standard Matrix</option>
                            <option value="gallery">Visual Gallery</option>
                        </optgroup>
                        <optgroup label="Advanced Flow">
                            <option value="cycle">Clinical Cycle</option>
                            <option value="timeline">Time Evolution</option>
                            <option value="pathway">Decision Flow</option>
                        </optgroup>
                        <optgroup label="Impact Focus">
                            <option value="spotlight">Phase Spotlight</option>
                            <option value="comparison">Side Comparison</option>
                        </optgroup>
                      </select>
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Glass Opacity</span>
                    <span>{Math.round((activeSlide.glassIntensity || 0.6) * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  value={activeSlide.glassIntensity ?? 0.6}
                  onChange={e => updateActiveSlide({ glassIntensity: parseFloat(e.target.value) })}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1.5">
                 <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-3">Slide Title</span>
                 <input 
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-[1.5rem] focus:border-blue-500 outline-none text-xl font-black uppercase atlas-title tracking-tighter"
                    placeholder="E.g. NEONATAL PATHOLOGY"
                    value={activeSlide.title}
                    onChange={e => updateActiveSlide({ title: e.target.value })}
                  />
              </div>
              <div className="space-y-1.5">
                 <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-3">Subtitle</span>
                  <input 
                    className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl focus:border-blue-500 outline-none text-sm text-slate-400 font-light"
                    placeholder="Enter context..."
                    value={activeSlide.subtitle}
                    onChange={e => updateActiveSlide({ subtitle: e.target.value })}
                  />
              </div>
            </section>

            <section className="space-y-6 pb-24">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Phase Nodes</label>
                <button 
                  onClick={() => updateActiveSlide({ phases: [...activeSlide.phases, { id: 'p'+Date.now(), title: 'New Protocol Step', description: 'Enter description...', icon: 'Activity' }] })}
                  className="text-[9px] font-black text-blue-400 hover:text-white px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 transition-all hover:bg-blue-500"
                >+ APPEND NODE</button>
              </div>

              {activeSlide.phases.map((phase, idx) => (
                <div key={phase.id} className="p-6 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-5 relative group hover:border-blue-500/40 transition-all duration-700 shadow-xl">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Step {idx+1}</p>
                    <div className="flex gap-2">
                       <select 
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase outline-none focus:border-blue-500"
                        value={phase.size || 'md'}
                        onChange={e => updatePhase(idx, { size: e.target.value as CardSize })}
                      >
                        <option value="sm">Compact</option>
                        <option value="md">Standard</option>
                        <option value="lg">Wide</option>
                      </select>
                      <button onClick={() => updateActiveSlide({ phases: activeSlide.phases.filter((_, i) => i !== idx) })} className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><IconRenderer name="X" className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-1">
                      <select 
                        className="w-full h-full bg-black/50 border border-white/10 rounded-xl flex items-center justify-center text-xl text-center outline-none focus:border-blue-500 transition-colors"
                        value={phase.icon}
                        onChange={e => updatePhase(idx, { icon: e.target.value })}
                      >
                        {Object.keys(Icons).map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <input 
                      className="col-span-5 bg-black/50 border border-white/5 p-4 rounded-xl text-base font-black uppercase atlas-title focus:border-blue-500 outline-none transition-colors"
                      value={phase.title}
                      placeholder="Title"
                      onChange={e => updatePhase(idx, { title: e.target.value })}
                    />
                  </div>

                  <textarea 
                    className="w-full bg-black/50 border border-white/5 p-4 rounded-xl text-xs h-24 resize-none focus:border-blue-500 outline-none leading-relaxed text-slate-300 font-light"
                    value={phase.description}
                    placeholder="Evidence..."
                    onChange={e => updatePhase(idx, { description: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2">Clinical Pearl</span>
                        <input 
                            className="w-full bg-black/50 border border-white/5 p-3 rounded-lg text-[10px] text-emerald-400 outline-none focus:border-emerald-500 transition-colors"
                            value={phase.clinicalPearl || ''}
                            placeholder="Insight..."
                            onChange={e => updatePhase(idx, { clinicalPearl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2">Value</span>
                        <input 
                            className="w-full bg-black/50 border border-white/5 p-3 rounded-lg text-[10px] text-blue-400 font-black outline-none focus:border-blue-500 transition-colors"
                            value={phase.medicalValue || ''}
                            placeholder="E.g. >15"
                            onChange={e => updatePhase(idx, { medicalValue: e.target.value })}
                        />
                      </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Visual Studio</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => generateAIVisual(idx)}
                          disabled={isProcessingImage === phase.id}
                          className={`text-[8px] font-black px-4 py-2 rounded-xl border transition-all ${isProcessingImage === phase.id ? 'bg-blue-600 animate-pulse' : 'border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white'}`}
                        >
                          {isProcessingImage === phase.id ? 'GENERATING...' : '✨ AI GENERATE'}
                        </button>
                        <button 
                          onClick={() => removeBackground(idx, phase.image || '')}
                          disabled={!phase.image || isProcessingImage === phase.id}
                          className={`text-[8px] font-black px-4 py-2 rounded-xl border transition-all ${isProcessingImage === phase.id ? 'bg-blue-600 animate-pulse' : 'border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white'}`}
                        >
                          {isProcessingImage === phase.id ? 'EXTRACTING...' : 'AI BG REMOVE'}
                        </button>
                      </div>
                    </div>
                    <input 
                      className="w-full bg-black/50 border border-white/5 p-3 rounded-xl text-[10px] font-mono text-blue-300/40 focus:border-blue-500 outline-none transition-colors"
                      value={phase.image || ''}
                      placeholder="Image URL..."
                      onChange={e => updatePhase(idx, { image: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}

      {/* Editor Trigger */}
      <div className="fixed top-8 right-8 z-[100]">
        <button 
          onClick={(e) => { e.stopPropagation(); isEditMode ? setIsEditMode(false) : handleEditModeRequest(); }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-700 border ${isEditMode ? 'bg-red-600 border-red-500 rotate-90' : 'bg-blue-600/10 border-blue-500/30 backdrop-blur-[40px] hover:bg-blue-600 hover:scale-110'}`}
        >
          <IconRenderer name={isEditMode ? "X" : "Menu"} className="w-6 h-6" />
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-slate-950 border border-blue-500/30 rounded-[3rem] p-10 w-96 shadow-2xl backdrop-blur-[80px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="atlas-title text-2xl font-black text-white mb-2 uppercase">Clinical Access</h3>
            <p className="text-slate-400 text-sm mb-6">أدخل كلمة المرور للدخول إلى المحرر</p>
            
            <div className="space-y-4">
              <div>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="كلمة المرور"
                  className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-colors"
                  autoFocus
                />
              </div>
              
              {passwordError && (
                <div className="text-red-400 text-sm font-bold">{passwordError}</div>
              )}
              
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-bold"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handlePasswordSubmit}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"
                >
                  دخول
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Navigation Dots */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-10 pointer-events-none">
        <div className="text-vertical text-[9px] font-black uppercase tracking-[1em] text-white/5 animate-pulse">Diagnostics 2025</div>
        <div className="w-px h-32 bg-gradient-to-b from-transparent via-blue-500/40 to-transparent"></div>
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[40vh] no-scrollbar pointer-events-auto px-4 py-6">
           {slides.map((_, i) => (
             <div 
               key={i} 
               onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); setCurrentPhase(0); }}
               className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-700 ${i === currentSlide ? 'bg-blue-500 scale-[2.5] shadow-[0_0_20px_rgba(59,130,246,1)]' : 'bg-white/5 hover:bg-white/30'}`}
             ></div>
           ))}
        </div>
      </div>

      <main className="relative z-40 h-full w-full flex items-center justify-center pointer-events-none overflow-hidden">
        <div key={currentSlide} className="w-full h-full panoramic-slide">
          <SlideRenderer slide={activeSlide} currentPhase={currentPhase} />
        </div>
      </main>

      {/* Cinematic Control Dock */}
      <footer className="absolute bottom-10 left-20 z-50 pointer-events-none">
        <div className="flex items-center gap-10 bg-slate-950/40 backdrop-blur-[60px] px-8 py-4 rounded-[3rem] border border-white/10 pointer-events-auto shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.4em] mb-2 ml-1">Protocol Nav</span>
            <div className="flex items-center gap-6">
              <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="p-2 hover:bg-white/10 rounded-xl transition-all group scale-110">
                <IconRenderer name="ChevronLeft" className="w-6 h-6 group-hover:text-blue-400 transition-transform" />
              </button>
              <div className="text-2xl font-black atlas-title flex items-baseline gap-1.5 tabular-nums">
                {String(currentSlide + 1).padStart(2, '0')}
                <span className="text-white/10 mx-0.5 text-sm">/</span>
                <span className="text-white/20 text-sm font-medium">{String(slides.length).padStart(2, '0')}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="p-2 hover:bg-white/10 rounded-xl transition-all group scale-110">
                <IconRenderer name="ChevronRight" className="w-6 h-6 group-hover:text-blue-400 transition-transform" />
              </button>
            </div>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.4em] mb-2 ml-1">Active Step</span>
            <div className="flex gap-2.5">
              {activeSlide.phases.map((_, i) => (
                <div 
                    key={i} 
                    onClick={(e) => { e.stopPropagation(); setCurrentPhase(i); }}
                    className={`h-2 rounded-full cursor-pointer transition-all duration-1000 ${i <= currentPhase ? 'w-10 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'w-2 bg-white/10 hover:bg-white/30'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Progress Monitor */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-white/5 z-[60]">
        <div 
          className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] transition-all duration-[2s] ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default App;
