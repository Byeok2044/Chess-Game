import type { Piece } from '../Chess.ts';

const ORDER: Piece['type'][] = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
const WHITE_ICONS = ['♔', '♕', '♖', '♗', '♘', '♙'];
const BLACK_ICONS = ['♚', '♛', '♜', '♝', '♞', '♟'];

export function capturedIconsFor(pieces: Piece[], takenColor: 'white' | 'black'): string[] {
  const icons = takenColor === 'white' ? WHITE_ICONS : BLACK_ICONS;
  return pieces.map((p) => icons[ORDER.indexOf(p.type)]);
}