import { useEffect, useRef, useState } from 'react';
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

interface AnimState {
  toKey: string;
  dx: number;
  dy: number;
  transition: boolean;
}

const MOVE_ANIM_MS = 180;

export default function Board({
  state, onSquareClick, onPromotion, flipped, showCoordinates, showValidMoves, boardTheme, hintFrom, locked,
}: Props) {
  const { board, selected, validMoves, promotionPending } = state;
  const lastMove = (state as any).lastMove ?? null;

  const rows = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const isValidMove = (r: number, c: number) => showValidMoves && validMoves.some(([vr, vc]) => vr === r && vc === c);
  const isSelected = (r: number, c: number) => selected?.[0] === r && selected?.[1] === c;
  const isHint = (r: number, c: number) => hintFrom?.[0] === r && hintFrom?.[1] === c;
  const isLastMove = (r: number, c: number) =>
    !!lastMove && ((lastMove.from[0] === r && lastMove.from[1] === c) || (lastMove.to[0] === r && lastMove.to[1] === c));
  const isInCheck = (r: number, c: number) => {
    const p = board[r][c];
    return p?.type === 'king' && p.color === state.turn && (state.status === 'check' || state.status === 'checkmate');
  };

  const themeStyle = boardTheme
    ? ({ '--light-sq': boardTheme.light, '--dark-sq': boardTheme.dark } as CSSProperties)
    : undefined;

  // ── Drag-and-drop (reuses the same onSquareClick pipeline as click-click) ──
  const [dragFrom, setDragFrom] = useState<[number, number] | null>(null);

  // ── Move animation (FLIP: offset-then-settle) ──────────────────────────
  const boardRef = useRef<HTMLDivElement>(null);
  const [squareSize, setSquareSize] = useState(0);
  const [anim, setAnim] = useState<AnimState | null>(null);
  const lastMoveKey = lastMove
    ? `${lastMove.from[0]},${lastMove.from[1]}-${lastMove.to[0]},${lastMove.to[1]}`
    : null;
  const prevLastMoveKeyRef = useRef<string | null>(lastMoveKey);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const update = () => setSquareSize(el.clientWidth / 8);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (lastMoveKey && lastMoveKey !== prevLastMoveKeyRef.current && lastMove && squareSize > 0) {
      const [fr, fc] = lastMove.from;
      const [tr, tc] = lastMove.to;
      const colOf = (c: number) => (flipped ? 7 - c : c);
      const rowOf = (r: number) => (flipped ? 7 - r : r);
      const dx = (colOf(fc) - colOf(tc)) * squareSize;
      const dy = (rowOf(fr) - rowOf(tr)) * squareSize;
      const toKey = `${tr}-${tc}`;

      setAnim({ toKey, dx, dy, transition: false });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnim((a) => (a && a.toKey === toKey ? { ...a, dx: 0, dy: 0, transition: true } : a));
        });
      });
    }
    prevLastMoveKeyRef.current = lastMoveKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMoveKey, squareSize, flipped]);

  useEffect(() => {
    if (anim?.transition) {
      const t = setTimeout(() => setAnim(null), MOVE_ANIM_MS + 60);
      return () => clearTimeout(t);
    }
  }, [anim]);

  return (
    <div style={{ position: 'relative', ...themeStyle }} className={locked ? 'board-locked' : undefined}>
      <div className="board" ref={boardRef}>
        {rows.map((r) => (
          <div key={r} className="board-row">
            {cols.map((c) => {
              const isLight = (r + c) % 2 === 0;
              const piece = board[r][c];
              const valid = isValidMove(r, c);
              const sel = isSelected(r, c);
              const check = isInCheck(r, c);
              const hint = isHint(r, c);
              const lastMoveSq = isLastMove(r, c);
              const isAnimatingPiece = anim?.toKey === `${r}-${c}`;
              const isDraggingPiece = dragFrom?.[0] === r && dragFrom?.[1] === c;

              const pieceStyle: CSSProperties | undefined = isAnimatingPiece
                ? {
                    transform: `translate(${anim!.dx}px, ${anim!.dy}px)`,
                    transition: anim!.transition
                      ? `transform ${MOVE_ANIM_MS}ms cubic-bezier(0.2, 0.6, 0.35, 1)`
                      : 'none',
                  }
                : undefined;

              return (
                <div
                  key={c}
                  className={[
                    'square',
                    isLight ? 'light' : 'dark',
                    sel ? 'selected' : '',
                    check ? 'in-check' : '',
                    hint ? 'hint-square' : '',
                    lastMoveSq ? 'last-move' : '',
                  ].join(' ')}
                  onClick={() => onSquareClick(r, c)}
                  onDragOver={(e) => {
                    if (dragFrom) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!dragFrom) return;
                    setDragFrom(null);
                    onSquareClick(r, c);
                  }}
                >
                  {valid && <div className={piece ? 'capture-ring' : 'move-dot'} />}
                  {piece && (
                    <span
                      className={`piece ${piece.color} ${isDraggingPiece ? 'dragging' : ''}`}
                      style={pieceStyle}
                      draggable={!locked}
                      onDragStart={(e) => {
                        if (locked) {
                          e.preventDefault();
                          return;
                        }
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', `${r},${c}`);
                        setDragFrom([r, c]);
                        onSquareClick(r, c);
                      }}
                      onDragEnd={() => setDragFrom(null)}
                    >
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
              {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map((type) => (
                <button key={type} className="promo-btn" onClick={() => onPromotion(type)}>
                  <span className={`piece ${state.turn}`}>{pieceChar({ type, color: state.turn })}</span>
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