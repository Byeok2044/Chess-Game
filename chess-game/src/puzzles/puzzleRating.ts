export const DEFAULT_PUZZLE_RATING = 900;
const K_FACTOR = 28;
const RATING_FLOOR = 400;      // keep ratings from spiraling to unusable lows
const NEXT_PUZZLE_WINDOW = 175;

const RATING_KEY = 'chess-puzzle-rating';

export function loadPuzzleRating(): number {
  try {
    const raw = localStorage.getItem(RATING_KEY);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : DEFAULT_PUZZLE_RATING;
  } catch {
    return DEFAULT_PUZZLE_RATING;
  }
}

export function savePuzzleRating(rating: number) {
  try {
    localStorage.setItem(RATING_KEY, String(Math.round(rating)));
  } catch {
    // best-effort only, same pattern as loadSolvedPuzzles/markPuzzleSolved
  }
}

function expectedScore(playerRating: number, puzzleRating: number): number {
  return 1 / (1 + Math.pow(10, (puzzleRating - playerRating) / 400));
}

export interface RatingUpdateInput {
  currentRating: number;
  puzzleRating: number;
  /** Number of wrong attempts before the puzzle was solved (0 = solved first try). */
  wrongAttempts: number;
  /** 0 = no hint; 1 = the origin-square hint was used. */
  hintsUsed: 0 | 1;
  /** True if the user hit "Solution" and had it played out rather than solving it. */
  revealed: boolean;
}

export interface RatingUpdateResult {
  newRating: number;
  delta: number;
}


export function updatePuzzleRating({
  currentRating,
  puzzleRating,
  wrongAttempts,
  hintsUsed,
  revealed,
}: RatingUpdateInput): RatingUpdateResult {
  // A revealed puzzle is intentionally treated as a loss. A solved puzzle
  // always earns some credit, but errors and hints dampen the gain.
  const actualScore = revealed ? 0 : 1;
  const expected = expectedScore(currentRating, puzzleRating);
  let delta = K_FACTOR * (actualScore - expected);

  if (!revealed) {
    if (hintsUsed >= 1) delta *= 0.45;
    if (wrongAttempts === 1) delta *= 0.7;
    else if (wrongAttempts > 1) delta *= 0.4;
  }

  delta = Math.round(delta);
  const newRating = Math.max(RATING_FLOOR, currentRating + delta);
  return { newRating, delta };
}

export function pickNextPuzzle<T extends { id: string; rating: number }>(
  puzzles: T[],
  solvedIds: Set<string>,
  currentRating: number,
  windowSize: number = NEXT_PUZZLE_WINDOW
): T | null {
  const unsolved = puzzles.filter((p) => !solvedIds.has(p.id));
  if (unsolved.length === 0) return null;

  const inWindow = unsolved.filter((p) => Math.abs(p.rating - currentRating) <= windowSize);
  const pool = inWindow.length > 0 ? inWindow : unsolved;

  // Prefer the closest puzzle at or just above the player's rating. This
  // keeps the curve aspirational without repeatedly jumping to a lower tier.
  return [...pool].sort((a, b) => {
    const aDistance = Math.abs(a.rating - currentRating);
    const bDistance = Math.abs(b.rating - currentRating);
    if (aDistance !== bDistance) return aDistance - bDistance;
    return a.rating - b.rating;
  })[0];
}

/**
 * Enforces the catalog contract from ratingBands. This prevents a short tactic
 * from being labelled Hard merely because it has been assigned a high number.
 */
export function satisfiesDifficultyCriteria(puzzle: Pick<Puzzle, 'rating' | 'tier' | 'solution'>): boolean {
  const band = bandForRating(puzzle.rating);
  const playerMoves = Math.ceil(puzzle.solution.length / 2);

  if (puzzle.tier !== band.key) return false;
  if (puzzle.tier === 'easy') return puzzle.solution.length === 1;
  if (puzzle.tier === 'medium') return playerMoves >= 2 && playerMoves <= 3;
  return playerMoves >= 3 && puzzle.solution.length >= 5;
}
import { bandForRating } from './ratingBands.ts';
import type { Puzzle } from './puzzleData.ts';
