interface Props {
  showSettings: boolean;
  onMenu: () => void;
  onNewGame: () => void;
  onToggleSettings: () => void;
}

export default function GameHeader({ showSettings, onMenu, onNewGame, onToggleSettings }: Props) {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-piece">♟</span>
        <span className="logo-text">Chess</span>
      </div>
      <div className="header-actions">
        <button className="btn-ghost" onClick={onMenu}>← Menu</button>
        <button className="btn-ghost" onClick={onNewGame}>↺ New game</button>
        <button
          className={`btn-ghost ${showSettings ? 'active' : ''}`}
          onClick={onToggleSettings}
        >
          ⚙ Settings
        </button>
      </div>
    </header>
  );
}