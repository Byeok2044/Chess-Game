// chess-game/src/components/PlayerBar.tsx
import { formatClock } from '../utils/formatTime.ts';

interface Props {
  label: string;
  avatarIcon: string;
  avatarClass: string;
  capturedIcons: string[];
  lead: number;
  thinking: boolean;
  timeMs?: number;
  clockActive?: boolean;
}

export default function PlayerBar({
  label, avatarIcon, avatarClass, capturedIcons, lead, thinking, timeMs, clockActive,
}: Props) {
  const lowTime = timeMs !== undefined && timeMs <= 30000;
  const criticalTime = timeMs !== undefined && timeMs <= 10000;

  return (
    <div className="player-bar">
      <span className={`player-avatar ${avatarClass}`}>{avatarIcon}</span>
      <span className="player-name">
        {label}{lead > 0 && ` +${lead}`}
      </span>
      <span className="captured-pieces">{capturedIcons.join('')}</span>
      {thinking && <span className="thinking">thinking…</span>}
      {timeMs !== undefined && (
        <span
          className={`player-clock ${clockActive ? 'active-clock' : ''} ${lowTime ? 'low-time' : ''} ${criticalTime && clockActive ? 'critical-time' : ''}`}
          aria-live={criticalTime && clockActive ? 'assertive' : undefined}
        >
          {formatClock(timeMs)}
        </span>
      )}
    </div>
  );
}