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

type TTFlag = 'exact' | 'lower' | 'upper';
interface TTEntry {
  depth: number;
  value: number;
  flag: TTFlag;
}

const MAX_TT_SIZE = 200_000;

class TranspositionTable {
  private map = new Map<string, TTEntry>();

  get(key: string): TTEntry | undefined {
    return this.map.get(key);
  }

  set(key: string, entry: TTEntry) {
    if (this.map.size >= MAX_TT_SIZE && !this.map.has(key)) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) this.map.delete(oldestKey);
    }
    this.map.set(key, entry);
  }

  clear() {
    this.map.clear();
  }

  get size() {
    return this.map.size;
  }
}

const transpositionTable = new TranspositionTable();

export function clearAiCache() {
  transpositionTable.clear();
}

const TYPE_CHAR: Record<PieceType, string> = {
  king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', pawn: 'p',
};

function hashState(state: GameState): string {
  let s = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p) { s += '.'; continue; }
      const ch = TYPE_CHAR[p.type];
      s += p.color === 'white' ? ch.toUpperCase() : ch;
    }
  }
  s += state.turn === 'white' ? 'w' : 'b';
  const cr = state.castlingRights;
  s += (cr.whiteKingside ? 'K' : '') + (cr.whiteQueenside ? 'Q' : '')
     + (cr.blackKingside ? 'k' : '') + (cr.blackQueenside ? 'q' : '');
  s += state.enPassantTarget ? `e${state.enPassantTarget[0]}${state.enPassantTarget[1]}` : '';
  return s;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiColor: Color,
): number {
  const key = hashState(state);
  const cached = transpositionTable.get(key);
  if (cached && cached.depth >= depth) {
    if (cached.flag === 'exact') return cached.value;
    if (cached.flag === 'lower') alpha = Math.max(alpha, cached.value);
    else if (cached.flag === 'upper') beta = Math.min(beta, cached.value);
    if (alpha >= beta) return cached.value;
  }

  if (depth === 0 || state.status === 'checkmate' || state.status === 'stalemate') {
    let value: number;
    if (state.status === 'checkmate') value = maximizing ? -50000 : 50000;
    else if (state.status === 'stalemate') value = 0;
    else value = evaluateBoard(state.board, aiColor);
    transpositionTable.set(key, { depth, value, flag: 'exact' });
    return value;
  }

  const alphaOrig = alpha;
  const moves = getAllLegalMoves(state);
  let best = maximizing ? -Infinity : Infinity;

  for (const m of moves) {
    const next = makeMove(state, m.from, m.to, m.promote);
    const resolved = next.promotionPending
      ? makeMove({ ...next, promotionPending: null }, m.from, m.to, m.promote ?? 'queen')
      : next;
    const val = minimax(resolved, depth - 1, alpha, beta, !maximizing, aiColor);

    if (maximizing) {
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
    } else {
      best = Math.min(best, val);
      beta = Math.min(beta, val);
    }
    if (beta <= alpha) break;
  }

  let flag: TTFlag = 'exact';
  if (best <= alphaOrig) flag = 'upper';
  else if (best >= beta) flag = 'lower';
  transpositionTable.set(key, { depth, value: best, flag });

  return best;
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