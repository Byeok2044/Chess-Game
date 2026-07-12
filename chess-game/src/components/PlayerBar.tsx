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

export default function PlayerBar({ label, avatarIcon, avatarClass, capturedIcons, lead, thinking, timeMs, clockActive }: Props) {
  const lowTime = timeMs !== undefined && timeMs <= 30000;

  return (
    <div className="player-bar">
      <div className="player-info">
        <div className={`player-avatar ${avatarClass}`}>{avatarIcon}</div>
        <div>
          <div className="player-name">{label}</div>
          {lead > 0 && <div className="material-lead">+{lead}</div>}
        </div>
      </div>
      <div className="captured-pieces">
        {capturedIcons.map((icon, i) => (
          <span key={i} className="captured">{icon}</span>
        ))}
      </div>
      {timeMs !== undefined && (
        <div className={`player-clock ${clockActive ? 'active-clock' : ''} ${lowTime ? 'low-time' : ''}`}>
          {formatClock(timeMs)}
        </div>
      )}
      {thinking && (
        <div className="thinking-dots"><span /><span /><span /></div>
      )}
    </div>
  );
}