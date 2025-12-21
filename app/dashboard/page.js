"use client";

import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";

const Scene3D = dynamic(() => import("../components/Scene3D"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />,
});

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status !== "authenticated") return;

    const abortCtrl = new AbortController();

    async function loadUserData() {
      try {
        setLoading(true);

        const res = await fetch("/api/chats/get", {
          method: "GET",
          signal: abortCtrl.signal,
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (res.ok && data.success) setChats(data.chats || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    }
    async function loadRoutineData(){
      try{
        setLoading(true);
        const res = await fetch('/api/routines/get',{
          method:"GET",
          signal: abortCtrl.signal,
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.success) setRoutines(data.routines || []);
      }catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
    loadRoutineData();
    return () => abortCtrl.abort();
  }, [status]);

  if (status === "loading" || loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <Scene3D />

      <nav className="relative z-10 backdrop-blur-xl bg-[#0B0E12]/70 border-b border-[#1F2630]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <img src="./isro.svg" className="w-14" />
              <div>
                <h1 className="text-xl font-bold pl-3">SAC - ISRO</h1>
                <p className="text-xs text-[#98C1D9]">
                  Satellite Imagery Analysis
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 bg-[#4A1F1F] hover:bg-[#5A2828] text-[#E63946] text-sm font-medium rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#161B22] border border-[#1F2630] rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={session?.user?.image || "/default-avatar.png"}
                alt={session?.user?.name}
                className="w-16 h-16 rounded-full"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
              <div>
                <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                <p className="text-sm text-[#98C1D9]">{session?.user?.email}</p>
              </div>
            </div>

            <Link
              href="/image"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg"
            >
              + New Chat
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1E2A38] border border-[#2C384A] rounded-xl p-6"
          >
            <p className="text-sm text-[#98C1D9]">Saved Routines</p>
            <p className="text-3xl font-bold text-white">{routines.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#122031] border border-[#2C384A] rounded-xl p-6"
          >
            <p className="text-sm text-[#98C1D9]">Images Analyzed</p>
            <p className="text-3xl font-bold text-[#FFFFFF]">{chats.length}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#161B22] border border-[#1F2630] rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-[#98C1D9]">
              Saved Routines
            </h3>

            {routines.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-[#2C384A] mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <p className="text-[#98C1D9]">No routines saved</p>
              </div>
            ) : (
              <div className="space-y-3 h-96 overflow-y-auto pr-2">
                {routines.map((routine, index) => (
                  <div
                    key={routine._id || index}
                    className="p-4 bg-[#1E2A38] hover:bg-[#253444] border border-[#2C384A] rounded-lg transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{routine.title}</p>
                        <p className="text-xs text-[#98C1D9]">
                          {routine.prompts?.length || 0} prompts
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#161B22] border border-[#1F2630] rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-[#98C1D9]">
              Recent Chats
            </h3>

            {chats.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-[#2C384A] mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-[#98C1D9] mb-4">No chats yet</p>
                <Link
                  href="/image"
                  className="px-4 py-2 bg-[#1F6FEB] hover:bg-[#195bcc] rounded-lg transition text-white text-sm"
                >
                  Start Your First Chat
                </Link>
              </div>
            ) : (
              <div className="space-y-3 h-96 overflow-y-auto pr-2">
                {chats.map((chat, index) => (
                  <Link
                    key={chat._id || index}
                    href={`/chat/${chat._id}`}
                    className="block p-4 bg-[#122031] hover:bg-[#1A2B3E] border border-[#2C384A] rounded-lg transition"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={chat.imageUrl}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">
                          {chat.title || "Untitled Chat"}
                        </p>
                        <p className="text-sm text-[#98C1D9] truncate opacity-70">
                          {chat.responses?.[0]?.prompt || ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
