"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast({
  message,
  type = "success",
  duration = 3000,
  isOpen = false,
}) {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    setShow(isOpen);
    if (isOpen) {
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const bgColor = {
    success: "bg-emerald-500/10 border-emerald-500/30",
    error: "bg-red-500/10 border-red-500/30",
    info: "bg-blue-500/10 border-blue-500/30",
  }[type];

  const textColor = {
    success: "text-emerald-400",
    error: "text-red-400",
    info: "text-blue-400",
  }[type];

  const iconColor = {
    success: "text-emerald-400",
    error: "text-red-400",
    info: "text-blue-400",
  }[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 0 }}
          className={`fixed top-6 right-6 z-[9999] ${bgColor} border rounded-lg px-4 py-3 flex items-center gap-3 max-w-sm`}
        >
          {type === "success" && (
            <svg
              className={`w-5 h-5 flex-shrink-0 ${iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {type === "error" && (
            <svg
              className={`w-5 h-5 flex-shrink-0 ${iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {type === "info" && (
            <svg
              className={`w-5 h-5 flex-shrink-0 ${iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
