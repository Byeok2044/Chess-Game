import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase.ts';
import { getOrFetch, appCache } from './lib/cache.ts';

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
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    setLoading(true);
    getOrFetch(LEADERBOARD_KEY, LEADERBOARD_TTL_MS, fetchLeaderboard)
      .then(setRows)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    appCache.invalidate(LEADERBOARD_KEY);
    load();
  }

  return (
    <div className="promotion-overlay" style={{ position: 'fixed' }}>
      <div className="promotion-modal" style={{ minWidth: 340, maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p>Leaderboard</p>
          <button className="btn-ghost" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? '…' : '↻'}
          </button>
        </div>
        {loading && <span className="no-moves">Loading…</span>}
        {!loading && rows.length === 0 && <span className="no-moves">No ranked games yet</span>}
        {!loading && rows.length > 0 && (
          <div className="moves-grid" style={{ maxHeight: 400 }}>
            {rows.map((r, i) => (
              <div key={r.id} className="move-pair" style={{ gridTemplateColumns: '24px 1fr 50px 70px' }}>
                <span className="move-num">{i + 1}.</span>
                <span className="move">{r.username}</span>
                <span className="move">{r.rating}</span>
                <span className="move">{r.wins}W {r.losses}L {r.draws}D</span>
              </div>
            ))}
          </div>
        )}
        <button className="btn-ghost" style={{ marginTop: 16 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}