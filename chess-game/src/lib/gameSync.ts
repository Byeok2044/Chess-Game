import { useEffect, useRef, useState } from 'react';
import { supabase, type GameRow, type SavedGameRow } from './supabase.ts';
import type { GameState } from '../Chess.ts';

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

// Call once a game finishes to update both players' win/loss/draw counts
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
    if (game?.status === 'finished' && !resultRecorded.current) {
      resultRecorded.current = true;
      recordResult(game);
    }
  }, [game?.status]);

  return game;
}