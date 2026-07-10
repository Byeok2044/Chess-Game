export type BoardTheme = 'classic' | 'midnight' | 'forest' | 'coral' | 'neon';
export type PieceStyle = 'unicode' | 'minimal';
export type TimeControl = 'none' | '1+0' | '3+2' | '5+0' | '10+0';

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
  boardTheme: 'neon',
  pieceStyle: 'unicode',
  showCoordinates: true,
  showValidMoves: true,
  soundEnabled: true,
  timeControl: 'none',
  playerOneName: 'White',
  playerTwoName: 'Black',
};

export const BOARD_THEMES: Record<BoardTheme, { light: string; dark: string; name: string }> = {
  neon:     { light: '#1c2129', dark: '#0a0c11', name: 'Neon' },
  classic:  { light: '#e8dfc4', dark: '#8b6e45', name: 'Classic' },
  midnight: { light: '#b0bec5', dark: '#37474f', name: 'Midnight' },
  forest:   { light: '#d4e8c4', dark: '#4a6741', name: 'Forest' },
  coral:    { light: '#f2d0c4', dark: '#a05040', name: 'Coral' },
};

export const TIME_CONTROLS: Record<TimeControl, { label: string; desc: string }> = {
  'none':  { label: '∞', desc: 'Unlimited' },
  '1+0':  { label: '1+0', desc: 'Bullet' },
  '3+2':  { label: '3+2', desc: 'Blitz' },
  '5+0':  { label: '5+0', desc: 'Blitz' },
  '10+0': { label: '10+0', desc: 'Rapid' },
};