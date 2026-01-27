create table public.reserved_stocks (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references inventorys(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  notes text null,
  created_at timestamptz default now()
);
