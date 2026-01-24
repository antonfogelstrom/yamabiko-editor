import React, { useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  TouchSensor,
  MouseSensor,
  DragOverlay,
  useDroppable,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SceneRow, SceneData } from "../lib/types";
import { supabase } from "../lib/supabase";

interface Props {
  scenes: SceneRow[];
  activeId: number | null;
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: (importedData?: SceneData) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

interface SortableItemProps {
  scene: SceneRow;
  activeId: number | null;
  onSelect?: (id: number) => void;
  onClose?: () => void;
}

/**
 * 1. Reusable Item UI
 * Split from the Sortable wrapper so we can render it in the DragOverlay
 */
const SceneItemUI = ({
  scene,
  activeId,
  isDragging,
  dragOverlay,
  onSelect,
  onClose,
}: SortableItemProps & { isDragging?: boolean; dragOverlay?: boolean }) => {
  return (
    <div
      className={`
        group flex items-center justify-between p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all
        ${
          dragOverlay
            ? "bg-indigo-600 text-white shadow-2xl scale-105 border border-indigo-400"
            : scene.id === activeId
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }
        ${isDragging ? "opacity-30" : "opacity-100"}
      `}
      onClick={() => {
        if (!isDragging && onSelect && onClose) {
          onSelect(scene.id);
          onClose();
        }
      }}
    >
      {!onSelect && (
        <svg
          className="w-4 h-4 mr-2 opacity-50"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2z" />
        </svg>
      )}

      <span className="truncate font-medium text-sm flex-1 mr-2 select-none">
        {scene.data.name || "Untitled Scene"}
      </span>
    </div>
  );
};

const SortableSceneItem = (props: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SceneItemUI {...props} isDragging={isDragging} />
    </div>
  );
};

/**
 * 2. Trash Zone Component
 * Detects drops with ID "trash-zone"
 */
const TrashDroppable = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: "trash-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-full h-full min-h-35 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200
        ${
          isOver
            ? "border-red-500 bg-red-500/20 text-red-200 scale-105"
            : "border-slate-600 bg-slate-800/50 text-slate-400"
        }
      `}
    >
      <svg
        className={`w-8 h-8 ${isOver ? "animate-bounce" : ""}`}
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
      <span className="text-sm font-bold uppercase tracking-wider">
        {isOver ? "Release to Delete" : "Drag here to delete"}
      </span>
    </div>
  );
};

export const Sidebar: React.FC<Props> = ({
  scenes,
  activeId,
  userEmail,
  isOpen,
  onClose,
  onSelect,
  onDelete,
  onCreate,
  onReorder,
}) => {
  const [activeDragId, setActiveDragId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    // DELETE LOGIC
    if (over.id === "trash-zone") {
      onDelete(active.id as number);
      return;
    }

    // REORDER LOGIC
    if (active.id !== over.id) {
      const oldIndex = scenes.findIndex((s) => s.id === active.id);
      const newIndex = scenes.findIndex((s) => s.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.id && Array.isArray(json.dialogue)) {
          onCreate(json);
        } else {
          alert("Invalid Scene JSON format.");
        }
      } catch {
        alert("Error parsing JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const activeDragScene = scenes.find((s) => s.id === activeDragId);

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 transform transition-transform duration-300 ease-in-out
    md:translate-x-0 md:static md:h-screen md:shrink-0 flex flex-col border-r border-slate-800
    ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
  `;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragId(null)}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
            <SortableContext
              items={scenes.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {scenes.map((scene) => (
                <SortableSceneItem
                  key={scene.id}
                  scene={scene}
                  activeId={activeId}
                  onSelect={onSelect}
                  onClose={onClose}
                />
              ))}
            </SortableContext>

            {scenes.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No scenes yet.
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-900 min-h-45 flex flex-col justify-end">
            {activeDragId ? (
              // 3. Show Trash Zone if dragging
              <TrashDroppable />
            ) : (
              // Show standard buttons if NOT dragging
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={handleFileChange}
                />
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
                  onClick={() => fileInputRef.current?.click()}
                  className="hidden md:flex w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-sm transition-colors items-center justify-center gap-2 border border-slate-700"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Import JSON
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 bg-transparent border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg font-medium text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* 4. Drag Overlay (Floating Clone) */}
          <DragOverlay>
            {activeDragScene ? (
              <SceneItemUI
                scene={activeDragScene}
                activeId={activeId}
                dragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </aside>
    </>
  );
};
