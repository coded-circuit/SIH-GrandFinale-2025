"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ImageCropperModal from "./ImageCropperModal";
  const getVerticesFromBox = (box) => {
    let vertices = [];
    if (Array.isArray(box)) {
      vertices = box;
    } else if (box && typeof box === 'object') {
      if (box.C0 && box.C1 && box.C2 && box.C3) {
        vertices = [box.C0, box.C1, box.C2, box.C3];
      } else {
        vertices = Object.values(box).filter(v => v && typeof v === 'object' && 'x' in v && 'y' in v);
      }
    }
    return vertices.filter(v => v && typeof v === 'object' && typeof v.x === 'number' && typeof v.y === 'number');
  };

export default function ImageUploader({ onImageSelect, externalImage,showChangeImageButton=true ,coordinates =[],setBoundingBox=true, onCropComplete, originalImageUrl}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [tempImageForCrop, setTempImageForCrop] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [cropUploading, setCropUploading] = useState(false); // NEW
  const fileInputRef = useRef(null);
  const hasOverlay = coordinates && coordinates.length > 0 && setBoundingBox;
  const overlayImageSrc = hasOverlay && originalImageUrl ? originalImageUrl : preview;

  useEffect(() => {
    if (externalImage) {
      setPreview(externalImage);
    }
  }, [externalImage]);
  useEffect(() => {
    if (!overlayImageSrc) return;
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = overlayImageSrc;
  }, [overlayImageSrc]);
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);
    if (!data.success) {
      console.error("Cloudinary upload failed:", data.error);
      return null;
    }
    return data.url;
  };
  const processFile = async (file) => {
    if (!file) return;
    if (file.type !== "image/png" && file.type !== "image/jpeg") return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreview(reader.result);
      const cloudUrl = await uploadToCloudinary(file);
      if (cloudUrl) {
        onImageSelect?.(file, cloudUrl);
      }
    };
    reader.readAsDataURL(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };
  const handleCropClick = () => {
    const imageToCrop = originalImageUrl || externalImage || preview;
    setTempImageForCrop(imageToCrop);
    setShowCropperModal(true);
  };
  const handleCropComplete = async (croppedImage) => {
    setCropUploading(true);
    const blob = await fetch(croppedImage).then((res) => res.blob());
    const croppedFile = new File(
      [blob],
      selectedImage?.name || "cropped-image.jpg",
      { type: blob.type }
    );
  const formData = new FormData();
    formData.append("file", croppedFile);
  const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
  });
  const data = await res.json();
    setCropUploading(false);
    if (!data.success) {
      console.error("Cloudinary upload failed:", data.error);
      return;
    }
  const isDataUrl = (url) => url && url.startsWith('data:');
  const imageUrlForUpdate = originalImageUrl || (externalImage && !isDataUrl(externalImage) ? externalImage : null);
    if (imageUrlForUpdate && data.url) {
      try {
        const updateRes = await fetch("/api/chats/update-cropped-url", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: imageUrlForUpdate,
            croppedUrl: data.url,
          }),
        });
        const updateData = await updateRes.json();
        if (!updateRes.ok || !updateData.success) {
          console.error("Failed to update cropped URL:", updateData.error);
        } else {
          if (onCropComplete) {
            onCropComplete();
          }
        }
      } catch (err) {
        console.error("Error updating cropped URL:", err);
      }
    } else if (!originalImageUrl) {
      console.warn("Cannot save cropped URL: No valid imageUrl found. Make sure you're cropping an image from an existing chat.");
    }
    setShowCropperModal(false);
    setTempImageForCrop(null);
  };
  const renderBoundingBoxes = () => {
    if (!coordinates || coordinates.length === 0 || !overlayImageSrc) return null;
    if (imageDimensions.width === 0 || imageDimensions.height === 0) return null;
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
        viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {coordinates.map((box, index) => {
          const vertices = getVerticesFromBox(box);
          if (vertices.length < 4) return null;
          const isNormalized = vertices.some(v => v.x <= 1 && v.y <= 1);
          const points = vertices.map(v => {
            const x = isNormalized ? v.x * imageDimensions.width : v.x;
            const y = isNormalized ? v.y * imageDimensions.height : v.y;
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={index}
              points={points}
              fill="rgba(0, 238, 44, 0.15)"
              stroke="#00EE2C"
              strokeWidth="3"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-md bg-slate-900/40 rounded-lg"
      >
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => {
            if (!preview && !uploading) fileInputRef.current?.click();
          }}
          className={`
            relative text-center cursor-pointer transition-all duration-300 rounded-lg
            ${
              !preview
                ? isDragging
                  ? "border-2 border-dashed border-blue-500 bg-blue-500/10 p-12"
                  : "border-2 border-dashed border-slate-600 hover:border-slate-500 bg-slate-800/30"
                : "border-none bg-transparent p-0"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg"
            disabled={uploading}
            onChange={(e) => {
              processFile(e.target.files[0]);
              e.target.value = "";
            }}
            className="hidden"
          />

          {preview ? (
            <div>
              <div className="relative h-[350px] rounded-lg overflow-hidden">
                <img
                  src={overlayImageSrc || preview}
                  alt="Preview"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                />
                {coordinates && coordinates.length > 0 && setBoundingBox && renderBoundingBoxes()}
              </div>
              <div className="flex gap-2 mt-2 justify-center">
              {!uploading  && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCropClick();
                    }}
                    className="text-sm px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-md transition-colors"
                  >
                    Crop
                  </button>
              )}
              {!uploading && showChangeImageButton&& (
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                  setPreview(null);
                  onImageSelect?.(null, null);
                  fileInputRef.current?.click();
                }}
                className="text-sm text-blue-400 hover:text-blue-300"
                >
                    Change Image
                  </button>
              )}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 opacity-90">
                <svg
                  className="w-12 h-12 mx-auto text-[#242424] bg-slate-500/50 rounded-lg p-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <path
                    d="M6.5 12.25V16H16.7145C17.046 16 17.3639 15.8683 17.5983 15.6339L20.9822 12.25L17.5983 8.86612C17.3639 8.6317 17.046 8.5 16.7145 8.5H10.25C8.17893 8.5 6.5 10.1789 6.5 12.25ZM4 12.25C4 8.79822 6.79822 6 10.25 6H16.7145C17.709 6 18.6629 6.39509 19.3661 7.09835L23.2678 11H37.75C41.2018 11 44 13.7982 44 17.25V34.75C44 38.2018 41.2018 41 37.75 41H10.25C6.79822 41 4 38.2018 4 34.75V12.25ZM6.5 18.5V34.75C6.5 36.8211 8.17893 38.5 10.25 38.5H37.75C39.8211 38.5 41.5 36.8211 41.5 34.75V17.25C41.5 15.1789 39.8211 13.5 37.75 13.5H23.2678L19.3661 17.4017C18.6629 18.1049 17.709 18.5 16.7145 18.5H6.5Z"
                    fill="#242424"
                  />
                </svg>

                <p className="text-slate-300">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-slate-500">PNG or JPG (max 10MB)</p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <img
            src={preview}
            alt="Full Preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ImageCropperModal
        open={showCropperModal}
        onClose={() => {
          if (!cropUploading) {
            setShowCropperModal(false);
            setTempImageForCrop(null);
          }
        }}
        imageSrc={tempImageForCrop}
        onCropComplete={handleCropComplete}
        loading={cropUploading}
      />
    </>
  );
}
