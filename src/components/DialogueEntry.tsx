import React from 'react';
import type { DialogueItem } from '../lib/types';

interface Props {
  item: DialogueItem;
  onChange: (updated: DialogueItem) => void;
  onRemove: () => void;
}

export const DialogueEntry: React.FC<Props> = ({ item, onChange, onRemove }) => {
  const handleChange = (field: string, value: any) => {
    // Deep update logic
    if (field === 'text') {
      onChange({ ...item, text: value });
    } else {
      onChange({
        ...item,
        portrait: { ...item.portrait, [field]: value } as any
      });
    }
  };

  return (
    <div className="entry" style={{ 
      position: 'relative', 
      background: 'white', 
      border: '1px solid var(--border)', 
      padding: '24px', 
      marginBottom: '20px', 
      borderRadius: 'var(--radius-md)',
      borderLeft: '4px solid var(--primary)'
    }}>
      <button 
        onClick={onRemove}
        style={{
            position: 'absolute', top: '16px', right: '16px', borderRadius: '50%',
            width: '28px', height: '28px', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'white'
        }}
        className="btn-remove-hover"
      >✕</button>
      
      <div className="row">
        <div>
          <label>Portrait Key</label>
          <input 
            type="text" 
            value={item.portrait?.key || ''} 
            onChange={(e) => handleChange('key', e.target.value)} 
          />
        </div>
        <div>
          <label>Position</label>
          <select 
            value={item.portrait?.position || 'left'} 
            onChange={(e) => handleChange('position', e.target.value)}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      <label>Text</label>
      <textarea 
        value={item.text || ''} 
        onChange={(e) => handleChange('text', e.target.value)} 
      />
    </div>
  );
};