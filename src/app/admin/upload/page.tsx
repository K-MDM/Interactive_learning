'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Upload, FileText, CheckCircle, AlertTriangle, Loader, Layers, Globe, Check } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();

  // Stepper state: 1 = Category, 2 = Target Scope (Boards/Classes/Subjects), 3 = File & Details
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDemo, setIsDemo] = useState(true); // Default to public Experience Zone lesson
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Taxonomy states
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [contentTypes, setContentTypes] = useState<any[]>([]);
  
  // Selected category IDs
  const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedContentTypeIds, setSelectedContentTypeIds] = useState<string[]>([]);

  // Toggles for wildcards ("All")
  const [selectAllBoards, setSelectAllBoards] = useState(true);
  const [selectAllClasses, setSelectAllClasses] = useState(true);
  const [selectAllSubjects, setSelectAllSubjects] = useState(true);

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const res = await fetch('/api/flutter/taxonomy');
        const data = await res.json();
        setBoards(data.boards || []);
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
        setContentTypes(data.content_types || []);
      } catch (err) {
        console.error('Failed to load taxonomy options', err);
      }
    };
    fetchTaxonomy();
  }, []);

  const deriveTitle = (fileName: string) => {
    const nameWithoutExt = fileName.replace(/\.html$/i, '');
    const spaced = nameWithoutExt.replace(/[_\-+][\s]*/g, ' ');
    return spaced
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.html'));
      if (selectedFiles.length > 0) {
        setFiles(selectedFiles);
        if (selectedFiles.length === 1) {
          setTitle(deriveTitle(selectedFiles[0].name));
        } else {
          setTitle(`Batch Upload: ${selectedFiles.length} files`);
        }
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'Please select one or more valid .html files' });
        setFiles([]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one HTML file' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const finalBoardIds = selectAllBoards ? [] : selectedBoardIds;
    const finalClassIds = selectAllClasses ? [] : selectedClassIds;
    const finalSubjectIds = selectAllSubjects ? [] : selectedSubjectIds;

    let successCount = 0;
    let failureCount = 0;
    let lastError = '';

    for (let i = 0; i < files.length; i++) {
      const fileToUpload = files[i];
      const derivedTitle = files.length === 1 ? title : deriveTitle(fileToUpload.name);
      const derivedDescription = description || `Interactive visual module for ${derivedTitle}.`;

      setMessage({
        type: 'success',
        text: `Uploading file ${i + 1} of ${files.length}: "${derivedTitle}"...`
      });

      const formData = new FormData();
      formData.append('title', derivedTitle);
      formData.append('description', derivedDescription);
      formData.append('file', fileToUpload);
      formData.append('isDemo', isDemo.toString());
      formData.append('boardIds', JSON.stringify(finalBoardIds));
      formData.append('classIds', JSON.stringify(finalClassIds));
      formData.append('subjectIds', JSON.stringify(finalSubjectIds));
      formData.append('contentTypeIds', JSON.stringify(selectedContentTypeIds));

      try {
        const res = await fetch('/api/admin/notes/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          successCount++;
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } catch (err: any) {
        console.error(`Failed to upload ${fileToUpload.name}`, err);
        failureCount++;
        lastError = err.message || 'Network error';
      }
    }

    if (failureCount === 0) {
      setMessage({
        type: 'success',
        text: `All ${successCount} modules uploaded successfully!`
      });
      setTitle('');
      setDescription('');
      setFiles([]);
      setSelectedBoardIds([]);
      setSelectedClassIds([]);
      setSelectedSubjectIds([]);
      setSelectedContentTypeIds([]);
      setSelectAllBoards(true);
      setSelectAllClasses(true);
      setSelectAllSubjects(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } else {
      setMessage({
        type: 'error',
        text: `Completed with errors. ${successCount} succeeded, ${failureCount} failed. Last error: ${lastError}`
      });
    }
    setLoading(false);
  };

  const steps = [
    { num: 1, label: 'Content Category', desc: 'Lecture, Quiz, etc.' },
    { num: 2, label: 'Target Scope', desc: 'Board, Class & Subject' },
    { num: 3, label: 'Upload & Details', desc: 'File, Title & Access' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12 relative overflow-hidden font-sans flex flex-col items-center">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl z-10 space-y-6">
        
        {/* Back Link */}
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-800 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Console</span>
        </Link>

        {/* Stepper Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 font-display">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>HTML Content Stepper</span>
            </h1>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Step {currentStep} of 3
            </span>
          </div>

          {/* Stepper Steps Progress Bar */}
          <div className="grid grid-cols-3 gap-2 relative">
            {steps.map((step) => {
              const isCompleted = step.num < currentStep;
              const isActive = step.num === currentStep;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (step.num < currentStep) setCurrentStep(step.num as any);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                      : isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200 cursor-pointer hover:bg-emerald-50'
                      : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      Step {step.num}
                    </span>
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    ) : null}
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">{step.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{step.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Card Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative">
          
          {message && (
            <div className={`p-4 mb-6 rounded-xl border text-sm font-medium flex items-start gap-2.5 ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ================= STEP 1: CONTENT CATEGORY ================= */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <span>Select Content Category</span>
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Choose what type of module you are uploading (e.g. Interactive Simulation, Lecture, Quiz).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contentTypes.length === 0 ? (
                    <div className="col-span-2 text-center py-6 text-slate-400 text-xs font-medium">
                      Loading categories...
                    </div>
                  ) : (
                    contentTypes.map((ct) => {
                      const isSelected = selectedContentTypeIds.includes(ct.id);
                      return (
                        <div
                          key={ct.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedContentTypeIds(selectedContentTypeIds.filter(id => id !== ct.id));
                            } else {
                              setSelectedContentTypeIds([...selectedContentTypeIds, ct.id]);
                            }
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 shadow-sm text-blue-900'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{ct.icon_emoji || '📖'}</span>
                            <div>
                              <div className="text-sm font-bold">{ct.name}</div>
                              <div className="text-[10px] text-slate-400 capitalize">{ct.slug}</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span>Next: Target Scope</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: TARGET SCOPE (BOARDS, CLASSES, SUBJECTS) ================= */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span>Select Target Scope (Optional)</span>
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Select target Board, Class, and Subject. <span className="font-bold text-blue-600">Leaving fields blank means content applies to ALL Boards, ALL Classes, and ALL Subjects.</span>
                  </p>
                </div>

                <div className="space-y-4">
                  {/* BOARDS */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Boards</span>
                      <label className="flex items-center gap-1.5 text-xs text-blue-600 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectAllBoards}
                          onChange={(e) => {
                            setSelectAllBoards(e.target.checked);
                            if (e.target.checked) setSelectedBoardIds([]);
                          }}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500/20"
                        />
                        <span>All Boards (Wildcard)</span>
                      </label>
                    </div>
                    {!selectAllBoards && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {boards.map((b) => {
                          const isSelected = selectedBoardIds.includes(b.id);
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) setSelectedBoardIds(selectedBoardIds.filter(id => id !== b.id));
                                else setSelectedBoardIds([...selectedBoardIds, b.id]);
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {b.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* CLASSES */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Classes</span>
                      <label className="flex items-center gap-1.5 text-xs text-blue-600 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectAllClasses}
                          onChange={(e) => {
                            setSelectAllClasses(e.target.checked);
                            if (e.target.checked) setSelectedClassIds([]);
                          }}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500/20"
                        />
                        <span>All Classes (Wildcard)</span>
                      </label>
                    </div>
                    {!selectAllClasses && (
                      <div className="flex flex-wrap gap-2 pt-1 max-h-[120px] overflow-y-auto pr-1">
                        {classes.map((c) => {
                          const isSelected = selectedClassIds.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) setSelectedClassIds(selectedClassIds.filter(id => id !== c.id));
                                else setSelectedClassIds([...selectedClassIds, c.id]);
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* SUBJECTS */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Subject</span>
                      <label className="flex items-center gap-1.5 text-xs text-blue-600 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectAllSubjects}
                          onChange={(e) => {
                            setSelectAllSubjects(e.target.checked);
                            if (e.target.checked) setSelectedSubjectIds([]);
                          }}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500/20"
                        />
                        <span>All Subjects (Wildcard)</span>
                      </label>
                    </div>
                    {!selectAllSubjects && (
                      <div className="flex flex-wrap gap-2 pt-1 max-h-[140px] overflow-y-auto pr-1">
                        {subjects.map((s) => {
                          const isSelected = selectedSubjectIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== s.id));
                                else setSelectedSubjectIds([...selectedSubjectIds, s.id]);
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {s.icon_emoji ? `${s.icon_emoji} ` : ''}{s.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span>Next: Upload & Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: HTML FILE UPLOAD & METADATA ================= */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Upload HTML File(s) & Details</span>
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Select your self-contained `.html` simulation file(s) and confirm lesson details.
                  </p>
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">HTML File(s)</label>
                  
                  <div className="relative group cursor-pointer">
                    <input 
                      type="file"
                      accept=".html"
                      multiple
                      onChange={handleFileChange}
                      disabled={loading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-500/50 rounded-xl p-6 text-center space-y-3 transition-colors">
                      <div className="mx-auto w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {files.length > 0 
                            ? (files.length === 1 ? files[0].name : `${files.length} HTML files selected`)
                            : 'Choose HTML file(s)'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {files.length > 0 
                            ? `${(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB total`
                            : 'You can select multiple self-contained .html files'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {files.length > 1 && (
                    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-[150px] overflow-y-auto space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Files in batch:</span>
                      {files.map((f, index) => (
                        <div key={index} className="flex justify-between items-center text-xs text-slate-600">
                          <span className="truncate max-w-[320px] font-medium">{f.name}</span>
                          <span className="text-slate-400 text-[10px] shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Note / Lesson Title</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Trigonometric Ratios & Circle Geometry"
                    required
                    disabled={loading || files.length > 1}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors disabled:bg-slate-100 disabled:text-slate-500 font-medium"
                  />
                  {files.length > 1 && (
                    <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                      Titles will be derived automatically from file names in batch mode.
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={files.length > 1 ? "Shared override description for all lectures..." : "Enter a brief overview..."}
                    disabled={loading}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none font-medium"
                  />
                </div>

                {/* Is Demo Toggle */}
                <div className="flex items-center gap-2.5 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                  <input 
                    type="checkbox"
                    id="isDemo"
                    checked={isDemo}
                    onChange={(e) => setIsDemo(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                  />
                  <label htmlFor="isDemo" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Publish to Public Experience Zone (accessible to guests without login)
                  </label>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={loading}
                    className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || files.length === 0}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{files.length > 1 ? `Upload ${files.length} Modules` : 'Submit & Upload'}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

          </form>
        </div>
      </div>
    </main>
  );
}
