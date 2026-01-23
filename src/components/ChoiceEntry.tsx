import React from 'react';
import type { DialogueItem } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  item: DialogueItem;
  onChange: (updated: DialogueItem) => void;
  onRemove: () => void;
}

export const ChoiceEntry: React.FC<Props> = ({ item, onChange, onRemove }) => {
  const choice = item.choice || { 
    id: uuidv4(), a: { id: '', label: '' }, b: { id: '', label: '' } 
  };

  const updateChoice = (field: string, value: any, subObject?: 'a' | 'b') => {
    if (subObject) {
      onChange({
        ...item,
        choice: {
          ...choice,
          [subObject]: { ...choice[subObject], [field]: value }
        }
      });
    } else {
      onChange({
        ...item,
        choice: { ...choice, [field]: value }
      });
    }
  };

  return (
    <div className="entry" style={{
      position: 'relative', background: 'white', border: '1px solid var(--border)',
      padding: '24px', marginBottom: '20px', borderRadius: 'var(--radius-md)',
      borderLeft: '4px solid var(--accent)'
    }}>
      <button 
        onClick={onRemove}
        style={{
            position: 'absolute', top: '16px', right: '16px', borderRadius: '50%',
            width: '28px', height: '28px', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'white'
        }}
      >✕</button>

      <strong>Choice Block</strong>
      
      <label>Image (Optional)</label>
      <input type="text" value={choice.image || ''} onChange={(e) => updateChoice('image', e.target.value)} />
      
      <label>Description</label>
      <input type="text" value={choice.description || ''} onChange={(e) => updateChoice('description', e.target.value)} />

      <div className="row">
        <div style={{ marginTop: '15px', padding: '15px', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)' }}>
            <label>Option A Label</label>
            <input type="text" value={choice.a?.label || ''} onChange={(e) => updateChoice('label', e.target.value, 'a')} />
            <label>Target Scene ID</label>
            <input type="text" value={choice.a?.id || ''} onChange={(e) => updateChoice('id', e.target.value, 'a')} />
        </div>
        <div style={{ marginTop: '15px', padding: '15px', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)' }}>
            <label>Option B Label</label>
            <input type="text" value={choice.b?.label || ''} onChange={(e) => updateChoice('label', e.target.value, 'b')} />
            <label>Target Scene ID</label>
            <input type="text" value={choice.b?.id || ''} onChange={(e) => updateChoice('id', e.target.value, 'b')} />
        </div>
      </div>
    </div>
  );
};