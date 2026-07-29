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
import {
  loadPuzzleRating, pickNextPuzzle, satisfiesDifficultyCriteria,
} from './puzzles/puzzleRating.ts';
import './Menu.css';
import './App.css';

type Feedback = 'idle' | 'correct' | 'incorrect' | 'complete';

const REVEAL_AFTER_ATTEMPTS = 2;
const REPLY_DELAY_MS = 250;
const SHAKE_DELAY_MS = 650;
const PUZZLE_CATALOG = PUZZLES.filter(satisfiesDifficultyCriteria);

export default function Puzzles({ onBack }: { onBack: () => void }) {
  const [rating] = useState(() => loadPuzzleRating());
  const [index, setIndex] = useState(() => {
    const next = pickNextPuzzle(PUZZLE_CATALOG, loadSolvedPuzzles(), loadPuzzleRating());
    return Math.max(0, next ? PUZZLE_CATALOG.findIndex((p) => p.id === next.id) : 0);
  });
  const puzzle = PUZZLE_CATALOG[index];

  const [state, setState] = useState<GameState>(() => stateFromPuzzle(puzzle.fen));
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [attempts, setAttempts] = useState(0);
  const [movesCompleted, setMovesCompleted] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hintFrom, setHintFrom] = useState<[number, number] | null>(null);
  const [hintTo, setHintTo] = useState<[number, number] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState<Set<string>>(() => loadSolvedPuzzles());

  const goal = useMemo(() => computeGoal(puzzle), [puzzle]);

  function loadPuzzle(i: number) {
    const p = PUZZLE_CATALOG[i];
    setIndex(i);
    setState(stateFromPuzzle(p.fen));
    setStep(0);
    setFeedback('idle');
    setAttempts(0);
    setMovesCompleted(0);
    setLocked(false);
    setHintFrom(null);
    setHintTo(null);
    setRevealed(false);
  }

  function resetAttempt() {
    setState(stateFromPuzzle(puzzle.fen));
    setStep(0);
    setFeedback('idle');
    setMovesCompleted(0);
    setLocked(false);
    setHintFrom(null);
    setHintTo(null);
  }

  function completePuzzle(wasRevealed = revealed) {
    setFeedback('complete');
    const nextSolved = new Set(solved);
    const isNewSolve = !wasRevealed && !nextSolved.has(puzzle.id);

    if (isNewSolve) {
      markPuzzleSolved(puzzle.id);
      nextSolved.add(puzzle.id);
      setSolved(nextSolved);
    }

    const next = pickNextPuzzle(PUZZLE_CATALOG, nextSolved, rating);
    if (next) {
      window.setTimeout(() => {
        const nextIndex = PUZZLE_CATALOG.findIndex((candidate) => candidate.id === next.id);
        if (nextIndex >= 0) loadPuzzle(nextIndex);
      }, 1800);
    }
  }

  function handleHint() {
    if (locked || feedback === 'complete') return;
    const { from } = fromUCI(puzzle.solution[step]);
    setHintFrom(from);
    setHintTo(null);
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
            // A broken continuation invalidates the entire calculation.
            // Start over rather than allowing the player to retain partial progress.
            resetAttempt();
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
        completePuzzle(true);
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

  const sideToMove = turnFromFEN(puzzle.fen) === 'white' ? 'White' : 'Black';
  const moveNumber = Math.min(movesCompleted + 1, goal.playerMoveCount);

  return (
    <div className="puzzles-page">
      <main className="puzzles-layout">
        <section className="puzzle-stage" aria-label="Current puzzle">
          <div className="puzzle-topbar">
            <button className="btn-ghost puzzle-back-link" onClick={onBack}>← Back</button>
            <div className="puzzle-objective">
              <span className="puzzle-position">#{index + 1}</span>
              <h2 className="puzzle-goal-label">{sideToMove} to move</h2>
              <span className={`puzzle-badge ${difficultyBadge(puzzle.rating)}`}>{puzzle.rating}</span>
            </div>
          </div>

          <div className="puzzle-progress" aria-label={`${movesCompleted} of ${goal.playerMoveCount} moves completed`}>
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
            <span className="puzzle-progress-text">Move {moveNumber}/{goal.playerMoveCount}</span>
          </div>

            <div className={`puzzle-board-shell ${feedback === 'incorrect' ? 'shake feedback-incorrect' : ''} ${feedback === 'correct' ? 'feedback-correct' : ''}`}>
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
              <button className="btn-ghost icon-button" onClick={handleHint} disabled={locked || feedback === 'complete'} aria-label="Hint">?</button>
              <button className="btn-ghost icon-button" onClick={() => loadPuzzle(index)} disabled={locked} aria-label="Retry">↻</button>
              {attempts >= REVEAL_AFTER_ATTEMPTS && feedback !== 'complete' && (
                <button className="btn-ghost icon-button" onClick={handleRevealSolution} disabled={locked} aria-label="Show solution">☰</button>
              )}
            </div>
        </section>

        <aside className="puzzles-sidebar">
            <div className="puzzle-status-slot" aria-live="polite">
              {feedback === 'correct' && <div className="puzzle-feedback-card correct" role="status">Correct</div>}
              {feedback === 'incorrect' && <div className="puzzle-feedback-card incorrect" role="alert">Incorrect</div>}
              {feedback === 'complete' && (
                <div className="puzzle-feedback-card complete">
                  <strong>Puzzle complete</strong>
                </div>
              )}
            </div>

            <nav className="puzzle-library" aria-label="Puzzle list">
              <div className="moves-grid">
                {PUZZLE_CATALOG.map((p, i) => (
                  <button key={p.id} className={`puzzle-list-item ${i === index ? 'active' : ''}`} onClick={() => loadPuzzle(i)} aria-current={i === index ? 'true' : undefined}>
                    <span className="puzzle-list-title">
                      {solved.has(p.id) && <span className="puzzle-solved-check">✓</span>}
                      <span className="puzzle-list-number">{String(i + 1).padStart(2, '0')}</span>
                      {p.title}
                    </span>
                    <span className={`puzzle-badge ${difficultyBadge(p.rating)}`}>{p.rating}</span>
                  </button>
                ))}
              </div>
            </nav>
        </aside>
      </main>
    </div>
  );
}
