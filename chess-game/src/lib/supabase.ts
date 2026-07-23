import { createClient } from '@supabase/supabase-js';
import type { GameState } from '../Chess.ts';
import type { TimeControl } from '../GameSettings.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Shared row types ─────────────────────────────────────
export interface Profile {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  created_at: string;
}

export interface GameRow {
  id: string;
  invite_code: string;
  white_id: string | null;
  black_id: string | null;
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  turn: 'white' | 'black';
  board_state: GameState;
  winner: 'white' | 'black' | 'draw' | null;
  time_control: TimeControl;
  white_ms: number | null;
  black_ms: number | null;
  last_move_at: string;
  created_at: string;
  updated_at: string;
}

export interface SavedGameRow {
  id: string;
  user_id: string;
  name: string;
  mode: 'two-player' | 'vs-ai';
  ai_color: 'white' | 'black' | null;
  difficulty: 'easy' | 'medium' | 'hard';
  board_state: GameState;
  updated_at: string;
}
