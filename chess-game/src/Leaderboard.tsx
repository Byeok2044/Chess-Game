import { useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase.ts';
import { getOrFetch, appCache } from './lib/cache.ts';
import './Leaderboard.css';

interface Row {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
}

const LEADERBOARD_KEY = 'leaderboard';
const LEADERBOARD_TTL_MS = 30000;

async function fetchLeaderboard(): Promise<Row[]> {
  const { data, error } = await supabase.from('leaderboard').select('*').limit(50);
  if (error) throw error;
  return (data as Row[]) ?? [];
}

export default function Leaderboard({ onClose }: { onClose: () => void }) {
  const modal = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    setLoading(true);
    setError(false);
    getOrFetch(LEADERBOARD_KEY, LEADERBOARD_TTL_MS, fetchLeaderboard)
      .then(setRows)
      .catch(() => setError(true))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    modal.current?.showModal();
    load();
    const element = modal.current;
    return () => element?.close();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    appCache.invalidate(LEADERBOARD_KEY);
    load();
  }

  return (
    <dialog ref={modal} className="leaderboard-modal" aria-labelledby="leaderboard-title" onCancel={onClose}>
        <div className="leaderboard-head">
          <span id="leaderboard-title" className="leaderboard-title">Leaderboard</span>
          <button className="btn-ghost" onClick={handleRefresh} disabled={refreshing || loading}>
            {refreshing ? '…' : '↻ Refresh'}
          </button>
        </div>

        <div className="leaderboard-rows">
          {loading &&
            Array.from({ length: 6 }, (_, i) => <div key={i} className="leaderboard-skeleton-row" />)}

          {error && <p className="leaderboard-empty auth-error" role="alert">Could not load the rankings. Try Refresh to reconnect.</p>}
          {!loading && !error && rows.length === 0 && (
            <div className="leaderboard-empty">
              No ranked games yet — play online to be the first on the board.
            </div>
          )}

          {!loading &&
            rows.map((r, i) => (
              <div key={r.id} className="leaderboard-row">
                <span className="rank-badge">{i + 1}</span>
                <span className="leaderboard-name">{r.username}</span>
                <span className="leaderboard-rating">{r.rating}</span>
                <span className="leaderboard-record">
                  {r.wins}W {r.losses}L {r.draws}D
                </span>
              </div>
            ))}
        </div>

        <div className="leaderboard-foot">
          <button className="btn-ghost" style={{ width: '100%' }} onClick={onClose}>
            Close
          </button>
        </div>
    </dialog>
  );
}
