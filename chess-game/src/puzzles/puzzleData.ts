import type { DifficultyBand } from './ratingBands.ts';

export interface Puzzle {
  id: string;
  title: string;
  fen: string;
  rating: number;
  tier: DifficultyBand;
  themes: string[];
  /**
   * Principal variation in UCI notation. Even plies are the player's moves;
   * the following odd plies are the forced replies played by the app.
   */
  solution: string[];
  solutionAlternates?: Record<number, string[]>;
}

export const PUZZLES: Puzzle[] = [
  // Easy: exactly one player decision.
  { id: 'back-rank-mate', title: 'Back-rank mate', fen: '6k1/5ppp/8/8/8/8/7K/4R3 w - - 0 1', rating: 800, tier: 'easy', themes: ['Back rank', 'Checkmate'], solution: ['e1e8'] },
  { id: 'free-queen', title: 'Free queen', fen: 'q5k1/5ppp/8/8/8/8/6B1/6K1 w - - 0 1', rating: 850, tier: 'easy', themes: ['Hanging piece', 'Bishop'], solution: ['g2a8'] },
  { id: 'ladder-mate', title: 'Ladder mate', fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1', rating: 900, tier: 'easy', themes: ['Queen endgame', 'Checkmate'], solution: ['g6g7'] },
  { id: 'rook-raid', title: 'Rook raid', fen: 'q6k/8/8/8/8/8/8/R6K w - - 0 1', rating: 950, tier: 'easy', themes: ['Hanging piece', 'Rook'], solution: ['a1a8'] },

  // Medium: two player moves with an automatic forced reply in between.
  {
    id: 'queen-net', title: 'Build the mating net', fen: '6k1/6pp/8/8/8/8/8/3Q1RK1 w - - 0 1',
    rating: 1300, tier: 'medium', themes: ['Forced mate', 'Queen', 'Deflection'],
    solution: ['d1d5', 'g8h8', 'd5d8'],
  },

  // Hard: every line has three player decisions and five plies minimum.
  {
    id: 'corner-net-white', title: 'Corner-net calculation', fen: 'k7/8/2K5/3Q4/8/8/8/8 w - - 0 1',
    rating: 1650, tier: 'hard', themes: ['Mate in 3', 'Queen endgame', 'Forced moves'],
    solution: ['d5d8', 'a8a7', 'd8b6', 'a7a8', 'b6b7'],
  },
  {
    id: 'file-net-white', title: 'File-net calculation', fen: 'k7/8/2K5/5Q2/8/8/8/8 w - - 0 1',
    rating: 1750, tier: 'hard', themes: ['Mate in 3', 'Quiet precision', 'Queen endgame'],
    solution: ['f5f8', 'a8a7', 'f8f7', 'a7a8', 'f7b7'],
  },
  {
    id: 'corner-net-black', title: 'Black’s corner net', fen: '8/8/8/8/3q4/2k5/8/K7 b - - 0 1',
    rating: 1850, tier: 'hard', themes: ['Mate in 3', 'King support', 'Forced moves'],
    solution: ['d4d1', 'a1a2', 'd1b3', 'a2a1', 'b3b2'],
  },
];
