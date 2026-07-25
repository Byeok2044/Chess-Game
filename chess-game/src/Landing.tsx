import './Menu.css';

interface Props {
  onPlay: () => void;
  onSettings: () => void;
  onAbout: () => void;
  onPuzzles: () => void;
}

const HERO_POSITION: Record<number, string> = {
  0: '♜', 5: '♚', 7: '♜',
  9: '♟', 10: '♟', 13: '♟', 14: '♟', 15: '♟',
  19: '♞', 27: '♗', 35: '♙',
  41: '♘', 44: '♙',
  48: '♙', 49: '♙', 50: '♙', 53: '♙', 54: '♙', 55: '♙',
  56: '♖', 60: '♔', 63: '♖',
};

export default function Landing({ onPlay, onSettings, onAbout, onPuzzles }: Props) {
  return (
    <div className="hero-split">
      <div className="hero-left">
        <span className="hero-eyebrow">Tournament Hall</span>
        <h1 className="hero-title">
          Chess,<br />
          <em>sharpened.</em>
        </h1>
        <p className="hero-desc">
          Play a friend on one screen, challenge the engine, or send an invite
          code across the world. No account required to start.
        </p>

        <div className="hero-actions">
          <button className="hero-action primary" onClick={onPlay}>
            <span className="hero-action-label">Play</span>
            <span className="hero-action-arrow">→</span>
          </button>
          <button className="hero-action" onClick={onPuzzles}>
            <span className="hero-action-label">Puzzles</span>
            <span className="hero-action-arrow">→</span>
          </button>
          <button className="hero-action" onClick={onSettings}>
            <span className="hero-action-label">Settings</span>
            <span className="hero-action-arrow">→</span>
          </button>
          <button className="hero-action" onClick={onAbout}>
            <span className="hero-action-label">About</span>
            <span className="hero-action-arrow">→</span>
          </button>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-board" aria-hidden="true">
          {Array.from({ length: 64 }, (_, i) => {
            const r = Math.floor(i / 8);
            const c = i % 8;
            const isLight = (r + c) % 2 === 0;
            const glyph = HERO_POSITION[i];
            const isWhite = glyph && '♔♕♖♗♘♙'.includes(glyph);
            return (
              <div key={i} className={`hero-sq ${isLight ? 'light' : 'dark'}`}>
                {glyph && <span className={`piece ${isWhite ? 'white' : 'black'}`}>{glyph}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}