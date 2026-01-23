import React from 'react';
import type { SceneRow } from '../lib/types';
import { supabase } from '../lib/supabase';

interface Props {
  scenes: SceneRow[];
  activeId: number | null;
  userEmail?: string; // New prop
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
}

export const Sidebar: React.FC<Props> = ({ scenes, activeId, userEmail, onSelect, onDelete, onCreate }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside style={{
        width: '280px', background: 'var(--bg-sidebar)', color: 'var(--text-on-dark)',
        display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155', flexShrink: 0
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #334155' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Dialogue Scenes</h2>
        {userEmail && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' }}>{userEmail}</div>}
      </div>

      <ul style={{ flex: 1, overflowY: 'auto', padding: '10px', listStyle: 'none', margin: 0 }}>
        {scenes.map((scene) => (
          <li 
            key={scene.id}
            onClick={() => onSelect(scene.id)}
            style={{
                padding: '12px 15px', marginBottom: '5px', borderRadius: 'var(--radius-md)',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: scene.id === activeId ? 'var(--primary)' : 'transparent',
                color: scene.id === activeId ? 'white' : 'inherit'
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {scene.data.name || 'Untitled Scene'}
            </span>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(scene.id); }}
                style={{ background: 'none', border: 'none', color: '#ffcccc', cursor: 'pointer', fontSize: '1.2em' }}
            >×</button>
          </li>
        ))}
      </ul>

      <div style={{ padding: '20px', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="btn btn-success" style={{ width: '100%' }} onClick={onCreate}>
          + New Scene
        </button>
        <button 
          className="btn" 
          onClick={handleLogout}
          style={{ width: '100%', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1' }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};