alter table public.inventorys
add constraint start_height_required_if_rack
check (
    (rack_id is null and start_unit is null and height is null)
    or
    (rack_id is not null and start_unit is not null and height is not null)
);
