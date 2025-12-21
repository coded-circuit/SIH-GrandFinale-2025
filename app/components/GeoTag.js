'use client';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ImageOverlay, useMap, ZoomControl } from 'react-leaflet';
import { X, MapPin, Maximize2, Minimize2, Download } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom marker component that disappears on zoom
function CenterMarker({ position, zoom, isMapHovered }) {
  const map = useMap();
  const ZOOM_THRESHOLD = 13; // Threshold where marker disappears and patch appears
  
  if (zoom >= ZOOM_THRESHOLD) return null;
  
  // Convert lat/lng to pixel position
  const point = map.latLngToContainerPoint(position);
  
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `${point.x}px`,
          top: `${point.y}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        <div className="relative">
          <div className="absolute -inset-4 bg-cyan-400/20 rounded-full animate-ping"></div>
          <MapPin size={48} className="text-cyan-400 drop-shadow-lg relative z-10" strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Hover tooltip */}
      {isMapHovered && (
        <div
          style={{
            position: 'absolute',
            left: `${point.x}px`,
            top: `${point.y}px`,
            transform: 'translate(-50%, calc(-100% - 60px))',
            zIndex: 1001,
            pointerEvents: 'none',
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-lg border border-cyan-400/50 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-white text-sm font-semibold whitespace-nowrap">
              Rowan County Thermal Survey
            </p>
            <p className="text-cyan-400 text-xs mt-0.5">
              35.9017°N, 80.2878°W
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// Map event handler to force re-render on pan/zoom
function MapEventHandler({ onUpdate }) {
  const map = useMap();
  
  useEffect(() => {
    const handleUpdate = () => {
      onUpdate();
    };
    
    map.on('move', handleUpdate);
    map.on('zoom', handleUpdate);
    
    return () => {
      map.off('move', handleUpdate);
      map.off('zoom', handleUpdate);
    };
  }, [map, onUpdate]);
  
  return null;
}

// Zoom tracker component
function ZoomTracker({ onZoomChange }) {
  const map = useMap();
  
  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    
    map.on('zoom', handleZoom);
    handleZoom();
    
    return () => {
      map.off('zoom', handleZoom);
    };
  }, [map, onZoomChange]);
  
  return null;
}

// Fit bounds component - only fit once on initial load
function FitBounds({ bounds }) {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (!hasInitialized) {
      map.fitBounds(bounds);
      setHasInitialized(true);
    }
  }, [map, bounds, hasInitialized]);
  
  return null;
}

const GeoTagComponent = ({ isOpen, onClose, thermalImageUrl }) => {
  const [currentZoom, setCurrentZoom] = useState(10);
  const [isOverlayHovered, setIsOverlayHovered] = useState(false);
  const [isMapHovered, setIsMapHovered] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [markerUpdate, setMarkerUpdate] = useState(0);

  const ZOOM_THRESHOLD = 13; // Threshold where marker disappears and patch appears

  if (!isOpen) return null;

  const imageBounds = [
    [35.93722, -80.33111],
    [35.86667, -80.24472],
  ];

  const centerCoords = [35.9017, -80.2878];

  const locationInfo = {
    name: "Rowan County Thermal Survey Zone",
    location: "Salisbury Metropolitan Area",
    county: "Rowan County",
    state: "North Carolina",
    country: "United States",
    coordinates: "35.9017°N, 80.2878°W",
    classification: {
      type: "Rural/Suburban Mixed",
      terrain: "Agricultural & Residential",
      landUse: "Mixed Development Zone"
    }
  };

  // Description for zoomed-in view
  const thermalDescription = currentZoom >= ZOOM_THRESHOLD
    ? "High-resolution thermal data reveals temperature variations across the surveyed area. Warmer zones (red/orange) indicate residential or commercial structures, while cooler zones (blue/purple) represent vegetation and open agricultural land."
    : null;

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = thermalImageUrl || '/output-hr.png';
    link.download = 'thermal-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-[70vw] h-[85vh] flex flex-col bg-[#1a1f2e] rounded-xl shadow-2xl">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">GeoTag Analysis</h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 p-4 min-h-0">
          
          {/* Left Side - Map */}
          <div 
            className="flex-1 bg-slate-900/50 rounded-lg overflow-hidden relative border border-slate-700/30"
            onMouseEnter={() => setIsMapHovered(true)}
            onMouseLeave={() => setIsMapHovered(false)}
          >
            <MapContainer
              center={centerCoords}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              doubleClickZoom={true}
              zoomControl={true}
              dragging={true}
              touchZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* Only show overlay when zoomed in past threshold */}
              {currentZoom >= ZOOM_THRESHOLD && (
                <ImageOverlay
                  url={thermalImageUrl || '/output-hr.png'}
                  bounds={imageBounds}
                  opacity={0.5}
                  eventHandlers={{
                    mouseover: () => setIsOverlayHovered(true),
                    mouseout: () => setIsOverlayHovered(false),
                  }}
                />
              )}

              <FitBounds bounds={imageBounds} />
              <ZoomTracker onZoomChange={setCurrentZoom} />
              <MapEventHandler onUpdate={() => setMarkerUpdate(prev => prev + 1)} />
              <CenterMarker position={centerCoords} zoom={currentZoom} isMapHovered={isMapHovered} key={markerUpdate} />
            </MapContainer>

            {/* Zoom Level Indicator */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${currentZoom >= ZOOM_THRESHOLD ? 'bg-green-400' : 'bg-cyan-400'}`}></div>
              <span className="text-white text-sm">Zoom: {currentZoom}</span>
              <div className="w-px h-3 bg-slate-600 mx-1"></div>
              <span className="text-slate-400 text-xs">{currentZoom >= ZOOM_THRESHOLD ? 'Detail View' : 'Overview'}</span>
            </div>

            {/* Overlay Status - Only show when patch is visible */}
            {currentZoom >= ZOOM_THRESHOLD && (
              <div className="absolute top-4 left-4 px-3 py-2 rounded-lg border backdrop-blur-md bg-cyan-500/20 border-cyan-400/50 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span className="text-white text-sm">Thermal Layer Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Details Panel */}
          <div className="w-[340px] flex flex-col gap-3">
            
            {/* Thermal Preview */}
            <div className={`bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700/30 transition-all duration-300 ${
              isPreviewExpanded ? 'h-[450px]' : 'h-[200px]'
            }`}>
              <div className="h-full flex flex-col">
                <div className="px-3 py-2 border-b border-slate-700/50 bg-slate-900/60 flex items-center justify-between">
                  <h3 className="text-white font-medium text-sm">THERMAL PREVIEW</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleDownloadImage}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Download thermal image"
                    >
                      <Download size={16} className="text-slate-400 hover:text-cyan-400" />
                    </button>
                    <button
                      onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title={isPreviewExpanded ? "Collapse" : "Expand"}
                    >
                      {isPreviewExpanded ? (
                        <Minimize2 size={16} className="text-slate-400 hover:text-cyan-400" />
                      ) : (
                        <Maximize2 size={16} className="text-slate-400 hover:text-cyan-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex-1 relative bg-black/40">
                  <img
                    src={thermalImageUrl || '/output-hr.png'}
                    alt="Thermal Preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-2">
                    <p className="text-white text-xs">High-Resolution Thermal Data</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="flex-1 bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700/30">
              <div className="h-full overflow-y-auto p-4 space-y-3">
                
                {/* Title Section */}
                <div className="pb-2 border-b border-slate-700/50">
                  <h3 className="text-base font-semibold text-white">{locationInfo.name}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{locationInfo.location}</p>
                </div>

                {/* Thermal Description (shown when zoomed in) */}
                {thermalDescription && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">Thermal Analysis</p>
                    <p className="text-white text-sm leading-relaxed">{thermalDescription}</p>
                  </div>
                )}

                {/* Geographic Information */}
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                      <MapPin size={14} className="text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-white text-sm leading-relaxed">
                        {locationInfo.county}, {locationInfo.state}
                        <br />
                        <span className="text-slate-400">{locationInfo.country}</span>
                      </p>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/30">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Coordinates</p>
                    <code className="text-cyan-400 text-sm font-mono bg-slate-900/50 px-2 py-1 rounded block">
                      {locationInfo.coordinates}
                    </code>
                  </div>

                  {/* Classification */}
                  <div className="space-y-2">
                    <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/30">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</p>
                      <p className="text-white text-sm">{locationInfo.classification.type}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/30">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Terrain</p>
                      <p className="text-white text-sm">{locationInfo.classification.terrain}</p>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2.5">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Land Use</p>
                      <p className="text-white text-sm">{locationInfo.classification.landUse}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoTagComponent;