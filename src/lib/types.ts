export interface Portrait {
  key: string;
  position: 'left' | 'right';
}

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface ChoiceBlock {
  id: string;
  image?: string;
  description?: string;
  a: ChoiceOption;
  b: ChoiceOption;
}

export interface DialogueItem {
  portrait?: Portrait;
  text?: string;
  choice?: ChoiceBlock;
}

// The internal JSON structure stored in the DB
export interface SceneData {
  id: string; // The UUID used internally by your game
  name: string; // Internal name for the editor
  background: string;
  next: string;
  dialogue: DialogueItem[];
}

// The Supabase Row structure
export interface SceneRow {
  id: number; // int8 primary key
  data: SceneData;
  deleted: boolean;
}