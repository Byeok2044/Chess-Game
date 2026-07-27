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
          <div className="menu-step" key="step-select">
            <p className="menu-subtitle">Choose your game mode</p>

            {resumeLabel && (
              <button className="resume-banner" onClick={onResume}>
                <span className="resume-icon" aria-hidden="true">♟</span>
                <span className="resume-text">
                  <span className="resume-eyebrow">Resume</span>
                  <span className="resume-title">Continue your game</span>
                  <span className="resume-desc">{resumeLabel}</span>
                </span>
                <span className="resume-arrow" aria-hidden="true">→</span>
              </button>
            )}

            <div className="menu-cards">
              <button
                className="menu-card mode-card mode-card--two-player"
                onClick={() => setPickedMode('two-player')}
              >
                <span className="mode-icon-badge">
                  <span className="menu-card-piece white">♔</span>
                  <span className="menu-card-vs">vs</span>
                  <span className="menu-card-piece black">♚</span>
                </span>
                <div className="menu-card-label">Two Players</div>
                <div className="menu-card-desc">Play with a friend on the same device</div>
              </button>

              <button
                className="menu-card mode-card mode-card--ai"
                onClick={() => setPickedMode('vs-ai')}
              >
                <span className="mode-icon-badge">
                  <span className="menu-card-piece white">♔</span>
                  <span className="menu-card-vs">vs</span>
                  <span className="menu-card-piece ai-glow">♚</span>
                </span>
                <div className="menu-card-label">vs Computer</div>
                <div className="menu-card-desc">Play against the AI</div>
              </button>

              <button className="menu-card mode-card mode-card--online" onClick={onPlayOnline}>
                <span className="mode-icon-badge">
                  <span className="menu-card-piece white">♔</span>
                  <span className="menu-card-vs">vs</span>
                  <span className="menu-card-piece black">♚</span>
                </span>
                <div className="menu-card-label">Play Online</div>
                <div className="menu-card-desc">Challenge a friend remotely with an invite code</div>
              </button>
            </div>

            <button className="btn-ghost" onClick={onBack}>← Back</button>
          </div>
        )}

        {/* ── Step 2a: two-player setup ───────────────────── */}
        {pickedMode === 'two-player' && (
          <div className="menu-step" key="step-two-player">
            <p className="menu-subtitle">Two Players</p>

            <div className="config-panel config-panel--two-player">
              <div className="config-panel-head">
                <span className="mode-icon-badge">
                  <span className="menu-card-piece white">♔</span>
                  <span className="menu-card-vs">vs</span>
                  <span className="menu-card-piece black">♚</span>
                </span>
                <div>
                  <div className="menu-card-label">Same-device match</div>
                  <div className="menu-card-desc">Play with a friend, taking turns on this screen</div>
                </div>
              </div>

              <div className="config-section">
                <div className="config-section-label">Clock</div>
                <div className="time-choice">
                  {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((tc) => (
                    <button
                      key={tc}
                      type="button"
                      className={`time-btn ${twoPlayerTimeControl === tc ? 'active' : ''}`}
                      onClick={() => setTwoPlayerTimeControl(tc)}
                      aria-pressed={twoPlayerTimeControl === tc}
                    >
                      {tc === 'none' ? 'No timer' : TIME_CONTROLS[tc].label}
                    </button>
                  ))}
                </div>
                <p className="config-section-caption">
                  {twoPlayerTimeControl === 'none' ? 'Unlimited — play at your own pace' : TIME_CONTROLS[twoPlayerTimeControl].desc}
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={() => onStart('two-player', 'white', twoPlayerTimeControl)}
              >
                Start Game
              </button>
            </div>

            <button className="btn-ghost" onClick={reset}>← Back</button>
          </div>
        )}

        {/* ── Step 2b: vs computer setup ──────────────────── */}
        {pickedMode === 'vs-ai' && (
          <div className="menu-step" key="step-vs-ai">
            <p className="menu-subtitle">vs Computer</p>

            <div className="config-panel config-panel--ai">
              <div className="config-panel-head">
                <span className="mode-icon-badge">
                  <span className="menu-card-piece white">♔</span>
                  <span className="menu-card-vs">vs</span>
                  <span className="menu-card-piece ai-glow">♚</span>
                </span>
                <div>
                  <div className="menu-card-label">Play the AI</div>
                  <div className="menu-card-desc">Choose your side, difficulty, and clock</div>
                </div>
              </div>

              <div className="config-section">
                <div className="config-section-label">Difficulty</div>
                <div className="time-choice">
                  {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`time-btn ${aiDifficulty === d ? 'active' : ''}`}
                      onClick={() => setAiDifficulty(d)}
                      aria-pressed={aiDifficulty === d}
                    >
                      {DIFFICULTIES[d].label}
                    </button>
                  ))}
                </div>
                <p className="config-section-caption">{DIFFICULTIES[aiDifficulty].desc}</p>
              </div>

              <div className="config-section">
                <div className="config-section-label">Clock</div>
                <div className="time-choice">
                  {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((tc) => (
                    <button
                      key={tc}
                      type="button"
                      className={`time-btn ${aiTimeControl === tc ? 'active' : ''}`}
                      onClick={() => setAiTimeControl(tc)}
                      aria-pressed={aiTimeControl === tc}
                    >
                      {tc === 'none' ? 'No timer' : TIME_CONTROLS[tc].label}
                    </button>
                  ))}
                </div>
                <p className="config-section-caption">
                  {aiTimeControl === 'none' ? 'Unlimited — play at your own pace' : TIME_CONTROLS[aiTimeControl].desc}
                </p>
              </div>

              <div className="config-section">
                <div className="config-section-label">Your side</div>
                <div className="color-choice">
                  <button
                    className="color-btn white-btn"
                    onClick={() => onStart('vs-ai', 'white', aiTimeControl, aiDifficulty)}
                  >
                    <span aria-hidden="true">♔</span> Play White
                  </button>
                  <button
                    className="color-btn black-btn"
                    onClick={() => onStart('vs-ai', 'black', aiTimeControl, aiDifficulty)}
                  >
                    <span aria-hidden="true">♚</span> Play Black
                  </button>
                </div>
              </div>
            </div>

            <button className="btn-ghost" onClick={reset}>← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}