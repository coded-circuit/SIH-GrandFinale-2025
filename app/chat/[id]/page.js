'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Download, Map, ZoomOut, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { downloadReport } from '../../components/GenerateReport'; 
import { Oswald } from 'next/font/google';
import dynamic from 'next/dynamic';

// Dynamically import GeoTagComponent with SSR disabled
const GeoTagComponent = dynamic(
  () => import('../../components/GeoTag'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-[#0f1720]/95 flex items-center justify-center">
        <div className="text-white">Loading map...</div>
      </div>
    )
  }
);

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '500'],
  display: 'swap',
});

const SatelliteAnalysisResults = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const metricsRef = useRef(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isGeoTagOpen, setIsGeoTagOpen] = useState(false);

  const handleGetStarted = () => {
    if (session) {
      router.push('/');
    } else {
      signIn('google');
    }
  };

  const [images, setImages] = useState({
    'Thermal-LR': '/input-lr.png',
    'Thermal-SR': '/output-hr.png',
    'Optical': '/rgb.png',
    'Ground-Truth': '/ground-truth.png'
  });

  const [metrics, setMetrics] = useState({
    psnr: '44.54',
    ssim: '0.9792',
    rmse: '0.00812'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRefs = useRef({});

  useEffect(() => {
    const preventDefaultZoom = (e) => {
      if (e.ctrlKey) e.preventDefault();
    };
    window.addEventListener('wheel', preventDefaultZoom, { passive: false });
    return () => {
      window.removeEventListener('wheel', preventDefaultZoom);
    };
  }, []);

  const handleWheel = (e, imageKey) => {
    e.preventDefault();
    const container = containerRefs.current[imageKey];
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 1), 5);
    if (newZoom === 1) {
      setPan({ x: 0, y: 0 });
    } else {
      const zoomPointX = (x - pan.x) / zoom;
      const zoomPointY = (y - pan.y) / zoom;
      setPan({ x: x - zoomPointX * newZoom, y: y - zoomPointY * newZoom });
    }
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownloadReport = async () => {
    try {
      await downloadReport('Satellite_Analysis_Output', images, metrics);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const scrollToMetrics = () => {
    if (metricsRef.current) {
      metricsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const handleGeoTagging = () => {
    setIsGeoTagOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f1720] text-white flex font-sans selection:bg-cyan-500/30">
      
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1720]/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Processing Analysis...</h2>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1720]/90">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button onClick={() => router.push('/image')} className="bg-cyan-500 px-6 py-2 rounded-lg">Return</button>
          </div>
        </div>
      )}

      <GeoTagComponent 
        isOpen={isGeoTagOpen}
        onClose={() => setIsGeoTagOpen(false)}
        thermalImageUrl="/output-hr.png"
      />

      {!error && (
        <>
          <aside 
            className="fixed left-0 top-0 h-screen bg-[#0a0f16] border-r border-white/10 z-50 transition-all duration-300 ease-in-out"
            style={{ width: isSidebarExpanded ? '280px' : '80px' }}
            onMouseEnter={() => setIsSidebarExpanded(true)}
            onMouseLeave={() => setIsSidebarExpanded(false)}
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-4">
              <img src="/isro.svg" className="w-12 h-12 flex-shrink-0" alt="ISRO Logo" />
              <div 
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ 
                  width: isSidebarExpanded ? '180px' : '0px',
                  opacity: isSidebarExpanded ? 1 : 0 
                }}
              >
                <h1 className="text-lg font-bold text-white whitespace-nowrap">SAC - ISRO</h1>
                <p className="text-xs text-slate-400 whitespace-nowrap">Satellite Image Analysis</p>
              </div>
            </div>

            <div className="flex flex-col py-10 gap-6">
              <button
                onClick={handleDownloadReport}
                className="group flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-all"
                title="Download Report"
              >
                <Download size={22} className="text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                <span 
                  className="text-sm text-slate-400 group-hover:text-cyan-400 transition-all duration-300 whitespace-nowrap overflow-hidden"
                  style={{ 
                    width: isSidebarExpanded ? '150px' : '0px',
                    opacity: isSidebarExpanded ? 1 : 0 
                  }}
                >
                  Download Report
                </span>
              </button>

              <button
                onClick={handleGeoTagging}
                className="group flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-all"
                title="Geo Tagging"
              >
                <Map size={22} className="text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                <span 
                  className="text-sm text-slate-400 group-hover:text-cyan-400 transition-all duration-300 whitespace-nowrap overflow-hidden"
                  style={{ 
                    width: isSidebarExpanded ? '150px' : '0px',
                    opacity: isSidebarExpanded ? 1 : 0 
                  }}
                >
                  Geo Tagging
                </span>
              </button>

              <button
                onClick={handleResetZoom}
                className="group flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-all"
                title="Reset Zoom"
              >
                <ZoomOut size={22} className="text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                <span 
                  className="text-sm text-slate-400 group-hover:text-cyan-400 transition-all duration-300 whitespace-nowrap overflow-hidden"
                  style={{ 
                    width: isSidebarExpanded ? '150px' : '0px',
                    opacity: isSidebarExpanded ? 1 : 0 
                  }}
                >
                  Reset Zoom
                </span>
              </button>

              <button
                onClick={scrollToMetrics}
                className="group flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-all"
                title="View Metrics"
              >
                <BarChart3 size={22} className="text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                <span 
                  className="text-sm text-slate-400 group-hover:text-cyan-400 transition-all duration-300 whitespace-nowrap overflow-hidden"
                  style={{ 
                    width: isSidebarExpanded ? '150px' : '0px',
                    opacity: isSidebarExpanded ? 1 : 0 
                  }}
                >
                  View Metrics
                </span>
              </button>
            </div>
          </aside>

          <div className="flex-1 flex flex-col ml-[80px]">
            <nav className="bg-[#0f1720] backdrop-blur-sm">
              <div className="px-8 py-4 flex items-center justify-between">
                <div 
                  className="transition-opacity duration-300"
                  style={{ opacity: isSidebarExpanded ? 0 : 1 }}
                >
                  <h1 className="text-2xl font-bold text-cyan-400 tracking-wide">RESULT ANALYSIS</h1>
                </div>

                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all "
                >
                  {status === "loading" ? "Loading..." : session ? "Dashboard" : "Sign In"}
                </button>
              </div>
            </nav>

            <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-8 py-6">
              <div className="flex w-full h-[82vh] gap-20">
                <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-6 h-full">
                  {Object.entries(images).map(([key, label]) => (
                    <div key={key} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative group shadow-xl">
                      <div
                        ref={(el) => (containerRefs.current[key] = el)}
                        className="relative w-full h-full cursor-move bg-black/50"
                        onWheel={(e) => handleWheel(e, key)}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        <div
                          style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'cover',
                          }}
                        >
                          <img
                            src={images[key]}
                            alt={key}
                            className="w-full h-full object-cover pointer-events-none" 
                          />
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm py-2 px-4 text-center pointer-events-none">
                        <span className={`text-white text-sm font-semibold tracking-widest ${oswald.className}`}>
                          {key.replace(/-/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-xs font-bold text-red-400 mb-4 tracking-widest">HIGH</div>
                  <div 
                    className="w-16 h-full rounded-2xl border border-white/20 shadow-lg"
                    style={{
                      background: 'linear-gradient(to top, #000004, #2c0066, #8c2981, #de4968, #fe9f6d, #fcfdbf)'
                    }}
                  ></div>
                  <div className="text-xs font-bold text-[#526991] mt-4 tracking-widest">LOW</div>
                </div>
              </div>

              <div ref={metricsRef} className="w-full mt-10 mb-8">
                <h2 className="text-xl font-semibold mb-5 text-slate-300 border-l-4 border-cyan-500 pl-4">Quantitative Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(metrics).map(([metric, value]) => (
                    <div key={metric} className="p-6 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
                      <div>
                        <div className="text-xs text-cyan-400 font-bold tracking-wider mb-1">{metric.toUpperCase()}</div>
                      </div>
                      <div className="text-3xl font-mono font-bold text-white group-hover:scale-110 transition-transform duration-200">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default SatelliteAnalysisResults;