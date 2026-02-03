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


create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  table_name text not null,          -- 'installation_requests' | 'relocation_requests'
  entity_id text not null,           -- the request id
  type text not null,                -- 'created' | 'status_change' | 'updated'
  title text not null,
  body text null,
  actor_user_id uuid null,
  requested_by uuid null,
  region_id uuid null,
  status text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_tbl_ent on public.notifications (table_name, entity_id);
create index if not exists idx_notifications_created on public.notifications (created_at desc);
create index if not exists idx_notifications_region on public.notifications (region_id);


create table if not exists public.notification_reads (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  notification_id bigint not null references public.notifications(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (user_id, notification_id)
);

create index if not exists idx_notification_reads_user on public.notification_reads (user_id);
create index if not exists idx_notification_reads_notif on public.notification_reads (notification_id);


create or replace function public.notify_installation_requests()
returns trigger as $$
declare v_title text; v_region uuid;
begin
  if (new.destination_region_id is not null) then
    v_region := new.destination_region_id;
  else
    select w.region_id into v_region
    from inventorys s join racks r on r.id=s.rack_id join warehouses w on w.id=r.warehouse_id
    where s.id=new.server_id;
  end if;

  if (tg_op='INSERT') then v_title:='Installation request created';
  elsif (tg_op='UPDATE') then
    if (new.status is distinct from old.status) then
      v_title:=format('Installation status changed: %s', new.status);
    else v_title:='Installation request updated'; end if;
  end if;

  insert into public.notifications
  (table_name, entity_id, type, title, actor_user_id, requested_by, region_id, status)
  values ('installation_requests', new.id::text, tg_op, v_title, null, new.requested_by, v_region, new.status);

  return new;
end; $$ language plpgsql;

drop trigger if exists trg_notify_installation_requests on public.installation_requests;
create trigger trg_notify_installation_requests
after insert or update on public.installation_requests
for each row execute function public.notify_installation_requests();


create or replace function public.notify_relocation_requests()
returns trigger as $$
declare v_title text; v_region uuid;
begin
  if (new.destination_move_type='warehouse') then
    v_region:=new.destination_region_id;
  else
    select w.region_id into v_region
    from inventorys s join racks r on r.id=s.rack_id join warehouses w on w.id=r.warehouse_id
    where s.id=new.destination_server_id;
  end if;

  if (tg_op='INSERT') then v_title:='Relocation request created';
  elsif (tg_op='UPDATE') then
    if (new.status is distinct from old.status) then
      v_title:=format('Relocation status changed: %s', new.status);
    else v_title:='Relocation request updated'; end if;
  end if;

  insert into public.notifications
  (table_name, entity_id, type, title, actor_user_id, requested_by, region_id, status)
  values ('relocation_requests', new.id::text, tg_op, v_title, null, new.requested_by, v_region, new.status);

  return new;
end; $$ language plpgsql;

drop trigger if exists trg_notify_relocation_requests on public.relocation_requests;
create trigger trg_notify_relocation_requests
after insert or update on public.relocation_requests
for each row execute function public.notify_relocation_requests();



create or replace function public.notify_inventory_requests()
returns trigger as $$
declare v_title text; v_region uuid;
begin
  -- Resolve region for the inventory request
  if (new.destination_region_id is not null) then
    v_region := new.destination_region_id;
  else
    -- fallback via server->rack->warehouse->region
    select w.region_id into v_region
    from inventorys s
    join racks r on r.id = s.rack_id
    join warehouses w on w.id = r.warehouse_id
    where s.id = new.server_id; -- adjust if column name differs
  end if;

  if (tg_op='INSERT') then v_title:='Inventory request created';
  elsif (tg_op='UPDATE') then
    if (new.status is distinct from old.status) then
      v_title:=format('Inventory status changed: %s', new.status);
    else v_title:='Inventory request updated'; end if;
  end if;

  insert into public.notifications
  (table_name, entity_id, type, title, actor_user_id, requested_by, region_id, status)
  values ('inventory_requests', new.id::text, tg_op, v_title, null, new.requested_by, v_region, new.status);

  return new;
end; $$ language plpgsql;

drop trigger if exists trg_notify_inventory_requests on public.inventory_requests;
create trigger trg_notify_inventory_requests
after insert or update on public.inventory_requests
for each row execute function public.notify_inventory_requests();



-- Add FKs (optional but recommended for joins and select syntax)
alter table public.notifications
  add constraint notifications_actor_user_fk
  foreign key (actor_user_id) references public.user_profile(id);

alter table public.notifications
  add constraint notifications_requested_by_fk
  foreign key (requested_by) references public.user_profile(id);

-- Helpful indexes for lookups
create index if not exists idx_notifications_actor on public.notifications (actor_user_id);
create index if not exists idx_notifications_requested_by on public.notifications (requested_by);
create index if not exists idx_notifications_status on public.notifications (status);

-- Update your trigger function to set actor and human title
create or replace function public.notify_installation_requests()
returns trigger as $$
declare
  v_title text;
  v_region uuid;
  v_actor uuid := auth.uid();
  v_actor_name text;
begin
  -- region resolution (as you already have)
  if (new.destination_region_id is not null) then
    v_region := new.destination_region_id;
  else
    select w.region_id into v_region
    from inventorys s join racks r on r.id=s.rack_id join warehouses w on w.id=r.warehouse_id
    where s.id=new.server_id;
  end if;

  -- fetch actor display name
  select name into v_actor_name from public.user_profile where id = v_actor;

  if (tg_op='INSERT') then
    v_title := coalesce(v_actor_name, 'Someone') || ' created install request';
  elsif (tg_op='UPDATE') then
    if (new.status is distinct from old.status) then
      v_title := coalesce(v_actor_name, 'Someone') || ' changed status into ' || new.status;
    else
      v_title := coalesce(v_actor_name, 'Someone') || ' updated install request';
    end if;
  end if;

  insert into public.notifications
    (table_name, entity_id, type, title, body, actor_user_id, requested_by, region_id, status)
  values
    ('installation_requests', new.id::text, tg_op, v_title, null, v_actor, new.requested_by, v_region, new.status);

  return new;
end;
$$ language plpgsql;


create or replace function public.notify_relocation_requests()
returns trigger as $$
declare
  v_title text;
  v_region uuid;
  v_actor uuid := auth.uid();
  v_actor_name text;
begin
  if (new.destination_move_type='warehouse') then
    v_region:=new.destination_region_id;
  else
    select w.region_id into v_region
    from inventorys s join racks r on r.id=s.rack_id join warehouses w on w.id=r.warehouse_id
    where s.id=new.destination_server_id;
  end if;

  select name into v_actor_name from public.user_profile where id = v_actor;

  if (tg_op='INSERT') then
    v_title := coalesce(v_actor_name,'Someone') || ' created relocation request';
  elsif (tg_op='UPDATE') then
    if (new.status is distinct from old.status) then
      v_title := coalesce(v_actor_name,'Someone') || ' changed status into ' || new.status;
    else
      v_title := coalesce(v_actor_name,'Someone') || ' updated relocation request';
    end if;
  end if;

  insert into public.notifications
    (table_name, entity_id, type, title, body, actor_user_id, requested_by, region_id, status)
  values
    ('relocation_requests', new.id::text, tg_op, v_title, null, v_actor, new.requested_by, v_region, new.status);

  return new;
end;
$$ language plpgsql;


create or replace function public.notify_inventory_requests()
returns trigger as $$
declare
  v_title text;
  v_region uuid;
  v_actor uuid := auth.uid();
  v_actor_name text;
begin
  if (new.destination_region_id is not null) then
    v_region := new.destination_region_id;
  else
    select w.region_id into v_region
    from inventorys s
    join racks r on r.id = s.rack_id
    join warehouses w on w.id = r.warehouse_id
    where s.id = new.server_id;
  end if;

  select name into v_actor_name from public.user_profile where id = v_actor;

  if (tg_op='INSERT') then
    v_title := coalesce(v_actor_name,'Someone') || ' created inventory request';
  elsif (tg_op='UPDATE') then
    if (new.status is distinct from old.status) then
      v_title := coalesce(v_actor_name,'Someone') || ' changed status into ' || new.status;
    else
      v_title := coalesce(v_actor_name,'Someone') || ' updated inventory request';
    end if;
  end if;

  insert into public.notifications
    (table_name, entity_id, type, title, body, actor_user_id, requested_by, region_id, status)
  values
    ('inventory_requests', new.id::text, tg_op, v_title, null, v_actor, new.requested_by, v_region, new.status);

  return new;
end;
$$ language plpgsql;


create or replace function public.notify_inventory_requests()
returns trigger as $$
declare
  v_title text;
  v_region uuid;
  v_actor uuid := auth.uid();        -- the current user
  v_actor_name text;
begin
  -- Resolve region via server -> rack -> warehouse
  select w.region_id into v_region
  from inventorys s
  join racks r on r.id = s.rack_id
  join warehouses w on w.id = r.warehouse_id
  where s.id = new.server_id;

  -- fetch actor display name
  select name into v_actor_name from public.user_profile where id = v_actor;

  -- set human-readable title
  if (tg_op='INSERT') then
    v_title := coalesce(v_actor_name,'Someone') || ' created inventory request';
  elsif (tg_op='UPDATE') then
    if (new.status is distinct from old.status) then
      v_title := coalesce(v_actor_name,'Someone') || ' changed status into ' || new.status;
    else
      v_title := coalesce(v_actor_name,'Someone') || ' updated inventory request';
    end if;
  end if;

  insert into public.notifications
    (table_name, entity_id, type, title, body, actor_user_id, requested_by, region_id, status)
  values
    ('inventory_requests', new.id::text, 
     case 
       when tg_op='INSERT' then 'created'
       when tg_op='UPDATE' and new.status is distinct from old.status then 'status_change'
       else 'updated'
     end,
     v_title, null, v_actor, new.requested_by, v_region, new.status);

  return new;
end;
$$ language plpgsql;


create or replace function public.notify_inventory_requests()
returns trigger as $$
declare
  v_title text;
  v_region uuid;
  v_actor uuid := auth.uid();
  v_actor_name text;
begin
  -- Resolve region for internal reference (optional, for logging)
  select w.region_id into v_region
  from inventorys s
  join racks r on r.id = s.rack_id
  join warehouses w on w.id = r.warehouse_id
  where s.id = new.server_id;

  -- fetch actor display name
  select name into v_actor_name from public.user_profile where id = v_actor;

  -- set human-readable title
  if (tg_op='INSERT') then
    v_title := coalesce(v_actor_name,'Someone') || ' created inventory request';
  elsif (tg_op='UPDATE') then
    if (new.status is distinct from old.status) then
      v_title := coalesce(v_actor_name,'Someone') || ' changed status into ' || new.status;
    else
      v_title := coalesce(v_actor_name,'Someone') || ' updated inventory request';
    end if;
  end if;

  -- Insert notification
  insert into public.notifications
    (table_name, entity_id, type, title, body, actor_user_id, requested_by, region_id, status)
  values
    ('inventory_requests', new.id::text,
     case 
       when tg_op='INSERT' then 'created'
       when tg_op='UPDATE' and new.status is distinct from old.status then 'status_change'
       else 'updated'
     end,
     v_title, null, v_actor, new.requested_by, v_region, new.status);

  return new;
end;
$$ language plpgsql;


create or replace function public.notify_inventory_requests()
returns trigger as $$
declare
  v_title text;
  v_actor uuid := auth.uid();
  v_actor_name text;
begin
  -- fetch actor display name
  select name into v_actor_name from public.user_profile where id = v_actor;

  -- set human-readable title
  if (tg_op='INSERT') then
    v_title := coalesce(v_actor_name,'Someone') || ' created inventory request';
  elsif (tg_op='UPDATE') then
    if (new.status is distinct from old.status) then
      v_title := coalesce(v_actor_name,'Someone') || ' changed status into ' || new.status;
    else
      v_title := coalesce(v_actor_name,'Someone') || ' updated inventory request';
    end if;
  end if;

  -- Insert notification
  insert into public.notifications
    (table_name, entity_id, type, title, body, actor_user_id, requested_by, region_id, status)
  values
    ('inventory_requests', new.id::text,
     case 
       when tg_op='INSERT' then 'created'
       when tg_op='UPDATE' and new.status is distinct from old.status then 'status_change'
       else 'updated'
     end,
     v_title, null, v_actor, new.requested_by, null, new.status);  -- set region_id null for inventory

  return new;
end;
$$ language plpgsql;


drop trigger if exists trg_notify_inventory_requests on public.inventory_requests;
