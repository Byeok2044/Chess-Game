export type DifficultyBand = 'easy' | 'medium' | 'hard' | 'expert';

export interface RatingBand {
  key: DifficultyBand;
  label: string;
  max: number;
}

export const PUZZLE_RATING_BANDS: RatingBand[] = [
  { key: 'easy', label: 'Easy', max: 1000 },
  { key: 'medium', label: 'Medium', max: 1400 },
  { key: 'hard', label: 'Hard', max: 1800 },
  { key: 'expert', label: 'Expert', max: Infinity },
];

export function bandForRating(rating: number): RatingBand {
  return (
    PUZZLE_RATING_BANDS.find((b) => rating < b.max) ??
    PUZZLE_RATING_BANDS[PUZZLE_RATING_BANDS.length - 1]
  );
}