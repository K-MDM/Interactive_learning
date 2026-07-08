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
    <main className="min-h-screen bg-[#0b0c10] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans flex flex-col justify-center items-center">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-6">
        
        {/* Back Link */}
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Console</span>
        </Link>

        {/* Upload Card */}
        <div className="bg-[#12141c]/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-2xl" />

          <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-500" />
            <span>Upload Interactive Note</span>
          </h2>

          {message && (
            <div className={`p-4 mb-6 rounded-lg border text-sm font-medium flex items-start gap-2.5 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Note Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to React state"
                required
                disabled={loading}
                className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief overview of this lecture..."
                disabled={loading}
                rows={3}
                className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* File Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">HTML File</label>
              
              <div className="relative group cursor-pointer">
                <input 
                  type="file"
                  accept=".html"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                <div className="bg-[#181a24] border-2 border-dashed border-gray-850 hover:border-blue-500/50 rounded-xl p-6 text-center space-y-3 transition-colors">
                  <div className="mx-auto w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-300">
                      {file ? file.name : 'Choose HTML file'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Only self-contained .html files accepted'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Is Demo Toggle */}
            <div className="flex items-center gap-2.5 bg-[#181a24] p-4 rounded-xl border border-gray-850">
              <input 
                type="checkbox"
                id="isDemo"
                checked={isDemo}
                onChange={(e) => setIsDemo(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-gray-700 bg-[#0d0f14] text-blue-600 focus:ring-blue-500/20 cursor-pointer"
              />
              <label htmlFor="isDemo" className="text-xs font-semibold text-gray-300 cursor-pointer select-none">
                Mark as public Free Demo Lesson (available to all visitors without log in)
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
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
