create table user_profile (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null, 
    email text not null,
    role text check (role in ('admin', 'PM', 'PC', 'engineer')) default 'engineer', 
    region_id uuid references regions(id), 
    warehouse_id uuid references warehouses(id),
    created_at timestamp with time zone default now()
);

create or replace function public.handle_new_user() 
returns trigger as $$
begin
    insert into public.user_profile (
        id, 
        name,
        email
    )
    values (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        new.email
    );
    return new;
end;
$$ language plpgsql security definer;


-- Trigger to call the funciton after a new user is inserted in auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();