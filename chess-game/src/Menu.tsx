import { useState } from 'react';
import './Menu.css';
import { TIME_CONTROLS, DIFFICULTIES } from './GameSettings.ts';
import type { TimeControl, Difficulty } from './GameSettings.ts';

interface Props {
  onStart: (
    mode: 'two-player' | 'vs-ai',
    playerColor: 'white' | 'black',
    timeControl?: TimeControl,
    difficulty?: Difficulty
  ) => void;
  onPlayOnline: () => void;
  resumeLabel: string | null;
  onResume: () => void;
  onBack: () => void;
}

type PickedMode = 'two-player' | 'vs-ai' | null;

export default function Menu({ onStart, onPlayOnline, resumeLabel, onResume, onBack }: Props) {
  const [pickedMode, setPickedMode] = useState<PickedMode>(null);
  const [twoPlayerTimeControl, setTwoPlayerTimeControl] = useState<TimeControl>('none');
  const [aiTimeControl, setAiTimeControl] = useState<TimeControl>('none');
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('medium');

  function reset() {
    setPickedMode(null);
  }

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

        {/* ── Step 1: choose a mode ───────────────────────── */}
        {pickedMode === null && (
          <>
            <p className="menu-subtitle">Choose your game mode</p>

            {resumeLabel && (
              <button className="menu-card" style={{ width: '100%' }} onClick={onResume}>
                <div className="menu-card-label">↻ Resume game</div>
                <div className="menu-card-desc">{resumeLabel}</div>
              </button>
            )}

            <div className="menu-cards">
              <button className="menu-card" onClick={() => setPickedMode('two-player')}>
                <div className="menu-card-pieces">
                  <span className="menu-card-piece white">♔</span>
                  <span className="menu-card-vs">vs</span>
                  <span className="menu-card-piece black">♚</span>
                </div>
                <div className="menu-card-label">Two Players</div>
                <div className="menu-card-desc">Play with a friend on the same device</div>
              </button>

              <button className="menu-card" onClick={() => setPickedMode('vs-ai')}>
                <div className="menu-card-pieces">
                  <span className="menu-card-piece white">♔</span>
                  <span className="menu-card-vs">vs</span>
                  <span className="menu-card-piece ai-glow">♚</span>
                </div>
                <div className="menu-card-label">vs Computer</div>
                <div className="menu-card-desc">Play against the AI</div>
              </button>

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
          </>
        )}

        {/* ── Step 2a: two-player setup ───────────────────── */}
        {pickedMode === 'two-player' && (
          <>
            <p className="menu-subtitle">Two Players</p>

            <div className="menu-card ai-card" style={{ width: '100%', maxWidth: 420 }}>
              <div className="menu-card-pieces">
                <span className="menu-card-piece white">♔</span>
                <span className="menu-card-vs">vs</span>
                <span className="menu-card-piece black">♚</span>
              </div>
              <div className="menu-card-label">Clock</div>
              <div className="menu-card-desc">Play with a friend on the same device</div>

              <div className="time-choice">
                {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((tc) => (
                  <button
                    key={tc}
                    type="button"
                    className={`time-btn ${twoPlayerTimeControl === tc ? 'active' : ''}`}
                    onClick={() => setTwoPlayerTimeControl(tc)}
                    title={TIME_CONTROLS[tc].desc}
                  >
                    {tc === 'none' ? 'No timer' : TIME_CONTROLS[tc].label}
                  </button>
                ))}
              </div>

              <button
                className="btn-primary"
                style={{ marginTop: 10 }}
                onClick={() => onStart('two-player', 'white', twoPlayerTimeControl)}
              >
                Start Game
              </button>
            </div>

            <button className="btn-ghost" onClick={reset}>← Back</button>
          </>
        )}

        {/* ── Step 2b: vs-AI setup ────────────────────────── */}
        {pickedMode === 'vs-ai' && (
          <>
            <p className="menu-subtitle">vs Computer</p>

            <div className="menu-card ai-card" style={{ width: '100%', maxWidth: 420 }}>
              <div className="menu-card-pieces">
                <span className="menu-card-piece white">♔</span>
                <span className="menu-card-vs">vs</span>
                <span className="menu-card-piece ai-glow">♚</span>
              </div>
              <div className="menu-card-label">Difficulty &amp; Clock</div>
              <div className="menu-card-desc">Choose your side, difficulty, and clock</div>

              <div className="time-choice">
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`time-btn ${aiDifficulty === d ? 'active' : ''}`}
                    onClick={() => setAiDifficulty(d)}
                    title={DIFFICULTIES[d].desc}
                  >
                    {DIFFICULTIES[d].label}
                  </button>
                ))}
              </div>

              <div className="time-choice">
                {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((tc) => (
                  <button
                    key={tc}
                    type="button"
                    className={`time-btn ${aiTimeControl === tc ? 'active' : ''}`}
                    onClick={() => setAiTimeControl(tc)}
                    title={TIME_CONTROLS[tc].desc}
                  >
                    {tc === 'none' ? 'No timer' : TIME_CONTROLS[tc].label}
                  </button>
                ))}
              </div>

              <div className="color-choice">
                <button
                  className="color-btn white-btn"
                  onClick={() => onStart('vs-ai', 'white', aiTimeControl, aiDifficulty)}
                >
                  <span>♔</span> Play White
                </button>
                <button
                  className="color-btn black-btn"
                  onClick={() => onStart('vs-ai', 'black', aiTimeControl, aiDifficulty)}
                >
                  <span>♚</span> Play Black
                </button>
              </div>
            </div>

            <button className="btn-ghost" onClick={reset}>← Back</button>
          </>
        )}
      </div>
    </div>
  );
}