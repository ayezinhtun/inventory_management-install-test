create table public.customers (
    id uuid primary key default gen_random_uuid(),
    company_name text not null,
    contact_person text not null,
    contact_email text not null,
    contact_number text not null,
    address text,
    created_at timestamp with time zone default now()
);

alter table public.customers enable row level security;

create policy "Allow read for authenticated"
on public.customers
for select
to authenticated
using (true);


create policy "Allow insert for authenticated"
on public.customers
for insert
to authenticated
with check (true);

create policy "Allow update for authenticated"
on public.customers
for update
to authenticated
using (true)
with check (true);

create policy "Allow delete for authenticated"
on public.customers
for delete
to authenticated
using (true);