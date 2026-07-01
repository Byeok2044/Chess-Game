import type { GameState } from '../Chess.ts';

const PIECE_VALUES: Record<string, number> = {
  pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0,
};

export function materialScore(state: GameState) {
  const white = state.capturedByWhite.reduce((s, p) => s + PIECE_VALUES[p.type], 0);
  const black = state.capturedByBlack.reduce((s, p) => s + PIECE_VALUES[p.type], 0);
  return { white, black };
}