-- Run once in a NEW dedicated Party Kingdom Supabase project's SQL Editor.
-- No service-role key belongs in the app. Users may only access their own visits.
begin;
create table public.visits (
  id text primary key check (length(id) between 1 and 80),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('Open Jump', 'Birthday Party', 'Other')),
  starts_at timestamptz not null,
  reminder_hours integer not null default 0 check (reminder_hours in (0, 2, 24, 48)),
  reference text not null default '' check (length(reference) <= 80),
  created_at timestamptz not null default now()
);
create index visits_user_starts on public.visits (user_id, starts_at);
alter table public.visits enable row level security;
revoke all on public.visits from anon;
grant select, insert, update, delete on public.visits to authenticated;
create policy "Read own visits" on public.visits for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own visits" on public.visits for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own visits" on public.visits for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own visits" on public.visits for delete to authenticated using ((select auth.uid()) = user_id);

-- Self-service deletion, deliberately no user-id parameter. A verified user can
-- only remove their own auth row; FK cascade removes their visits. Metadata
-- (name/phone) lives in their auth user record and is removed with it.
create function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in before deleting your account';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
commit;
