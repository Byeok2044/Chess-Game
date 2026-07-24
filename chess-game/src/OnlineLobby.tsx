import { useState } from 'react';
import { initGame } from './Chess.ts';
import { createGame, joinGameByCode } from './lib/gameSync.ts';
import { useAuth } from './lib/AuthContext.tsx';
import AuthPanel from './AuthPanel.tsx';
import { TIME_CONTROLS } from './GameSettings.ts';
import type { TimeControl } from './GameSettings.ts';

export default function OnlineLobby({ onEnterGame, onBack }: {
  onEnterGame: (gameId: string, color: 'white' | 'black') => void;
  onBack: () => void;
}) {
  const { session, profile, signOut } = useAuth();
  const [code, setCode] = useState('');
  const [timeControl, setTimeControl] = useState<TimeControl>('none');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleCreate() {
    if (!session) return;
    setBusy(true);
    setError(null);
    const { data, error } = await createGame(session.user.id, initGame(), timeControl);
    setBusy(false);
    if (error || !data) { setError(error?.message ?? 'Could not create game'); return; }
    onEnterGame(data.id, 'white');
  }

  async function handleJoin() {
    if (!session || !code.trim()) return;
    setBusy(true);
    setError(null);
    const { data, error } = await joinGameByCode(code.trim().toLowerCase(), session.user.id);
    setBusy(false);
    if (error || !data) { setError(error?.message ?? 'Could not join game'); return; }
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

    if (err) {
      setError(err);
      return;
    }

    // Reset local lobby state so a fresh sign-in starts clean.
    setCode('');
    setTimeControl('none');
  }

  return (
    <div className="menu-root">
      <div className="menu-content">
        <h1 className="menu-title" style={{ fontSize: 40 }}>Play Online</h1>

        {!session ? (
          <AuthPanel />
        ) : (
          <>
            <div
              className="menu-card ai-card"
              style={{
                width: '100%',
                maxWidth: 420,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div className="menu-card-label">
                  {profile?.username ?? session.user.email ?? 'Signed in'}
                </div>
                {profile && (
                  <div className="menu-card-desc">
                    {profile.rating} rating · {profile.wins}W {profile.losses}L {profile.draws}D
                  </div>
                )}
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

            <div className="menu-cards" style={{ gridTemplateColumns: '1fr' }}>
              <div className="menu-card ai-card">
                <div className="menu-card-label">Create a game</div>
                <div className="menu-card-desc">Get an invite code to share with a friend</div>

                <div className="time-choice">
                  {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((tc) => (
                    <button
                      key={tc}
                      type="button"
                      className={`time-btn ${timeControl === tc ? 'active' : ''}`}
                      onClick={() => setTimeControl(tc)}
                      aria-pressed={timeControl === tc}
                      title={TIME_CONTROLS[tc].desc}
                    >
                      {tc === 'none' ? 'No timer' : TIME_CONTROLS[tc].label}
                    </button>
                  ))}
                </div>

                <button className="btn-primary" style={{ marginTop: 10 }} onClick={handleCreate} disabled={busy || signingOut}>
                  {busy ? 'Creating…' : 'Create'}
                </button>
              </div>

              <div className="menu-card ai-card">
                <div className="menu-card-label">Join with a code</div>
                <input
                  style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', textAlign: 'center', letterSpacing: 2 }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ABC123"
                  maxLength={6}
                  disabled={signingOut}
                />
                <button className="btn-primary" style={{ marginTop: 10 }} onClick={handleJoin} disabled={busy || signingOut || !code.trim()}>
                  Join
                </button>
              </div>
            </div>
          </>
        )}

        {error && <p style={{ color: '#e85050', fontSize: 13 }}>{error}</p>}
        <button className="btn-ghost" onClick={onBack} disabled={signingOut}>← Back</button>
      </div>
    </div>
  );
}