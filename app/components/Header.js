'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 border-b border-cyan-500/20 backdrop-blur-xl bg-black/30"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2"/>
                <path d="M2 12h20" strokeWidth="2"/>
              </svg>
              <div>
                <h1 className="text-xl font-bold text-white">SAC - ISRO</h1>
                <p className="text-xs text-slate-400">Satellite Imagery Analysis</p>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/test" className="text-sm text-slate-300 hover:text-white transition-colors">
              Speed Test
            </Link>
            
            {status === 'loading' ? (
              <div className="px-4 py-2 text-sm text-slate-400">Loading...</div>
            ) : session ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/25"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/25"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
