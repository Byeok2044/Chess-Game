import type { TimeControl } from '../GameSettings.ts';

export interface ParsedTimeControl {
  initialMs: number;
  incrementMs: number;
}

export function parseTimeControl(tc: TimeControl): ParsedTimeControl | null {
  if (tc === 'none') return null;
  const [minutes, incSeconds] = tc.split('+').map(Number);
  return { initialMs: minutes * 60 * 1000, incrementMs: incSeconds * 1000 };
}