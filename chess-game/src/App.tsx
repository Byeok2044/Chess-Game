import { useState, useEffect, useRef } from 'react';
import Board from './Board.tsx';
import Menu from './Menu.tsx';
import Settings from './Settings.tsx';
import GameHeader from './components/GameHeader.tsx';
import PlayerBar from './components/PlayerBar.tsx';
import MoveHistory from './components/MoveHistory.tsx';
import StatusCard from './components/StatusCard.tsx';
import OnlineLobby from './OnlineLobby.tsx';
import MultiplayerGame from './MultiplayerGame.tsx';
import { useChessGame } from './hooks/useChessGame.ts';
import { materialScore } from './utils/Material.ts';
import { capturedIconsFor } from './utils/CapturedIcons.ts';
import { useAuth } from './lib/AuthContext.tsx';
import { saveGame, listSavedGames, deleteSavedGame } from './lib/gameSync.ts';
import { saveGuestGame, loadGuestGame, clearGuestGame } from './lib/localSave.ts';
import type { Color, GameState } from './Chess.ts';
import './App.css';

type View = 'menu' | 'local' | 'online-lobby' | 'multiplayer';

interface ResumableGame {
  source: 'guest' | 'cloud';
  id?: string;
  mode: 'two-player' | 'vs-ai';
  aiColor: 'white' | 'black' | null;
  state: GameState;
}

