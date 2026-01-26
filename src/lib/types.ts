export interface Portrait {
  key: string;
  position: "left" | "right";
  mood: string;
  name: string;
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

export interface SceneData {
  id: string;
  name: string;
  background: string;
  next: string;
  dialogue: DialogueItem[];
}

export interface SceneRow {
  id: number;
  data: SceneData;
  deleted: boolean;
  order: number;
}

export interface BaseData {
  id: number;
  value: string;
}
