export type Color = 'white' | 'black';
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Square = Piece | null;
export type Board = Square[][];

export interface GameState {
  board: Board;
  turn: Color;
  selected: [number, number] | null;
  validMoves: [number, number][];
  status: 'playing' | 'check' | 'checkmate' | 'stalemate';
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  moveHistory: string[];
  enPassantTarget: [number, number] | null;
  castlingRights: { whiteKingside: boolean; whiteQueenside: boolean; blackKingside: boolean; blackQueenside: boolean };
  promotionPending: [number, number] | null;
}

export function initBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRow[c], color: 'black' };
    board[1][c] = { type: 'pawn', color: 'black' };
    board[6][c] = { type: 'pawn', color: 'white' };
    board[7][c] = { type: backRow[c], color: 'white' };
  }
  return board;
}

export function initGame(): GameState {
  return {
    board: initBoard(),
    turn: 'white',
    selected: null,
    validMoves: [],
    status: 'playing',
    capturedByWhite: [],
    capturedByBlack: [],
    moveHistory: [],
    enPassantTarget: null,
    castlingRights: { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true },
    promotionPending: null,
  };
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function findKing(board: Board, color: Color): [number, number] {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.type === 'king' && board[r][c]?.color === color)
        return [r, c];
  return [-1, -1];
}

export function isAttacked(board: Board, r: number, c: number, by: Color): boolean {
  for (let er = 0; er < 8; er++) {
    for (let ec = 0; ec < 8; ec++) {
      const p = board[er][ec];
      if (!p || p.color !== by) continue;
      const moves = rawMoves(board, er, ec, null, { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false });
      if (moves.some(([mr, mc]) => mr === r && mc === c)) return true;
    }
  }
  return false;
}

export function rawMoves(board: Board, r: number, c: number, enPassant: [number, number] | null, castling: GameState['castlingRights']): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: [number, number][] = [];
  const { type, color } = piece;

  const dirs: Record<string, [number, number][]> = {
    rook: [[0,1],[0,-1],[1,0],[-1,0]],
    bishop: [[1,1],[1,-1],[-1,1],[-1,-1]],
    queen: [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]],
  };

  const slide = (deltas: [number, number][]) => {
    for (const [dr, dc] of deltas) {
      let nr = r + dr, nc = c + dc;
      while (inBounds(nr, nc)) {
        if (board[nr][nc]) {
          if (board[nr][nc]!.color !== color) moves.push([nr, nc]);
          break;
        }
        moves.push([nr, nc]);
        nr += dr; nc += dc;
      }
    }
  };

  if (type === 'rook') slide(dirs.rook);
  else if (type === 'bishop') slide(dirs.bishop);
  else if (type === 'queen') slide(dirs.queen);
  else if (type === 'knight') {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push([nr, nc]);
    }
  } else if (type === 'king') {
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push([nr, nc]);
    }
    const row = color === 'white' ? 7 : 0;
    const enemy = color === 'white' ? 'black' : 'white';
    if (r === row && c === 4) {
      if ((color === 'white' ? castling.whiteKingside : castling.blackKingside)
          && !board[row][5] && !board[row][6]
          && !isAttacked(board, row, 4, enemy) && !isAttacked(board, row, 5, enemy) && !isAttacked(board, row, 6, enemy)) {
        moves.push([row, 6]);
      }
      if ((color === 'white' ? castling.whiteQueenside : castling.blackQueenside)
          && !board[row][3] && !board[row][2] && !board[row][1]
          && !isAttacked(board, row, 4, enemy) && !isAttacked(board, row, 3, enemy) && !isAttacked(board, row, 2, enemy)) {
        moves.push([row, 2]);
      }
    }
  } else if (type === 'pawn') {
    const dir = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      moves.push([r + dir, c]);
      if (r === startRow && !board[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (inBounds(nr, nc)) {
        if (board[nr][nc]?.color !== color && board[nr][nc]) moves.push([nr, nc]);
        if (enPassant && enPassant[0] === nr && enPassant[1] === nc) moves.push([nr, nc]);
      }
    }
  }
  return moves;
}

