import type { DifficultyBand } from './ratingBands.ts';

export interface Puzzle {
  id: string;
  title: string;
  fen: string;
  rating: number;
  tier: DifficultyBand;
  themes: string[];
  /**
   * A principal variation in UCI notation. Even plies are played by the user;
   * odd plies are the opponent's automatic response.
   */
  solution: string[];
  /** Acceptable alternatives for a given ply in the principal variation. */
  solutionAlternates?: Record<number, string[]>;
}

export const PUZZLES: Puzzle[] = [
  // Beginner — learn to spot immediate tactical opportunities.
  {
    id: 'back-rank-mate', title: 'Back-rank mate',
    fen: '6k1/5ppp/8/8/8/8/7K/4R3 w - - 0 1',
    rating: 800, tier: 'beginner', themes: ['Back rank', 'Checkmate'], solution: ['e1e8'],
  },
  {
    id: 'free-queen', title: 'Free queen',
    fen: 'q5k1/5ppp/8/8/8/8/6B1/6K1 w - - 0 1',
    rating: 850, tier: 'beginner', themes: ['Hanging piece', 'Bishop'], solution: ['g2a8'],
  },
  {
    id: 'ladder-mate', title: 'Ladder mate',
    fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1',
    rating: 950, tier: 'beginner', themes: ['Queen endgame', 'Checkmate'], solution: ['g6g7'],
  },
  {
    id: 'rook-raid', title: 'Rook raid',
    fen: 'q6k/8/8/8/8/8/8/R6K w - - 0 1',
    rating: 975, tier: 'beginner', themes: ['Hanging piece', 'Rook'], solution: ['a1a8'],
  },

  // Intermediate — one forcing move wins material or finishes the king.
  {
    id: 'knight-fork', title: 'Knight fork',
    fen: '2q3k1/5ppp/8/3N4/8/8/8/6K1 w - - 0 1',
    rating: 1100, tier: 'intermediate', themes: ['Fork', 'Knight'], solution: ['d5e7'],
  },
  {
    id: 'long-diagonal', title: 'Long diagonal',
    fen: '6k1/7r/8/8/8/8/8/1BK5 w - - 0 1',
    rating: 1150, tier: 'intermediate', themes: ['Hanging piece', 'Bishop'], solution: ['b1h7'],
  },
  {
    id: 'pawn-fork', title: 'Pawn fork reward',
    fen: '6k1/8/3r1q2/4P3/8/8/8/6K1 w - - 0 1',
    rating: 1250, tier: 'intermediate', themes: ['Pawn tactic', 'Fork'], solution: ['e5f6'],
  },
  {
    id: 'black-back-rank', title: 'Black’s back-rank attack',
    fen: '6kr/5pp1/8/8/7q/8/5PPP/7K b - - 0 1',
    rating: 1350, tier: 'intermediate', themes: ['Back rank', 'Checkmate'], solution: ['h4h2'],
  },

  // Advanced — every even ply is the user's move; the app plays the reply.
  {
    id: 'queen-net', title: 'Build the mating net',
    fen: '6k1/6pp/8/8/8/8/8/3Q1RK1 w - - 0 1',
    rating: 1550, tier: 'advanced', themes: ['Forced mate', 'Queen', 'Deflection'],
    solution: ['d1d5', 'g8h8', 'd5d8'],
  },
  {
    id: 'rook-file', title: 'Rook’s open file',
    fen: '3q2k1/8/8/8/8/8/8/3R2K1 w - - 0 1',
    rating: 1450, tier: 'advanced', themes: ['Rook', 'Deflection'], solution: ['d1d8'],
  },
  {
    id: 'dark-square-harvest', title: 'Dark-square harvest',
    fen: '6k1/8/8/8/8/3n4/5Q2/6K1 b - - 0 1',
    rating: 1600, tier: 'advanced', themes: ['Knight', 'Hanging piece'], solution: ['d3f2'],
  },
];
