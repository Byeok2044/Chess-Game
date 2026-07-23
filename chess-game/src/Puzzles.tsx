import { useMemo, useState } from 'react';
import Board from './Board.tsx';
import { legalMoves, makeMove } from './Chess.ts';
import type { GameState } from './Chess.ts';
import { turnFromFEN } from './utils/fen.ts';
import { PUZZLES } from './puzzles/puzzleData.ts';
import {
  toUCI, fromUCI, stateFromPuzzle, computeGoal, difficultyBadge,
  loadSolvedPuzzles, markPuzzleSolved,
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
  const [hintTo, setHintTo] = useState<[number, number] | null>(null);
  const [hintPresses, setHintPresses] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState<Set<string>>(() => loadSolvedPuzzles());

  const goal = useMemo(() => computeGoal(puzzle), [puzzle]);

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
    setHintTo(null);
    setHintPresses(0);
    setRevealed(false);
  }

  function completePuzzle() {
    setFeedback('complete');
    if (!revealed) {
      markPuzzleSolved(puzzle.id);
      setSolved((prev) => new Set(prev).add(puzzle.id));
    }
  }

  function handleHint() {
    if (locked || feedback === 'complete') return;
    const { from, to } = fromUCI(puzzle.solution[step]);
    if (hintPresses === 0) {
      setHintFrom(from);
      setHintPresses(1);
    } else if (hintPresses === 1) {
      setHintTo(to);
      setHintPresses(2);
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
        const alternates = puzzle.solutionAlternates?.[step] ?? [];
        const isCorrect = uci === expected || alternates.includes(uci);

        if (isCorrect) {
          const next = makeMove(state, [sr, sc], [r, c]);
          const isLastMove = step + 1 >= puzzle.solution.length;
          setHintFrom(null);
          setHintTo(null);
          setHintPresses(0);
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
              if (newStep >= puzzle.solution.length) completePuzzle();
              else setFeedback('idle');
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
        setHintTo(null);
        return;
      }
      setState({ ...state, selected: null, validMoves: [] });
      return;
    }

    if (piece && piece.color === state.turn) {
      setState({ ...state, selected: [r, c], validMoves: legalMoves(state, r, c) });
      setHintFrom(null);
      setHintTo(null);
    }
  }

  function handleRevealSolution() {
    if (locked || feedback === 'complete') return;
    setRevealed(true);
    setHintFrom(null);
    setHintTo(null);
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
        <button className="btn-ghost" onClick={onBack}>← Back</button>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <div>
            <div className="puzzle-objective">
              <span className={`puzzle-badge ${difficultyBadge(puzzle.rating)}`}>{puzzle.rating}</span>
              <h2 className="puzzle-goal-label">{goal.label}</h2>
            </div>

            <div className="puzzle-progress">
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
                hintTo={hintTo}
                locked={locked}
              />
            </div>

            <div className="puzzle-actions">
              <button className="btn-ghost" onClick={handleHint} disabled={locked || feedback === 'complete'}>Hint</button>
              <button className="btn-ghost" onClick={() => loadPuzzle(index)} disabled={locked}>Retry</button>
              {attempts >= REVEAL_AFTER_ATTEMPTS && feedback !== 'complete' && (
                <button className="btn-ghost" onClick={handleRevealSolution} disabled={locked}>Solution</button>
              )}
            </div>
          </div>

          <aside className="side-panel" style={{ width: 280, position: 'static' }}>
            {feedback === 'correct' && <div className="puzzle-feedback-card correct" />}
            {feedback === 'incorrect' && <div className="puzzle-feedback-card incorrect" />}
            {feedback === 'complete' && (
              <div className="puzzle-feedback-card complete">
                {index + 1 < PUZZLES.length ? (
                  <button className="btn-primary" onClick={() => loadPuzzle(index + 1)}>Next puzzle</button>
                ) : (
                  <span>All puzzles solved</span>
                )}
              </div>
            )}

            <div className="move-history">
              <div className="moves-grid">
                {PUZZLES.map((p, i) => (
                  <button key={p.id} className="btn-ghost puzzle-list-item" onClick={() => loadPuzzle(i)}>
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
      </div>
    </div>
  );
}