export function applyMove(board: Board, from: [number, number], to: [number, number], enPassant: [number, number] | null): { board: Board; captured: Piece | null; enPassantTarget: [number, number] | null } {
  const newBoard = board.map(row => [...row]);
  const [fr, fc] = from;
  const [tr, tc] = to;
  const piece = newBoard[fr][fc]!;
  let captured: Piece | null = newBoard[tr][tc];
  let newEnPassant: [number, number] | null = null;

  if (piece.type === 'pawn' && enPassant && enPassant[0] === tr && enPassant[1] === tc) {
    const capRow = fr;
    captured = newBoard[capRow][tc];
    newBoard[capRow][tc] = null;
  }

  if (piece.type === 'king' && Math.abs(tc - fc) === 2) {
    const row = fr;
    if (tc === 6) { newBoard[row][5] = newBoard[row][7]; newBoard[row][7] = null; }
    else { newBoard[row][3] = newBoard[row][0]; newBoard[row][0] = null; }
  }

  if (piece.type === 'pawn' && Math.abs(tr - fr) === 2) {
    newEnPassant = [(fr + tr) / 2, fc];
  }

  newBoard[tr][tc] = piece;
  newBoard[fr][fc] = null;
  return { board: newBoard, captured, enPassantTarget: newEnPassant };
}

export function legalMoves(state: GameState, r: number, c: number): [number, number][] {
  const piece = state.board[r][c];
  if (!piece || piece.color !== state.turn) return [];
  const candidates = rawMoves(state.board, r, c, state.enPassantTarget, state.castlingRights);
  const color = piece.color;
  return candidates.filter(([tr, tc]) => {
    const { board: nb } = applyMove(state.board, [r, c], [tr, tc], state.enPassantTarget);
    const [kr, kc] = findKing(nb, color);
    const enemy = color === 'white' ? 'black' : 'white';
    return !isAttacked(nb, kr, kc, enemy);
  });
}

function colLetter(c: number) { return String.fromCharCode(97 + c); }
function algebraic(r: number, c: number) { return `${colLetter(c)}${8 - r}`; }

export function makeMove(state: GameState, from: [number, number], to: [number, number], promoteTo?: PieceType): GameState {
  const [fr, fc] = from;
  const [tr, tc] = to;
  const piece = state.board[fr][fc]!;
  const { board: newBoard, captured, enPassantTarget } = applyMove(state.board, from, to, state.enPassantTarget);

  const isPawnPromotion = piece.type === 'pawn' && (tr === 0 || tr === 7);
  if (isPawnPromotion && !promoteTo) {
    return { ...state, board: newBoard, promotionPending: [tr, tc], selected: null, validMoves: [] };
  }
  if (isPawnPromotion && promoteTo) {
    newBoard[tr][tc] = { type: promoteTo, color: piece.color };
  }

  const cr = { ...state.castlingRights };
  if (piece.type === 'king') {
    if (piece.color === 'white') { cr.whiteKingside = false; cr.whiteQueenside = false; }
    else { cr.blackKingside = false; cr.blackQueenside = false; }
  }
  if (piece.type === 'rook') {
    if (fr === 7 && fc === 0) cr.whiteQueenside = false;
    if (fr === 7 && fc === 7) cr.whiteKingside = false;
    if (fr === 0 && fc === 0) cr.blackQueenside = false;
    if (fr === 0 && fc === 7) cr.blackKingside = false;
  }

  const nextTurn: Color = state.turn === 'white' ? 'black' : 'white';
  const enemy = state.turn;

  const notation = `${piece.type === 'pawn' ? '' : piece.type[0].toUpperCase()}${algebraic(fr, fc)}-${algebraic(tr, tc)}`;

  const capturedByWhite = [...state.capturedByWhite];
  const capturedByBlack = [...state.capturedByBlack];
  if (captured) {
    if (state.turn === 'white') capturedByWhite.push(captured);
    else capturedByBlack.push(captured);
  }

  const [nkr, nkc] = findKing(newBoard, nextTurn);
  const inCheck = isAttacked(newBoard, nkr, nkc, enemy);
  
  let hasLegal = false;
  outer: for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = newBoard[r][c];
      if (!p || p.color !== nextTurn) continue;
      const candidates = rawMoves(newBoard, r, c, enPassantTarget, cr);
      for (const [mr, mc] of candidates) {
        const { board: tb } = applyMove(newBoard, [r, c], [mr, mc], enPassantTarget);
        const [kr, kc] = findKing(tb, nextTurn);
        if (!isAttacked(tb, kr, kc, enemy)) { hasLegal = true; break outer; }
      }
    }
  }

  let status: GameState['status'] = 'playing';
  if (!hasLegal) status = inCheck ? 'checkmate' : 'stalemate';
  else if (inCheck) status = 'check';

  return {
    ...state,
    board: newBoard,
    turn: nextTurn,
    selected: null,
    validMoves: [],
    status,
    capturedByWhite,
    capturedByBlack,
    moveHistory: [...state.moveHistory, notation],
    enPassantTarget,
    castlingRights: cr,
    promotionPending: null,
  };
}