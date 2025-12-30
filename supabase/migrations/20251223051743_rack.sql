create table public.racks (
    id uuid primary key default gen_random_uuid(),
    warehouse_id uuid not null references warehouses(id) on delete cascade,
    name text not null,
    size_u int default 42 not null,
    type text default 'mixed',
    status text default 'active',
    color text default '#3b82f6',
    notes text,
    created_at timestamp with time zone default now()
);

create index if not exists idx_racks_warehouse_id on racks(warehouse_id);

alter table public.racks enable row level security;

create policy "Allow read for authenticated"
on public.racks
for select
to authenticated
using (true);

create policy "Allow insert for authenticated"
on public.racks
for insert
to authenticated
with check (true);

create policy "Allow update for authenticated"
on public.racks
for update
to authenticated
using (true)
with check (true);

create policy "Allow delete for authenticated"
on public.racks
for delete
to authenticated
using (true);