"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
export default function RoutinesModal({
  open,
  onClose,
  onSelectRoutine,
  routines = [],
}) {
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [editedPrompts, setEditedPrompts] = useState({});
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") {
        if (selectedRoutine) {
          setSelectedRoutine(null);
          setSelectedPrompts([]);
        } else {
          onClose?.();
        }
      }
    }
    if (open) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [open, onClose, selectedRoutine]);
  const handleRoutineClick = (routine) => {
    setSelectedRoutine(routine);
    setSelectedPrompts(routine.prompts.map((_, i) => i));
    setEditedPrompts({});
  };
  const handleBack = () => {
    setSelectedRoutine(null);
    setSelectedPrompts([]);
    setEditedPrompts({});
  };
  const togglePrompt = (index) => {
    setSelectedPrompts((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };
  const handlePromptEdit = (index, newText) => {
    setEditedPrompts((prev) => ({
      ...prev,
      [index]: newText,
    }));
  };
  const handleRunRoutine = () => {
    const selectedData = selectedPrompts.map((i) => ({
      ...selectedRoutine.prompts[i],
      prompt: editedPrompts[i] || selectedRoutine.prompts[i].prompt,
    }));
    onSelectRoutine?.(selectedData, selectedRoutine);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-[min(780px,78%)] max-h-[85vh] flex flex-col rounded-2xl bg-[#000] border shadow-2xl border-white overflow-hidden"
          >
            <div className=" px-6 py-4">
              <div className="flex items-center justify-center gap-4 relative">
                {selectedRoutine && (
                  <button
                    onClick={handleBack}
                    className="p-1.5 rounded-lg transition-colors absolute left-0"
                  >
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedRoutine ? selectedRoutine.title : "Routines"}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {selectedRoutine
                      ? "Select the required prompts to run the routine"
                      : "Save and reuse groups of prompts for faster analysis"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors absolute right-0"
                >
                  <svg
                    className="w-5 h-5 text-slate-400"
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
            <div className="flex-1 overflow-auto px-24 py-6">
              {!selectedRoutine ? (
                routines.length === 0 ? (
                  <div className="text-center py-16">
                    <svg
                      className="w-16 h-16 text-slate-600 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    <p className="text-slate-400 text-lg">No routines yet</p>
                    <p className="text-slate-500 text-sm mt-2">
                      Create a routine by saving prompts from a chat
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {routines.map((routine, idx) => (
                      <button
                        key={routine._id || idx}
                        onClick={() => handleRoutineClick(routine)}
                        className="w-full text-left py-3 border-b-[#6D6D6D66] border-b  cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {routine.title || "Untitled Routine"}
                          </p>
                          <span className="text-xs text-slate-500 flex-shrink-0">
                            {(routine.prompts || []).length} prompts
                          </span>
                        </div>

                        <svg
                          className="w-4 h-4 text-[#ffffffc0] flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-1">
                  {selectedRoutine.prompts.map((prompt, idx) => (
                    <div
                      key={idx}
                      className="w-full text-left py-3 border-b border-b-slate-700 flex items-center gap-4"
                    >
                      <button
                        onClick={() => togglePrompt(idx)}
                        className="flex-shrink-0"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedPrompts.includes(idx)
                              ? ""
                              : "border-slate-500 bg-transparent"
                          }`}
                        >
                          {selectedPrompts.includes(idx) && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </div>
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={
                            editedPrompts[idx] !== undefined
                              ? editedPrompts[idx]
                              : prompt.prompt
                          }
                          onChange={(e) =>
                            handlePromptEdit(idx, e.target.value)
                          }
                          className="w-full bg-transparent text-slate-200 outline-none border-none focus:text-white"
                          placeholder="Enter prompt"
                        />
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0 capitalize">
                        {prompt.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Footer - Only show when routine is selected */}
            {selectedRoutine && (
              <div className="  px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {selectedPrompts.length} of {selectedRoutine.prompts.length}{" "}
                    prompts selected
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRunRoutine}
                      disabled={selectedPrompts.length === 0}
                      className="px-6 py-2 rounded-lg bg-[#0468F9] hover:bg-[#044ab3] disabled:bg-slate-800/50 disabled:text-slate-200 text-white  disabled:font-normal font-medium transition-colors"
                    >
                      Run Selected
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
