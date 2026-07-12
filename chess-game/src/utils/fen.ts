import type { Board, Color, PieceType } from '../Chess.ts';

const CHAR_TO_TYPE: Record<string, PieceType> = {
  k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn',
};

export function boardFromFEN(fen: string): Board {
  const [placement] = fen.trim().split(' ');
  const rows = placement.split('/');
  if (rows.length !== 8) throw new Error('Invalid FEN: expected 8 ranks');

  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  rows.forEach((row, r) => {
    let c = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        c += Number(ch);
      } else {
        const type = CHAR_TO_TYPE[ch.toLowerCase()];
        const color: Color = ch === ch.toUpperCase() ? 'white' : 'black';
        board[r][c] = { type, color };
        c += 1;
      }
    }
  });
  return board;
}

export function turnFromFEN(fen: string): Color {
  const parts = fen.trim().split(' ');
  return parts[1] === 'b' ? 'black' : 'white';
}