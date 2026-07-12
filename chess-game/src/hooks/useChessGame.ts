import { useState } from 'react';
import { initGame, legalMoves, makeMove } from '../Chess.ts';
import type { Color, GameState, PieceType } from '../Chess.ts';
import { DEFAULT_SETTINGS } from '../GameSettings.ts';
import type { BoardTheme, TimeControl } from '../GameSettings.ts';
import { useAiOpponent } from './useAiOpponent.ts';
import { useChessClock } from './useChessClock.ts';
import { clearAiCache } from '../AI.ts';

export type GameMode = 'menu' | 'playing';

export function useChessGame() {
  const [screen, setScreen] = useState<GameMode>('menu');
  const [vsAI, setVsAI] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>('white');
  const [state, setState] = useState<GameState>(initGame());
  const [flipped, setFlipped] = useState(false);
  const [pendingFrom, setPendingFrom] = useState<[number, number] | null>(null);
  const [showHints, setShowHints] = useState(true);
  const [showCoords, setShowCoords] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(DEFAULT_SETTINGS.boardTheme);
  const [timeControl, setTimeControl] = useState<TimeControl>('none');

  const clock = useChessClock(
    timeControl,
    state.turn,
    screen === 'playing' && (state.status === 'playing' || state.status === 'check'),
    state.moveHistory.length
  );

  const { aiThinking, cancelAiTurn } = useAiOpponent(state, setState, vsAI, playerColor, screen, !!clock.timedOut);

  function handleStart(mode: 'two-player' | 'vs-ai', color: Color, tc: TimeControl = 'none') {
    setVsAI(mode === 'vs-ai');
    setPlayerColor(color);
    setFlipped(mode === 'vs-ai' && color === 'black');
    setState(initGame());
    setPendingFrom(null);
    setTimeControl(tc);
    clock.reset();
    setScreen('playing');
  }

  function resumeGame(mode: 'two-player' | 'vs-ai', color: Color, savedState: GameState) {
    setVsAI(mode === 'vs-ai');
    setPlayerColor(color);
    setFlipped(mode === 'vs-ai' && color === 'black');
    setState(savedState);
    setPendingFrom(null);
    setTimeControl('none'); // saved games don't currently persist a clock
    clock.reset();
    setScreen('playing');
  }

  function handleSquareClick(r: number, c: number) {
    if (clock.timedOut) return;
    if (state.status === 'checkmate' || state.status === 'stalemate') return;
    if (state.promotionPending) return;
    if (vsAI) {
      const aiColor: Color = playerColor === 'white' ? 'black' : 'white';
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
        if (isPawnPromotion) setPendingFrom([sr, sc]);
        setState(makeMove(state, [sr, sc], [r, c]));
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
    cancelAiTurn();
    setState(initGame());
    setPendingFrom(null);
    clock.reset();
    clearAiCache();
  }

  function goToMenu() {
    cancelAiTurn();
    setScreen('menu');
  }

  return {
    screen,
    vsAI,
    playerColor,
    state,
    flipped,
    showHints,
    showCoords,
    showSettings,
    boardTheme,
    aiThinking,
    timeControl,
    clock,
    setFlipped,
    setShowHints,
    setShowCoords,
    setShowSettings,
    setBoardTheme,
    handleStart,
    resumeGame,
    handleSquareClick,
    handlePromotion,
    resetGame,
    goToMenu,
  };
}