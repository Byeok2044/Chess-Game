export interface Puzzle {
  id: string;
  title: string;
  fen: string;
  rating: number;
  themes: string[];          
  solution: string[];
  solutionAlternates?: string[][];
}

export const PUZZLES: Puzzle[] = [
  {
    id: 'p1',
    title: 'Back-rank mate',
    fen: '6k1/5ppp/8/8/8/8/7K/4R3 w - - 0 1',
    rating: 900,
    themes: ['Back rank', 'Mating attack'],
    solution: ['e1e8'],
  },
  {
    id: 'p2',
    title: 'Knight fork',
    fen: '2q3k1/5ppp/8/3N4/8/8/8/6K1 w - - 0 1',
    rating: 1100,
    themes: ['Fork'],
    solution: ['d5e7'],
  },
  {
    id: 'p3',
    title: 'Free queen',
    fen: 'q5k1/5ppp/8/8/8/8/6B1/6K1 w - - 0 1',
    rating: 700,
    themes: ['Hanging piece'],
    solution: ['g2a8'],
  },
];