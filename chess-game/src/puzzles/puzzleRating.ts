export const DEFAULT_PUZZLE_RATING = 1200;
const K_FACTOR = 24;           // mid of the requested 20–32 range
const RATING_FLOOR = 400;      // keep ratings from spiraling to unusable lows
const NEXT_PUZZLE_WINDOW = 150;

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
  /** 0 = no hint, 1 = origin-square hint used, 2 = origin+destination hint used. */
  hintsUsed: 0 | 1 | 2;
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
  const actualScore = revealed ? 0 : 1;
  const expected = expectedScore(currentRating, puzzleRating);
  let delta = K_FACTOR * (actualScore - expected);

  if (!revealed) {
    if (hintsUsed === 2) delta *= 0;       
    else if (hintsUsed === 1) delta *= 0.5; 
    if (wrongAttempts > 0) delta *= 0.5;    
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

  return pool.reduce((closest, p) =>
    Math.abs(p.rating - currentRating) < Math.abs(closest.rating - currentRating) ? p : closest
  );
}