import './Landing.css';

interface Props {
  onPlay: () => void;
  onSettings: () => void;
  onAbout: () => void;
  onPuzzles: () => void;
}

// A fixed, recognizable mid-game position — decorative, not a live board —
// so the hero shows real play instead of an empty checkerboard.
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
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-logo">
          <span className="landing-logo-piece">♟</span>
          <span className="landing-logo-text">Chess</span>
        </div>
        <nav className="landing-nav-links">
          <button className="landing-nav-link" onClick={onPlay}>Play</button>
          <button className="landing-nav-link" onClick={onPuzzles}>Puzzles</button>
          <button className="landing-nav-link" onClick={onSettings}>Settings</button>
          <button className="landing-nav-link" onClick={onAbout}>About</button>
        </nav>
      </header>

      <main className="landing-hero">
        <div className="landing-board" aria-hidden="true">
          {Array.from({ length: 64 }, (_, i) => {
            const r = Math.floor(i / 8);
            const c = i % 8;
            const isLight = (r + c) % 2 === 0;
            const glyph = HERO_POSITION[i];
            const isWhite = glyph && '♔♕♖♗♘♙'.includes(glyph);
            return (
              <div key={i} className={`landing-sq ${isLight ? 'light' : 'dark'}`}>
                {glyph && <span className={`piece ${isWhite ? 'white' : 'black'}`}>{glyph}</span>}
              </div>
            );
          })}
        </div>

        <div className="landing-actions">
          <button className="landing-cta primary" onClick={onPlay}>
            <span className="landing-cta-icon">♞</span>Play
          </button>
          <button className="landing-cta" onClick={onPuzzles}>
            <span className="landing-cta-icon">♛</span>Puzzles
          </button>
          <button className="landing-cta" onClick={onSettings}>
            <span className="landing-cta-icon">⚙</span>Settings
          </button>
        </div>
      </main>
    </div>
  );
}