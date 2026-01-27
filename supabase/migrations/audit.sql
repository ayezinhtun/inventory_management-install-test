-- 1) Table to store audit logs
create table if not exists public.audit_logs (
  id            bigserial primary key,
  executed_at   timestamptz not null default now(),
  table_name    text not null,
  action        text not null check (action in ('INSERT','UPDATE','DELETE')),
  row_id_text   text,                       -- best-effort primary key value as text
  old_data      jsonb,
  new_data      jsonb,
  changed_cols  text[],                     -- for UPDATE, which cols changed
  actor_uid     uuid,                       -- from auth.uid()
  actor_email   text,                       -- from JWT claims
  request_roles text[],                     -- roles from JWT
  request_ip    inet                        -- optional; may be null in local
);

-- Helpful indexes for querying
create index if not exists idx_audit_logs_table_time on public.audit_logs (table_name, executed_at desc);
create index if not exists idx_audit_logs_action on public.audit_logs (action);
create index if not exists idx_audit_logs_rowid on public.audit_logs (row_id_text);
create index if not exists idx_audit_logs_old_gin on public.audit_logs using gin (old_data);
create index if not exists idx_audit_logs_new_gin on public.audit_logs using gin (new_data);

-- 2) Utility: safe JSON claim extraction
create or replace function public.jwt_claim(claim text)
returns text
language plpgsql
stable
as $$
declare
  v_claims jsonb;
begin
  begin
    v_claims := current_setting('request.jwt.claims', true)::jsonb;
  exception when others then
    return null;
  end;
  if v_claims is null then return null; end if;
  return coalesce(v_claims ->> claim, null);
end$$;

-- 3) Utility: try to derive a row id as text
--    Prefers "id" if present, else tries common key names, else null.
create or replace function public._derive_row_id(_old jsonb, _new jsonb)
returns text
language sql
immutable
as $$
  select coalesce(
    coalesce(_new->>'id', _old->>'id'),
    coalesce(_new->>'uuid', _old->>'uuid'),
    coalesce(_new->>'code', _old->>'code'),
    coalesce(_new->>'key', _old->>'key'),
    null
  )
$$;

-- 4) Generic trigger function to log changes
create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_uid   uuid;
  v_actor_email text;
  v_roles       text[];
  v_old         jsonb;
  v_new         jsonb;
  v_changed     text[];
  v_row_id      text;
begin
  -- Actor info from Supabase JWT
  begin
    v_actor_uid   := nullif(jwt_claim('sub'), '')::uuid; -- auth.uid()
    v_actor_email := jwt_claim('email');
    v_roles       := string_to_array(coalesce(jwt_claim('role'), ''), ',');
  exception when others then
    v_actor_uid   := null;
    v_actor_email := null;
    v_roles       := null;
  end;

  if (TG_OP = 'DELETE') then
    v_old    := to_jsonb(OLD);
    v_new    := null;
    v_row_id := public._derive_row_id(v_old, null);
  elsif (TG_OP = 'INSERT') then
    v_old    := null;
    v_new    := to_jsonb(NEW);
    v_row_id := public._derive_row_id(null, v_new);
  elsif (TG_OP = 'UPDATE') then
    v_old    := to_jsonb(OLD);
    v_new    := to_jsonb(NEW);
    -- Compute changed columns by comparing keys with different values
    select array_agg(k) into v_changed
    from (
      select key as k
      from jsonb_object_keys(v_new) as key
      where v_new->>key is distinct from v_old->>key
    ) s;
    v_row_id := public._derive_row_id(v_old, v_new);
  end if;

  insert into public.audit_logs (
    table_name, action, row_id_text,
    old_data, new_data, changed_cols,
    actor_uid, actor_email, request_roles, request_ip
  ) values (
    TG_TABLE_NAME, TG_OP, v_row_id,
    v_old, v_new, v_changed,
    v_actor_uid, v_actor_email, v_roles, null
  );

  -- For row-level triggers, return the appropriate record
  if TG_OP in ('INSERT','UPDATE') then
    return NEW;
  else
    return OLD;
  end if;
end
$$;

-- 5) Create triggers for all tables in public except audit_logs
do $$
declare
  r record;
  trg_name text;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename not in ('audit_logs')  -- exclude the audit table itself
  loop
    trg_name := format('trg_audit_%s', r.tablename);

    -- INSERT
    execute format($f$
      drop trigger if exists %I on public.%I;
      create trigger %I
      after insert or update or delete on public.%I
      for each row execute function public.log_audit();
    $f$, trg_name, r.tablename, trg_name, r.tablename);
  end loop;
end$$;



--  for notification

create table if not exists public.notification_reads (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  audit_id bigint not null,
  read_at timestamptz not null default now(),
  unique (user_id, audit_id)
);

alter table public.notification_reads enable row level security;

create policy "read own reads"
on public.notification_reads
for select
to authenticated
using (auth.uid() = user_id);

create policy "insert own reads"
on public.notification_reads
for insert
to authenticated
with check (auth.uid() = user_id);