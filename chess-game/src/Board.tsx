// chess-game/src/Board.tsx
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
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

function colLetter(c: number) {
  return String.fromCharCode(97 + c);
}
function algebraic(r: number, c: number) {
  return `${colLetter(c)}${8 - r}`;
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
  const { board, selected, validMoves, promotionPending, turn, status, lastMove } = state;

  const rows = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
  const cols = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

  const isValidMove = (r: number, c: number) => showValidMoves && validMoves.some(([vr, vc]) => vr === r && vc === c);
  const isSelected = (r: number, c: number) => selected?.[0] === r && selected?.[1] === c;
  const isHint = (r: number, c: number) => hintFrom?.[0] === r && hintFrom?.[1] === c;
  const isInCheck = (r: number, c: number) => {
    const p = board[r][c];
    return p?.type === 'king' && p.color === turn && (status === 'check' || status === 'checkmate');
  };
  const isLastMove = (r: number, c: number) =>
    !!lastMove && (
      (lastMove.from[0] === r && lastMove.from[1] === c) ||
      (lastMove.to[0] === r && lastMove.to[1] === c)
    );

  // ── Roving tabindex / keyboard navigation ─────────────────────────
  const [focused, setFocused] = useState<[number, number]>(() => selected ?? [flipped ? 0 : 7, flipped ? 7 : 0]);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (selected) setFocused(selected);
  }, [selected]);

  useEffect(() => {
    const el = cellRefs.current.get(`${focused[0]}-${focused[1]}`);
    el?.focus();
  }, [focused]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>, r: number, c: number) {
    if (locked) return;
    const dirs: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
    };
    const dir = dirs[e.key];
    if (dir) {
      e.preventDefault();
      let [nr, nc] = [r + dir[0], c + dir[1]];
      nr = Math.min(7, Math.max(0, nr));
      nc = Math.min(7, Math.max(0, nc));
      setFocused([nr, nc]);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSquareClick(r, c);
    }
  }

  // ── Drag and drop feedback ─────────────────────────────────────────
  const [dragOver, setDragOver] = useState<[number, number] | null>(null);
  const dragging = useRef(false);

  function handleDragStart(r: number, c: number) {
    const piece = board[r][c];
    if (locked || !piece || piece.color !== turn) return;
    dragging.current = true;
    onSquareClick(r, c); // select the source square, same as a click
  }

  function handleDragOver(e: React.DragEvent, r: number, c: number) {
    if (!dragging.current) return;
    e.preventDefault();
    setDragOver([r, c]);
  }

  function handleDrop(e: React.DragEvent, r: number, c: number) {
    e.preventDefault();
    if (!dragging.current) return;
    dragging.current = false;
    setDragOver(null);
    onSquareClick(r, c); // attempt the move, same as a second click
  }

  function handleDragEnd() {
    dragging.current = false;
    setDragOver(null);
  }

  const themeStyle = boardTheme
    ? ({ '--light-sq': boardTheme.light, '--dark-sq': boardTheme.dark } as CSSProperties)
    : undefined;

  const statusAnnouncement =
    status === 'checkmate' ? `Checkmate. ${turn === 'white' ? 'Black' : 'White'} wins.`
    : status === 'check' ? `${turn === 'white' ? 'White' : 'Black'} is in check.`
    : status === 'stalemate' ? 'Stalemate.'
    : '';

  return (
    <div style={{ position: 'relative', ...themeStyle }} className={locked ? 'board-locked' : undefined}>
      {/* Screen-reader-only live region so check/checkmate/stalemate get announced */}
      <span className="sr-only" role="status" aria-live="polite">{statusAnnouncement}</span>

      <div className="board" role="grid" aria-label="Chess board">
        {rows.map((r) => (
          <div key={r} className="board-row" role="row">
            {cols.map((c) => {
              const isLight = (r + c) % 2 === 0;
              const piece = board[r][c];
              const valid = isValidMove(r, c);
              const sel = isSelected(r, c);
              const check = isInCheck(r, c);
              const hint = isHint(r, c);
              const lastMoveSq = isLastMove(r, c);
              const isDragOver = dragOver?.[0] === r && dragOver?.[1] === c;
              const dragOverLegal = isDragOver && validMoves.some(([vr, vc]) => vr === r && vc === c);
              const dragOverIllegal = isDragOver && !dragOverLegal;
              const isFocusTarget = focused[0] === r && focused[1] === c;

              const label = [
                algebraic(r, c),
                piece ? `${piece.color} ${piece.type}` : 'empty',
                sel ? 'selected' : '',
                valid ? 'valid move' : '',
                check ? 'in check' : '',
                lastMoveSq ? 'last move' : '',
              ].filter(Boolean).join(', ');

              return (
                <div
                  key={c}
                  ref={(el) => {
                    if (el) cellRefs.current.set(`${r}-${c}`, el);
                    else cellRefs.current.delete(`${r}-${c}`);
                  }}
                  role="gridcell"
                  aria-label={label}
                  aria-selected={sel}
                  tabIndex={isFocusTarget ? 0 : -1}
                  className={[
                    'square',
                    isLight ? 'light' : 'dark',
                    sel ? 'selected' : '',
                    check ? 'in-check' : '',
                    hint ? 'hint-square' : '',
                    lastMoveSq ? 'last-move' : '',
                    dragOverLegal ? 'drag-over-legal' : '',
                    dragOverIllegal ? 'drag-over-illegal' : '',
                  ].join(' ')}
                  onClick={() => onSquareClick(r, c)}
                  onKeyDown={(e) => handleKeyDown(e, r, c)}
                  onFocus={() => setFocused([r, c])}
                  onDragOver={(e) => handleDragOver(e, r, c)}
                  onDrop={(e) => handleDrop(e, r, c)}
                  onDragLeave={() => setDragOver((d) => (d && d[0] === r && d[1] === c ? null : d))}
                >
                  {valid && (
                    <div className={piece ? 'capture-ring' : 'move-dot'} aria-hidden="true" />
                  )}
                  {piece && (
                    <span
                      className={`piece ${piece.color}`}
                      draggable={!locked && piece.color === turn}
                      onDragStart={() => handleDragStart(r, c)}
                      onDragEnd={handleDragEnd}
                      aria-hidden="true"
                    >
                      {pieceChar(piece)}
                    </span>
                  )}
                  {showCoordinates && c === (flipped ? 7 : 0) && (
                    <span className="coord rank" aria-hidden="true">{8 - r}</span>
                  )}
                  {showCoordinates && r === (flipped ? 0 : 7) && (
                    <span className="coord file" aria-hidden="true">{String.fromCharCode(97 + c)}</span>
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
                  <span className={`piece ${state.turn}`} aria-hidden="true">
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