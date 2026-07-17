import type { CSSProperties } from 'react';
import type { GameState, Piece, PieceType } from './Chess.ts';

const PIECES: Record<string, string> = {
  'white-king': '♔', 'white-queen': '♕', 'white-rook': '♖',
  'white-bishop': '♗', 'white-knight': '♘', 'white-pawn': '♙',
  'black-king': '♚', 'black-queen': '♛', 'black-rook': '♜',
  'black-bishop': '♝', 'black-knight': '♞', 'black-pawn': '♟',
};

function pieceChar(piece: Piece) {
  return PIECES[`${piece.color}-${piece.type}`] || '?';
}

interface Props {
  state: GameState;
  onSquareClick: (r: number, c: number) => void;
  onPromotion: (type: PieceType) => void;
  flipped: boolean;
  showCoordinates: boolean;
  showValidMoves: boolean;
  boardTheme?: { light: string; dark: string };
  hintFrom?: [number, number] | null;
  locked?: boolean;
}

export default function Board({ state, onSquareClick, onPromotion, flipped, showCoordinates, showValidMoves, boardTheme, hintFrom, locked }: Props) {
  const { board, selected, validMoves, promotionPending } = state;

  const rows = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
  const cols = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

  const isValidMove = (r: number, c: number) => showValidMoves && validMoves.some(([vr, vc]) => vr === r && vc === c);
  const isSelected = (r: number, c: number) => selected?.[0] === r && selected?.[1] === c;
  const isHint = (r: number, c: number) => hintFrom?.[0] === r && hintFrom?.[1] === c;
  const isInCheck = (r: number, c: number) => {
    const p = board[r][c];
    return p?.type === 'king' && p.color === state.turn && (state.status === 'check' || state.status === 'checkmate');
  };

  const themeStyle = boardTheme
    ? ({ '--light-sq': boardTheme.light, '--dark-sq': boardTheme.dark } as CSSProperties)
    : undefined;

  return (
    <div style={{ position: 'relative', ...themeStyle }} className={locked ? 'board-locked' : undefined}>
      <div className="board">
        {rows.map((r) => (
          <div key={r} className="board-row">
            {cols.map((c) => {
              const isLight = (r + c) % 2 === 0;
              const piece = board[r][c];
              const valid = isValidMove(r, c);
              const sel = isSelected(r, c);
              const check = isInCheck(r, c);
              const hint = isHint(r, c);

              return (
                <div
                  key={c}
                  className={[
                    'square',
                    isLight ? 'light' : 'dark',
                    sel ? 'selected' : '',
                    check ? 'in-check' : '',
                    hint ? 'hint-square' : '',
                  ].join(' ')}
                  onClick={() => onSquareClick(r, c)}
                >
                  {valid && (
                    <div className={piece ? 'capture-ring' : 'move-dot'} />
                  )}
                  {piece && (
                    <span className={`piece ${piece.color}`}>
                      {pieceChar(piece)}
                    </span>
                  )}
                  {showCoordinates && c === (flipped ? 7 : 0) && (
                    <span className="coord rank">{8 - r}</span>
                  )}
                  {showCoordinates && r === (flipped ? 0 : 7) && (
                    <span className="coord file">{String.fromCharCode(97 + c)}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {promotionPending && (
        <div className="promotion-overlay">
          <div className="promotion-modal">
            <p>Promote pawn to:</p>
            <div className="promotion-choices">
              {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map(type => (
                <button key={type} className="promo-btn" onClick={() => onPromotion(type)}>
                  <span className={`piece ${state.turn}`}>
                    {pieceChar({ type, color: state.turn })}
                  </span>
                  <span>{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}