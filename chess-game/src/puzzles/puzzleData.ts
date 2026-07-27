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
  {
    id: 'p4',
    title: 'Check on f7',
    fen: '6k1/5ppp/8/7Q/2B5/8/8/6K1 w - - 0 1',
    rating: 950,
    themes: ['Checkmate', 'Mating attack'],
    solution: ['h5f7'],
  },
  {
    id: 'p5',
    title: 'Ladder mate',
    fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1',
    rating: 1000,
    themes: ['Checkmate', 'Queen endgame'],
    solution: ['g6g7'],
  },
  {
    id: 'p6',
    title: 'Rook raid',
    fen: 'q6k/8/8/8/8/8/8/R6K w - - 0 1',
    rating: 800,
    themes: ['Hanging piece', 'Rook'],
    solution: ['a1a8'],
  },
  {
    id: 'p7',
    title: 'Long diagonal',
    fen: '6k1/7r/8/8/8/8/8/1BK5 w - - 0 1',
    rating: 850,
    themes: ['Hanging piece', 'Bishop'],
    solution: ['b1h7'],
  },
  {
    id: 'p8',
    title: 'Knight’s prize',
    fen: '4q1k1/8/2N5/8/8/8/8/6K1 w - - 0 1',
    rating: 1050,
    themes: ['Hanging piece', 'Knight'],
    solution: ['c6e7'],
  },
  {
    id: 'p9',
    title: 'Diagonal strike',
    fen: '4q1k1/8/8/1B6/8/8/8/6K1 w - - 0 1',
    rating: 1100,
    themes: ['Hanging piece', 'Bishop'],
    solution: ['b5e8'],
  },
  {
    id: 'p10',
    title: 'Pawn fork reward',
    fen: '6k1/8/3r1q2/4P3/8/8/8/6K1 w - - 0 1',
    rating: 1200,
    themes: ['Pawn tactic', 'Fork'],
    solution: ['e5f6'],
  },
  {
    id: 'p11',
    title: 'Rook’s open file',
    fen: '3q2k1/8/8/8/8/8/8/3R2K1 w - - 0 1',
    rating: 1250,
    themes: ['Hanging piece', 'Rook'],
    solution: ['d1d8'],
  },
  {
    id: 'p12',
    title: 'Black’s back-rank attack',
    fen: '6kr/5pp1/8/8/7q/8/5PPP/7K b - - 0 1',
    rating: 1350,
    themes: ['Checkmate', 'Back rank'],
    solution: ['h4h2'],
  },
  {
    id: 'p13',
    title: 'Dark-square harvest',
    fen: '6k1/8/8/8/8/3n4/5Q2/6K1 b - - 0 1',
    rating: 1400,
    themes: ['Hanging piece', 'Knight'],
    solution: ['d3f2'],
  },
  {
    id: 'p14',
    title: 'Queen takes the rook',
    fen: '6k1/7r/6K1/3Q4/8/8/8/8 w - - 0 1',
    rating: 900,
    themes: ['Hanging piece', 'Queen'],
    solution: ['d5h7'],
  },
  {
    id: 'p15',
    title: 'Knight fork',
    fen: '2q3k1/6pp/8/3N4/8/8/8/6K1 w - - 0 1',
    rating: 1150,
    themes: ['Fork', 'Knight'],
    solution: ['d5e7'],
  },
];
