import './App.css';

interface Props {
  showHints: boolean;
  showCoords: boolean;
  flipped: boolean;
  onToggleHints: () => void;
  onToggleCoords: () => void;
  onToggleFlipped: () => void;
}

interface ToggleRowProps {
  icon: string;
  name: string;
  desc: string;
  value: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon, name, desc, value, onToggle }: ToggleRowProps) {
  return (
    <div className="setting-item" onClick={onToggle} role="switch" aria-checked={value} style={{ cursor: 'pointer' }}>
      <div className="setting-label">
        <span className="setting-icon">{icon}</span>
        <div>
          <div className="setting-name">{name}</div>
          <div className="setting-desc">{desc}</div>
        </div>
      </div>
      <div className={`toggle ${value ? 'on' : ''}`}>
        <div className="toggle-thumb" />
      </div>
    </div>
  );
}

export default function Settings({ showHints, showCoords, flipped, onToggleHints, onToggleCoords, onToggleFlipped }: Props) {
  return (
    <div className="settings-bar">
      <div className="settings-grid">
        <ToggleRow
          icon="◉"
          name="Show valid moves"
          desc="Highlight legal squares"
          value={showHints}
          onToggle={onToggleHints}
        />
        <ToggleRow
          icon="⊞"
          name="Board coordinates"
          desc="Show ranks and files"
          value={showCoords}
          onToggle={onToggleCoords}
        />
        <ToggleRow
          icon="⇅"
          name="Flipped board"
          desc="Black side at bottom"
          value={flipped}
          onToggle={onToggleFlipped}
        />
      </div>
    </div>
  );
}