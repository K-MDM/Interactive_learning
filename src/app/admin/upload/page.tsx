'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDemo, setIsDemo] = useState(false);
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
        text: `All ${successCount} lectures uploaded successfully!`
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12 relative overflow-hidden font-sans flex flex-col justify-center items-center">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-6">
        
        {/* Back Link */}
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-455 hover:text-slate-800 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Console</span>
        </Link>

        {/* Upload Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-2xl" />

          <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 font-display">
            <Upload className="w-6 h-6 text-blue-600" />
            <span>Upload Interactive Lectures</span>
          </h2>

          {message && (
            <div className={`p-4 mb-6 rounded-lg border text-sm font-medium flex items-start gap-2.5 ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Title / Batch Mode Info */}
            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Note Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to React state"
                required
                disabled={loading || files.length > 1}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors disabled:bg-slate-100 disabled:text-slate-500"
              />
              {files.length > 1 && (
                <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                  Titles will be derived automatically from file names in batch mode.
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-2">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={files.length > 1 ? "Shared override description for all lectures..." : "Enter a brief overview..."}
                disabled={loading}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* Taxonomy Checkbox Lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* BOARDS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Boards</span>
                  <label className="flex items-center gap-1.5 text-xs text-blue-600 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectAllBoards}
                      disabled={loading}
                      onChange={(e) => {
                        setSelectAllBoards(e.target.checked);
                        if (e.target.checked) setSelectedBoardIds([]);
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500/20"
                    />
                    <span>All</span>
                  </label>
                </div>
                {!selectAllBoards && (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {boards.map(b => (
                      <label key={b.id} className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedBoardIds.includes(b.id)}
                          disabled={loading}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBoardIds([...selectedBoardIds, b.id]);
                            } else {
                              setSelectedBoardIds(selectedBoardIds.filter(id => id !== b.id));
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        <span>{b.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {selectAllBoards && (
                  <p className="text-[11px] text-slate-400 italic py-1">All Boards (wildcard)</p>
                )}
              </div>

              {/* CLASSES */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Classes</span>
                  <label className="flex items-center gap-1.5 text-xs text-blue-600 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectAllClasses}
                      disabled={loading}
                      onChange={(e) => {
                        setSelectAllClasses(e.target.checked);
                        if (e.target.checked) setSelectedClassIds([]);
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500/20"
                    />
                    <span>All</span>
                  </label>
                </div>
                {!selectAllClasses && (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {classes.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(c.id)}
                          disabled={loading}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClassIds([...selectedClassIds, c.id]);
                            } else {
                              setSelectedClassIds(selectedClassIds.filter(id => id !== c.id));
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {selectAllClasses && (
                  <p className="text-[11px] text-slate-400 italic py-1">All Classes (wildcard)</p>
                )}
              </div>

              {/* SUBJECTS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subjects</span>
                  <label className="flex items-center gap-1.5 text-xs text-blue-600 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectAllSubjects}
                      disabled={loading}
                      onChange={(e) => {
                        setSelectAllSubjects(e.target.checked);
                        if (e.target.checked) setSelectedSubjectIds([]);
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500/20"
                    />
                    <span>All</span>
                  </label>
                </div>
                {!selectAllSubjects && (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {subjects.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSubjectIds.includes(s.id)}
                          disabled={loading}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjectIds([...selectedSubjectIds, s.id]);
                            } else {
                              setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== s.id));
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        <span>{s.icon_emoji ? `${s.icon_emoji} ` : ''}{s.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {selectAllSubjects && (
                  <p className="text-[11px] text-slate-400 italic py-1">All Subjects (wildcard)</p>
                )}
              </div>

              {/* CONTENT TYPES */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Content Types</span>
                </div>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {contentTypes.map(ct => (
                    <label key={ct.id} className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedContentTypeIds.includes(ct.id)}
                        disabled={loading}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContentTypeIds([...selectedContentTypeIds, ct.id]);
                          } else {
                            setSelectedContentTypeIds(selectedContentTypeIds.filter(id => id !== ct.id));
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                      />
                      <span>{ct.icon_emoji ? `${ct.icon_emoji} ` : ''}{ct.name}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* File Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-2">HTML File(s)</label>
              
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
              
              {/* List selected files if batch upload */}
              {files.length > 1 && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-[150px] overflow-y-auto space-y-1.5 animate-in slide-in-from-top-2 duration-150">
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

            {/* Is Demo Toggle */}
            <div className="flex items-center gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input 
                type="checkbox"
                id="isDemo"
                checked={isDemo}
                onChange={(e) => setIsDemo(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500/20 cursor-pointer"
              />
              <label htmlFor="isDemo" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                Mark all as public Free Demo Lessons (accessible to guests without login)
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading || files.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>{files.length > 1 ? `Upload ${files.length} Lectures` : 'Upload Lecture'}</span>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
