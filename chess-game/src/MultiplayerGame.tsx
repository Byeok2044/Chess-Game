import { useEffect, useState } from 'react';
import Board from './Board.tsx';
import StatusCard from './components/StatusCard.tsx';
import MoveHistory from './components/MoveHistory.tsx';
import PlayerBar from './components/PlayerBar.tsx';
import { legalMoves, makeMove } from './Chess.ts';
import type { PieceType, GameState } from './Chess.ts';
import { useMultiplayerGame, usePresenceAbandonment, pushMove, resignGame } from './lib/gameSync.ts';
import { useAuth } from './lib/AuthContext.tsx';
import { capturedIconsFor } from './utils/capturedIcons.ts';
import { materialScore } from './utils/Material.ts';

interface Props {
  gameId: string;
  playerColor: 'white' | 'black';
  onExit: () => void;
}

export default function MultiplayerGame({ gameId, playerColor, onExit }: Props) {
  const { session } = useAuth();
  const game = useMultiplayerGame(gameId);
  const { opponentOnline } = usePresenceAbandonment(gameId, game, playerColor, session?.user?.id ?? null);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [pendingFrom, setPendingFrom] = useState<[number, number] | null>(null);

  useEffect(() => {
    setSelected(null);
    setValidMoves([]);
  }, [game?.turn]);

  if (!game) {
    return (
      <div className="menu-root">
        <div className="menu-content">
          <p>Loading game…</p>
          <button className="btn-ghost" onClick={onExit}>← Back</button>
        </div>
      </div>
    );
  }

  if (game.status === 'waiting') {
    return (
      <div className="menu-root">
        <div className="menu-content">
          <h1 className="menu-title" style={{ fontSize: 40 }}>Waiting for opponent…</h1>
          <p>Share this code:</p>
          <code style={{ fontSize: 28, letterSpacing: 4 }}>{game.invite_code}</code>
          <button className="btn-ghost" onClick={onExit}>← Back</button>
        </div>
      </div>
    );
  }

  const boardState = game.board_state;
  const myTurn = game.turn === playerColor && game.status === 'active';
  const displayState: GameState = { ...boardState, selected, validMoves };
  const gameOver = game.status === 'finished' || game.status === 'abandoned';

  async function handleLeave() {
    if (game?.status === 'active') {
      const ok = window.confirm('Leaving now forfeits the game. Are you sure?');
      if (!ok) return;
      await resignGame(gameId, playerColor);
    }
    onExit();
  }

  function handleSquareClick(r: number, c: number) {
    if (!myTurn) return;
    if (boardState.status === 'checkmate' || boardState.status === 'stalemate') return;
    if (boardState.promotionPending) return;

    const piece = boardState.board[r][c];

    if (selected) {
      const [sr, sc] = selected;
      const moves = legalMoves(boardState, sr, sc);
      const isValid = moves.some(([vr, vc]) => vr === r && vc === c);

      if (isValid) {
        const movingPiece = boardState.board[sr][sc]!;
        const isPromotion = movingPiece.type === 'pawn' && (r === 0 || r === 7);
        const next = makeMove(boardState, [sr, sc], [r, c]);
        if (isPromotion) setPendingFrom([sr, sc]);
        setSelected(null);
        setValidMoves([]);
        pushMove(gameId, next, next.turn);
        return;
      }

      if (piece && piece.color === playerColor) {
        setSelected([r, c]);
        setValidMoves(legalMoves(boardState, r, c));
        return;
      }

      setSelected(null);
      setValidMoves([]);
      return;
    }

    if (piece && piece.color === playerColor) {
      setSelected([r, c]);
      setValidMoves(legalMoves(boardState, r, c));
    }
  }

  function handlePromotion(type: PieceType) {
    if (!boardState.promotionPending || !pendingFrom) return;
    const [tr, tc] = boardState.promotionPending;
    const [fr, fc] = pendingFrom;
    const next = makeMove({ ...boardState, promotionPending: null }, [fr, fc], [tr, tc], type);
    setPendingFrom(null);
    pushMove(gameId, next, next.turn);
  }

  const scores = materialScore(boardState);
  const whiteLead = scores.white - scores.black;
  const blackLead = scores.black - scores.white;

  const resultMessage = gameOver
    ? game.winner === 'draw'
      ? 'Draw'
      : game.winner === playerColor
        ? (game.status === 'abandoned' ? 'You win — your opponent disconnected' : 'You win — your opponent resigned')
        : (game.status === 'abandoned' ? 'You lose — you disconnected' : 'You lose — you resigned')
    : null;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-piece">♟</span>
          <span className="logo-text">Chess</span>
        </div>
        <div className="header-actions">
          <button className="btn-ghost" onClick={handleLeave}>
            {gameOver ? '← Back to menu' : '← Leave game'}
          </button>
        </div>
      </header>

      {game?.status === 'active' && !opponentOnline && (
        <div className="status-card check" style={{ margin: '12px 24px 0', borderRadius: 10 }}>
          <div className="status-dot" />
          <span>Your opponent seems to have disconnected — you'll win by forfeit if they don't return soon.</span>
        </div>
      )}

      <main className="main">
        <div className="game-layout">
          <PlayerBar
            label={playerColor === 'black' ? 'You' : 'Opponent'}
            avatarIcon="♚"
            avatarClass="black-avatar"
            capturedIcons={capturedIconsFor(boardState.capturedByBlack, 'white')}
            lead={blackLead}
            thinking={false}
          />

          <Board
            state={displayState}
            onSquareClick={handleSquareClick}
            onPromotion={handlePromotion}
            flipped={playerColor === 'black'}
            showCoordinates={true}
            showValidMoves={true}
          />

          <PlayerBar
            label={playerColor === 'white' ? 'You' : 'Opponent'}
            avatarIcon="♔"
            avatarClass="white-avatar"
            capturedIcons={capturedIconsFor(boardState.capturedByWhite, 'black')}
            lead={whiteLead}
            thinking={false}
          />
        </div>

        <aside className="side-panel">
          {gameOver ? (
            <>
              <div className="status-card checkmate">
                <div className="status-dot" />
                <span>{resultMessage}</span>
              </div>
              <button className="btn-primary" onClick={onExit}>Back to menu</button>
            </>
          ) : (
            <StatusCard state={boardState} aiThinking={false} onPlayAgain={onExit} />
          )}
          <MoveHistory moveHistory={boardState.moveHistory} />
        </aside>
      </main>
    </div>
  );
}