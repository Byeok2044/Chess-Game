import type { GameState, Color } from '../Chess.ts';

interface Props {
  state: GameState;
  aiThinking: boolean;
  onPlayAgain: () => void;
  timedOut?: Color | null;
}

export default function StatusCard({ state, aiThinking, onPlayAgain, timedOut }: Props) {
  const statusMsg = timedOut
    ? `${timedOut === 'white' ? 'Black' : 'White'} wins on time`
    : {
        checkmate: `Checkmate — ${state.turn === 'white' ? 'Black' : 'White'} wins`,
        stalemate: 'Stalemate',
        check: `${state.turn === 'white' ? 'White' : 'Black'} in check`,
        playing: aiThinking ? 'Thinking…' : `${state.turn === 'white' ? 'White' : 'Black'} to move`,
      }[state.status];

  const gameOver = !!timedOut || state.status === 'checkmate' || state.status === 'stalemate';

  return (
    <div className={`status-card ${timedOut ? 'checkmate' : state.status}`}>
      <span>{statusMsg}</span>
      {gameOver && <button className="btn-primary" onClick={onPlayAgain}>Play again</button>}
    </div>
  );
}