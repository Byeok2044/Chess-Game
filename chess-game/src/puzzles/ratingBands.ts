export type DifficultyBand = 'easy' | 'medium' | 'hard';

export interface RatingBand {
  key: DifficultyBand;
  label: string;
  min: number;
  max: number;
  /** Minimum number of decisions the player must make in the solution line. */
  minPlayerMoves: number;
  description: string;
}

/**
 * Difficulty is a contract, not just a display label:
 * - Easy: one player move and a sub-1000 rating.
 * - Medium: 2–3 player moves, with forced replies between them.
 * - Hard: 3+ player moves; no mate-in-one or one-move fork may enter here.
 */
export const PUZZLE_RATING_BANDS: RatingBand[] = [
  { key: 'easy', label: 'Easy', min: 0, max: 1000, minPlayerMoves: 1, description: 'A single tactical decision.' },
  { key: 'medium', label: 'Medium', min: 1000, max: 1500, minPlayerMoves: 2, description: 'Calculate a forcing continuation.' },
  { key: 'hard', label: 'Hard', min: 1500, max: Infinity, minPlayerMoves: 3, description: 'Calculate a deep, forced tactical line.' },
];

export function bandForRating(rating: number): RatingBand {
  return PUZZLE_RATING_BANDS.find((band) => rating >= band.min && rating < band.max)
    ?? PUZZLE_RATING_BANDS[PUZZLE_RATING_BANDS.length - 1];
}
