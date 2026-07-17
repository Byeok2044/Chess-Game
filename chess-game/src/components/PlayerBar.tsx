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

  return (
    <div className="player-bar">
      <span className={`player-avatar ${avatarClass}`}>{avatarIcon}</span>
      <span className="player-name">
        {label}{lead > 0 && ` +${lead}`}
      </span>
      <span className="captured-pieces">{capturedIcons.join('')}</span>
      {thinking && <span className="thinking">thinking…</span>}
      {timeMs !== undefined && (
        <span className={`player-clock ${clockActive ? 'active-clock' : ''} ${lowTime ? 'low-time' : ''}`}>
          {formatClock(timeMs)}
        </span>
      )}
    </div>
  );
}