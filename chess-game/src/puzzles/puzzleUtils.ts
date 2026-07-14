import { initGame, makeMove } from '../Chess.ts';
import type { GameState } from '../Chess.ts';
import { boardFromFEN, turnFromFEN } from '../utils/fen.ts';
import type { Puzzle } from './puzzleData.ts';

export function colLetter(c: number) {
  return String.fromCharCode(97 + c);
}

export function toUCI(from: [number, number], to: [number, number]): string {
  return `${colLetter(from[1])}${8 - from[0]}${colLetter(to[1])}${8 - to[0]}`;
}

export function fromUCI(move: string): { from: [number, number]; to: [number, number] } {
  const from: [number, number] = [8 - Number(move[1]), move.charCodeAt(0) - 97];
  const to: [number, number] = [8 - Number(move[3]), move.charCodeAt(2) - 97];
  return { from, to };
}

export function stateFromPuzzle(fen: string): GameState {
  const base = initGame();
  return {
    ...base,
    board: boardFromFEN(fen),
    turn: turnFromFEN(fen),
    castlingRights: { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false },
  };
}

const PIECE_LABEL: Record<string, string> = {
  queen: 'the queen', rook: 'a rook', bishop: 'a bishop', knight: 'a knight', pawn: 'a pawn', king: 'the king',
};

const VALUE: Record<string, number> = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };

export interface PuzzleGoal {
  label: string;
  playerMoveCount: number;
}

/**
 * Simulate the puzzle's full scripted solution once (not the user's attempt)
 * to work out what the actual objective is — mate, material win, or a
 * plain tactic — instead of relying on hand-authored, easily-stale metadata.
 */
export function computeGoal(puzzle: Puzzle): PuzzleGoal {
  const playerMoveCount = Math.ceil(puzzle.solution.length / 2);
  let state = stateFromPuzzle(puzzle.fen);
  let bestCaptureValue = 0;
  let bestCaptureType: string | null = null;

  try {
    for (let i = 0; i < puzzle.solution.length; i++) {
      const { from, to } = fromUCI(puzzle.solution[i]);
      const target = state.board[to[0]][to[1]];
      if (target && i % 2 === 0) {
        const v = VALUE[target.type];
        if (v > bestCaptureValue) {
          bestCaptureValue = v;
          bestCaptureType = target.type;
        }
      }
      let next = makeMove(state, from, to);
      if (next.promotionPending) next = makeMove({ ...next, promotionPending: null }, from, to, 'queen');
      state = next;
    }
  } catch {
    // Fall through to the generic label below if a puzzle's solution is malformed.
  }

  if (state.status === 'checkmate') {
    return { label: `Checkmate in ${playerMoveCount}`, playerMoveCount };
  }
  if (bestCaptureType) {
    return { label: `Win ${PIECE_LABEL[bestCaptureType]}`, playerMoveCount };
  }
  return { label: 'Find the best move', playerMoveCount };
}

export function difficultyBadge(rating: number): 'easy' | 'medium' | 'hard' {
  if (rating < 900) return 'easy';
  if (rating < 1300) return 'medium';
  return 'hard';
}

const PROGRESS_KEY = 'chess-puzzle-progress';

export function loadSolvedPuzzles(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markPuzzleSolved(id: string) {
  try {
    const solved = loadSolvedPuzzles();
    solved.add(id);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...solved]));
  } catch {
    // Best-effort only — progress just won't persist across sessions.
  }
}