import { useEffect, useState } from 'react';
import { supabase, SCHEMA, TABLE_NAME } from './lib/supabase';
import type { SceneRow, SceneData, DialogueItem } from './lib/types';
import type { Session } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { DialogueEntry } from './components/DialogueEntry';
import { ChoiceEntry } from './components/ChoiceEntry';
import { Auth } from './components/Auth'; // Import the new component

function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [appReady, setAppReady] = useState(false);
  
  // App Content State
  const [scenes, setScenes] = useState<SceneRow[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // 1. Handle Auth Session on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAppReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Data when Session exists
  useEffect(() => {
    if (session) {
      fetchScenes();
    } else {
      // Clear data on logout
      setScenes([]);
      setActiveId(null);
    }
  }, [session]);

  const fetchScenes = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TABLE_NAME)
      .select('*')
      .eq('deleted', false)
      .order('id', { ascending: true });

    if (error) console.error('Error fetching scenes:', error);
    if (data) {
        setScenes(data);
        if (data.length > 0 && !activeId) setActiveId(data[0].id);
    }
    setLoadingData(false);
  };

  // ... (Keep createScene, deleteScene, updateActiveScene, auto-save logic exactly as before)
  const createScene = async () => {
    const newSceneData: SceneData = {
      id: uuidv4(),
      name: 'New Scene',
      background: '',
      next: '',
      dialogue: []
    };
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TABLE_NAME)
      .insert({ data: newSceneData, deleted: false })
      .select()
      .single();

    if (error) { console.error('Error creating scene:', error); return; }
    setScenes(prev => [...prev, data]);
    setActiveId(data.id);
  };

  const deleteScene = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scene?')) return;
    const { error } = await supabase.schema(SCHEMA).from(TABLE_NAME).update({ deleted: true }).eq('id', id);
    if (!error) {
        setScenes(prev => prev.filter(s => s.id !== id));
        if (activeId === id) setActiveId(null);
    }
  };

  const updateActiveScene = (updater: (data: SceneData) => SceneData) => {
    if (activeId === null) return;
    setScenes(prev => prev.map(scene => scene.id === activeId ? { ...scene, data: updater(scene.data) } : scene));
  };

  // Auto-save
  const activeScene = scenes.find(s => s.id === activeId);
  const debouncedSceneData = useDebounce(activeScene?.data, 1000);
  useEffect(() => {
    if (activeId && debouncedSceneData && session) {
      supabase.schema(SCHEMA).from(TABLE_NAME).update({ data: debouncedSceneData }).eq('id', activeId).then(({ error }) => {
            if (error) console.error("Auto-save error", error);
        });
    }
  }, [debouncedSceneData, activeId, session]);

  // Actions
  const addDialogue = () => {
    updateActiveScene(data => {
      const hasChoice = data.dialogue.some(d => !!d.choice);
      const newEntry: DialogueItem = { portrait: { key: '', position: 'left' }, text: '' };
      let newDialogue = [...data.dialogue];
      if (hasChoice) {
         const choiceIndex = newDialogue.findIndex(d => !!d.choice);
         newDialogue.splice(choiceIndex, 0, newEntry);
      } else {
         newDialogue.push(newEntry);
      }
      return { ...data, dialogue: newDialogue };
    });
  };

  const addChoice = () => {
    updateActiveScene(data => ({
      ...data,
      dialogue: [...data.dialogue, { choice: { id: uuidv4(), a: { id: '', label: '' }, b: { id: '', label: '' } } }]
    }));
  };
  
  const downloadJSON = () => {
    if (!activeScene) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeScene.data, null, 4));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `${activeScene.data.name || 'scene'}.json`);
    dl.click();
  };

  // -- RENDER LOGIC --

  if (!appReady) return <div style={{display:'flex', justifyContent:'center', marginTop: 50}}>Initializing...</div>;

  // IF NOT LOGGED IN, SHOW AUTH
  if (!session) {
    return <Auth />;
  }

  // IF LOGGED IN, SHOW EDITOR
  if (loadingData && scenes.length === 0) return <div style={{display:'flex', justifyContent:'center', marginTop: 50}}>Loading Scenes...</div>;

  return (
    <div className="app-layout">
      <Sidebar 
        scenes={scenes} 
        activeId={activeId} 
        userEmail={session.user.email}
        onSelect={setActiveId} 
        onDelete={deleteScene}
        onCreate={createScene}
      />

      <main className="main-editor">
        {activeScene ? (
          <div className="container">
            <div className="controls">
              <h2 style={{ margin: 0, flex: 1 }}>{activeScene.data.name}</h2>
              <button className="btn btn-primary" onClick={downloadJSON}>Download JSON</button>
            </div>

            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '30px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label>Scene Name (Internal)</label>
                <input type="text" value={activeScene.data.name} onChange={e => updateActiveScene(d => ({ ...d, name: e.target.value }))} />
              </div>
              <div>
                <label>Root File ID (UUID)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={activeScene.data.id} readOnly style={{ background: '#e5e7eb' }} />
                  <button className="btn" onClick={() => navigator.clipboard.writeText(activeScene.data.id)}>Copy</button>
                </div>
              </div>
              <div>
                <label>Background Key</label>
                <input type="text" value={activeScene.data.background} onChange={e => updateActiveScene(d => ({ ...d, background: e.target.value }))} />
              </div>
              <div>
                <label>Next Scene (Target ID)</label>
                <input type="text" value={activeScene.data.next} onChange={e => updateActiveScene(d => ({ ...d, next: e.target.value }))} placeholder="Paste target UUID" />
              </div>
            </div>

            <div className="controls">
              <button className="btn btn-success" onClick={addDialogue}>+ Add Dialogue</button>
              <button className="btn btn-accent" onClick={addChoice} disabled={activeScene.data.dialogue.some(d => !!d.choice)}>+ Add Choice</button>
            </div>

            <div id="dialogue-list">
              {activeScene.data.dialogue.map((item, idx) => (
                item.choice ? (
                  <ChoiceEntry 
                    key={idx} item={item} 
                    onChange={(updated) => { const newArr = [...activeScene.data.dialogue]; newArr[idx] = updated; updateActiveScene(d => ({ ...d, dialogue: newArr })); }}
                    onRemove={() => { const newArr = activeScene.data.dialogue.filter((_, i) => i !== idx); updateActiveScene(d => ({ ...d, dialogue: newArr })); }}
                  />
                ) : (
                  <DialogueEntry 
                    key={idx} item={item} 
                    onChange={(updated) => { const newArr = [...activeScene.data.dialogue]; newArr[idx] = updated; updateActiveScene(d => ({ ...d, dialogue: newArr })); }}
                    onRemove={() => { const newArr = activeScene.data.dialogue.filter((_, i) => i !== idx); updateActiveScene(d => ({ ...d, dialogue: newArr })); }}
                  />
                )
              ))}
            </div>
          </div>
        ) : (
            <div style={{ textAlign: 'center', marginTop: '100px', color: '#6b7280' }}>
            <h2>No Scene Selected</h2>
            <p>Select a scene from the sidebar or create a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;