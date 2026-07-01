import Board from './Board.tsx';
import Menu from './Menu.tsx';
import Settings from './Settings.tsx';
import GameHeader from './components/GameHeader.tsx';
import PlayerBar from './components/PlayerBar.tsx';
import MoveHistory from './components/MoveHistory.tsx';
import StatusCard from './components/StatusCard.tsx';
import { useChessGame } from './hooks/useChessGame.ts';
import { materialScore } from './utils/Material.ts';
import { capturedIconsFor } from './utils/CapturedIcons.ts';
import './App.css';

export default function App() {
  const {
    screen, vsAI, playerColor, state, flipped,
    showHints, showCoords, showSettings, aiThinking,
    setShowHints, setShowCoords, setShowSettings, setFlipped,
    handleStart, handleSquareClick, handlePromotion, resetGame, goToMenu,
  } = useChessGame();

  if (screen === 'menu') return <Menu onStart={handleStart} />;

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
        onMenu={goToMenu}
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