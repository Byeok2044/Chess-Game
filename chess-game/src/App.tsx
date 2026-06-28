import { useState, useEffect, useRef } from 'react';
import { initGame, legalMoves, makeMove } from './Chess.ts';
import type { GameState, PieceType } from './Chess.ts';
import Board from './Board.tsx';
import Menu from './Menu.tsx';
import Settings from './Settings.tsx';
import { getBestMove } from './Ai.ts';
import './app.css';

const PIECE_VALUES: Record<string, number> = {
  pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0,
};

function materialScore(state: GameState) {
  const white = state.capturedByWhite.reduce((s, p) => s + PIECE_VALUES[p.type], 0);
  const black = state.capturedByBlack.reduce((s, p) => s + PIECE_VALUES[p.type], 0);
  return { white, black };
}

type GameMode = 'menu' | 'playing';

export default function App() {
  const [screen, setScreen] = useState<GameMode>('menu');
  const [vsAI, setVsAI] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [state, setState] = useState<GameState>(initGame());
  const [flipped, setFlipped] = useState(false);
  const [pendingFrom, setPendingFrom] = useState<[number, number] | null>(null);
  const [showHints, setShowHints] = useState(true);
  const [showCoords, setShowCoords] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!vsAI || screen !== 'playing') return;
    const aiColor = playerColor === 'white' ? 'black' : 'white';
    if (state.turn !== aiColor) return;
    if (state.status === 'checkmate' || state.status === 'stalemate') return;
    if (state.promotionPending) return;

    setAiThinking(true);
    aiTimeoutRef.current = setTimeout(() => {
      const move = getBestMove(state, 3);
      if (move) setState(makeMove(state, move.from, move.to, move.promote));
      setAiThinking(false);
    }, 300);

    return () => { if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current); };
  }, [state, vsAI, playerColor, screen]);

  function handleStart(mode: 'two-player' | 'vs-ai', color: 'white' | 'black') {
    setVsAI(mode === 'vs-ai');
    setPlayerColor(color);
    setFlipped(mode === 'vs-ai' && color === 'black');
    setState(initGame());
    setPendingFrom(null);
    setScreen('playing');
  }

  function handleSquareClick(r: number, c: number) {
    if (state.status === 'checkmate' || state.status === 'stalemate') return;
    if (state.promotionPending) return;
    if (vsAI) {
      const aiColor = playerColor === 'white' ? 'black' : 'white';
      if (state.turn === aiColor) return;
    }

    const piece = state.board[r][c];

    if (state.selected) {
      const [sr, sc] = state.selected;
      const movesForSelected = legalMoves(state, sr, sc);
      const isValid = movesForSelected.some(([vr, vc]) => vr === r && vc === c);

      if (isValid) {
        const movingPiece = state.board[sr][sc]!;
        const isPawnPromotion = movingPiece.type === 'pawn' && (r === 0 || r === 7);
        if (isPawnPromotion) {
          setPendingFrom([sr, sc]);
          setState(makeMove(state, [sr, sc], [r, c]));
        } else {
          setState(makeMove(state, [sr, sc], [r, c]));
        }
        return;
      }

      if (piece && piece.color === state.turn) {
        setState({ ...state, selected: [r, c], validMoves: legalMoves(state, r, c) });
        return;
      }

      setState({ ...state, selected: null, validMoves: [] });
      return;
    }

    if (piece && piece.color === state.turn) {
      setState({ ...state, selected: [r, c], validMoves: legalMoves(state, r, c) });
    }
  }

  function handlePromotion(type: PieceType) {
    if (!state.promotionPending || !pendingFrom) return;
    const [tr, tc] = state.promotionPending;
    const [fr, fc] = pendingFrom;
    setState(makeMove({ ...state, promotionPending: null }, [fr, fc], [tr, tc], type));
    setPendingFrom(null);
  }

  function resetGame() {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setAiThinking(false);
    setState(initGame());
    setPendingFrom(null);
  }

  function goToMenu() {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setAiThinking(false);
    setScreen('menu');
  }

  if (screen === 'menu') return <Menu onStart={handleStart} />;

  const scores = materialScore(state);
  const whiteLead = scores.white - scores.black;
  const blackLead = scores.black - scores.white;
  const aiColor = playerColor === 'white' ? 'black' : 'white';
  const blackLabel = vsAI ? (aiColor === 'black' ? 'Computer' : 'You') : 'Black';
  const whiteLabel = vsAI ? (playerColor === 'white' ? 'You' : 'Computer') : 'White';

  const statusMsg = {
    checkmate: `Checkmate — ${state.turn === 'white' ? 'Black' : 'White'} wins`,
    stalemate: 'Stalemate — Draw',
    check: `${state.turn === 'white' ? 'White' : 'Black'} is in check`,
    playing: aiThinking ? 'Computer is thinking…' : `${state.turn === 'white' ? 'White' : 'Black'} to move`,
  }[state.status];

  const displayState = showHints ? state : { ...state, validMoves: [] };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-piece">♟</span>
          <span className="logo-text">Chess</span>
        </div>
        <div className="header-actions">
          <button className="btn-ghost" onClick={goToMenu}>← Menu</button>
          <button className="btn-ghost" onClick={resetGame}>↺ New game</button>
          <button
            className={`btn-ghost ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(s => !s)}
          >
            ⚙ Settings
          </button>
        </div>
      </header>

      {showSettings && (
        <Settings
          showHints={showHints}
          showCoords={showCoords}
          flipped={flipped}
          onToggleHints={() => setShowHints(h => !h)}
          onToggleCoords={() => setShowCoords(c => !c)}
          onToggleFlipped={() => setFlipped(f => !f)}
        />
      )}

      <main className="main">
        <div className="game-layout">
          <div className="player-bar">
            <div className="player-info">
              <div className={`player-avatar ${vsAI && aiColor === 'black' ? 'ai-avatar' : 'black-avatar'}`}>
                {vsAI && aiColor === 'black' ? '🤖' : '♚'}
              </div>
              <div>
                <div className="player-name">{blackLabel}</div>
                {blackLead > 0 && <div className="material-lead">+{blackLead}</div>}
              </div>
            </div>
            <div className="captured-pieces">
              {state.capturedByBlack.map((p, i) => (
                <span key={i} className="captured">
                  {['♔','♕','♖','♗','♘','♙'][['king','queen','rook','bishop','knight','pawn'].indexOf(p.type)]}
                </span>
              ))}
            </div>
            {vsAI && aiThinking && aiColor === 'black' && (
              <div className="thinking-dots"><span /><span /><span /></div>
            )}
          </div>

          <Board
            state={displayState}
            onSquareClick={handleSquareClick}
            onPromotion={handlePromotion}
            flipped={flipped}
            showCoordinates={showCoords}
            showValidMoves={showHints}
          />

          <div className="player-bar">
            <div className="player-info">
              <div className={`player-avatar ${vsAI && aiColor === 'white' ? 'ai-avatar' : 'white-avatar'}`}>
                {vsAI && aiColor === 'white' ? '🤖' : '♔'}
              </div>
              <div>
                <div className="player-name">{whiteLabel}</div>
                {whiteLead > 0 && <div className="material-lead">+{whiteLead}</div>}
              </div>
            </div>
            <div className="captured-pieces">
              {state.capturedByWhite.map((p, i) => (
                <span key={i} className="captured">
                  {['♚','♛','♜','♝','♞','♟'][['king','queen','rook','bishop','knight','pawn'].indexOf(p.type)]}
                </span>
              ))}
            </div>
            {vsAI && aiThinking && aiColor === 'white' && (
              <div className="thinking-dots"><span /><span /><span /></div>
            )}
          </div>
        </div>

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