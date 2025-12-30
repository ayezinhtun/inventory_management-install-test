create table public.warehouses(
    id uuid primary key default gen_random_uuid(),
    name text not null,
    region_id uuid not null references regions(id) on delete cascade,
    description text,
    created_at timestamp with time zone default now()
);

alter table public.warehouses enable row level security;

create policy "Allow read for authenticated"
on public.warehouses
for select
to authenticated
using (true);

create policy "Allow insert for authenticated"
on public.warehouses
for insert
to authenticated
with check (true);

create policy "Allow update for authenticated"
on public.warehouses
for update
to authenticated
using (true)
with check (true);

create policy "Allow delete for authenticated"
on public.warehouses
for delete
to authenticated
using (true);