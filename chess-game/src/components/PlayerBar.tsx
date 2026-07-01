interface Props {
  label: string;
  avatarIcon: string;
  avatarClass: string;
  capturedIcons: string[];
  lead: number;
  thinking: boolean;
}

export default function PlayerBar({ label, avatarIcon, avatarClass, capturedIcons, lead, thinking }: Props) {
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
      {thinking && (
        <div className="thinking-dots"><span /><span /><span /></div>
      )}
    </div>
  );
}