
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_SLIDES } from './constants';
import SlideRenderer from './components/SlideRenderer';
import { IconRenderer, Icons } from './components/Icons';
import { SlideContent, SlideType, AccentColor, CardSize, BackgroundStyle, TransitionType, Presentation } from './types';
import { GoogleGenAI } from "@google/genai";

function App() {
  const [presentations, setPresentations] = useState<Presentation[]>(() => {
    const saved = localStorage.getItem('atlas_presentations_v1');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'default',
      name: 'Neonatal Jaundice',
      slides: INITIAL_SLIDES,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      color: 'blue'
    }];
  });

  const [currentPresentationId, setCurrentPresentationId] = useState<string>(() => {
    const saved = localStorage.getItem('atlas_current_presentation');
    return saved || 'default';
  });

  const [slides, setSlides] = useState<SlideContent[]>(() => {
    const presentation = presentations.find(p => p.id === currentPresentationId);
    return presentation?.slides || INITIAL_SLIDES;
  });

  const currentPresentation = presentations.find(p => p.id === currentPresentationId);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Session-based auth
  const [isProcessingImage, setIsProcessingImage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState<'edit' | 'create'>('edit');
  const [showPresentationsModal, setShowPresentationsModal] = useState(false);
  const [showPresentationSelector, setShowPresentationSelector] = useState(false);
  const [showNewPresentationForm, setShowNewPresentationForm] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('atlas_theme_mode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });

  const EDITOR_PASSWORD = 'Sohila@@Admin@@';

  const activeSlide = slides[currentSlide];

  const progress = useMemo(() => {
    const totalSlides = slides.length;
    if (totalSlides === 0) return 0;
    const currentSlideProgress = currentSlide / totalSlides;
    const phaseProgress = (currentPhase + 1) / (activeSlide.phases.length * totalSlides);
    return (currentSlideProgress + phaseProgress) * 100;
  }, [currentSlide, currentPhase, activeSlide.phases.length, slides.length]);

  // Save presentations whenever they change
  useEffect(() => {
    localStorage.setItem('atlas_presentations_v1', JSON.stringify(presentations));
  }, [presentations]);

  // Save current presentation ID
  useEffect(() => {
    localStorage.setItem('atlas_current_presentation', currentPresentationId);
  }, [currentPresentationId]);

  // Update slides when presentation changes
  useEffect(() => {
    const presentation = presentations.find(p => p.id === currentPresentationId);
    if (presentation) {
      setSlides(presentation.slides);
      setCurrentSlide(0);
      setCurrentPhase(0);
    }
  }, [currentPresentationId, presentations]);

  // Update current presentation slides
  useEffect(() => {
    setPresentations(prev => prev.map(p => 
      p.id === currentPresentationId 
        ? { ...p, slides, updatedAt: Date.now() }
        : p
    ));
  }, [slides]);

  useEffect(() => {
    localStorage.setItem('atlas_theme_mode', JSON.stringify(isDarkMode));
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.background = '#050a15';
      document.body.style.color = '#e2e8f0';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '#f8fafc';
      document.body.style.color = '#1e293b';
    }
  }, [isDarkMode]);

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

  const handlePasswordSubmit = () => {
    if (passwordInput === EDITOR_PASSWORD) {
      setIsAuthenticated(true); // Remember this session
      if (passwordModalMode === 'edit') {
        setIsEditMode(true);
      } else if (passwordModalMode === 'create') {
        handleCreatePresentation();
      }
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const handleEditorToggle = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      if (isAuthenticated) {
        // Already authenticated in this session
        setIsEditMode(true);
      } else {
        // Need to authenticate
        setPasswordModalMode('edit');
        setShowPasswordModal(true);
        setPasswordInput('');
        setPasswordError(false);
      }
    }
  };

  const handleCreatePresentationClick = () => {
    if (!newPresentationName.trim()) return;
    setPasswordModalMode('create');
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError(false);
  };

  const handleCreatePresentation = () => {
    if (!newPresentationName.trim()) return;
    const newId = Date.now().toString();
    const newPresentation: Presentation = {
      id: newId,
      name: newPresentationName,
      slides: INITIAL_SLIDES,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      color: 'blue'
    };
    setPresentations([...presentations, newPresentation]);
    setCurrentPresentationId(newId);
    setNewPresentationName('');
    setShowNewPresentationForm(false);
    setShowPresentationsModal(false);
  };

  const handleDeletePresentation = (id: string) => {
    if (presentations.length === 1) return;
    const newPresentations = presentations.filter(p => p.id !== id);
    setPresentations(newPresentations);
    if (currentPresentationId === id) {
      setCurrentPresentationId(newPresentations[0].id);
    }
  };

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
      className={`relative h-screen w-full text-white overflow-hidden panoramic-bg select-none transition-colors duration-700 ${isDarkMode ? 'bg-[#050a15]' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 text-slate-900'}`}
      onClick={handleGlobalClick}
      onContextMenu={handleGlobalContextMenu}
      style={!isDarkMode ? { color: '#1e293b' } : {}}
    >
      {/* Editor Panel */}
      {isEditMode && (
        <div className={`edit-panel fixed inset-y-0 right-0 w-[450px] backdrop-blur-[80px] z-[150] border-l p-8 overflow-y-auto shadow-[-50px_0_120px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500 no-scrollbar transition-colors ${isDarkMode ? 'bg-slate-950/98 border-white/10' : 'bg-white/95 border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h2 className={`atlas-title text-xl font-black uppercase tracking-tighter transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Clinical Editor Suite</h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Architect Mode Active</p>
            </div>
            <div className="flex gap-2">
               <div className={`flex rounded-2xl p-1 border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-200 border-slate-300'}`}>
                  <button 
                    onClick={addSlide} 
                    title="Add New Slide"
                    className={`p-3 rounded-xl transition-all ${isDarkMode ? 'text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                  >
                    <IconRenderer name="Activity" className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={deleteSlide} 
                    title="Delete Current Slide"
                    className={`p-3 rounded-xl transition-all ${isDarkMode ? 'text-rose-400 hover:bg-rose-500 hover:text-white' : 'text-rose-600 hover:bg-rose-600 hover:text-white'}`}
                  >
                    <IconRenderer name="Trash2" className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowPresentationsModal(true)}
                    title="Manage Presentations"
                    className={`p-3 rounded-xl transition-all ${isDarkMode ? 'text-purple-400 hover:bg-purple-500 hover:text-white' : 'text-purple-600 hover:bg-purple-600 hover:text-white'}`}
                  >
                    <IconRenderer name="Layout" className="w-5 h-5" />
                  </button>
               </div>
               <button 
                onClick={() => setIsEditMode(false)}
                className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/10' : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'}`}
                title="Close Editor"
               >
                 <IconRenderer name="X" className="w-5 h-5" />
               </button>
            </div>
          </div>
          
          <div className="space-y-8">
            <section className={`p-6 rounded-[2rem] border space-y-5 transition-colors ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
              <label className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Architecture</label>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className={`text-[9px] font-bold uppercase transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>System Accent Palette</span>
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
                      <span className={`text-[9px] font-bold uppercase transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Background</span>
                      <select 
                        className={`w-full p-3 rounded-xl text-[10px] font-black uppercase outline-none transition-colors ${isDarkMode ? 'bg-black/50 border border-white/10 focus:border-blue-500 text-white' : 'bg-white border border-slate-300 focus:border-blue-400 text-slate-900'}`}
                        value={activeSlide.backgroundStyle || 'mesh'}
                        onChange={e => updateActiveSlide({ backgroundStyle: e.target.value as BackgroundStyle })}
                      >
                        <option value="mesh">Interactive Mesh</option>
                        <option value="glass-gradient">Glass Gradient</option>
                        <option value="deep-solid">Clinical Solid</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <span className={`text-[9px] font-bold uppercase transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Layout</span>
                      <select 
                        className={`w-full p-3 rounded-xl text-[10px] font-black uppercase outline-none transition-colors ${isDarkMode ? 'bg-black/50 border border-white/10 focus:border-blue-500 text-white' : 'bg-white border border-slate-300 focus:border-blue-400 text-slate-900'}`}
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
                        <optgroup label="New Designs">
                            <option value="infographic">Infographic</option>
                            <option value="animated-list">Animated List</option>
                            <option value="card-grid">Card Grid</option>
                        </optgroup>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <span className={`text-[9px] font-bold uppercase transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Transition</span>
                      <select 
                        className={`w-full p-3 rounded-xl text-[10px] font-black uppercase outline-none transition-colors ${isDarkMode ? 'bg-black/50 border border-white/10 focus:border-blue-500 text-white' : 'bg-white border border-slate-300 focus:border-blue-400 text-slate-900'}`}
                        value={activeSlide.transitionType || 'fade'}
                        onChange={e => updateActiveSlide({ transitionType: e.target.value as TransitionType })}
                      >
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="zoom">Zoom</option>
                        <option value="flip">Flip</option>
                        <option value="rotate">Rotate</option>
                      </select>
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className={`flex justify-between text-[9px] font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>Glass Opacity</span>
                    <span>{Math.round((activeSlide.glassIntensity || 0.6) * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-slate-300'}`}
                  value={activeSlide.glassIntensity ?? 0.6}
                  onChange={e => updateActiveSlide({ glassIntensity: parseFloat(e.target.value) })}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1.5">
                 <span className={`text-[9px] font-black uppercase tracking-widest ml-3 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Slide Title</span>
                 <input 
                    className={`w-full p-4 rounded-[1.5rem] focus:outline-none text-xl font-black uppercase atlas-title tracking-tighter transition-colors ${isDarkMode ? 'bg-white/5 border border-white/10 focus:border-blue-500 text-white' : 'bg-slate-100 border border-slate-300 focus:border-blue-400 text-slate-900'}`}
                    placeholder="E.g. NEONATAL PATHOLOGY"
                    value={activeSlide.title}
                    onChange={e => updateActiveSlide({ title: e.target.value })}
                  />
              </div>
              <div className="space-y-1.5">
                 <span className={`text-[9px] font-black uppercase tracking-widest ml-3 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Subtitle</span>
                  <input 
                    className={`w-full p-3.5 rounded-xl focus:outline-none text-sm font-light transition-colors ${isDarkMode ? 'bg-white/5 border border-white/10 focus:border-blue-500 text-slate-400' : 'bg-slate-100 border border-slate-300 focus:border-blue-400 text-slate-700'}`}
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
                <div key={phase.id} className={`p-6 rounded-[2.5rem] border space-y-5 relative group transition-all duration-700 shadow-xl ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-blue-500/40' : 'bg-slate-100 border-slate-200 hover:border-blue-400/40'}`}>
                  <div className="flex justify-between items-center">
                    <p className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-colors ${isDarkMode ? 'text-blue-500 bg-blue-500/10' : 'text-blue-600 bg-blue-600/10'}`}>Step {idx+1}</p>
                    <div className="flex gap-2">
                       <select 
                        className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase outline-none transition-colors ${isDarkMode ? 'bg-black/40 border border-white/10 focus:border-blue-500 text-white' : 'bg-slate-200 border border-slate-300 focus:border-blue-400 text-slate-900'}`}
                        value={phase.size || 'md'}
                        onChange={e => updatePhase(idx, { size: e.target.value as CardSize })}
                      >
                        <option value="sm">Compact</option>
                        <option value="md">Standard</option>
                        <option value="lg">Wide</option>
                      </select>
                      <button onClick={() => updateActiveSlide({ phases: activeSlide.phases.filter((_, i) => i !== idx) })} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-red-500/40 hover:text-red-500 hover:bg-red-500/10' : 'text-red-600/40 hover:text-red-600 hover:bg-red-600/10'}`}><IconRenderer name="X" className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-1">
                      <select 
                        className={`w-full h-full rounded-xl flex items-center justify-center text-xl text-center outline-none transition-colors ${isDarkMode ? 'bg-black/50 border border-white/10 focus:border-blue-500 text-white' : 'bg-slate-200 border border-slate-300 focus:border-blue-400 text-slate-900'}`}
                        value={phase.icon}
                        onChange={e => updatePhase(idx, { icon: e.target.value })}
                      >
                        {Object.keys(Icons).map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <input 
                      className={`col-span-5 p-4 rounded-xl text-base font-black uppercase atlas-title outline-none transition-colors ${isDarkMode ? 'bg-black/50 border border-white/5 focus:border-blue-500' : 'bg-slate-200 border border-slate-300 focus:border-blue-400 text-slate-900'}`}
                      value={phase.title}
                      placeholder="Title"
                      onChange={e => updatePhase(idx, { title: e.target.value })}
                    />
                  </div>

                  <textarea 
                    className={`w-full p-4 rounded-xl text-xs h-24 resize-none outline-none leading-relaxed font-light transition-colors ${isDarkMode ? 'bg-black/50 border border-white/5 focus:border-blue-500 text-slate-300' : 'bg-slate-200 border border-slate-300 focus:border-blue-400 text-slate-700'}`}
                    value={phase.description}
                    placeholder="Evidence..."
                    onChange={e => updatePhase(idx, { description: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className={`text-[8px] font-black uppercase tracking-widest ml-2 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Clinical Pearl</span>
                        <input 
                            className={`w-full p-3 rounded-lg text-[10px] outline-none transition-colors ${isDarkMode ? 'bg-black/50 border border-white/5 focus:border-emerald-500 text-emerald-400' : 'bg-slate-200 border border-slate-300 focus:border-emerald-400 text-emerald-600'}`}
                            value={phase.clinicalPearl || ''}
                            placeholder="Insight..."
                            onChange={e => updatePhase(idx, { clinicalPearl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className={`text-[8px] font-black uppercase tracking-widest ml-2 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Value</span>
                        <input 
                            className={`w-full p-3 rounded-lg text-[10px] font-black outline-none transition-colors ${isDarkMode ? 'bg-black/50 border border-white/5 focus:border-blue-500 text-blue-400' : 'bg-slate-200 border border-slate-300 focus:border-blue-400 text-blue-600'}`}
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

      {/* Presentation Selector - Top Left */}
      <div className="fixed top-8 left-8 z-[100]">
        <button 
          onClick={() => setShowPresentationSelector(!showPresentationSelector)}
          title="Select Presentation"
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-700 border relative ${isDarkMode ? 'bg-cyan-600/10 border-cyan-500/30 hover:bg-cyan-600' : 'bg-cyan-400/10 border-cyan-400/30 hover:bg-cyan-400'}`}
        >
          <IconRenderer name="BookOpen" className="w-6 h-6" />
        </button>
        
        {showPresentationSelector && (
          <div className={`absolute top-16 left-0 mt-2 rounded-xl border shadow-2xl backdrop-blur-[80px] z-[101] min-w-[280px] p-3 space-y-2 animate-in slide-in-from-top duration-200 ${isDarkMode ? 'bg-slate-950/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
            {presentations.map(presentation => (
              <button
                key={presentation.id}
                onClick={() => {
                  setCurrentPresentationId(presentation.id);
                  setShowPresentationSelector(false);
                }}
                className={`w-full text-left p-3 rounded-lg transition-all text-sm font-bold ${
                  currentPresentationId === presentation.id
                    ? isDarkMode ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-cyan-400/20 border border-cyan-400 text-cyan-600'
                    : isDarkMode ? 'border border-transparent hover:bg-white/10 text-white' : 'border border-transparent hover:bg-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconRenderer name="Check" className={`w-4 h-4 ${currentPresentationId === presentation.id ? 'opacity-100' : 'opacity-0'}`} />
                  {presentation.name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor Trigger */}
      <div className="fixed top-8 right-8 z-[100] flex gap-3">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-700 border ${isDarkMode ? 'bg-yellow-600/10 border-yellow-500/30 hover:bg-yellow-600' : 'bg-slate-400/10 border-slate-500/30 hover:bg-slate-400'}`}
        >
          <IconRenderer name={isDarkMode ? "Sun" : "Moon"} className="w-6 h-6" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleEditorToggle(); }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-700 border ${isEditMode ? 'bg-red-600 border-red-500 rotate-90' : 'bg-blue-600/10 border-blue-500/30 backdrop-blur-[40px] hover:bg-blue-600 hover:scale-110'}`}
        >
          <IconRenderer name={isEditMode ? "X" : "Menu"} className="w-6 h-6" />
        </button>
      </div>

      {/* Side Navigation Dots - Moved to Right */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-8 pointer-events-none transition-colors ${isDarkMode ? 'text-white/5' : 'text-slate-600/30'}`}>
        <div className={`text-vertical text-[7px] font-black uppercase tracking-[0.8em] animate-pulse transition-colors ${isDarkMode ? 'text-white/5' : 'text-slate-400'}`}>Slides</div>
        <div className={`w-px h-24 bg-gradient-to-b from-transparent to-transparent transition-colors ${isDarkMode ? 'via-blue-500/40' : 'via-blue-400/30'}`}></div>
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] no-scrollbar pointer-events-auto px-3 py-4">
           {slides.map((_, i) => (
             <div 
               key={i} 
               onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); setCurrentPhase(0); }}
               className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-700 ${i === currentSlide ? isDarkMode ? 'bg-blue-500 scale-[2] shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'bg-blue-600 scale-[2] shadow-[0_0_15px_rgba(37,99,235,0.8)]' : isDarkMode ? 'bg-white/5 hover:bg-white/20' : 'bg-slate-400/20 hover:bg-slate-400/40'}`}
             ></div>
           ))}
        </div>
      </div>

      <main className="relative z-40 h-full w-full flex items-center justify-center pointer-events-none overflow-hidden">
        <div key={currentSlide} className="w-full h-full panoramic-slide">
          <SlideRenderer slide={activeSlide} currentPhase={currentPhase} isDarkMode={isDarkMode} />
        </div>
      </main>

      {/* Cinematic Control Dock - Compact Version */}
      <footer className="absolute bottom-12 left-10 z-50 pointer-events-none">
        <div className="flex items-center gap-6 bg-slate-950/50 backdrop-blur-[80px] px-6 py-3 rounded-2xl border border-white/10 pointer-events-auto shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-all group">
              <IconRenderer name="ChevronLeft" className="w-5 h-5 group-hover:text-blue-400 transition-transform" />
            </button>
            <div className="text-sm font-black atlas-title flex items-baseline gap-1 tabular-nums">
              <span className="text-base text-white">{String(currentSlide + 1).padStart(2, '0')}</span>
              <span className="text-white/20 text-xs">/</span>
              <span className="text-white/30 text-xs">{String(slides.length).padStart(2, '0')}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-all group">
              <IconRenderer name="ChevronRight" className="w-5 h-5 group-hover:text-blue-400 transition-transform" />
            </button>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex gap-1.5">
            {activeSlide.phases.map((_, i) => (
              <div 
                  key={i} 
                  onClick={(e) => { e.stopPropagation(); setCurrentPhase(i); }}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-1000 ${i <= currentPhase ? 'w-6 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'w-1 bg-white/10 hover:bg-white/30'}`}
              ></div>
            ))}
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

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black border border-blue-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white mb-6">
              {passwordModalMode === 'edit' ? 'Enter Editor Password' : 'Enter Password to Create'}
            </h2>
            
            <div className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
                placeholder="Password"
                className={`w-full bg-black/50 border rounded-xl p-3 text-white placeholder-slate-500 outline-none transition-all ${passwordError ? 'border-rose-500 focus:border-rose-400' : 'border-blue-500/30 focus:border-blue-500'}`}
                autoFocus
              />
              
              {passwordError && (
                <p className="text-rose-400 text-sm font-semibold">Incorrect password. Please try again.</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordInput('');
                    setPasswordError(false);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl transition-all"
                >
                  Unlock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Presentations Manager Modal */}
      {showPresentationsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black border border-emerald-500/30 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase tracking-[0.1em] text-white">My Presentations</h2>
              <button
                onClick={() => setShowPresentationsModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <IconRenderer name="X" className="w-6 h-6" />
              </button>
            </div>

            {/* Presentations List */}
            <div className="space-y-2 mb-6">
              {presentations.map(presentation => (
                <div
                  key={presentation.id}
                  onClick={() => {
                    setCurrentPresentationId(presentation.id);
                    setShowPresentationsModal(false);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    currentPresentationId === presentation.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{presentation.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {presentation.slides.length} slides • Updated {new Date(presentation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {presentations.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePresentation(presentation.id);
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <IconRenderer name="Trash2" className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* New Presentation Form */}
            {!showNewPresentationForm ? (
              <button
                onClick={() => setShowNewPresentationForm(true)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                <IconRenderer name="Plus" className="w-5 h-5" />
                Create New Presentation
              </button>
            ) : (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <input
                  type="text"
                  value={newPresentationName}
                  onChange={(e) => setNewPresentationName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreatePresentationClick();
                    }
                  }}
                  placeholder="Presentation name..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowNewPresentationForm(false);
                      setNewPresentationName('');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePresentationClick}
                    disabled={!newPresentationName.trim()}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl transition-all"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
