import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = () => {
  const [statusText, setStatusText] = useState("INITIALIZING SATELLITE UPLINK");
  useEffect(() => {
    const phases = [
      "ACQUIRING SATELLITE IMAGE",
      "PROCESSING GEOSPATIAL DATA",
      "ANALYZING IMAGERY FEATURES",
      "GENERATING INSIGHTS",
      "PREPARING RESULTS"
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phases.length;
      setStatusText(phases[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712] text-white overflow-hidden font-mono">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] opacity-20 animate-pulse" />
      </div>
      <div className="relative z-10 w-64 h-64 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-white/10 border-t-white/50 border-r-transparent"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border border-zinc-800 border-b-white/80 border-l-transparent"
        />
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-16 rounded-full border-2 border-transparent border-t-white border-l-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        />
        <div className="relative flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)]">
           <motion.div
             animate={{ scale: [1, 0.8, 1], opacity: [1, 0.5, 1] }}
             transition={{ duration: 1.5, repeat: Infinity }}
             className="w-12 h-12 bg-black rounded-full flex items-center justify-center"
           >
              <div className="w-2 h-2 bg-white rounded-full" />
           </motion.div>
        </div>
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
           className="absolute w-full h-full"
        >
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>
      </div>
      <div className="mt-12 flex flex-col items-center gap-2 z-10">
        <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <motion.span 
              key={statusText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm font-bold tracking-[0.2em] text-white min-w-[200px] text-center"
            >
              {statusText}
            </motion.span>
        </div>
        <div className="text-[10px] text-zinc-500 tracking-widest flex gap-4 mt-2">
           <span>SAT_NODE_01</span>
           <span>::</span>
           <span>STATUS: ACTIVE</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
    </div>
  );
};

export default Loader;