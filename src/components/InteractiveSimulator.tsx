'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Sparkles, Play, RotateCcw, Power, Cpu, BookOpen } from 'lucide-react';

type ActiveTab = 'distillation' | 'titration' | 'gears' | 'slides';

export default function InteractiveSimulator() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('distillation');
  
  // 1. Distillation simulation states
  const [distillHeat, setDistillHeat] = useState(false);
  const [distillProgress, setDistillProgress] = useState(0);
  
  // 2. Titration states
  const [acidDrops, setAcidDrops] = useState(0);
  const [pHValue, setPHValue] = useState(12.0);
  
  // 3. Gears states
  const [gearSpeed, setGearSpeed] = useState(1);
  const [gearsRunning, setGearsRunning] = useState(true);

  // 4. Learning module states
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);

  // --------------------------------------------------
  // INTERACTIVE SIMULATIONS SIMULATOR EFFECTS
  // --------------------------------------------------
  
  // 1. Distillation Sim loop
  useEffect(() => {
    let interval: any;
    if (distillHeat) {
      interval = setInterval(() => {
        setDistillProgress((prev) => {
          if (prev >= 100) {
            setDistillHeat(false);
            return 100;
          }
          return prev + 1;
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [distillHeat]);

  // titrate color transition helper
  const getTitrationColor = () => {
    if (pHValue > 8) {
      const alpha = (pHValue - 8) / 4;
      return `rgba(219, 39, 119, ${0.1 + alpha * 0.75})`; // Pinkish base
    } else if (pHValue > 6) {
      return 'rgba(244, 63, 94, 0.08)'; // Near neutral
    }
    return 'rgba(234, 179, 8, 0.15)'; // Yellowish acid
  };

  const handleTitrateDrop = () => {
    if (pHValue <= 3) return;
    setAcidDrops((prev) => prev + 1);
    setPHValue((prev) => {
      const next = prev - 0.9;
      return Math.max(3.2, Number(next.toFixed(1)));
    });
  };

  const resetTitration = () => {
    setAcidDrops(0);
    setPHValue(12.0);
  };

  return (
    <section className="relative w-full bg-[#05090D] py-20 md:py-24 rounded-3xl border border-slate-900 overflow-hidden shadow-xl">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side text selection panel */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-900/50 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>Interact Live</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight font-display tracking-tight">
              The Interactive Classroom.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Interact with animated notes directly inside our custom learning webview. Play with physical forces, trigger reactions, and step through slides. Learning is no longer passive reading—it is active exploration.
            </p>
          </div>

          {/* Menu Tabs for Mockup screen selector */}
          <div className="flex flex-col gap-2.5">
            {[
              { id: 'distillation', label: 'Distillation Column', desc: 'Control thermal kinetics and evaporation levels' },
              { id: 'titration', idLabel: 'Acid-Base Titration', desc: 'Simulate titration reactions and log pH charts' },
              { id: 'gears', label: 'Mechanical Gears', desc: 'Adjust gear ratios and rotation speed loops' },
              { id: 'slides', label: 'Interactive Slide Deck', desc: 'Check slide concepts and quiz modules' }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0a0f1d] border-blue-500/80 shadow-md shadow-blue-500/[0.05] scale-[1.01]'
                      : 'border-slate-900 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-800'
                  }`}
                >
                  <span className={`text-xs font-extrabold uppercase tracking-wider block ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                    {tab.id === 'titration' ? tab.idLabel : tab.label}
                  </span>
                  <span className={`text-xs block mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-550'}`}>{tab.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side floating mobile screen mockup */}
        <div className="lg:col-span-7 flex justify-center items-center">
          
          {/* Phone Container structure with subtle floating animation */}
          <div className="relative w-full max-w-[320px] aspect-[9/18] bg-[#0c0d12] border-[10px] border-slate-900 rounded-[44px] shadow-2xl p-3 overflow-hidden flex flex-col justify-between animate-float ring-4 ring-slate-800/10">
            
            {/* Apple Camera Notch block */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-slate-700/50" />
            </div>

            {/* Internal Screen Area */}
            <div className="flex-1 rounded-[34px] overflow-hidden bg-white relative flex flex-col select-none pt-6">
              
              {/* Simulated App Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Keeelai Note Viewer</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* ─────────────────────────────────────────────
                 SIMULATOR SCREEN 1: DISTILLATION
              ───────────────────────────────────────────── */}
              {activeTab === 'distillation' && (
                <div className="flex-1 p-4 flex flex-col justify-between bg-slate-50">
                  <div className="space-y-2 text-center">
                    <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Chemistry Section 4
                    </span>
                    <h4 className="text-xs font-black text-slate-900 font-display">Fractional Distillation</h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed">
                      Heat the liquid mixture to vaporize compounds at distinct boiling points.
                    </p>
                  </div>

                  {/* SVG Interactive graphic */}
                  <div className="flex-1 flex items-center justify-center py-4 relative">
                    <svg viewBox="0 0 100 120" className="w-32 h-36">
                      {/* Bunsen Burner base */}
                      <path d="M40,110 L60,110 L55,100 L45,100 Z" fill="#64748b" />
                      <rect x="48" y="90" width="4" height="10" fill="#94a3b8" />
                      
                      {/* Interactive Fire */}
                      {distillHeat && (
                        <path 
                          d="M47,90 Q50,70 53,90 Z" 
                          fill="#f97316" 
                          className="animate-pulse"
                          style={{ transformOrigin: '50px 90px', transform: 'scale(1.2)' }}
                        />
                      )}

                      {/* Flask base */}
                      <circle cx="50" cy="65" r="16" fill="none" stroke="#334155" strokeWidth="1.5" />
                      
                      {/* Fluid level inside flask */}
                      <path 
                        d="M36,73 A16,16 0 0,0 64,73 Z" 
                        fill={distillHeat ? '#38bdf8' : '#0284c7'} 
                        className="transition-colors duration-500" 
                      />

                      {/* Distillation vapor column */}
                      <rect x="47" y="32" width="6" height="20" fill="none" stroke="#334155" strokeWidth="1.5" />
                      
                      {/* Boiling Bubbles */}
                      {distillHeat && (
                        <>
                          <circle cx="45" cy="74" r="1.5" fill="#fff" className="animate-bounce" />
                          <circle cx="52" cy="70" r="2" fill="#fff" className="animate-bounce [animation-delay:0.2s]" />
                          <circle cx="48" cy="62" r="1.2" fill="#fff" className="animate-bounce [animation-delay:0.4s]" />
                          
                          {/* Vapor animation moving up */}
                          <circle cx="50" cy="48" r="1" fill="#bae6fd" className="animate-ping" />
                          <circle cx="50" cy="38" r="1" fill="#bae6fd" className="animate-ping [animation-delay:0.3s]" />
                        </>
                      )}

                      {/* Condenser Arm */}
                      <line x1="50" y1="35" x2="76" y2="55" stroke="#334155" strokeWidth="2.5" />
                      
                      {/* Collecting Beaker */}
                      <path d="M72,95 L84,95 L82,75 L74,75 Z" fill="none" stroke="#334155" strokeWidth="1.5" />
                      <rect x="74.5" y="83" width="7" height="11" fill="#0284c7" style={{ transform: `scaleY(${distillProgress / 100})`, transformOrigin: 'bottom' }} />

                      {/* Drops animation */}
                      {distillHeat && distillProgress < 100 && (
                        <circle cx="76" cy="63" r="1" fill="#38bdf8" className="animate-bounce" />
                      )}
                    </svg>

                    {/* Display Progress percentage */}
                    <div className="absolute bottom-2 right-2 bg-slate-800 text-white font-mono text-[8px] px-1.5 py-0.5 rounded">
                      DISTILL: {distillProgress}%
                    </div>
                  </div>

                  {/* Controller button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (distillProgress >= 100) setDistillProgress(0);
                      setDistillHeat(!distillHeat);
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      distillHeat 
                        ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{distillHeat ? 'Stop Bunsen Burner' : distillProgress >= 100 ? 'Reset Simulation' : 'Ignite Bunsen Burner'}</span>
                  </button>
                </div>
              )}

              {/* ─────────────────────────────────────────────
                 SIMULATOR SCREEN 2: TITRATION
              ───────────────────────────────────────────── */}
              {activeTab === 'titration' && (
                <div className="flex-1 p-4 flex flex-col justify-between bg-slate-50">
                  <div className="space-y-2 text-center">
                    <span className="bg-emerald-50 border border-emerald-150 text-emerald-700 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Chemistry Section 6
                    </span>
                    <h4 className="text-xs font-black text-slate-900 font-display">Neutralization Titration</h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed">
                      Add hydrochloric acid to sodium hydroxide base to neutralize the flask solution.
                    </p>
                  </div>

                  <div className="flex-1 flex items-center justify-center gap-4 py-2">
                    {/* Titration SVG Graphic */}
                    <svg viewBox="0 0 100 120" className="w-20 h-28">
                      {/* Burette structure */}
                      <line x1="45" y1="10" x2="45" y2="80" stroke="#475569" strokeWidth="1.5" />
                      {/* Burette marks */}
                      <line x1="42" y1="20" x2="45" y2="20" stroke="#475569" strokeWidth="1" />
                      <line x1="42" y1="30" x2="45" y2="30" stroke="#475569" strokeWidth="1" />
                      <line x1="42" y1="40" x2="45" y2="40" stroke="#475569" strokeWidth="1" />
                      <line x1="42" y1="50" x2="45" y2="50" stroke="#475569" strokeWidth="1" />
                      <line x1="42" y1="60" x2="45" y2="60" stroke="#475569" strokeWidth="1" />
                      
                      {/* burette fluid */}
                      <line x1="45" y1="35" x2="45" y2="80" stroke="#bae6fd" strokeWidth="2.5" />

                      {/* burette stand */}
                      <rect x="25" y="105" width="40" height="5" fill="#94a3b8" />
                      <line x1="35" y1="10" x2="35" y2="105" stroke="#64748b" strokeWidth="2" />
                      <line x1="35" y1="50" x2="45" y2="50" stroke="#64748b" strokeWidth="1.5" />

                      {/* beaker base */}
                      <path d="M35,100 L55,100 L53,82 L37,82 Z" fill={getTitrationColor()} stroke="#475569" strokeWidth="1" />
                    </svg>

                    {/* Display Data Metrics chart */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex-1 space-y-2 flex flex-col justify-center">
                      <div className="text-center">
                        <span className="text-[8px] text-slate-400 font-semibold block uppercase">Solution pH</span>
                        <span className={`text-lg font-black font-mono block ${pHValue === 7.0 ? 'text-emerald-600' : pHValue < 7 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {pHValue.toFixed(1)}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded text-[8px] text-slate-500 font-semibold space-y-1">
                        <div className="flex justify-between">
                          <span>Acid Added:</span>
                          <span className="font-mono font-bold text-slate-800">{acidDrops} drops</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`font-bold ${pHValue === 7.0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {pHValue === 7.0 ? 'Neutralized' : pHValue < 7 ? 'Acidic' : 'Basic'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={resetTitration}
                      className="border border-slate-200 hover:bg-slate-100 text-slate-600 p-2.5 rounded-xl transition-colors cursor-pointer"
                      title="Reset Titration"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleTitrateDrop}
                      disabled={pHValue <= 3.2}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Dispense Acid Drop</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────
                 SIMULATOR SCREEN 3: GEARS
              ───────────────────────────────────────────── */}
              {activeTab === 'gears' && (
                <div className="flex-1 p-4 flex flex-col justify-between bg-slate-50">
                  <div className="space-y-2 text-center">
                    <span className="bg-amber-50 border border-amber-150 text-amber-700 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Physics & Gear Ratio
                    </span>
                    <h4 className="text-xs font-black text-slate-900 font-display">Gear Torque Transmissions</h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed">
                      Drag the controller below to alter gear rotation speeds and witness torque transmission ratio change.
                    </p>
                  </div>

                  {/* SVG animated gear mesh */}
                  <div className="flex-1 flex items-center justify-center py-4 relative">
                    <svg viewBox="0 0 100 80" className="w-36 h-28">
                      {/* Large Driver Gear */}
                      <g 
                        className={gearsRunning ? 'origin-[35px_40px]' : ''} 
                        style={{
                          animation: gearsRunning ? `spin ${4 / gearSpeed}s linear infinite` : 'none',
                        }}
                      >
                        <circle cx="35" cy="40" r="16" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                        <circle cx="35" cy="40" r="4" fill="#3b82f6" />
                        {/* Teeth mock */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                          <line 
                            key={angle} 
                            x1="35" y1="40" 
                            x2={35 + 19 * Math.cos((angle * Math.PI) / 180)} 
                            y2={40 + 19 * Math.sin((angle * Math.PI) / 180)} 
                            stroke="#3b82f6" strokeWidth="2.5" 
                          />
                        ))}
                      </g>

                      {/* Small Driven Gear */}
                      <g 
                        className={gearsRunning ? 'origin-[65px_40px]' : ''} 
                        style={{
                          animation: gearsRunning ? `spin ${2 / gearSpeed}s linear reverse infinite` : 'none',
                        }}
                      >
                        <circle cx="65" cy="40" r="8" fill="none" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="65" cy="40" r="2" fill="#10b981" />
                        {/* Teeth mock */}
                        {[0, 60, 120, 180, 240, 300].map((angle) => (
                          <line 
                            key={angle} 
                            x1="65" y1="40" 
                            x2={65 + 11 * Math.cos((angle * Math.PI) / 180)} 
                            y2={40 + 11 * Math.sin((angle * Math.PI) / 180)} 
                            stroke="#10b981" strokeWidth="2.5" 
                          />
                        ))}
                      </g>
                    </svg>
                    
                    <style jsx global>{`
                      @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                      }
                    `}</style>

                    {/* Speed badge */}
                    <span className="absolute bottom-2 right-2 bg-slate-800 text-white font-mono text-[8px] px-1.5 py-0.5 rounded">
                      RATIO: 2:1
                    </span>
                  </div>

                  {/* Speed Slider control */}
                  <div className="space-y-3 bg-white p-3 border border-slate-200 rounded-2xl">
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase">
                      <span>Transmission Speed</span>
                      <span className="font-mono text-blue-600">{gearSpeed.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.2" 
                      max="3.0" 
                      step="0.1" 
                      value={gearSpeed}
                      onChange={(e) => setGearSpeed(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                    <button
                      type="button"
                      onClick={() => setGearsRunning(!gearsRunning)}
                      className="w-full text-center text-[8px] font-bold uppercase text-slate-450 hover:text-blue-600 transition-colors"
                    >
                      {gearsRunning ? 'Pause Rotation' : 'Resume Rotation'}
                    </button>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────
                 SIMULATOR SCREEN 4: SLIDES
              ───────────────────────────────────────────── */}
              {activeTab === 'slides' && (
                <div className="flex-1 p-4 flex flex-col justify-between bg-slate-50">
                  {slideIndex === 0 ? (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2 text-center">
                        <span className="bg-violet-50 border border-violet-150 text-violet-700 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Interactive slides
                        </span>
                        <h4 className="text-xs font-black text-slate-900 font-display">Boyle's Gas Law</h4>
                        <p className="text-[10px] text-slate-450 leading-relaxed">
                          Boyle's law states that volume and pressure are inversely proportional for a gas at a constant temperature.
                        </p>
                      </div>

                      {/* Interactive diagram box */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 flex-1 flex flex-col justify-center">
                        <div className="flex justify-around items-end h-20">
                          {/* Low pressure container */}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-14 border border-slate-300 rounded bg-slate-50 relative flex items-center justify-center">
                              <circle cx="20" cy="30" r="1.5" fill="#3b82f6" className="animate-ping" />
                              <circle cx="10" cy="15" r="1.5" fill="#3b82f6" className="animate-ping [animation-delay:0.3s]" />
                              <circle cx="30" cy="45" r="1.5" fill="#3b82f6" className="animate-ping [animation-delay:0.6s]" />
                              <span className="absolute bottom-1 text-[8px] font-mono text-slate-450">V = 2.0L</span>
                            </div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">P = 1.0 atm</span>
                          </div>

                          {/* High pressure container */}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-7 border border-slate-300 rounded bg-slate-50 relative flex items-center justify-center">
                              <circle cx="20" cy="15" r="1.5" fill="#ef4444" className="animate-ping" />
                              <circle cx="12" cy="10" r="1.5" fill="#ef4444" className="animate-ping [animation-delay:0.3s]" />
                              <circle cx="28" cy="20" r="1.5" fill="#ef4444" className="animate-ping [animation-delay:0.6s]" />
                              <span className="absolute bottom-1 text-[8px] font-mono text-slate-450">V = 1.0L</span>
                            </div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">P = 2.0 atm</span>
                          </div>
                        </div>
                        <span className="text-[8px] text-center text-slate-400 block font-semibold">Tactile: Try pressing the next slide to take the quiz</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5 text-center">
                        <span className="bg-violet-50 border border-violet-150 text-violet-700 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Quiz Question
                        </span>
                        <h4 className="text-xs font-black text-slate-900 font-display">Check Your Knowledge</h4>
                        <p className="text-[9px] text-slate-450">
                          If the volume of a closed gas container is halved, what happens to its pressure?
                        </p>
                      </div>

                      {/* Interactive options */}
                      <div className="space-y-1.5">
                        {[
                          { idx: 0, text: 'Pressure is halved' },
                          { idx: 1, text: 'Pressure is doubled (Correct)' },
                          { idx: 2, text: 'Pressure remains unchanged' }
                        ].map((opt) => (
                          <button
                            key={opt.idx}
                            type="button"
                            onClick={() => {
                              setSelectedAnswer(opt.idx);
                              setShowAnswerFeedback(true);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border text-[9px] font-semibold transition-colors cursor-pointer ${
                              selectedAnswer === opt.idx
                                ? opt.idx === 1
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : 'bg-rose-50 border-rose-300 text-rose-700'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>

                      {/* Feedback text display */}
                      {showAnswerFeedback && (
                        <div className={`p-2 rounded-lg text-center text-[9px] font-bold ${
                          selectedAnswer === 1 
                            ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-100/50 text-rose-700 border border-rose-200'
                        }`}>
                          {selectedAnswer === 1 ? 'Correct! P₁V₁ = P₂V₂' : 'Incorrect. Volume and Pressure are inversely proportional.'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pagination buttons */}
                  <div className="flex border-t border-slate-100 pt-3 gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSlideIndex(0);
                        setSelectedAnswer(null);
                        setShowAnswerFeedback(false);
                      }}
                      className={`flex-1 py-1.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                        slideIndex === 0 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Concept Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideIndex(1)}
                      className={`flex-1 py-1.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                        slideIndex === 1 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Quiz Module
                    </button>
                  </div>
                </div>
              )}

              {/* Simulated App Footer */}
              <div className="bg-slate-50 border-t border-slate-100 py-3 text-center">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-semibold">Tactile Interaction Mode</span>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
