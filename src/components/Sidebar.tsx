import React from "react";
import type { SceneRow } from "../lib/types";
import { supabase } from "../lib/supabase";

interface Props {
  scenes: SceneRow[];
  activeId: number | null;
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
}

export const Sidebar: React.FC<Props> = ({
  scenes,
  activeId,
  userEmail,
  isOpen,
  onClose,
  onSelect,
  onDelete,
  onCreate,
}) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Base classes for the sidebar container
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 transform transition-transform duration-300 ease-in-out
    md:translate-x-0 md:static md:h-screen md:shrink-0 flex flex-col border-r border-slate-800
    ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Story Editor
            </h2>
            {userEmail && (
              <p
                className="text-xs text-slate-400 mt-1 truncate max-w-50"
                title={userEmail}
              >
                {userEmail}
              </p>
            )}
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Scene List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              onClick={() => {
                onSelect(scene.id);
                onClose(); // Close drawer on mobile selection
              }}
              className={`
                group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                ${
                  scene.id === activeId
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <span className="truncate font-medium text-sm flex-1 mr-2">
                {scene.data.name || "Untitled Scene"}
              </span>
              {scene.id === activeId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(scene.id);
                  }}
                  className={`
                    p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                    ${scene.id === activeId ? "hover:bg-indigo-700 text-indigo-200" : "hover:bg-slate-700 text-slate-400 hover:text-red-400"}
                    md:opacity-100 focus:opacity-100
                  `}
                  aria-label="Delete scene"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {scenes.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No scenes yet. Create one!
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900">
          <button
            onClick={() => {
              onCreate();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Scene
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-transparent border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg font-medium text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
