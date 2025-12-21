'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import GeoTagComponent with SSR disabled
const GeoTagComponent = dynamic(
  () => import('../components/GeoTag'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-[#0f1720]/95 flex items-center justify-center">
        <div className="text-white">Loading map...</div>
      </div>
    )
  }
);

export default function Test2Page() {
  const [isGeoTagOpen, setIsGeoTagOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1720] p-8">
      <button
        onClick={() => setIsGeoTagOpen(true)}
        className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
      >
        Open GeoTag
      </button>

      <GeoTagComponent 
        isOpen={isGeoTagOpen}
        onClose={() => setIsGeoTagOpen(false)}
        thermalImageUrl="/output-hr.png"
      />
    </div>
  );
}