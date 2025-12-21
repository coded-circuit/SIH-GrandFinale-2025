"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Scene3D from "../components/Scene3D";

export default function ImagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      alert("Not Authenticated");
      router.push("/");
    }
  }, [status, router]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  // Load GeoTIFF library
  const loadGeoTIFFLibrary = () => {
    return new Promise((resolve, reject) => {
      if (window.GeoTIFF) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/geotiff@2.0.7/dist-browser/geotiff.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load GeoTIFF library'));
      document.head.appendChild(script);
    });
  };

  const convertTiffWithGeoTIFF = async (arrayBuffer) => {
    try {
      await loadGeoTIFFLibrary();

      const tiff = await window.GeoTIFF.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      const width = image.getWidth();
      const height = image.getHeight();
      const rasters = await image.readRasters();
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(width, height);
      
      // Convert raster data to RGBA
      const data = imageData.data;
      const numPixels = width * height;
      
      // Normalize values for better visualization
      const normalize = (value, min, max) => {
        if (max === min) return 128;
        return Math.floor(((value - min) / (max - min)) * 255);
      };
      
      // Find min/max for normalization
      const findMinMax = (raster) => {
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < raster.length; i++) {
          if (raster[i] < min) min = raster[i];
          if (raster[i] > max) max = raster[i];
        }
        return { min, max };
      };
      
      if (rasters.length === 1) {
        // Grayscale
        const { min, max } = findMinMax(rasters[0]);
        for (let i = 0; i < numPixels; i++) {
          const pixelIndex = i * 4;
          const value = normalize(rasters[0][i], min, max);
          data[pixelIndex] = value;
          data[pixelIndex + 1] = value;
          data[pixelIndex + 2] = value;
          data[pixelIndex + 3] = 255;
        }
      } else if (rasters.length >= 3) {
        // RGB or RGBA
        const minMaxR = findMinMax(rasters[0]);
        const minMaxG = findMinMax(rasters[1]);
        const minMaxB = findMinMax(rasters[2]);
        
        for (let i = 0; i < numPixels; i++) {
          const pixelIndex = i * 4;
          data[pixelIndex] = normalize(rasters[0][i], minMaxR.min, minMaxR.max);
          data[pixelIndex + 1] = normalize(rasters[1][i], minMaxG.min, minMaxG.max);
          data[pixelIndex + 2] = normalize(rasters[2][i], minMaxB.min, minMaxB.max);
          data[pixelIndex + 3] = rasters.length > 3 ? rasters[3][i] : 255;
        }
      } else {
        throw new Error('Unsupported number of bands');
      }
      
      ctx.putImageData(imageData, 0, 0);
      return canvas;
    } catch (err) {
      console.error('GeoTIFF conversion failed:', err);
      throw err;
    }
  };

  // Create a placeholder with file info when preview fails
  const createPlaceholder = (file) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#06b6d4';
    
    ctx.beginPath();
    ctx.roundRect(280, 180, 240, 280, 10);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.roundRect(310, 220, 180, 120, 5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(320, 310);
    ctx.lineTo(370, 250);
    ctx.lineTo(420, 310);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(450, 250, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(330, 360, 140, 8);
    ctx.fillRect(330, 385, 100, 8);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIFF File Ready', 400, 500);
    
    ctx.fillStyle = '#06b6d4';
    ctx.font = '18px sans-serif';
    ctx.fillText(file.name.length > 40 ? file.name.substring(0, 37) + '...' : file.name, 400, 535);
    ctx.fillText(`${(file.size / 1024 / 1024).toFixed(2)} MB`, 400, 565);
    
    return canvas;
  };

  const convertTiffToPng = async (file) => {
    try {
      setIsLoadingPreview(true);
      setPreviewFailed(false);
      const arrayBuffer = await file.arrayBuffer();
      const canvas = await convertTiffWithGeoTIFF(arrayBuffer);
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      });
      
    } catch (err) {
      console.error('Preview conversion failed:', err);
      setPreviewFailed(true);
      const canvas = createPlaceholder(file);
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          resolve(url);
        }, 'image/png');
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };
  const handleFileInput = async (file) => {
    if (!file) {
      return;
    }
    const fileName = file.name.toLowerCase();
    const isTiff = fileName.endsWith('.tiff') || fileName.endsWith('.tif') || file.type === 'image/tiff';
    if (!isTiff) {
      alert("Please upload a .tiff or .tif file only!");
      return;
    }
    setSelectedImage(file);
    try {
      const pngUrl = await convertTiffToPng(file);
      setImagePreview(pngUrl);
      console.log('File ready for analysis');
    } catch (error) {
      console.error('Error during TIFF processing:', error);
    }
  };
  const handleSubmitImage = async () => {
    if (!selectedImage) {
      alert("Please upload an image first");
      return;
    }
    try { 
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("file", selectedImage);
      const mlRes = await fetch("/api/ml", {
        method: "POST",
        body: formData,
      });
      console.log('ML API response status:', mlRes.status);
      if (!mlRes.ok) {
        const errorText = await mlRes.text();
        console.error('ML API error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: 'Failed to analyze image' };
        }
        throw new Error(errorData.message || "Failed to analyze image");
      }
      const mlData = await mlRes.json();
      const chatRes = await fetch("/api/chats/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isImageUploaded: true, // Mark that image was uploaded
          routineId: null,
          responses: [],
          metadata: {
            uploadedAt: new Date().toISOString(),
            fileName: selectedImage.name,
            fileSize: selectedImage.size,
            mlResult: mlData.result, // Store ML result in metadata
          },
        }),
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok || !chatData.success) {
        throw new Error(chatData.error || "Failed to create chat");
      }
      const chatId = chatData.chat._id;
      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error("Error in image analysis flow:", err);
      alert(err.message || "Failed to process image");
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileInput(file);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleClearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedImage(null);
    setPreviewFailed(false);
  };
  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {(isAnalyzing || isLoadingPreview) && <Loader />}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <Scene3D />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-4xl"
        >
          <div className="w-full flex items-center justify-end mb-4 pointer-events-auto">
            <Link href="/">
              <span
                aria-label="Go to dashboard"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/6 hover:bg-white/10 border border-white/50 flex items-center justify-center text-white backdrop-blur-sm shadow transition p-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z"
                  />
                </svg>
              </span>
            </Link>
          </div>
          <AnimatePresence mode="wait">
            {!selectedImage ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <input
                  type="file"
                  id="fileInput"
                  accept=".tiff,.tif,image/tiff"
                  onChange={(e) => handleFileInput(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="fileInput"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`block cursor-pointer rounded-3xl border-[0.5px] border-solid transition-all duration-300 overflow-hidden ${
                    isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-700'
                  }`}
                  style={{
                    backdropFilter: "blur(5px)",
                    boxShadow: "0 0 40px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div className="relative py-32 px-8 text-center">
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mb-8"
                    >
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/30">
                        <svg
                          className="w-16 h-16 text-cyan-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                    </motion.div>
                    <h3 className="text-3xl font-bold text-white mb-3">
                      Upload Satellite Imagery
                    </h3>
                    <p className="text-lg text-gray-400 mb-6">
                      Drag and drop your satellite image here, or click to browse
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-cyan-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        TIF, TIFF
                      </span>
                      <span className="text-gray-600">|</span>
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-cyan-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Max 10MB
                      </span>
                    </div>
                  </div>
                </label>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                {previewFailed && (
                  <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl backdrop-blur">
                    <p className="text-yellow-300 text-sm flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Unable to generate preview. File is ready for analysis - click Run Analysis to proceed.
                    </p>
                  </div>
                )}
                
                <div className="rounded-3xl overflow-hidden border-2 border-cyan-500/30 bg-gray-900/40 backdrop-blur-xl max-w-[900px] mx-auto">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="TIFF Preview"
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                        <div className="text-center">
                          <div className="w-24 h-24 mx-auto mb-4 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-400">Loading preview...</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-2 rounded-lg">
                      <p className="text-white text-sm font-medium">
                        {selectedImage?.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {(selectedImage?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={handleClearImage}
                      className="absolute top-4 right-4 p-3 rounded-full bg-red-500/80 hover:bg-red-600 text-white transition-all duration-300 backdrop-blur-sm"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <motion.button
                  onClick={handleSubmitImage}
                  disabled={isAnalyzing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-8 max-w-[900px] mx-auto block py-6 rounded-2xl font-bold text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group w-full"
                  style={{
                    background: "#06b6d4",
                    boxShadow: "0 10px 40px rgba(6, 182, 212, 0.3)",
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isAnalyzing ? (
                      <>
                        <svg
                          className="animate-spin h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Analyzing TIFF Image...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Run Analysis
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}