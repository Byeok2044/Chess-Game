import type { GameState } from '../Chess.ts';

const KEY = 'chess-guest-save';

export interface GuestSave {
  mode: 'two-player' | 'vs-ai';
  aiColor: 'white' | 'black' | null;
  state: GameState;
  updatedAt: string;
}

export function saveGuestGame(mode: 'two-player' | 'vs-ai', aiColor: 'white' | 'black' | null, state: GameState) {
  const payload: GuestSave = { mode, aiColor, state, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    return null;
  }
  return payload;
}

export function loadGuestGame(): GuestSave | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GuestSave) : null;
  } catch {
    return null;
  }
}

export function clearGuestGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return;
  }
}