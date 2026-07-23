import { useEffect, useMemo, useState } from 'react';
import type { Color } from '../Chess.ts';
import type { TimeControl } from '../GameSettings.ts';
import { parseTimeControl } from '../utils/timeControl.ts';

export function useChessClock(
  timeControl: TimeControl,
  turn: Color,
  active: boolean,
  moveCount: number
) {
  const parsed = useMemo(() => parseTimeControl(timeControl), [timeControl]);
  const [whiteMs, setWhiteMs] = useState(parsed?.initialMs ?? 0);
  const [blackMs, setBlackMs] = useState(parsed?.initialMs ?? 0);
  const [timedOut, setTimedOut] = useState<Color | null>(null);
  const [lastMoveCount, setLastMoveCount] = useState(0);
  const [lastTurn, setLastTurn] = useState<Color>('white');

  useEffect(() => {
    if (!parsed || !active || timedOut) return;
    const interval = setInterval(() => {
      if (turn === 'white') {
        setWhiteMs((ms) => {
          const next = ms - 250;
          if (next <= 0) {
            setTimedOut('white');
            return 0;
          }
          return next;
        });
      } else {
        setBlackMs((ms) => {
          const next = ms - 250;
          if (next <= 0) {
            setTimedOut('black');
            return 0;
          }
          return next;
        });
      }
    }, 250);
    return () => clearInterval(interval);
  }, [turn, active, parsed, timedOut]);

  useEffect(() => {
    if (!parsed) return;
    if (moveCount > lastMoveCount) {
      if (lastTurn === 'white') setWhiteMs((ms) => ms + parsed.incrementMs);
      else setBlackMs((ms) => ms + parsed.incrementMs);
    }
    setLastMoveCount(moveCount);
    setLastTurn(turn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCount]);

  function reset() {
    setWhiteMs(parsed?.initialMs ?? 0);
    setBlackMs(parsed?.initialMs ?? 0);
    setTimedOut(null);
    setLastMoveCount(0);
    setLastTurn('white');
  }

  return { whiteMs, blackMs, timedOut, hasClock: !!parsed, reset };
}