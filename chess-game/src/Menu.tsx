import './menu.css';

interface Props {
  onStart: (mode: 'two-player' | 'vs-ai', playerColor: 'white' | 'black') => void;
}

export default function Menu({ onStart }: Props) {
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
        <p className="menu-subtitle">Choose your game mode</p>

        <div className="menu-cards">
          <button className="menu-card" onClick={() => onStart('two-player', 'white')}>
            <div className="menu-card-pieces">
              <span className="menu-card-piece white">♔</span>
              <span className="menu-card-vs">vs</span>
              <span className="menu-card-piece black">♚</span>
            </div>
            <div className="menu-card-label">Two Players</div>
            <div className="menu-card-desc">Play with a friend on the same device</div>
          </button>

          <div className="menu-card ai-card">
            <div className="menu-card-pieces">
              <span className="menu-card-piece white">♔</span>
              <span className="menu-card-vs">vs</span>
              <span className="menu-card-piece ai-glow">♚</span>
            </div>
            <div className="menu-card-label">vs Computer</div>
            <div className="menu-card-desc">Choose your side</div>
            <div className="color-choice">
              <button
                className="color-btn white-btn"
                onClick={() => onStart('vs-ai', 'white')}
              >
                <span>♔</span> Play White
              </button>
              <button
                className="color-btn black-btn"
                onClick={() => onStart('vs-ai', 'black')}
              >
                <span>♚</span> Play Black
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}