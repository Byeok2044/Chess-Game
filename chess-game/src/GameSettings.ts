export type BoardTheme = 'ledger' | 'classic' | 'slate' | 'forest' | 'rosewood';
export type PieceStyle = 'unicode' | 'minimal';
export type TimeControl = 'none' | '1+0' | '3+2' | '5+0' | '10+0';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
  showCoordinates: boolean;
  showValidMoves: boolean;
  soundEnabled: boolean;
  timeControl: TimeControl;
  playerOneName: string;
  playerTwoName: string;
}

export const DEFAULT_SETTINGS: GameSettings = {
  boardTheme: 'ledger',
  pieceStyle: 'unicode',
  showCoordinates: true,
  showValidMoves: true,
  soundEnabled: true,
  timeControl: 'none',
  playerOneName: 'White',
  playerTwoName: 'Black',
};

export const BOARD_THEMES: Record<BoardTheme, { light: string; dark: string; name: string }> = {
  ledger:   { light: '#e8dcc0', dark: '#6b4a30', name: 'Ledger' },
  classic:  { light: '#eee0c0', dark: '#8b6e45', name: 'Classic' },
  slate:    { light: '#c9c4b6', dark: '#454a44', name: 'Slate' },
  forest:   { light: '#dbe3c4', dark: '#3f5233', name: 'Forest' },
  rosewood: { light: '#e9d3c0', dark: '#6b3230', name: 'Rosewood' },
};

export const TIME_CONTROLS: Record<TimeControl, { label: string; desc: string }> = {
  'none':  { label: '∞', desc: 'Unlimited' },
  '1+0':  { label: '1+0', desc: 'Bullet' },
  '3+2':  { label: '3+2', desc: 'Blitz' },
  '5+0':  { label: '5+0', desc: 'Blitz' },
  '10+0': { label: '10+0', desc: 'Rapid' },
};

export const DIFFICULTIES: Record<Difficulty, { label: string; desc: string; depth: number }> = {
  easy:   { label: 'Easy',   desc: 'Blunders pieces, good for beginners', depth: 1 },
  medium: { label: 'Medium', desc: 'Solid club-level play',               depth: 3 },
  hard:   { label: 'Hard',   desc: 'Calculates several moves ahead',      depth: 4 },
};