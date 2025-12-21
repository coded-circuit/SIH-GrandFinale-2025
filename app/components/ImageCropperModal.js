"use client";

import React, { useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { motion } from "framer-motion";

export default function ImageCropperModal({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  loading,
}) {
  const cropperRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  const handleCrop = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      const croppedImage = canvas.toDataURL();
      setPreviewImage(croppedImage);
      setPreviewSize({
        width: canvas.width,
        height: canvas.height,
      });

      onCropComplete?.(croppedImage);
    }
  };

  const handlePreviewUpdate = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      setPreviewImage(canvas.toDataURL());
      setPreviewSize({
        width: canvas.width,
        height: canvas.height,
      });
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={() => {
        if (!loading) onClose?.();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-[#0f1720] border border-cyan-700/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl z-50">
            <div className="border-4 border-t-transparent border-cyan-400 w-12 h-12 rounded-full animate-spin"></div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Crop Image</h2>
          {!loading && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-300 mb-3 pl-4 flex items-center gap-2">
              Crop & Adjust
            </label>
            <div className="bg-slate-900/50 rounded-lg p-4 flex justify-center flex-1">
              <div className="w-full">
                <Cropper
                  src={imageSrc}
                  ref={cropperRef}
                  style={{ height: 350, width: "100%" }}
                  initialAspectRatio={1}
                  viewMode={1}
                  guides={true}
                  background={false}
                  responsive={true}
                  checkOrientation={false}
                  autoCropArea={1}
                  modal={true}
                  crop={handlePreviewUpdate}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Live Preview
            </label>
            {previewImage ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className=" rounded-lg px-4 flex-1 flex flex-col items-center justify-center"
              >
                <div className="w-full h-64 bg-black rounded-lg overflow-hidden flex items-center justify-center mb-4">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="w-full grid grid-cols-2 gap-2">
                  <div className="bg-slate-800 rounded p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Width</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {previewSize.width}px
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Height</div>
                    <div className="text-lg font-bold text-cyan-400">
                      {previewSize.height}px
                    </div>
                  </div>
                </div>
                <div className="w-full mt-3 bg-slate-800/50 rounded p-2 text-center border border-slate-700">
                  <div className="text-xs text-gray-400">Aspect Ratio</div>
                  <div className="text-sm font-semibold text-gray-200">
                    {previewSize.width > 0 && previewSize.height > 0
                      ? `${(previewSize.width / previewSize.height).toFixed(
                          2
                        )}:1`
                      : "N/A"}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-lg flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-slate-600 mb-3"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-gray-500 text-center">
                  Adjust the crop area to see preview
                </p>
              </motion.div>
            )}
          </div>
        </div>
        <div className="border-t-2 border-cyan-900/30 pt-4">
          <div className="flex justify-end gap-3">
            <button
              disabled={loading}
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Cancel
            </button>
            <button
              disabled={loading || !previewImage}
              onClick={handleCrop}
              className="px-8 py-2 rounded-lg bg-[#0468F9] hover:bg-[#044ab3] text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
