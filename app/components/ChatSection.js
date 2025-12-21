"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ThinkingEffect from "./ThinkingEffect";

export default function ChatSection({
  chatHistory = [],
  onQueryClick = null,
  selectedQueryId = null,
  thinkingQueryId = null,
}) {
  const [activeTab, setActiveTab] = useState("All");
  const chatEndRef = useRef(null);
  const [localSelectedId, setLocalSelectedId] = useState(selectedQueryId);
  const [completedTyping, setCompletedTyping] = useState(new Set());
  const wasThinkingRef = useRef(new Set());
  const previousResponsesRef = useRef(new Map());
  const [typingStates, setTypingStates] = useState({});

  useEffect(() => {
    setLocalSelectedId(selectedQueryId);
  }, [selectedQueryId]);

  useEffect(() => {
    if (thinkingQueryId) {
      wasThinkingRef.current.add(thinkingQueryId);
    }
  }, [thinkingQueryId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, thinkingQueryId, typingStates]);

  useEffect(() => {
    chatHistory.forEach((chat) => {
      if (chat.id) {
        const previousResponse = previousResponsesRef.current.get(chat.id);
        const currentResponse = chat.response || "";

        const wasInThinkingState = wasThinkingRef.current.has(chat.id);

        const isNewResponse =
          currentResponse &&
          (!previousResponse || previousResponse === "") &&
          !completedTyping.has(chat.id) &&
          wasInThinkingState;

        previousResponsesRef.current.set(chat.id, currentResponse);

        if (isNewResponse) {
          setTypingStates((prev) => ({
            ...prev,
            [chat.id]: { isTyping: true, hasStarted: true },
          }));
        } else if (
          currentResponse &&
          previousResponse === undefined &&
          !wasInThinkingState
        ) {
          setCompletedTyping((prev) => new Set([...prev, chat.id]));
        }
      }
    });
  }, [chatHistory, completedTyping]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .chat-messages-area::-webkit-scrollbar {
        display: none;
      }
      .chat-messages-area {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const tabs = ["All", "Captioning", "Grounding", "VQA"];

  const filteredChatHistory =
    activeTab === "All"
      ? chatHistory
      : chatHistory.filter((chat) => chat.category === activeTab);

  const handleQueryClick = (chat) => {
    if (onQueryClick) onQueryClick(chat);
  };

  return (
    <div className="w-full h-[65vh] flex flex-col bg-[#0f1720] border border-cyan-700/10 rounded-2xl overflow-hidden min-h-[420px] shadow-lg">
      {/* Tabs */}
      <div className="flex items-center justify-center py-1 border-b border-cyan-700/10">
        <div className="flex space-x-4 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-2 transition-colors relative ${
                activeTab === tab
                  ? "text-white"
                  : "text-slate-300/60 hover:text-slate-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-6 space-y-8 chat-messages-area"
        onClick={() => {
          setLocalSelectedId(null);
          if (onQueryClick) onQueryClick(null);
        }}
      >
        {filteredChatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No chat history yet. Start a conversation below.
          </div>
        ) : (
          filteredChatHistory.map((chat) => {
            const isThinking = chat.isThinking && thinkingQueryId === chat.id;
            const hasResponse = chat.response && !isThinking;

            return (
              <div key={chat.id} className="space-y-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-blue-400 mb-0.5 px-2 font-medium">
                    {chat.category}
                  </span>

                  <button
                    className={`bg-blue-600 text-white px-2 py-3 rounded-lg max-w-[75%] shadow-md transition-all cursor-pointer focus:outline-none ${
                      localSelectedId === chat.id
                        ? "ring-2 ring-cyan-400 ring-offset-transparent"
                        : "hover:bg-blue-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalSelectedId(chat.id);
                      handleQueryClick(chat);
                    }}
                  >
                    <p className="leading-relaxed text-left whitespace-pre-wrap break-words max-w-full">
                      {chat.query}
                    </p>
                  </button>
                </div>

                {isThinking ? (
                  <div className="flex flex-col items-start">
                    <div className="bg-black text-white px-4 py-3 rounded-lg max-w-[75%] border border-cyan-700/20 shadow-lg">
                      <ThinkingEffect isVisible={true} />
                    </div>
                  </div>
                ) : hasResponse ? (
                  <div className="flex flex-col items-start">
                    <div
                      className={`bg-black text-white px-2 py-3 rounded-lg max-w-[75%] border shadow-lg ${
                        chat.error ? "border-red-500/30" : "border-black"
                      }`}
                    >
                      {typingStates[chat.id]?.isTyping &&
                      !completedTyping.has(chat.id) ? (
                        <p
                          className={`leading-relaxed whitespace-pre-wrap break-words max-w-full ${
                            chat.error ? "text-red-400" : ""
                          }`}
                        >
                          <TypingEffect
                            text={chat.response}
                            speed={15}
                            isVisible={true}
                            onComplete={() => {
                              setCompletedTyping(
                                (prev) => new Set([...prev, chat.id])
                              );
                              setTypingStates((prev) => ({
                                ...prev,
                                [chat.id]: {
                                  isTyping: false,
                                  hasStarted: true,
                                },
                              }));
                            }}
                          />
                        </p>
                      ) : (
                        <p
                          className={`leading-relaxed whitespace-pre-wrap break-words max-w-full ${
                            chat.error ? "text-red-400" : ""
                          }`}
                        >
                          {chat.response}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
