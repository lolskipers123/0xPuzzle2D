export type PuzzleCategory = 'binary' | 'hex' | 'logic' | 'arithmetic' | 'color' | 'memory' | 'master';

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'jump-through' | 'spring' | 'hazard';
  label?: string;
  color?: string;
}

export interface PuzzleSwitchData {
  id: string;
  label: string;
  subLabel?: string;
  weight: number; // For binary: 128, 64, 32, 16, 8, 4, 2, 1
  value: 0 | 1;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface PuzzleDialData {
  id: string;
  label: string;
  subLabel?: string;
  min: number;
  max: number; // e.g. 15 for 0x0-0xF
  step: number;
  value: number;
  format: 'hex' | 'dec' | 'byte-hex';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface LogicGateData {
  id: string;
  type: 'AND' | 'OR' | 'XOR' | 'NOT';
  inputSwitchIds: string[];
  outputRequired: 0 | 1;
  currentOutput: 0 | 1;
  x: number;
  y: number;
}

export interface PuzzleEvaluation {
  isSolved: boolean;
  currentValueText: string;
  targetValueText: string;
  matchDetails: string;
  percentMatch: number;
  colorPreview?: string; // For RGB hex level
}

export interface PuzzleLevel {
  id: number; // 1 to 10
  title: string;
  subtitle: string;
  category: PuzzleCategory;
  difficulty: 'Intro' | 'Apprentice' | 'Operator' | 'Specialist' | 'Master';
  targetDescription: string;
  hintTitle: string;
  hintExplanation: string;
  hintRules: string[];
  hintTable?: { key: string; val: string }[];
  parMoves: number;
  parTime: number; // in seconds
  playerSpawn: { x: number; y: number };
  platforms: Platform[];
  switches: PuzzleSwitchData[];
  dials: PuzzleDialData[];
  logicGates?: LogicGateData[];
  exitGate: { x: number; y: number; width: number; height: number };
  laserBarrier: { x: number; y: number; width: number; height: number };
  evaluate: (switches: PuzzleSwitchData[], dials: PuzzleDialData[]) => PuzzleEvaluation;
}

export interface LevelStats {
  completed: boolean;
  stars: number;
  bestMoves: number;
  bestTime: number; // seconds
}

export interface PlayerProgress {
  unlockedLevel: number; // 1 to 10. Only <= unlockedLevel can be accessed!
  levelStats: Record<number, LevelStats>;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
}
