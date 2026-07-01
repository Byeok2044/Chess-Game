import { useEffect, useRef, useState } from 'react';
import { supabase, type GameRow, type SavedGameRow } from './supabase.ts';
import type { GameState, Color } from '../Chess.ts';

const ABANDON_GRACE_MS = 20000; // time to allow a dropped player to reconnect

// ─────────────────────────────────────────────
// Save & resume (local / vs-AI games)
// ─────────────────────────────────────────────
export async function saveGame(
  userId: string,
  state: GameState,
  mode: 'two-player' | 'vs-ai',
  aiColor: 'white' | 'black' | null,
  name = 'Untitled game',
  existingId?: string
) {
  const payload = {
    user_id: userId,
    name,
    mode,
    ai_color: aiColor,
    board_state: state,
  };
  const query = existingId
    ? supabase.from('saved_games').update(payload).eq('id', existingId)
    : supabase.from('saved_games').insert(payload);
  const { data, error } = await query.select().single();
  return { data: data as SavedGameRow | null, error };
}

export async function listSavedGames(userId: string) {
  const { data, error } = await supabase
    .from('saved_games')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  return { data: (data ?? []) as SavedGameRow[], error };
}

export async function deleteSavedGame(id: string) {
  return supabase.from('saved_games').delete().eq('id', id);
}

// ─────────────────────────────────────────────
// Multiplayer: create / join
// ─────────────────────────────────────────────
export async function createGame(userId: string, initialState: GameState) {
  const { data, error } = await supabase
    .from('games')
    .insert({ white_id: userId, board_state: initialState, turn: 'white', status: 'waiting' })
    .select()
    .single();
  return { data: data as GameRow | null, error };
}

export async function joinGameByCode(inviteCode: string, userId: string) {
  const { data: game, error: findErr } = await supabase
    .from('games')
    .select('*')
    .eq('invite_code', inviteCode)
    .eq('status', 'waiting')
    .single();

  if (findErr || !game) return { data: null, error: findErr ?? new Error('Game not found or already full') };

  const { data, error } = await supabase
    .from('games')
    .update({ black_id: userId, status: 'active' })
    .eq('id', game.id)
    .select()
    .single();

  return { data: data as GameRow | null, error };
}

// ─────────────────────────────────────────────
// Moves
// ─────────────────────────────────────────────
export async function pushMove(gameId: string, state: GameState, turn: 'white' | 'black') {
  const winner =
    state.status === 'checkmate' ? (turn === 'white' ? 'black' : 'white') // turn already flipped to loser
    : state.status === 'stalemate' ? 'draw'
    : null;

  return supabase
    .from('games')
    .update({
      board_state: state,
      turn,
      status: winner ? 'finished' : 'active',
      ...(winner ? { winner } : {}),
    })
    .eq('id', gameId);
}

// ─────────────────────────────────────────────
// Ending a game early: resignation & abandonment
// ─────────────────────────────────────────────

// Called when a player deliberately leaves — instant forfeit.
export async function resignGame(gameId: string, resigningColor: Color) {
  const winner = resigningColor === 'white' ? 'black' : 'white';
  return supabase
    .from('games')
    .update({ status: 'finished', winner })
    .eq('id', gameId)
    .eq('status', 'active'); // no-op if the game already ended
}

// Called automatically once a player's connection has been gone
// for longer than the grace period.
export async function claimAbandonment(gameId: string, remainingColor: Color) {
  return supabase
    .from('games')
    .update({ status: 'abandoned', winner: remainingColor })
    .eq('id', gameId)
    .eq('status', 'active');
}

// ─────────────────────────────────────────────
// Call once a game finishes to update both players' win/loss/draw counts.
// Counts 'abandoned' games too, so forfeits affect ratings/records.
// ─────────────────────────────────────────────
export async function recordResult(game: GameRow) {
  if (!game.winner || !game.white_id || !game.black_id) return;

  const bump = async (userId: string, field: 'wins' | 'losses' | 'draws') => {
    const { data } = await supabase.from('profiles').select(field).eq('id', userId).single();
    const current = (data as Record<string, number> | null)?.[field] ?? 0;
    await supabase.from('profiles').update({ [field]: current + 1 }).eq('id', userId);
  };

  if (game.winner === 'draw') {
    await bump(game.white_id, 'draws');
    await bump(game.black_id, 'draws');
  } else if (game.winner === 'white') {
    await bump(game.white_id, 'wins');
    await bump(game.black_id, 'losses');
  } else {
    await bump(game.black_id, 'wins');
    await bump(game.white_id, 'losses');
  }
}

// ─────────────────────────────────────────────
// React hook: subscribe to a live multiplayer game
// ─────────────────────────────────────────────
export function useMultiplayerGame(gameId: string | null) {
  const [game, setGame] = useState<GameRow | null>(null);
  const resultRecorded = useRef(false);

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;

    supabase.from('games').select('*').eq('id', gameId).single().then(({ data }) => {
      if (!cancelled) setGame(data as GameRow);
    });

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => setGame(payload.new as GameRow)
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  useEffect(() => {
    if ((game?.status === 'finished' || game?.status === 'abandoned') && !resultRecorded.current) {
      resultRecorded.current = true;
      recordResult(game);
    }
  }, [game?.status]);

  return game;
}

// ─────────────────────────────────────────────
// React hook: detect an opponent disconnecting and
// claim the win if they don't come back in time
// ─────────────────────────────────────────────
export function usePresenceAbandonment(
  gameId: string | null,
  game: GameRow | null,
  myColor: Color,
  myUserId: string | null
) {
  const [opponentOnline, setOpponentOnline] = useState(true);
  const abandonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!gameId || !myUserId || !game || game.status !== 'active') return;

    const opponentId = myColor === 'white' ? game.black_id : game.white_id;
    if (!opponentId) return;

    const channel = supabase.channel(`presence:game:${gameId}`, {
      config: { presence: { key: myUserId } },
    });

    const checkPresence = () => {
      const state = channel.presenceState() as Record<string, unknown[]>;
      const online = Boolean(state[opponentId]?.length);
      setOpponentOnline(online);

      if (!online && !abandonTimer.current) {
        abandonTimer.current = setTimeout(async () => {
          abandonTimer.current = null;
          const stillGone = !(channel.presenceState() as Record<string, unknown[]>)[opponentId]?.length;
          if (stillGone) await claimAbandonment(gameId, myColor);
        }, ABANDON_GRACE_MS);
      } else if (online && abandonTimer.current) {
        clearTimeout(abandonTimer.current);
        abandonTimer.current = null;
      }
    };

    channel
      .on('presence', { event: 'sync' }, checkPresence)
      .on('presence', { event: 'join' }, checkPresence)
      .on('presence', { event: 'leave' }, checkPresence)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ color: myColor, online_at: new Date().toISOString() });
        }
      });

    return () => {
      if (abandonTimer.current) clearTimeout(abandonTimer.current);
      supabase.removeChannel(channel);
    };
  }, [gameId, myUserId, myColor, game?.status, game?.white_id, game?.black_id]);

  return { opponentOnline };
}