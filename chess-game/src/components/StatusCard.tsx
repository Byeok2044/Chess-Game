import type { GameState } from '../Chess.ts';

interface Props {
  state: GameState;
  aiThinking: boolean;
  onPlayAgain: () => void;
}

export default function StatusCard({ state, aiThinking, onPlayAgain }: Props) {
  const statusMsg = {
    checkmate: `Checkmate — ${state.turn === 'white' ? 'Black' : 'White'} wins`,
    stalemate: 'Stalemate — Draw',
    check: `${state.turn === 'white' ? 'White' : 'Black'} is in check`,
    playing: aiThinking ? 'Computer is thinking…' : `${state.turn === 'white' ? 'White' : 'Black'} to move`,
  }[state.status];

  const gameOver = state.status === 'checkmate' || state.status === 'stalemate';

  return (
    <>
      <div className={`status-card ${state.status}`}>
        <div className="status-dot" />
        <span>{statusMsg}</span>
      </div>
      {gameOver && (
        <button className="btn-primary" onClick={onPlayAgain}>Play again</button>
      )}
    </>
  );
}