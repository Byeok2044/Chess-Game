// chess-game/src/Landing.tsx
import './Menu.css';
import './Landing.css';

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
const HERO_LAST_MOVE = new Set([44, 35]);

export default function Landing({ onPlay, onSettings, onAbout, onPuzzles }: Props) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-logo">
          <span className="landing-logo-piece">♟</span>
          <span className="landing-logo-text">Chess</span>
        </div>
        <nav className="landing-nav-links">
          <button className="landing-nav-link emphasis" onClick={onPlay}>Play</button>
          <button className="landing-nav-link" onClick={onPuzzles}>Puzzles</button>
          <button className="landing-nav-link" onClick={onSettings}>Settings</button>
          <button className="landing-nav-link" onClick={onAbout}>About</button>
        </nav>
      </header>

      <main className="hero-split">
        <div className="hero-left">
          <div className="hero-eyebrow">Local · Computer · Online</div>
          <h1 className="hero-title">
            Chess,<br /><em>unhurried.</em>
          </h1>
          <p className="hero-desc">
            Play across the table with a friend, test yourself against an
            engine that adjusts to your level, or start an online game with
            a six‑letter code. Nothing to install, nothing to sign up for
            to get started.
          </p>

          <div className="hero-meta">
            <span className="hero-meta-item"><strong>5</strong> AI difficulty levels</span>
            <span className="hero-meta-item"><strong>3</strong> tactics puzzles</span>
            <span className="hero-meta-item"><strong>∞</strong> or timed clocks</span>
          </div>

          <div className="hero-actions">
            <button className="hero-action primary" onClick={onPlay}>
              <span className="hero-action-text">
                <span className="hero-action-label">Play a game</span>
                <span className="hero-action-sub">Two players, vs computer, or online</span>
              </span>
              <span className="hero-action-arrow">→</span>
            </button>
            <button className="hero-action" onClick={onPuzzles}>
              <span className="hero-action-text">
                <span className="hero-action-label">Solve puzzles</span>
                <span className="hero-action-sub">From back-rank mates to forks</span>
              </span>
              <span className="hero-action-arrow">→</span>
            </button>
            <button className="hero-action" onClick={onSettings}>
              <span className="hero-action-text">
                <span className="hero-action-label">Customize the board</span>
                <span className="hero-action-sub">Themes, coordinates, sound</span>
              </span>
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
              const lastMove = HERO_LAST_MOVE.has(i);
              return (
                <div key={i} className={`hero-sq ${isLight ? 'light' : 'dark'} ${lastMove ? 'hero-sq-highlight' : ''}`}>
                  {glyph && <span className={`piece ${isWhite ? 'white' : 'black'}`}>{glyph}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}