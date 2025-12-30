create table public.regions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamp with time zone default now()
);

alter table public.regions enable row level security;

create policy "Allow read for authenticated"
on public.regions
for select
to authenticated
using (true);

create policy "Allow insert for authenticated"
on public.regions
for insert
to authenticated
with check (true);


create policy "Allow update for authenticated"
on public.regions
for update
to authenticated
using (true)
with check (true);

create policy "Allow delete for authenticated"
on public.regions
for delete
to authenticated
using (true)


-- in the sql editor do the name as unique