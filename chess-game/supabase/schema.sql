
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  rating int not null default 1200,
  wins int not null default 0,
  losses int not null default 0,
  draws int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.games (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null default substr(md5(random()::text), 1, 6),
  white_id uuid references public.profiles(id),
  black_id uuid references public.profiles(id),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished', 'abandoned')),
  turn text not null default 'white' check (turn in ('white', 'black')),
  board_state jsonb not null,
  winner text check (winner in ('white', 'black', 'draw')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.games enable row level security;

create policy "Games visible to players or when open"
  on public.games for select
  using (
    status = 'waiting'
    or auth.uid() = white_id
    or auth.uid() = black_id
  );

create policy "Authenticated users can create a game"
  on public.games for insert
  with check (auth.uid() = white_id);

create policy "Players can update their own game"
  on public.games for update
  using (auth.uid() = white_id or auth.uid() = black_id);

create function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger games_touch_updated_at
  before update on public.games
  for each row execute procedure public.touch_updated_at();


alter publication supabase_realtime add table public.games;

create table public.saved_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Untitled game',
  mode text not null default 'two-player' check (mode in ('two-player', 'vs-ai')),
  ai_color text check (ai_color in ('white', 'black')),
  board_state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.saved_games enable row level security;

create policy "Users manage their own saved games"
  on public.saved_games for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger saved_games_touch_updated_at
  before update on public.saved_games
  for each row execute procedure public.touch_updated_at();


create view public.leaderboard as
  select
    id,
    username,
    rating,
    wins,
    losses,
    draws,
    (wins + losses + draws) as games_played
  from public.profiles
  order by rating desc, wins desc;