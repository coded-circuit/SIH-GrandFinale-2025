"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import ImageUploader from "./ImageUploader";

export default function UploadCard({ onImageSelect, imagePreview,showChangeImageButton,coordinates =[],setBoundingBox, onCropComplete, originalImageUrl}) {
  const pathname = usePathname();
  const isChatDetailPage = /^\/chat\/[^/]+$/.test(pathname);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-[#0f1720] border border-cyan-700/10 p-8 min-h-[420px] shadow-lg min-w-fit"
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[520px]">
            <ImageUploader
              onImageSelect={onImageSelect}
              externalImage={imagePreview}
              showChangeImageButton = {showChangeImageButton}
              coordinates = {coordinates}
              setBoundingBox={setBoundingBox}
              onCropComplete={onCropComplete}
              originalImageUrl={originalImageUrl}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
