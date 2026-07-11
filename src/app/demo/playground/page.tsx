'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Video, Image as ImageIcon } from 'lucide-react';
import ScrollExpandMedia from '@/components/blocks/scroll-expansion-hero';

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sampleMediaContent: MediaContentCollection = {
  video: {
    src: 'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1',
    poster:
      'https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg',
    background:
      'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYMNjMlBUYHaeYpxduXPVNwf8mnFA61L7rkcoS',
    title: 'Immersive Video Experience',
    date: 'Cosmic Journey',
    scrollToExpand: 'Scroll down to expand',
    about: {
      overview:
        'This is a demonstration of the ScrollExpandMedia component with a high-fidelity video. As you scroll, the video expands smoothly to fill the screen, drawing the user into an immersive, cinematic experience.',
      conclusion:
        'The ScrollExpandMedia component uses scroll-driven calculations to morph a standard card into a full-viewport media showcase, allowing you to tell engaging visual stories on any landing page.',
    },
  },
  image: {
    src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1280&auto=format&fit=crop',
    background:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop',
    title: 'Dynamic Image Showcase',
    date: 'Satellite Vision',
    scrollToExpand: 'Scroll down to expand',
    about: {
      overview:
        'This is a demonstration of the ScrollExpandMedia component with a high-resolution static image. The same smooth interpolation is applied to scale the image, making it highly versatile for photography and graphic portfolios.',
      conclusion:
        'Whether using high-framerate background video loops or optimized visual imagery, this component maintains performance across both desktop and mobile viewports.',
    },
  },
};

const MediaContentSection = ({ mediaType }: { mediaType: 'video' | 'image' }) => {
  const currentMedia = sampleMediaContent[mediaType];

  return (
    <div className='max-w-4xl mx-auto py-12 px-6 bg-[#05090D] border border-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden'>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      <h2 className='text-3xl font-black mb-6 font-display tracking-tight text-white'>
        About This Interactive Block
      </h2>
      <p className='text-lg leading-relaxed mb-6 text-slate-350'>
        {currentMedia.about.overview}
      </p>
      <p className='text-lg leading-relaxed text-slate-350'>
        {currentMedia.about.conclusion}
      </p>
      <div className="mt-8 pt-8 border-t border-slate-900 flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-widest">
        <span>Interactive Sandbox</span>
        <Link href="/" className="text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default function DemoPlayground() {
  const [mediaType, setMediaType] = useState('video');
  const currentMedia = sampleMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, [mediaType]);

  return (
    <div className='min-h-screen bg-[#05090D] relative'>
      {/* Back button and Selector controls */}
      <div className='fixed top-4 left-4 z-50 flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-2xl'>
        <Link
          href="/demo"
          className="p-2 text-white hover:text-blue-400 transition-colors"
          title="Back to Demos"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="h-6 w-px bg-white/10" />
        <button
          onClick={() => setMediaType('video')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
            mediaType === 'video'
              ? 'bg-white text-black'
              : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Video Mode</span>
        </button>

        <button
          onClick={() => setMediaType('image')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
            mediaType === 'image'
              ? 'bg-white text-black'
              : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image Mode</span>
        </button>
      </div>

      <ScrollExpandMedia
        mediaType={mediaType as 'video' | 'image'}
        mediaSrc={currentMedia.src}
        posterSrc={mediaType === 'video' ? currentMedia.poster : undefined}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <MediaContentSection mediaType={mediaType as 'video' | 'image'} />
      </ScrollExpandMedia>
    </div>
  );
}
