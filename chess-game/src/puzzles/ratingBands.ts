export type DifficultyBand = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface RatingBand {
  key: DifficultyBand;
  label: string;
  min: number;
  max: number;
  description: string;
}

export const PUZZLE_RATING_BANDS: RatingBand[] = [
  { key: 'beginner', label: 'Beginner', min: 0, max: 1000, description: 'One-move tactics and basic mates.' },
  { key: 'intermediate', label: 'Intermediate', min: 1000, max: 1400, description: 'Forcing lines, forks, and simple combinations.' },
  { key: 'advanced', label: 'Advanced', min: 1400, max: 1800, description: 'Multi-move tactical sequences.' },
  { key: 'expert', label: 'Expert', min: 1800, max: Infinity, description: 'Precise calculation under pressure.' },
];

export function bandForRating(rating: number): RatingBand {
  return PUZZLE_RATING_BANDS.find((band) => rating >= band.min && rating < band.max)
    ?? PUZZLE_RATING_BANDS[PUZZLE_RATING_BANDS.length - 1];
}
