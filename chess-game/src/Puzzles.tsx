import { useMemo, useState } from 'react';
import Board from './Board.tsx';
import { legalMoves, makeMove } from './Chess.ts';
import type { GameState } from './Chess.ts';
import { turnFromFEN } from './utils/fen.ts';
import { PUZZLES } from './puzzles/puzzleData.ts';
import {
  toUCI,
  fromUCI,
  stateFromPuzzle,
  computeGoal,
  difficultyBadge,
  loadSolvedPuzzles,
  markPuzzleSolved,
} from './puzzles/puzzleUtils.ts';
import './Menu.css';
import './App.css';

type Feedback = 'idle' | 'correct' | 'incorrect' | 'complete';

const REVEAL_AFTER_ATTEMPTS = 2;
const REPLY_DELAY_MS = 550;
const SHAKE_DELAY_MS = 650;

export default function Puzzles({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const puzzle = PUZZLES[index];

  const [state, setState] = useState<GameState>(() => stateFromPuzzle(puzzle.fen));
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [attempts, setAttempts] = useState(0);
  const [movesCompleted, setMovesCompleted] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hintFrom, setHintFrom] = useState<[number, number] | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState<Set<string>>(() => loadSolvedPuzzles());

  const goal = useMemo(() => computeGoal(puzzle), [puzzle]);
  const turnLabel = turnFromFEN(puzzle.fen) === 'white' ? 'White' : 'Black';
  const solvedCount = solved.size;

  function loadPuzzle(i: number) {
    const p = PUZZLES[i];
    setIndex(i);
    setState(stateFromPuzzle(p.fen));
    setStep(0);
    setFeedback('idle');
    setAttempts(0);
    setMovesCompleted(0);
    setLocked(false);
    setHintFrom(null);
    setHintUsed(false);
    setRevealed(false);
  }

  function completePuzzle() {
    setFeedback('complete');
    if (!revealed) {
      markPuzzleSolved(puzzle.id);
      setSolved((prev) => new Set(prev).add(puzzle.id));
    }
  }

  function handleSquareClick(r: number, c: number) {
    if (locked || feedback === 'complete') return;
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
          setHintFrom(null);
          setMovesCompleted((m) => m + 1);
          setState(next);

          if (isLastMove) {
            completePuzzle();
          } else {
            setFeedback('correct');
            setLocked(true);
            const reply = fromUCI(puzzle.solution[step + 1]);
            window.setTimeout(() => {
              setState((s) => makeMove(s, reply.from, reply.to));
              const newStep = step + 2;
              setStep(newStep);
              setLocked(false);
              if (newStep >= puzzle.solution.length) {
                completePuzzle();
              } else {
                setFeedback('idle');
              }
            }, REPLY_DELAY_MS);
          }
        } else {
          setState({ ...state, selected: null, validMoves: [] });
          setFeedback('incorrect');
          setAttempts((a) => a + 1);
          setLocked(true);
          window.setTimeout(() => {
            setFeedback('idle');
            setLocked(false);
          }, SHAKE_DELAY_MS);
        }
        return;
      }

      if (piece && piece.color === state.turn) {
        setState({ ...state, selected: [r, c], validMoves: legalMoves(state, r, c) });
        setHintFrom(null);
        return;
      }

      setState({ ...state, selected: null, validMoves: [] });
      return;
    }

    if (piece && piece.color === state.turn) {
      setState({ ...state, selected: [r, c], validMoves: legalMoves(state, r, c) });
      setHintFrom(null);
    }
  }

  function handleHint() {
    if (locked || feedback === 'complete') return;
    const { from } = fromUCI(puzzle.solution[step]);
    setHintFrom(from);
    setHintUsed(true);
  }

  function handleRevealSolution() {
    if (locked || feedback === 'complete') return;
    setRevealed(true);
    setHintFrom(null);
    setLocked(true);

    let s = state;
    let i = step;
    const playNext = () => {
      if (i >= puzzle.solution.length) {
        setLocked(false);
        completePuzzle();
        return;
      }
      const { from, to } = fromUCI(puzzle.solution[i]);
      s = makeMove(s, from, to);
      setState(s);
      if (i % 2 === 0) setMovesCompleted((m) => m + 1);
      i += 1;
      window.setTimeout(playNext, 500);
    };
    playNext();
  }

  return (
    <div className="menu-root" style={{ alignItems: 'flex-start', paddingTop: 24 }}>
      <div className="menu-content" style={{ maxWidth: 960 }}>
        <div className="menu-logo">
          <span className="menu-logo-piece">♟</span>
          <h1 className="menu-title">Puzzles</h1>
        </div>
        <p className="menu-subtitle" style={{ marginBottom: 0 }}>
          {solvedCount} / {PUZZLES.length} solved
        </p>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <div>
            <div className="puzzle-objective">
              <span className={`puzzle-badge ${difficultyBadge(puzzle.rating)}`}>{puzzle.rating}</span>
              <h2 className="puzzle-goal-label">{goal.label}</h2>
            </div>
            <p className="puzzle-subline">{turnLabel} to move · {puzzle.theme}</p>

            <div className="puzzle-progress" aria-label={`${movesCompleted} of ${goal.playerMoveCount} moves found`}>
              {Array.from({ length: goal.playerMoveCount }, (_, i) => (
                <span
                  key={i}
                  className={[
                    'puzzle-dot',
                    i < movesCompleted ? 'filled' : '',
                    i === movesCompleted && feedback !== 'complete' ? 'current' : '',
                  ].join(' ')}
                />
              ))}
            </div>

            <div className={feedback === 'incorrect' ? 'shake' : undefined}>
              <Board
                state={state}
                onSquareClick={handleSquareClick}
                onPromotion={() => {}}
                flipped={turnFromFEN(puzzle.fen) === 'black'}
                showCoordinates
                showValidMoves
                hintFrom={hintFrom}
                locked={locked}
              />
            </div>

            <div className="puzzle-actions">
              <button className="btn-ghost" onClick={handleHint} disabled={locked || feedback === 'complete'}>
                💡 Hint
              </button>
              <button className="btn-ghost" onClick={() => loadPuzzle(index)} disabled={locked}>
                ↺ Retry
              </button>
              {attempts >= REVEAL_AFTER_ATTEMPTS && feedback !== 'complete' && (
                <button className="btn-ghost" onClick={handleRevealSolution} disabled={locked}>
                  Show solution
                </button>
              )}
            </div>
          </div>

          <aside className="side-panel" style={{ width: 280, position: 'static' }}>
            <div className={`puzzle-feedback-card ${feedback}`}>
              {feedback === 'idle' && <span>Find {turnLabel}'s best move.</span>}
              {feedback === 'correct' && <span>Correct! Keep going…</span>}
              {feedback === 'incorrect' && <span>Not quite — try again.</span>}
              {feedback === 'complete' && (
                <span>
                  {revealed
                    ? 'Solution shown — ready for the next one?'
                    : `Solved${attempts === 0 ? ' in one try' : ` in ${attempts + 1} tries`}${hintUsed ? ' (with a hint)' : ''} 🎉`}
                </span>
              )}
            </div>

            {feedback === 'complete' && index + 1 < PUZZLES.length && (
              <button className="btn-primary" onClick={() => loadPuzzle(index + 1)}>Next puzzle</button>
            )}
            {feedback === 'complete' && index + 1 >= PUZZLES.length && (
              <p className="puzzle-subline" style={{ textAlign: 'center' }}>
                🏆 You've solved every puzzle available!
              </p>
            )}

            <div className="move-history">
              <h3>All puzzles</h3>
              <div className="moves-grid">
                {PUZZLES.map((p, i) => (
                  <button
                    key={p.id}
                    className="btn-ghost puzzle-list-item"
                    onClick={() => loadPuzzle(i)}
                  >
                    <span className="puzzle-list-title">
                      {solved.has(p.id) && <span className="puzzle-solved-check">✓</span>}
                      {p.title}
                    </span>
                    <span className={`puzzle-badge ${difficultyBadge(p.rating)}`}>{p.rating}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <button className="btn-ghost" onClick={onBack} style={{ marginTop: 16 }}>← Back</button>
      </div>
    </div>
  );
}