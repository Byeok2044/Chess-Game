import './Menu.css';

interface Props {
  onPlay: () => void;
  onSettings: () => void;
  onAbout: () => void;
}

export default function Landing({ onPlay, onSettings, onAbout }: Props) {
  return (
    <div className="menu-root">
      <div className="menu-bg">
        <div className="menu-board-preview">
          {Array.from({ length: 64 }, (_, i) => (
            <div key={i} className={`menu-sq ${(Math.floor(i / 8) + i) % 2 === 0 ? 'light' : 'dark'}`} />
          ))}
        </div>
      </div>

      <div className="menu-content">
        <div className="menu-logo">
          <span className="menu-logo-piece">♟</span>
          <h1 className="menu-title">Chess</h1>
        </div>
        <p className="menu-subtitle">A classic game, reimagined</p>

        <div className="landing-cards">
          <button className="menu-card landing-card" onClick={onPlay}>
            <div className="menu-card-label">Play</div>
          </button>
          <button className="menu-card landing-card" onClick={onSettings}>
            <div className="menu-card-label">Settings</div>
          </button>
          <button className="menu-card landing-card" onClick={onAbout}>
            <div className="menu-card-label">About</div>
          </button>
        </div>
      </div>
    </div>
  );
}