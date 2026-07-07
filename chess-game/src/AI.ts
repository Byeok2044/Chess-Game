import type { GameState, Board, Color, PieceType } from './Chess.ts';
import { legalMoves, makeMove } from './Chess.ts'; 

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000,
};

const PST: Record<PieceType, number[][]> = {
  pawn: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0],
  ],
  knight: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50],
  ],
  bishop: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20],
  ],
  rook: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0],
  ],
  queen: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20],
  ],
  king: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20],
  ],
};

function evaluateBoard(board: Board, forColor: Color): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const pstRow = p.color === 'black' ? r : 7 - r;
      const pstVal = PST[p.type][pstRow][c];
      const val = PIECE_VALUES[p.type] + pstVal;
      score += p.color === forColor ? val : -val;
    }
  }
  return score;
}

interface MoveOption {
  from: [number, number];
  to: [number, number];
  promote?: PieceType;
}

function getAllLegalMoves(state: GameState): MoveOption[] {
  const moves: MoveOption[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p || p.color !== state.turn) continue;
      const targets = legalMoves(state, r, c);
      for (const [tr, tc] of targets) {
        if (p.type === 'pawn' && (tr === 0 || tr === 7)) {
          for (const promote of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
            moves.push({ from: [r, c], to: [tr, tc], promote });
          }
        } else {
          moves.push({ from: [r, c], to: [tr, tc] });
        }
      }
    }
  }
  return moves;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiColor: Color,
): number {
  if (depth === 0 || state.status === 'checkmate' || state.status === 'stalemate') {
    if (state.status === 'checkmate') {
      return maximizing ? -50000 : 50000;
    }
    if (state.status === 'stalemate') return 0;
    return evaluateBoard(state.board, aiColor);
  }

  const moves = getAllLegalMoves(state);

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const next = makeMove(state, m.from, m.to, m.promote);
      // Handle promotion pending
      const resolved = next.promotionPending
        ? makeMove({ ...next, promotionPending: null }, m.from, m.to, m.promote ?? 'queen')
        : next;
      const val = minimax(resolved, depth - 1, alpha, beta, false, aiColor);
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const next = makeMove(state, m.from, m.to, m.promote);
      const resolved = next.promotionPending
        ? makeMove({ ...next, promotionPending: null }, m.from, m.to, m.promote ?? 'queen')
        : next;
      const val = minimax(resolved, depth - 1, alpha, beta, true, aiColor);
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function getBestMove(state: GameState, depth = 3): MoveOption | null {
  const moves = getAllLegalMoves(state);
  if (moves.length === 0) return null;

  const aiColor = state.turn;
  let bestVal = -Infinity;
  let bestMove: MoveOption = moves[0];

  const shuffled = [...moves].sort(() => Math.random() - 0.5);

  for (const m of shuffled) {
    const next = makeMove(state, m.from, m.to, m.promote);
    const resolved = next.promotionPending
      ? makeMove({ ...next, promotionPending: null }, m.from, m.to, m.promote ?? 'queen')
      : next;
    const val = minimax(resolved, depth - 1, -Infinity, Infinity, false, aiColor);
    if (val > bestVal) {
      bestVal = val;
      bestMove = m;
    }
  }

  return bestMove;
}