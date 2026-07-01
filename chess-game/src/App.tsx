import { useState } from 'react';
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
import type { Color } from './Chess.ts';
import './App.css';

type View = 'menu' | 'local' | 'online-lobby' | 'multiplayer';

export default function App() {
  const [view, setView] = useState<View>('menu');
  const [multiplayerGameId, setMultiplayerGameId] = useState<string | null>(null);
  const [multiplayerColor, setMultiplayerColor] = useState<Color>('white');

  const {
    vsAI, playerColor, state, flipped,
    showHints, showCoords, showSettings, aiThinking,
    setShowHints, setShowCoords, setShowSettings, setFlipped,
    handleStart, handleSquareClick, handlePromotion, resetGame, goToMenu,
  } = useChessGame();

  function startLocal(mode: 'two-player' | 'vs-ai', color: Color) {
    handleStart(mode, color);
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

  if (view === 'menu') {
    return <Menu onStart={startLocal} onPlayOnline={() => setView('online-lobby')} />;
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
        onNewGame={resetGame}
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
          <StatusCard state={state} aiThinking={aiThinking} onPlayAgain={resetGame} />
          <MoveHistory moveHistory={state.moveHistory} />
        </aside>
      </main>
    </div>
  );
}