export default function App() {
  const [view, setView] = useState<View>('menu');
  const [multiplayerGameId, setMultiplayerGameId] = useState<string | null>(null);
  const [multiplayerColor, setMultiplayerColor] = useState<Color>('white');
  const [resumable, setResumable] = useState<ResumableGame | null>(null);
  const { session } = useAuth();
  const savedGameIdRef = useRef<string | undefined>(undefined);

  const {
    vsAI, playerColor, state, flipped,
    showHints, showCoords, showSettings, aiThinking,
    setShowHints, setShowCoords, setShowSettings, setFlipped,
    handleStart, resumeGame, handleSquareClick, handlePromotion, resetGame, goToMenu,
  } = useChessGame();

  useEffect(() => {
    if (view !== 'menu') return;
    let cancelled = false;

    if (session?.user) {
      listSavedGames(session.user.id).then(({ data }) => {
        if (cancelled) return;
        const latest = data[0];
        setResumable(
          latest
            ? { source: 'cloud', id: latest.id, mode: latest.mode, aiColor: latest.ai_color, state: latest.board_state }
            : null
        );
      });
    } else {
      const guest = loadGuestGame();
      setResumable(guest ? { source: 'guest', mode: guest.mode, aiColor: guest.aiColor, state: guest.state } : null);
    }

    return () => {
      cancelled = true;
    };
  }, [view, session?.user?.id]);

  function discardActiveSave() {
    if (savedGameIdRef.current) {
      deleteSavedGame(savedGameIdRef.current);
      savedGameIdRef.current = undefined;
    }
    clearGuestGame();
  }

  function startLocal(mode: 'two-player' | 'vs-ai', color: Color) {
    discardActiveSave();
    handleStart(mode, color);
    setView('local');
  }

  function handleNewGame() {
    discardActiveSave();
    resetGame();
  }

  function handleResume() {
    if (!resumable) return;
    const color: Color =
      resumable.mode === 'vs-ai'
        ? resumable.aiColor === 'white' ? 'black' : 'white'
        : 'white';
    savedGameIdRef.current = resumable.source === 'cloud' ? resumable.id : undefined;
    resumeGame(resumable.mode, color, resumable.state);
    setView('local');
  }

  function backToMenu() {
    goToMenu();
    setView('menu');
  }

  function enterMultiplayerGame(gameId: string, color: Color) {
    setMultiplayerGameId(gameId);
    setMultiplayerColor(color);
    setView('multiplayer');
  }

  useEffect(() => {
    if (view !== 'local') return;
    if (state.moveHistory.length === 0) return;

    const mode: 'two-player' | 'vs-ai' = vsAI ? 'vs-ai' : 'two-player';
    const aiColorForSave: Color | null = vsAI ? (playerColor === 'white' ? 'black' : 'white') : null;
    const finished = state.status === 'checkmate' || state.status === 'stalemate';

    if (!session?.user) {
      if (finished) {
        clearGuestGame();
        return;
      }
      const timeout = setTimeout(() => {
        saveGuestGame(mode, aiColorForSave, state);
      }, 800);
      return () => clearTimeout(timeout);
    }

    if (finished) {
      if (savedGameIdRef.current) {
        deleteSavedGame(savedGameIdRef.current);
        savedGameIdRef.current = undefined;
      }
      return;
    }

    const timeout = setTimeout(() => {
      saveGame(session.user!.id, state, mode, aiColorForSave, 'Untitled game', savedGameIdRef.current).then(
        ({ data }) => {
          if (data) savedGameIdRef.current = data.id;
        }
      );
    }, 800);

    return () => clearTimeout(timeout);
  }, [state, view, vsAI, playerColor, session?.user?.id]);

  const resumeLabel = resumable
    ? resumable.mode === 'vs-ai'
      ? `vs Computer · ${resumable.state.moveHistory.length} moves played`
      : `Two Players · ${resumable.state.moveHistory.length} moves played`
    : null;

  if (view === 'menu') {
    return (
      <Menu
        onStart={startLocal}
        onPlayOnline={() => setView('online-lobby')}
        resumeLabel={resumeLabel}
        onResume={handleResume}
      />
    );
  }

  if (view === 'online-lobby') {
    return <OnlineLobby onEnterGame={enterMultiplayerGame} onBack={() => setView('menu')} />;
  }

  if (view === 'multiplayer' && multiplayerGameId) {
    return (
      <MultiplayerGame
        gameId={multiplayerGameId}
        playerColor={multiplayerColor}
        onExit={() => { setMultiplayerGameId(null); setView('menu'); }}
      />
    );
  }

  const scores = materialScore(state);
  const whiteLead = scores.white - scores.black;
  const blackLead = scores.black - scores.white;
  const aiColor = playerColor === 'white' ? 'black' : 'white';
  const blackLabel = vsAI ? (aiColor === 'black' ? 'Computer' : 'You') : 'Black';
  const whiteLabel = vsAI ? (playerColor === 'white' ? 'You' : 'Computer') : 'White';
  const displayState = showHints ? state : { ...state, validMoves: [] };

  return (
    <div className="app">
      <GameHeader
        showSettings={showSettings}
        onMenu={backToMenu}
        onNewGame={handleNewGame}
        onToggleSettings={() => setShowSettings((s) => !s)}
      />

      {showSettings && (
        <Settings
          showHints={showHints}
          showCoords={showCoords}
          flipped={flipped}
          onToggleHints={() => setShowHints((h) => !h)}
          onToggleCoords={() => setShowCoords((c) => !c)}
          onToggleFlipped={() => setFlipped((f) => !f)}
        />
      )}

      <main className="main">
        <div className="game-layout">
          <PlayerBar
            label={blackLabel}
            avatarIcon={vsAI && aiColor === 'black' ? '🤖' : '♚'}
            avatarClass={vsAI && aiColor === 'black' ? 'ai-avatar' : 'black-avatar'}
            capturedIcons={capturedIconsFor(state.capturedByBlack, 'white')}
            lead={blackLead}
            thinking={vsAI && aiThinking && aiColor === 'black'}
          />

          <Board
            state={displayState}
            onSquareClick={handleSquareClick}
            onPromotion={handlePromotion}
            flipped={flipped}
            showCoordinates={showCoords}
            showValidMoves={showHints}
          />

          <PlayerBar
            label={whiteLabel}
            avatarIcon={vsAI && aiColor === 'white' ? '🤖' : '♔'}
            avatarClass={vsAI && aiColor === 'white' ? 'ai-avatar' : 'white-avatar'}
            capturedIcons={capturedIconsFor(state.capturedByWhite, 'black')}
            lead={whiteLead}
            thinking={vsAI && aiThinking && aiColor === 'white'}
          />
        </div>

        <aside className="side-panel">
          <StatusCard state={state} aiThinking={aiThinking} onPlayAgain={handleNewGame} />
          <MoveHistory moveHistory={state.moveHistory} />
        </aside>
      </main>
    </div>
  );
}