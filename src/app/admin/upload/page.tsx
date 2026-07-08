'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.html')) {
        setFile(selectedFile);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'Please select a valid .html file' });
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      setMessage({ type: 'error', text: 'Title and file are required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('isDemo', isDemo.toString());

    try {
      const res = await fetch('/api/admin/notes/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'HTML Lecture uploaded successfully!' });
        setTitle('');
        setDescription('');
        setFile(null);
        // Redirect back to dashboard after a delay
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to upload note');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred during upload' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12 relative overflow-hidden font-sans flex flex-col justify-center items-center">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-6">
        
        {/* Back Link */}
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-450 hover:text-slate-800 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Console</span>
        </Link>

        {/* Upload Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-2xl" />

          <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 font-display">
            <Upload className="w-6 h-6 text-blue-600" />
            <span>Upload Interactive Note</span>
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
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Note Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to React state"
                required
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief overview of this lecture..."
                disabled={loading}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* File Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-2">HTML File</label>
              
              <div className="relative group cursor-pointer">
                <input 
                  type="file"
                  accept=".html"
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
                      {file ? file.name : 'Choose HTML file'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Only self-contained .html files accepted'}
                    </p>
                  </div>
                </div>
              </div>
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
                Mark as public Free Demo Lesson (available to all visitors without log in)
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Lecture</span>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
