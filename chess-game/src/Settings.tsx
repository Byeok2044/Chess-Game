import './App.css';
import { BOARD_THEMES } from './GameSettings.ts';
import type { BoardTheme } from './GameSettings.ts';

interface Props {
  showHints: boolean;
  showCoords: boolean;
  flipped: boolean;
  boardTheme: BoardTheme;
  onToggleHints: () => void;
  onToggleCoords: () => void;
  onToggleFlipped: () => void;
  onChangeBoardTheme: (theme: BoardTheme) => void;
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

export default function Settings({
  showHints,
  showCoords,
  flipped,
  boardTheme,
  onToggleHints,
  onToggleCoords,
  onToggleFlipped,
  onChangeBoardTheme,
}: Props) {
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

        <div className="setting-item" style={{ cursor: 'default' }}>
          <div className="setting-label">
            <span className="setting-icon">◈</span>
            <div>
              <div className="setting-name">Board theme</div>
              <div className="setting-desc">Square color palette</div>
            </div>
          </div>
          <div className="theme-swatches">
            {(Object.keys(BOARD_THEMES) as BoardTheme[]).map((key) => {
              const t = BOARD_THEMES[key];
              return (
                <button
                  key={key}
                  type="button"
                  className={`theme-swatch ${boardTheme === key ? 'active' : ''}`}
                  onClick={() => onChangeBoardTheme(key)}
                  title={t.name}
                  aria-label={`${t.name} board theme`}
                >
                  <span style={{ background: t.light }} />
                  <span style={{ background: t.dark }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}