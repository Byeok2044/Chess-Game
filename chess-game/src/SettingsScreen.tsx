import './Menu.css';
import './App.css';
import Settings from './Settings.tsx';
import type { BoardTheme } from './GameSettings.ts';

interface Props {
  showHints: boolean;
  showCoords: boolean;
  flipped: boolean;
  boardTheme: BoardTheme;
  soundEnabled: boolean;
  onToggleHints: () => void;
  onToggleCoords: () => void;
  onToggleFlipped: () => void;
  onToggleSound: () => void;
  onChangeBoardTheme: (theme: BoardTheme) => void;
  onBack: () => void;
}

export default function SettingsScreen({ onBack, ...settingsProps }: Props) {
  return (
    <div className="menu-root">
      <div className="menu-bg">
        <div className="menu-board-preview">
          {Array.from({ length: 64 }, (_, i) => (
            <div key={i} className={`menu-sq ${(Math.floor(i / 8) + i) % 2 === 0 ? 'light' : 'dark'}`} />
          ))}
        </div>
      </div>

      <div className="menu-content settings-screen-content">
        <div className="menu-logo">
          <span className="menu-logo-piece">♟</span>
          <h1 className="menu-title">Settings</h1>
        </div>
        <Settings {...settingsProps} />
        <button className="btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}