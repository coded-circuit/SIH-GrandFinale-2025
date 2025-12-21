import React, { useState, useRef, useEffect } from "react";
const Promptbox = ({
  value,
  onChange,
  onSend,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [internalValue, setInternalValue] = useState("");
  const [internalCategory, setInternalCategory] = useState("Captioning");
  const textareaRef = useRef(null);
  const categories = ["Captioning", "Grounding", "VQA"];
  const isControlled =
    typeof value !== "undefined" && typeof onChange === "function";
  const currentValue = isControlled ? value : internalValue;
  const changeValue = (v) => {
    if (isControlled) onChange(v);
    else setInternalValue(v);
  };
  const isCategoryControlled =
    typeof selectedCategory !== "undefined" &&
    typeof setSelectedCategory === "function";
  const currentCategory = isCategoryControlled
    ? selectedCategory
    : internalCategory;
  const changeCategory = (c) => {
    if (isCategoryControlled) setSelectedCategory(c);
    else setInternalCategory(c);
  };
  const doSend = () => {
    const trimmed = (currentValue || "").trim();
    if (!trimmed) return;
    if (typeof onSend === "function") onSend(trimmed, currentCategory);
    if (!isControlled) setInternalValue("");
  };
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [currentValue]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      doSend(); 
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8">
      <div className="flex gap-4 justify-center items-center mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => changeCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentCategory === category
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                : "text-gray-400 hover:text-white border border-gray-700/50 hover:border-gray-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 backdrop-blur-xl border border-blue-400/20 rounded-xl p-1 shadow-2xl">
          <div className="relative flex items-center gap-3 bg-slate-900/40 rounded-lg px-4 py-3">
            <textarea
              ref={textareaRef}
              value={currentValue}
              onChange={(e) => changeValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none resize-none overflow-hidden min-h-[40px]"
              rows={1}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                doSend();
              }}
              className="ml-2 p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-all"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promptbox;
