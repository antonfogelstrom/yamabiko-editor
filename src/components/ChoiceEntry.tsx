import React from "react";
import type { DialogueItem } from "../lib/types";
import { v4 as uuidv4 } from "uuid";

interface Props {
  item: DialogueItem;
  onChange: (updated: DialogueItem) => void;
  onRemove: () => void;
}

export const ChoiceEntry: React.FC<Props> = ({ item, onChange, onRemove }) => {
  const choice = item.choice || {
    id: uuidv4(),
    a: { id: "", label: "" },
    b: { id: "", label: "" },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateChoice = (field: string, value: any, subObject?: "a" | "b") => {
    if (subObject) {
      onChange({
        ...item,
        choice: {
          ...choice,
          [subObject]: { ...choice[subObject], [field]: value },
        },
      });
    } else {
      onChange({
        ...item,
        choice: { ...choice, [field]: value },
      });
    }
  };

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6 mb-4 transition-shadow hover:shadow-md border-l-4 border-l-amber-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
          Choice Block
        </h3>
        <button
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
        >
          <svg
            className="w-5 h-5"
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

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="text"
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2 px-3 bg-slate-50"
              value={choice.image || ""}
              onChange={(e) => updateChoice("image", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Internal Description
            </label>
            <input
              type="text"
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2 px-3 bg-slate-50"
              value={choice.description || ""}
              onChange={(e) => updateChoice("description", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Option A */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="font-medium text-slate-700 mb-3 text-sm border-b border-slate-200 pb-2">
              Option A
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  className="w-full rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                  value={choice.a?.label || ""}
                  onChange={(e) => updateChoice("label", e.target.value, "a")}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Target Scene ID
                </label>
                <input
                  type="text"
                  className="w-full rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm font-mono"
                  value={choice.a?.id || ""}
                  onChange={(e) => updateChoice("id", e.target.value, "a")}
                />
              </div>
            </div>
          </div>

          {/* Option B */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="font-medium text-slate-700 mb-3 text-sm border-b border-slate-200 pb-2">
              Option B
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  className="w-full rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                  value={choice.b?.label || ""}
                  onChange={(e) => updateChoice("label", e.target.value, "b")}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Target Scene ID
                </label>
                <input
                  type="text"
                  className="w-full rounded border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm font-mono"
                  value={choice.b?.id || ""}
                  onChange={(e) => updateChoice("id", e.target.value, "b")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
