import { useEffect, useState, useCallback } from "react";
import { supabase, SCHEMA, TABLE_NAME } from "./lib/supabase";
import type { SceneRow, SceneData, DialogueItem } from "./lib/types";
import type { Session } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { Sidebar } from "./components/Sidebar";
import { DialogueEntry } from "./components/DialogueEntry";
import { ChoiceEntry } from "./components/ChoiceEntry";
import { Auth } from "./components/Auth";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [appReady, setAppReady] = useState(false);

  // App Content State
  const [scenes, setScenes] = useState<SceneRow[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dirty State Tracking
  const [originalSnapshot, setOriginalSnapshot] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Derived State
  const activeScene = scenes.find((s) => s.id === activeId);

  // Check if current data matches the snapshot we took on load/save
  const isDirty = activeScene
    ? JSON.stringify(activeScene.data) !== originalSnapshot
    : false;

  // 1. Handle Auth Session on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAppReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchScenes = useCallback(async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TABLE_NAME)
      .select("*")
      .eq("deleted", false)
      .order("id", { ascending: true });

    if (error) console.error("Error fetching scenes:", error);
    if (data) {
      setScenes(data);
      // If we have data, set the first one as active and snapshot it
      if (data.length > 0 && !activeId) {
        const firstId = data[0].id;
        setActiveId(firstId);
        setOriginalSnapshot(JSON.stringify(data[0].data));
      }
    }
    setLoadingData(false);
  }, [activeId]);

  // 2. Fetch Data when Session exists
  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        await fetchScenes();
      } else {
        setScenes([]);
        setActiveId(null);
        setOriginalSnapshot("");
      }
    };

    fetchData();
  }, [session, fetchScenes]);

  // Handle Safe Scene Switching
  const handleSceneSelect = (id: number) => {
    if (id === activeId) return;

    if (isDirty) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes. Are you sure you want to switch scenes? Unsaved changes will be lost.",
      );
      if (!confirmSwitch) return;
    }

    // Proceed to switch
    const targetScene = scenes.find((s) => s.id === id);
    if (targetScene) {
      setActiveId(id);
      setOriginalSnapshot(JSON.stringify(targetScene.data));
    }
  };

  const createScene = async (importedData?: SceneData) => {
    if (
      isDirty &&
      !window.confirm(
        "You have unsaved changes. Create/Import new scene anyway?",
      )
    )
      return;

    // Use imported data if provided, otherwise create default
    const newSceneData: SceneData = importedData || {
      id: uuidv4(),
      name: "New Scene",
      background: "",
      next: "",
      dialogue: [],
    };

    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TABLE_NAME)
      .insert({ data: newSceneData, deleted: false })
      .select()
      .single();

    if (error) {
      console.error("Error creating scene:", error);
      return;
    }
    setScenes((prev) => [...prev, data]);
    setActiveId(data.id);
    setOriginalSnapshot(JSON.stringify(data.data));
  };

  const deleteScene = async (id: number) => {
    if (!confirm("Are you sure you want to delete this scene?")) return;
    const { error } = await supabase
      .schema(SCHEMA)
      .from(TABLE_NAME)
      .update({ deleted: true })
      .eq("id", id);
    if (!error) {
      const remaining = scenes.filter((s) => s.id !== id);
      setScenes(remaining);
      if (activeId === id) {
        setActiveId(null);
        setOriginalSnapshot("");
      }
    }
  };

  const updateActiveScene = (updater: (data: SceneData) => SceneData) => {
    if (activeId === null) return;
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === activeId ? { ...scene, data: updater(scene.data) } : scene,
      ),
    );
  };

  const saveScene = async () => {
    if (!activeScene || !session) return;

    setSaving(true);
    const { error } = await supabase
      .schema(SCHEMA)
      .from(TABLE_NAME)
      .update({ data: activeScene.data })
      .eq("id", activeId);

    if (error) {
      console.error("Error saving scene:", error);
      alert("Failed to save scene.");
    } else {
      // Update snapshot on success so button becomes disabled
      setOriginalSnapshot(JSON.stringify(activeScene.data));
    }
    setSaving(false);
  };

  // Actions
  const addDialogue = () => {
    updateActiveScene((data) => {
      const hasChoice = data.dialogue.some((d) => !!d.choice);
      const newEntry: DialogueItem = {
        portrait: { key: "", position: "left" },
        text: "",
      };
      const newDialogue = [...data.dialogue];
      if (hasChoice) {
        const choiceIndex = newDialogue.findIndex((d) => !!d.choice);
        newDialogue.splice(choiceIndex, 0, newEntry);
      } else {
        newDialogue.push(newEntry);
      }
      return { ...data, dialogue: newDialogue };
    });
  };

  const addChoice = () => {
    updateActiveScene((data) => ({
      ...data,
      dialogue: [
        ...data.dialogue,
        {
          choice: {
            id: uuidv4(),
            a: { id: "", label: "" },
            b: { id: "", label: "" },
          },
        },
      ],
    }));
  };

  const downloadJSON = () => {
    if (!activeScene) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(activeScene.data, null, 4));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `${activeScene.data.name || "scene"}.json`);
    dl.click();
  };

  if (!appReady)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 animate-pulse">
        Initializing...
      </div>
    );

  if (!session) {
    return <Auth />;
  }

  if (loadingData && scenes.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
        Loading Scenes...
      </div>
    );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Responsive Drawer */}
      <Sidebar
        scenes={scenes}
        activeId={activeId}
        userEmail={session.user.email}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSceneSelect}
        onDelete={deleteScene}
        onCreate={createScene}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Sticky Mobile/Desktop Header */}
        <header className="bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="font-bold text-lg text-slate-800 truncate">
              {activeScene ? activeScene.data.name : "Select a Scene"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {activeScene && (
              <>
                <button
                  onClick={downloadJSON}
                  className="hidden sm:inline-flex items-center justify-center p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Download JSON"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
                <button
                  onClick={saveScene}
                  disabled={saving || !isDirty} // Disable if saving OR not dirty
                  className={`
                      inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white
                      transition-all duration-200
                      ${
                        saving
                          ? "bg-slate-400 cursor-wait"
                          : !isDirty
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" // Grayed out state
                            : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md" // Active state
                      }
                    `}
                >
                  {saving ? "Saving..." : isDirty ? "Save Changes" : "Saved"}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Editor Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 scroll-smooth">
          {activeScene ? (
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
              {/* Scene Metadata Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Scene Name
                  </label>
                  <input
                    type="text"
                    className="block w-full text-lg font-medium border-0 border-b-2 border-slate-200 focus:border-indigo-500 focus:ring-0 px-0 bg-transparent transition-colors"
                    value={activeScene.data.name}
                    onChange={(e) =>
                      updateActiveScene((d) => ({ ...d, name: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Background Key
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={activeScene.data.background}
                    onChange={(e) =>
                      updateActiveScene((d) => ({
                        ...d,
                        background: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Next Scene ID
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                    value={activeScene.data.next}
                    placeholder="UUID"
                    onChange={(e) =>
                      updateActiveScene((d) => ({ ...d, next: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Scene ID
                  </label>
                  <div className="flex gap-2">
                    <code className="flex-1 block w-full rounded-md border border-slate-200 bg-slate-100 py-2 px-3 text-xs font-mono text-slate-600 truncate">
                      {activeScene.data.id}
                    </code>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(activeScene.data.id)
                      }
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 my-6"></div>

              {/* Dialogue Flow */}
              <div className="space-y-4">
                {activeScene.data.dialogue.map((item, idx) =>
                  item.choice ? (
                    <ChoiceEntry
                      key={idx}
                      item={item}
                      onChange={(updated) => {
                        const newArr = [...activeScene.data.dialogue];
                        newArr[idx] = updated;
                        updateActiveScene((d) => ({ ...d, dialogue: newArr }));
                      }}
                      onRemove={() => {
                        const newArr = activeScene.data.dialogue.filter(
                          (_, i) => i !== idx,
                        );
                        updateActiveScene((d) => ({ ...d, dialogue: newArr }));
                      }}
                    />
                  ) : (
                    <DialogueEntry
                      key={idx}
                      item={item}
                      onChange={(updated) => {
                        const newArr = [...activeScene.data.dialogue];
                        newArr[idx] = updated;
                        updateActiveScene((d) => ({ ...d, dialogue: newArr }));
                      }}
                      onRemove={() => {
                        const newArr = activeScene.data.dialogue.filter(
                          (_, i) => i !== idx,
                        );
                        updateActiveScene((d) => ({ ...d, dialogue: newArr }));
                      }}
                    />
                  ),
                )}
              </div>

              {/* Add Buttons Area */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={addDialogue}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-semibold hover:bg-indigo-100 hover:border-indigo-200 hover:shadow-sm transition-all"
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
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Dialogue
                </button>
                <button
                  onClick={addChoice}
                  disabled={activeScene.data.dialogue.some((d) => !!d.choice)}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 font-semibold hover:bg-amber-100 hover:border-amber-200 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Choice
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-600">
                No Scene Selected
              </h2>
              <p className="mt-2 text-sm max-w-xs text-center">
                Open the sidebar menu to select a scene or create a new one.
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="mt-6 md:hidden px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
              >
                Open Menu
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
