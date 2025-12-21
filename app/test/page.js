'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useTime, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Layers, Zap, CloudFog, Globe, ChevronRight, Activity, Thermometer } from 'lucide-react';

// Load Scene3D (Keep your existing Earth background)
const Scene3D = dynamic(() => import('../components/Scene3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-[#050510]" />
});

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);

  // Animation hook for the scanner bar (0% to 100%)
  const time = useTime();
  const scanPosition = useTransform(time, [0, 4000], [0, 100], { clamp: false }); 
  // Modulo logic to make it loop 0 -> 100 repeatedly
  const loopedScan = useTransform(scanPosition, (value) => value % 100);

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      signIn('google');
    }
  };

  const features = [
    {
      title: "Cross-Modal Fusion",
      desc: "Aligns high-res optical texture with thermal intensity using GDNet attention.",
      icon: <Layers className="w-5 h-5" />
    },
    {
      title: "Physics-Guided Logic",
      desc: " FDTR priors ensure radiative consistency and prevent hallucinated artifacts.",
      icon: <Activity className="w-5 h-5" />
    },
    {
      title: "All-Weather Vision",
      desc: "Restores land details obscured by fog, clouds, or extreme low-light conditions.",
      icon: <CloudFog className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden relative font-sans selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none brightness-100 contrast-150" />
      
      <Scene3D />

      {/* Tech Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] z-0 pointer-events-none" />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 border-b border-white/5 bg-black/10 backdrop-blur-md"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
                <Globe className="w-8 h-8 text-orange-500 animate-pulse-slow" />
                <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-white">SPECTRA <span className="text-orange-500">ISRO</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] tracking-[0.2em] text-cyan-200/70 uppercase">SIH 2025 // TEAM 86204</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGetStarted}
            className="relative px-6 py-2 group overflow-hidden rounded-full bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300"
          >
            <div className="absolute inset-0 w-0 bg-gradient-to-r from-orange-500/20 to-cyan-500/20 transition-all duration-[250ms] ease-out group-hover:w-full opacity-100" />
            <span className="relative flex items-center gap-2 text-sm font-medium text-cyan-100 group-hover:text-white">
              {status === "loading" ? "Initializing..." : session ? "Open Dashboard" : "Initialize Session"}
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 pt-12 md:pt-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* LEFT: Copy & Features */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-10"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-950/20 backdrop-blur-md">
                <Thermometer className="w-3 h-3 text-orange-400" />
                <span className="text-xs font-mono text-orange-300 tracking-wider">OPTICAL-GUIDED SUPER RESOLUTION</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Seeing the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
                  Unseen Heat
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 max-w-lg leading-relaxed border-l-2 border-orange-500/30 pl-6">
                Transforming low-resolution thermal data into high-fidelity intelligence using Deep Learning.
              </p>
            </div>

            {/* Interactive Feature List - ORBITAL STYLE */}
            <div className="relative mt-12 pl-4">
              <div className="absolute left-[27px] top-0 bottom-0 w-px bg-slate-800" />
              <div className="space-y-8">
                {features.map((feature, idx) => {
                  const isActive = activeFeature === idx;
                  return (
                    <div 
                      key={idx}
                      onMouseEnter={() => setActiveFeature(idx)}
                      className="relative flex items-start gap-6 cursor-pointer group"
                    >
                      {/* Node */}
                      <div className="relative z-10 pt-1">
                        <motion.div 
                          animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                          className="absolute inset-0 bg-orange-500/30 rounded-full blur-md"
                        />
                        <motion.div 
                          animate={{ 
                            backgroundColor: isActive ? "#f97316" : "#1e293b",
                            scale: isActive ? 1.2 : 1,
                            borderColor: isActive ? "#7c2d12" : "#0f172a"
                          }}
                          className="w-3 h-3 rounded-full border-2 transition-colors duration-300"
                        />
                      </div>
                      {/* Text */}
                      <div className="flex-1">
                        <motion.h3 
                          animate={{ color: isActive ? "#ffffff" : "#64748b", x: isActive ? 10 : 0 }}
                          className="text-2xl font-bold uppercase tracking-wider transition-all duration-300"
                        >
                          {feature.title}
                        </motion.h3>
                        <motion.div
                          initial={false}
                          animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0, x: isActive ? 10 : 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 pb-2 flex flex-col gap-3">
                            <p className="text-orange-100/70 text-base font-light leading-relaxed border-l-2 border-orange-500/30 pl-4">
                              {feature.desc}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: The Before/After Scanner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-xl"
          >
            <div className="relative group">
             
              
              <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl h-[450px]">
                
                {/* Header HUD */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-30">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="text-[10px] font-mono text-orange-400/70">MODE: SPECTRA_FUSION // TARGET: URBAN_HEAT_ISLAND</div>
                </div>

                {/* --- IMAGE COMPARISON LOGIC --- */}
                
                {/* 1. Base Layer: Low Resolution Input (Blurry) */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src="/runway.jpg"  // REPLACE WITH YOUR BLURRY INPUT IMAGE
                    alt="Low Res Input" 
                    className="w-full h-full object-cover opacity-80 filter blur-sm scale-105"
                  />
                  <div className="absolute bottom-20 left-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-red-400 font-mono border border-red-500/30">
                    INPUT: LOW_RES_THERMAL
                  </div>
                </div>

                {/* 2. Top Layer: Super Resolved Output (Sharp) */}
                {/* This div's height is controlled by the scanner position */}
                <motion.div 
                  style={{ height: useTransform(loopedScan, (v) => `${v}%`) }}
                  className="absolute top-0 left-0 right-0 z-10 overflow-hidden border-b-2 border-cyan-400 bg-black/10"
                >
                  {/* We use fixed positioning inside the absolute container to keep the image static while the container shrinks/grows */}
                  <div className="relative w-full h-[450px]"> 
                     <img 
                      src="/thermal-hr.jpg" // REPLACE WITH YOUR SHARP OUTPUT IMAGE
                      alt="Super Res Output" 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                     <div className="absolute bottom-20 left-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-cyan-400 font-mono border border-cyan-500/30">
                        OUTPUT: SPECTRA_ENHANCED
                      </div>
                  </div>
                </motion.div>

                {/* 3. The Scanner Bar Visual */}
                <motion.div 
                  style={{ top: useTransform(loopedScan, (v) => `${v}%`) }}
                  className="absolute left-0 right-0 h-0 z-20"
                >
                  <div className="absolute -top-4 left-0 right-0 h-8 bg-cyan-400/20 blur-md" />
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)]" />
                  {/* Scanner Label */}
                  <div className="absolute right-4 -top-8 bg-cyan-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-sm">
                    PROCESSING...
                  </div>
                </motion.div>


                {/* HUD Corners */}
                <div className="absolute inset-4 border border-white/5 rounded-lg z-20 pointer-events-none">
                   <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500/50" />
                   <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500/50" />
                   <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500/50" />
                   <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500/50" />
                </div>

                {/* Bottom Stats Grid */}
                <div className="absolute bottom-0 inset-x-0 h-14 bg-black/80 backdrop-blur-md border-t border-white/10 grid grid-cols-3 divide-x divide-white/10 z-30">
                  <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Upscaling</span>
                    <span className="text-sm font-mono text-cyan-400">4x FACTOR</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Physics Loss</span>
                    <span className="text-sm font-mono text-orange-400">0.058 RMSE</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Status</span>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-mono text-green-400">OPTIMIZED</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}