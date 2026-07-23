import { useEffect, useState } from 'react';
import type { Color } from '../Chess.ts';
import type { GameRow } from '../lib/supabase.ts';
import { parseTimeControl } from '../utils/timeControl.ts';

const TICK_MS = 250;

export function useMultiplayerClock(game: GameRow | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!game || game.status !== 'active' || !parseTimeControl(game.time_control)) return;
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, [game?.status, game?.time_control, game?.id]);

  const parsed = game ? parseTimeControl(game.time_control) : null;
  if (!game || !parsed || game.white_ms == null || game.black_ms == null) {
    return { whiteMs: 0, blackMs: 0, hasClock: false, timedOut: null as Color | null };
  }

  const elapsed = game.status === 'active' ? Math.max(0, now - new Date(game.last_move_at).getTime()) : 0;
  const whiteMs = game.turn === 'white' ? Math.max(0, game.white_ms - elapsed) : game.white_ms;
  const blackMs = game.turn === 'black' ? Math.max(0, game.black_ms - elapsed) : game.black_ms;
  const timedOut: Color | null = whiteMs <= 0 ? 'white' : blackMs <= 0 ? 'black' : null;

  return { whiteMs, blackMs, hasClock: true, timedOut };
}