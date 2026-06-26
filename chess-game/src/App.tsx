import { useState } from 'react';
import { initGame, legalMoves, makeMove } from './Chess.ts';
import type { GameState, PieceType } from './Chess.ts';
import Board from './Board.tsx';
import './app.css';

const PIECE_VALUES: Record<string, number> = {
  pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0,
};

function materialScore(state: GameState) {
  const white = state.capturedByWhite.reduce((s, p) => s + PIECE_VALUES[p.type], 0);
  const black = state.capturedByBlack.reduce((s, p) => s + PIECE_VALUES[p.type], 0);
  return { white, black };
}

export default function App() {
  const [state, setState] = useState<GameState>(initGame());
  const [flipped, setFlipped] = useState(false);
  const [pendingFrom, setPendingFrom] = useState<[number, number] | null>(null);

  function handleSquareClick(r: number, c: number) {
    if (state.status === 'checkmate' || state.status === 'stalemate') return;
    if (state.promotionPending) return;

    const piece = state.board[r][c];

    // If a piece is selected and we click a valid move
    if (state.selected) {
      const [sr, sc] = state.selected;
      const isValid = state.validMoves.some(([vr, vc]) => vr === r && vc === c);
      
      if (isValid) {
        const movingPiece = state.board[sr][sc]!;
        const isPawnPromotion = movingPiece.type === 'pawn' && (r === 0 || r === 7);
        
        if (isPawnPromotion) {
          setPendingFrom([sr, sc]);
          const newState = makeMove(state, [sr, sc], [r, c]);
          setState(newState);
        } else {
          setState(makeMove(state, [sr, sc], [r, c]));
        }
        return;
      }

      // Clicking own piece → reselect
      if (piece && piece.color === state.turn) {
        const moves = legalMoves(state, r, c);
        setState({ ...state, selected: [r, c], validMoves: moves });
        return;
      }

      // Deselect
      setState({ ...state, selected: null, validMoves: [] });
      return;
    }

    // Select a piece
    if (piece && piece.color === state.turn) {
      const moves = legalMoves(state, r, c);
      setState({ ...state, selected: [r, c], validMoves: moves });
    }
  }

  function handlePromotion(type: PieceType) {
    if (!state.promotionPending || !pendingFrom) return;
    const [tr, tc] = state.promotionPending;
    const [fr, fc] = pendingFrom;
    const newState = makeMove({ ...state, promotionPending: null }, [fr, fc], [tr, tc], type);
    setState(newState);
    setPendingFrom(null);
  }

  function resetGame() {
    setState(initGame());
    setPendingFrom(null);
  }

  const scores = materialScore(state);
  const whiteLead = scores.white - scores.black;
  const blackLead = scores.black - scores.white;

  const statusMsg = {
    checkmate: `Checkmate — ${state.turn === 'white' ? 'Black' : 'White'} wins`,
    stalemate: 'Stalemate — Draw',
    check: `${state.turn === 'white' ? 'White' : 'Black'} is in check`,
    playing: `${state.turn === 'white' ? 'White' : 'Black'} to move`,
  }[state.status];

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-piece">♟</span>
          <span className="logo-text">Chess</span>
        </div>
        <div className="header-actions">
          <button className="btn-ghost" onClick={() => setFlipped(f => !f)} title="Flip board">
            ↕ Flip
          </button>
          <button className="btn-ghost" onClick={resetGame}>
            ↺ New game
          </button>
        </div>
      </header>

      <main className="main">
        <div className="game-layout">

          {/* Black side info */}
          <div className="player-bar">
            <div className="player-info">
              <div className="player-avatar black-avatar">♚</div>
              <div>
                <div className="player-name">Black</div>
                {blackLead > 0 && <div className="material-lead">+{blackLead}</div>}
              </div>
            </div>
            <div className="captured-pieces">
              {state.capturedByBlack.map((p, i) => (
                <span key={i} className="captured">{['♔','♕','♖','♗','♘','♙'][['king','queen','rook','bishop','knight','pawn'].indexOf(p.type)]}</span>
              ))}
            </div>
          </div>

          <Board
            state={state}
            onSquareClick={handleSquareClick}
            onPromotion={handlePromotion}
            flipped={flipped}
          />

          {/* White side info */}
          <div className="player-bar">
            <div className="player-info">
              <div className="player-avatar white-avatar">♔</div>
              <div>
                <div className="player-name">White</div>
                {whiteLead > 0 && <div className="material-lead">+{whiteLead}</div>}
              </div>
            </div>
            <div className="captured-pieces">
              {state.capturedByWhite.map((p, i) => (
                <span key={i} className="captured">{['♚','♛','♜','♝','♞','♟'][['king','queen','rook','bishop','knight','pawn'].indexOf(p.type)]}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <aside className="side-panel">
          <div className={`status-card ${state.status}`}>
            <div className="status-dot" />
            <span>{statusMsg}</span>
          </div>

          {(state.status === 'checkmate' || state.status === 'stalemate') && (
            <button className="btn-primary" onClick={resetGame}>Play again</button>
          )}

          <div className="move-history">
            <h3>Move history</h3>
            <div className="moves-grid">
              {state.moveHistory.length === 0 && (
                <span className="no-moves">No moves yet</span>
              )}
              {Array.from({ length: Math.ceil(state.moveHistory.length / 2) }, (_, i) => (
                <div key={i} className="move-pair">
                  <span className="move-num">{i + 1}.</span>
                  <span className="move">{state.moveHistory[i * 2]}</span>
                  <span className="move">{state.moveHistory[i * 2 + 1] || ''}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}