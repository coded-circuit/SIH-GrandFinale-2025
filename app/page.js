'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Oswald } from 'next/font/google';
import Image from 'next/image';
import { motion, px } from 'framer-motion';
import { useState } from 'react';
import { Scan, MessageSquare, Box, Globe, ChevronRight, Activity } from 'lucide-react';

const Scene3D = dynamic(() => import('./components/Scene3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-[#050510]" />
}); 

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const handleGetStarted = () => {
    if (session) {
      router.push('/image');
    } else {
      signIn('google');
    }
  };

  return (
    <div className="min-h-screen text-white overflow-hidden relative font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none brightness-100 contrast-150" />
      <Scene3D />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] z-0 pointer-events-none" />
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10  backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/isro.svg" className='w-14' />
              <div>
                <h1 className="text-xl font-bold text-white pl-3">SAC - ISRO</h1>
                <p className="text-xs text-slate-400">
                  Satellite Imagery Analysis
                </p>
              </div>
            </div>
            <button
              onClick={handleGetStarted}
              className=" pl-3 pr-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/25"
            >
              {status === "loading"
                ? "Loading..."
                : session
                ? "+ New Session"
                : "Sign In"}
            </button>
          </div>
        </div>
      </motion.nav>
      <main className="relative z-10 container mx-auto px-6 pt-12 md:pt-12">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-10"
          >
            <div className="space-y-4">
              <h1
                className={`text-10xl md:text-9xl mt-8 font-bold text-white leading-tight ${oswald.className}`}
              >
                Deciphering <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600  mb-2">
                  Earth From Above
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-lg leading-relaxed  border-cyan-500/30 pl-1">
                Transforming low-resolution thermal data into high-fidelity intelligence using Deep Learning.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-xl"
          >
            <div className="relative group">
              <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-10 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-20">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400/70">
                    IMG_SAT_V8.22 // LAT: 23.0225° N
                  </div>
                </div>
                <img
                  src="/test6.jpg"
                  alt="Satellite Analysis"
                  className=" w-full h-[500px] object-cover opacity-80"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent z-10 pointer-events-none"
                  initial={{ top: "-100%" }}
                  animate={{ top: "200%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ height: "50%" }}
                >
                  <div className="absolute bottom-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)]" />
                </motion.div>
               
                <div className="absolute bottom-0 inset-x-0 h-16 bg-black/80 backdrop-blur-md border-t border-white/10 grid grid-cols-3 divide-x divide-white/10 z-20">
                  <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-[10px] text-slate-500 uppercase">
                      psnr
                    </span>
                    <span className="text-sm font-mono text-white">
                      41.2
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center pt-1.5">
                    <span className="text-[10px] text-slate-500 uppercase">
                      SIZE
                    </span>
                    <span className="text-sm font-mono text-cyan-400">64*64</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-[10px] text-slate-500 uppercase">
                      Status
                    </span>
                    <span className="text-sm font-mono text-green-400 bg-green-900/20 px-2 py-0.5 rounded">
                      LIVE
                    </span>
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