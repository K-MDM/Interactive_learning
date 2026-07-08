import React from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    userId?: string;
    expiry?: string;
    signature?: string;
  }>;
}

export default async function WebviewNotePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const query = new URLSearchParams();
  if (resolvedSearchParams.userId) {
    query.set('userId', resolvedSearchParams.userId);
  }
  if (resolvedSearchParams.expiry) {
    query.set('expiry', resolvedSearchParams.expiry);
  }
  if (resolvedSearchParams.signature) {
    query.set('signature', resolvedSearchParams.signature);
  }

  // Next.js relative endpoint to load the note securely
  const noteApiUrl = `/api/notes/${id}?${query.toString()}`;

  return (
    <main className="w-screen h-screen bg-[#0d0f14] overflow-hidden flex items-center justify-center">
      {/* 
        The iframe fetches the HTML file from our secure server-side API.
        We sandbox the iframe to allow scripts (so interactive elements work)
        and allow-same-origin (to let assets render safely).
      */}
      <iframe
        src={noteApiUrl}
        className="w-full h-full border-none bg-transparent"
        title="Interactive Note Player"
        sandbox="allow-scripts allow-same-origin"
      />
    </main>
  );
}
