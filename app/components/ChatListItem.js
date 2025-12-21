"use client";
import { useState } from "react";

export default function ChatListItem({
  chat,
  isActive,
  onOpenChat,
  onRename,
  onDelete,
}) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);

  const handleRenameSubmit = () => {
    if (!newTitle.trim()) return;
    onRename(chat._id, newTitle.trim());
    setIsRenaming(false);
  };

  return (
    <div
      className={`relative p-3 rounded-lg mb-2 cursor-pointer transition-all border
        ${
          isActive
            ? "bg-[#1E2A38] border-[#2C384A] border-[1.5px] shadow-lg"
            : "bg-white/5 border-transparent hover:bg-white/10"
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMenuOpen(false);
      }}
      onClick={() => !isRenaming && onOpenChat(chat)}
    >
      {/* Title OR rename textarea */}
      {!isRenaming ? (
        <p className="font-semibold break-words whitespace-normal">
          {chat.title}
        </p>
      ) : (
        <textarea
          className="w-full px-2 py-1 bg-black border border-cyan-700 rounded text-white mb-1 resize-none break-words whitespace-normal"
          autoFocus
          rows={2}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            // Submit on ENTER without SHIFT
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleRenameSubmit();
            }
          }}
          onBlur={handleRenameSubmit}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <p className="text-xs text-gray-400">
        {new Date(chat.createdAt).toLocaleString()}
      </p>

      {/* Right click/tap area for menu (larger hit area). Clicking here opens the menu. */}
      {!isRenaming && (
        <div
          className="absolute right-2 top-0 bottom-0 flex items-start justify-center w-12"
          onClick={(e) => {
            // prevent opening the chat
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          role="button"
          aria-label="Open chat actions"
        >
          {/* show three dots when hovered over item or when menu is open */}
          {(hovered || menuOpen) && (
            <div className="text-gray-300 hover:text-white select-none mt-5">⋮</div>
          )}
        </div>
      )}

      {/* Dropdown menu */}
      {menuOpen && !isRenaming && (
        <div
          className="absolute right-14 top-10 bg-gradient-to-br from-[#071017] to-[#0f1720] border border-white/10 rounded-md shadow-2xl z-50 w-40 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 flex items-center">
            <button
              className="w-full text-left px-3 py-2 rounded-md text-sm text-white hover:bg-white/6 transition  flex items-center justify-between"
              onClick={() => {
                setIsRenaming(true);
                setMenuOpen(false);
              }}
            >
              {/* Rename Icon */}
              <p>Rename</p>
              <img src="/rename.svg" alt="Rename" className="block w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-white/5 px-3 py-2">
            <button
              className="w-full text-left px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-600/10 transition flex items-center justify-between"
             onClick={() => onDelete(chat._id)}
              >
              {/* Delete Text and Icon */}
                <p>Delete</p>
              <img src="/delete.svg" alt="Delete" className="block w-4  h-4" />
              </button>
            </div>

        </div>
      )}
    </div>
  );
}
