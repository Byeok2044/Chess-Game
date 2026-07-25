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
      <div className="landing-board-frame" aria-hidden="true">
        <div className="hero-board">
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

      <div className="landing-scrim" aria-hidden="true" />

      <main className="landing-content">
        <h1 className="landing-title">Chess</h1>

        <div className="landing-actions">
          <button className="landing-action primary" onClick={onPlay}>Play</button>
          <button className="landing-action" onClick={onPuzzles}>Puzzles</button>
          <button className="landing-action" onClick={onSettings}>Settings</button>
          <button className="landing-action" onClick={onAbout}>About</button>
        </div>
      </main>
    </div>
  );
}