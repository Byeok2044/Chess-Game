import './Menu.css';

interface Props {
  onStart: (mode: 'two-player' | 'vs-ai', playerColor: 'white' | 'black') => void;
  onPlayOnline: () => void;
  resumeLabel: string | null;
  onResume: () => void;
  onBack: () => void;
}

export default function Menu({ onStart, onPlayOnline, resumeLabel, onResume, onBack }: Props) {
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

        {resumeLabel && (
          <button className="menu-card" style={{ width: '100%' }} onClick={onResume}>
            <div className="menu-card-label">↻ Resume game</div>
            <div className="menu-card-desc">{resumeLabel}</div>
          </button>
        )}

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

          <button className="menu-card" onClick={onPlayOnline}>
            <div className="menu-card-pieces">
              <span className="menu-card-piece white">♔</span>
              <span className="menu-card-vs">vs</span>
              <span className="menu-card-piece black">♚</span>
            </div>
            <div className="menu-card-label">Play Online</div>
            <div className="menu-card-desc">Challenge a friend remotely with an invite code</div>
          </button>
        </div>

        <button className="btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}