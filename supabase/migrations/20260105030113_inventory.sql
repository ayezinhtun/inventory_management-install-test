create extension if not exists "pgcrypto";

create table public.inventorys (
    id uuid primary key default gen_random_uuid(), 
    warehouse_id uuid references public.warehouses(id) on delete restrict,
    rack_id uuid references public.racks(id) on delete restrict, 
    name text not null, 
    status text not null default 'active', 
    serial_no text, 
    type text not null, 
    model text not null, 
    vendor text not null, 
    start_unit int check (start_unit >=1), 
    height int check (height >=1), 
    color text not null default '#10b981', 
    notes text, 
    attributes jsonb default '{}'::jsonb, 
    image text, 
    created_at timestamptz not null default now(), 
    updated_at timestamptz not null default now()
);

create index if not exists idx_inventorys_warehouse on public.inventorys(warehouse_id);
create index if not exists idx_inventorys_rack on public.inventorys(rack_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
drop trigger if exists trg_inventorys_updated_at on public.inventorys;
create trigger trg_inventorys_updated_at
before update on public.inventorys
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.inventorys enable row level security;

-- Policies
create policy "Allow read for authenticated"
on public.inventorys
for select
to authenticated
using (true);

create policy "Allow insert for authenticated"
on public.inventorys
for insert
to authenticated
with check (true);

create policy "Allow update for authenticated"
on public.inventorys
for update
to authenticated
using (true)
with check (true);

create policy "Allow delete for authenticated"
on public.inventorys
for delete
to authenticated
using (true);

-- name is change into unique


-- do this in the sql editor 

