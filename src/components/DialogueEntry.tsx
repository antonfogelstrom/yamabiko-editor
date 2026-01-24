import React from "react";
import type { BaseData, DialogueItem } from "../lib/types";

interface Props {
  item: DialogueItem;
  names: BaseData[];
  portraits: BaseData[];
  moods: BaseData[];
  onChange: (updated: DialogueItem) => void;
  onRemove: () => void;
}

export const DialogueEntry: React.FC<Props> = ({
  item,
  names,
  portraits,
  moods,
  onChange,
  onRemove,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: string, value: any) => {
    if (field === "text") {
      onChange({ ...item, text: value });
    } else {
      onChange({
        ...item,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        portrait: { ...item.portrait, [field]: value } as any,
      });
    }
  };

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6 mb-4 transition-shadow hover:shadow-md border-l-4 border-l-indigo-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Dialogue
        </h3>
        <button
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
          title="Remove Block"
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Name
          </label>
          <select
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-slate-50"
            value={item.portrait?.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
          >
            {names.map((name) => (
              <option key={name.id}>{name.value}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Portrait
          </label>
          <select
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-slate-50"
            value={item.portrait?.key || ""}
            onChange={(e) => handleChange("key", e.target.value)}
          >
            {portraits.map((portrait) => (
              <option key={portrait.id}>{portrait.value}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Mood
          </label>
          <select
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-slate-50"
            value={item.portrait?.mood || ""}
            onChange={(e) => handleChange("mood", e.target.value)}
          >
            {moods.map((mood) => (
              <option key={mood.id}>{mood.value}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Dialogue Text
        </label>
        <textarea
          rows={3}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-slate-50 resize-y min-h-20"
          placeholder="What does the character say?"
          value={item.text || ""}
          onChange={(e) => handleChange("text", e.target.value)}
        />
      </div>
    </div>
  );
};
