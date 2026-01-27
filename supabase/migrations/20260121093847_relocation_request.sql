create table if not exists relocation_requests (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references inventorys(id),

  source_server_id uuid not null references inventorys(id),

  destination_move_type text not null check (destination_move_type in ('server','warehouse')),
  destination_server_id uuid null references inventorys(id),

  destination_region_id uuid null references regions(id),
  destination_warehouse_id uuid null references warehouses(id),

  quantity integer not null check (quantity > 0),

  status text not null default 'pm_approve_pending',
  requested_by uuid not null references auth.users(id),
  created_at timestamptz default now(),

  pm_approved_by uuid null references auth.users(id),
  pm_approved_at timestamptz null,

  admin_approved_by uuid null references auth.users(id),
  admin_approved_at timestamptz null,

  rejected_by uuid null references auth.users(id),
  rejected_at timestamptz null,

  completed_at timestamptz null
);

create index if not exists idx_reloc_status on relocation_requests(status);
create index if not exists idx_reloc_source on relocation_requests(source_server_id);
create index if not exists idx_reloc_inventory on relocation_requests(inventory_id);




alter table relocation_requests
  drop constraint if exists relocation_requests_requested_by_fkey;


alter table relocation_requests
  add constraint relocation_requests_requested_by_fkey
  foreign key (requested_by) references user_profile(id);


create index if not exists idx_reloc_requested_by on relocation_requests(requested_by);


ALTER TABLE public.relocation_requests
ADD COLUMN notes text;
