-- eunbilog blog posts table
-- Run this once in Supabase Dashboard -> SQL Editor

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  category text not null check (category in (
    'app-dev', 'baseball', 'tooltoolz', 'affiliate', 'gov-info', 'side-hustle', 'ai-news', 'travel'
  )),
  date date not null,
  tags text[] not null default '{}',
  excerpt text not null,
  cover_image text,
  published boolean not null default false,
  content text not null,
  affiliate jsonb,
  seo jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, slug)
);

create index if not exists posts_category_published_date_idx
  on posts (category, published, date desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_updated_at on posts;
create trigger posts_updated_at
  before update on posts
  for each row execute function set_updated_at();

alter table posts enable row level security;

drop policy if exists "public read published" on posts;
create policy "public read published" on posts
  for select using (published = true);

drop policy if exists "authenticated full access" on posts;
create policy "authenticated full access" on posts
  for all to authenticated using (true) with check (true);
