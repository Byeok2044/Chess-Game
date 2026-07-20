import { useEffect, useRef, useState } from 'react';
import { getBestMove } from '../AI.ts';
import { makeMove } from '../Chess.ts';
import type { Color, GameState } from '../Chess.ts';
import { playSound, soundEventForTransition } from '../utils/sound.ts';

export function useAiOpponent(
  state: GameState,
  setState: (state: GameState) => void,
  vsAI: boolean,
  playerColor: Color,
  screen: 'menu' | 'playing',
  depth: number,
  locked = false,
  soundEnabled = true
) {
  const [aiThinking, setAiThinking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!vsAI || screen !== 'playing' || locked) return;
    const aiColor: Color = playerColor === 'white' ? 'black' : 'white';
    if (state.turn !== aiColor) return;
    if (state.status === 'checkmate' || state.status === 'stalemate') return;
    if (state.promotionPending) return;

    setAiThinking(true);
    timeoutRef.current = setTimeout(() => {
      const move = getBestMove(state, depth);
      if (move) {
        const next = makeMove(state, move.from, move.to, move.promote);
        setState(next);
        playSound(soundEventForTransition(state, next), soundEnabled);
      }
      setAiThinking(false);
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state, vsAI, playerColor, screen, setState, depth, locked, soundEnabled]);

  function cancel() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAiThinking(false);
  }

  return { aiThinking, cancelAiTurn: cancel };
}