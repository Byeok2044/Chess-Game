import { useState } from 'react';
import Board from './Board.tsx';
import { initGame, legalMoves, makeMove } from './Chess.ts';
import type { GameState } from './Chess.ts';
import { boardFromFEN, turnFromFEN } from './utils/fen.ts';
import { PUZZLES } from './puzzles/puzzleData.ts';
import './Menu.css';
import './App.css';

function colLetter(c: number) {
  return String.fromCharCode(97 + c);
}
function toUCI(from: [number, number], to: [number, number]) {
  return `${colLetter(from[1])}${8 - from[0]}${colLetter(to[1])}${8 - to[0]}`;
}
function fromUCI(move: string): { from: [number, number]; to: [number, number] } {
  const from: [number, number] = [8 - Number(move[1]), move.charCodeAt(0) - 97];
  const to: [number, number] = [8 - Number(move[3]), move.charCodeAt(2) - 97];
  return { from, to };
}

function stateFromPuzzle(fen: string): GameState {
  const base = initGame();
  return {
    ...base,
    board: boardFromFEN(fen),
    turn: turnFromFEN(fen),
    castlingRights: { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false },
  };
}

type Feedback = 'idle' | 'correct' | 'incorrect' | 'complete';

export default function Puzzles({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const puzzle = PUZZLES[index];
  const [state, setState] = useState<GameState>(() => stateFromPuzzle(puzzle.fen));
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');

  function loadPuzzle(i: number) {
    const p = PUZZLES[i];
    setIndex(i);
    setState(stateFromPuzzle(p.fen));
    setStep(0);
    setFeedback('idle');
  }

  function handleSquareClick(r: number, c: number) {
    if (feedback === 'complete') return;
    const piece = state.board[r][c];

    if (state.selected) {
      const [sr, sc] = state.selected;
      const moves = legalMoves(state, sr, sc);
      const isValid = moves.some(([vr, vc]) => vr === r && vc === c);

      if (isValid) {
        const uci = toUCI([sr, sc], [r, c]);
        const expected = puzzle.solution[step];

        if (uci === expected) {
          const next = makeMove(state, [sr, sc], [r, c]);
          const isLastMove = step + 1 >= puzzle.solution.length;

          if (isLastMove) {
            setState(next);
            setFeedback('complete');
          } else {
            setState(next);
            setFeedback('correct');
            const reply = fromUCI(puzzle.solution[step + 1]);
            setTimeout(() => {
              setState((s) => makeMove(s, reply.from, reply.to));
              const newStep = step + 2;
              setStep(newStep);
              setFeedback(newStep >= puzzle.solution.length ? 'complete' : 'idle');
            }, 500);
          }
        } else {
          setState({ ...state, selected: null, validMoves: [] });
          setFeedback('incorrect');
          setTimeout(() => setFeedback('idle'), 900);
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

  return (
    <div className="menu-root" style={{ alignItems: 'flex-start', paddingTop: 24 }}>
      <div className="menu-content" style={{ maxWidth: 960 }}>
        <div className="menu-logo">
          <span className="menu-logo-piece">♟</span>
          <h1 className="menu-title">Puzzles</h1>
        </div>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <Board
            state={state}
            onSquareClick={handleSquareClick}
            onPromotion={() => {}}
            flipped={turnFromFEN(puzzle.fen) === 'black'}
            showCoordinates
            showValidMoves
          />

          <aside className="side-panel" style={{ width: 280, position: 'static' }}>
            <div className="status-card">
              <div className="status-dot" />
              <span>{puzzle.title} · {state.turn === 'white' ? 'White' : 'Black'} to move</span>
            </div>

            {feedback === 'correct' && <p style={{ color: 'var(--accent)' }}>Correct! Keep going…</p>}
            {feedback === 'incorrect' && <p style={{ color: 'var(--check)' }}>Not quite — try again.</p>}
            {feedback === 'complete' && <p style={{ color: 'var(--accent)' }}>Solved! 🎉</p>}

            <div className="move-history">
              <h3>All puzzles</h3>
              <div className="moves-grid">
                {PUZZLES.map((p, i) => (
                  <button
                    key={p.id}
                    className="btn-ghost"
                    style={{ justifyContent: 'space-between', display: 'flex', marginBottom: 6, width: '100%' }}
                    onClick={() => loadPuzzle(i)}
                  >
                    <span>{p.title}</span>
                    <span>{p.rating}</span>
                  </button>
                ))}
              </div>
            </div>

            {feedback === 'complete' && index + 1 < PUZZLES.length && (
              <button className="btn-primary" onClick={() => loadPuzzle(index + 1)}>Next puzzle</button>
            )}
          </aside>
        </div>

        <button className="btn-ghost" onClick={onBack} style={{ marginTop: 16 }}>← Back</button>
      </div>
    </div>
  );
}