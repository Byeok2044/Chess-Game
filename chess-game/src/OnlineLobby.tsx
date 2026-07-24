import { useEffect, useRef, useState } from 'react';
import { initGame } from './Chess.ts';
import { createGame, joinGameByCode } from './lib/gameSync.ts';
import { useAuth } from './lib/AuthContext.tsx';
import AuthPanel from './AuthPanel.tsx';
import { TIME_CONTROLS } from './GameSettings.ts';
import type { TimeControl } from './GameSettings.ts';
import './Menu.css';
import './OnlineLobby.css';

const CODE_LENGTH = 6;

export default function OnlineLobby({ onEnterGame, onBack }: {
  onEnterGame: (gameId: string, color: 'white' | 'black') => void;
  onBack: () => void;
}) {
  const { session, profile, signOut } = useAuth();
  const [code, setCode] = useState('');
  const [timeControl, setTimeControl] = useState<TimeControl>('none');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const busy = creating || joining;

  async function handleCreate() {
    if (!session || busy) return;
    setCreating(true);
    setError(null);
    const { data, error } = await createGame(session.user.id, initGame(), timeControl);
    setCreating(false);
    if (error || !data) { setError(error?.message ?? 'Could not create game'); return; }
    onEnterGame(data.id, 'white');
  }

  async function handleJoin() {
    if (!session || busy || code.length !== CODE_LENGTH) return;
    setJoining(true);
    setError(null);
    const { data, error } = await joinGameByCode(code.toLowerCase(), session.user.id);
    setJoining(false);
    if (error || !data) { setError(error?.message ?? 'Game not found or already full'); return; }
    onEnterGame(data.id, 'black');
  }

  async function handleSignOut() {
    if (signingOut) return;
    if (busy) {
      const ok = window.confirm('An action is in progress. Sign out anyway?');
      if (!ok) return;
    }
    setSigningOut(true);
    setError(null);
    const err = await signOut();
    setSigningOut(false);
    if (err) { setError(err); return; }
    setCode('');
    setTimeControl('none');
  }

  function handleCodeChange(raw: string) {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(cleaned);
    if (error) setError(null);
  }

  function handleCodeKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && code.length === CODE_LENGTH) handleJoin();
  }

  useEffect(() => {
    if (session) codeInputRef.current?.focus();
  }, [session]);

  const initial = (profile?.username?.[0] ?? session?.user.email?.[0] ?? '?').toUpperCase();

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
        <div className="lobby-wrap">
          <div className="lobby-header">
            <div className="lobby-eyebrow">Multiplayer</div>
            <h1 className="menu-title" style={{ fontSize: 40, margin: '4px 0' }}>Play Online</h1>
            <p className="menu-card-desc" style={{ marginTop: 4 }}>
              Challenge a friend in real time — no download, just a code.
            </p>
          </div>

          {!session ? (
            <AuthPanel />
          ) : (
            <>
              <div className="lobby-identity">
                <div className="lobby-identity-left">
                  <div className="lobby-avatar">{initial}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="lobby-identity-name">{profile?.username ?? session.user.email}</div>
                    {profile && (
                      <div className="lobby-identity-meta">
                        {profile.rating} rating · {profile.wins}W {profile.losses}L {profile.draws}D
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="btn-ghost"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  aria-busy={signingOut}
                >
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>

              {error && (
                <div className="lobby-error" role="alert">
                  <span className="lobby-error-icon">!</span>
                  <span className="lobby-error-msg">{error}</span>
                  <button className="lobby-error-close" onClick={() => setError(null)} aria-label="Dismiss error">✕</button>
                </div>
              )}

              <div className="lobby-split">
                <div className="lobby-pane">
                  <div className="lobby-pane-icon" aria-hidden="true">♞</div>
                  <div className="lobby-pane-title">Create a game</div>
                  <div className="lobby-pane-desc">Choose a clock, then share your invite code with a friend.</div>

                  <div className="lobby-tc-grid" role="group" aria-label="Time control">
                    {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((tc) => (
                      <button
                        key={tc}
                        type="button"
                        className={`lobby-tc-chip ${timeControl === tc ? 'active' : ''}`}
                        onClick={() => setTimeControl(tc)}
                        aria-pressed={timeControl === tc}
                      >
                        <span className="lobby-tc-chip-label">
                          {tc === 'none' ? '∞' : TIME_CONTROLS[tc].label}
                        </span>
                        <span className="lobby-tc-chip-desc">
                          {tc === 'none' ? 'Unlimited' : TIME_CONTROLS[tc].desc}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="lobby-btn">
                    <button className="btn-primary" onClick={handleCreate} disabled={busy || signingOut}>
                      {creating && <span className="lobby-spinner" aria-hidden="true" />}
                      {creating ? 'Creating…' : 'Create game'}
                    </button>
                  </div>
                </div>

                <div className="lobby-divider" aria-hidden="true">or</div>

                <div className="lobby-pane">
                  <div className="lobby-pane-icon" aria-hidden="true">⚑</div>
                  <div className="lobby-pane-title">Join with a code</div>
                  <div className="lobby-pane-desc">Enter the 6-character code your friend sent you.</div>

                  <div style={{ position: 'relative' }}>
                    <div className="lobby-code-input" aria-hidden="true">
                      {Array.from({ length: CODE_LENGTH }, (_, i) => (
                        <div
                          key={i}
                          className={`lobby-code-box ${i < code.length ? 'filled' : ''} ${i === code.length ? 'next' : ''}`}
                        >
                          {code[i] ?? ''}
                        </div>
                      ))}
                    </div>
                    <input
                      ref={codeInputRef}
                      className="lobby-code-hidden-input"
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      onKeyDown={handleCodeKeyDown}
                      onFocus={(e) => e.target.select()}
                      maxLength={CODE_LENGTH}
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      aria-label="Invite code"
                      disabled={signingOut}
                    />
                  </div>
                  <p className="lobby-code-hint">Click the boxes above to type</p>

                  <div className="lobby-btn">
                    <button
                      className="btn-primary"
                      onClick={handleJoin}
                      disabled={busy || signingOut || code.length !== CODE_LENGTH}
                    >
                      {joining && <span className="lobby-spinner" aria-hidden="true" />}
                      {joining ? 'Joining…' : 'Join game'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          <button className="btn-ghost" onClick={onBack} disabled={signingOut}>← Back</button>
        </div>
      </div>
    </div>
  );
}