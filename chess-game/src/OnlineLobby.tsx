import { useState } from 'react';
import { initGame } from './Chess.ts';
import { createGame, joinGameByCode } from './lib/gameSync.ts';
import { useAuth } from './lib/AuthContext.tsx';
import AuthPanel from './AuthPanel.tsx';

export default function OnlineLobby({ onEnterGame, onBack }: {
  onEnterGame: (gameId: string, color: 'white' | 'black') => void;
  onBack: () => void;
}) {
  const { session } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!session) return;
    setBusy(true);
    const { data, error } = await createGame(session.user.id, initGame());
    setBusy(false);
    if (error || !data) { setError(error?.message ?? 'Could not create game'); return; }
    onEnterGame(data.id, 'white');
  }

  async function handleJoin() {
    if (!session || !code.trim()) return;
    setBusy(true);
    const { data, error } = await joinGameByCode(code.trim().toLowerCase(), session.user.id);
    setBusy(false);
    if (error || !data) { setError(error?.message ?? 'Could not join game'); return; }
    onEnterGame(data.id, 'black');
  }

  return (
    <div className="menu-root">
      <div className="menu-content">
        <h1 className="menu-title" style={{ fontSize: 40 }}>Play Online</h1>

        {!session ? (
          <AuthPanel />
        ) : (
          <div className="menu-cards" style={{ gridTemplateColumns: '1fr' }}>
            <button className="menu-card" onClick={handleCreate} disabled={busy}>
              <div className="menu-card-label">Create a game</div>
              <div className="menu-card-desc">Get an invite code to share with a friend</div>
            </button>

            <div className="menu-card ai-card">
              <div className="menu-card-label">Join with a code</div>
              <input
                style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', textAlign: 'center', letterSpacing: 2 }}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ABC123"
                maxLength={6}
              />
              <button className="btn-primary" style={{ marginTop: 10 }} onClick={handleJoin} disabled={busy || !code.trim()}>
                Join
              </button>
            </div>
          </div>
        )}

        {error && <p style={{ color: '#e85050', fontSize: 13 }}>{error}</p>}
        <button className="btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}