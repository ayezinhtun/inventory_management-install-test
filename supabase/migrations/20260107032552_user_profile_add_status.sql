ALTER TABLE public.user_profile
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'));


create or replace function public.handle_new_user() 
returns trigger as $$
begin
    insert into public.user_profile (
        id, 
        name,
        email,
        status
    )
    values (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        new.email,
        'active'
    );
    return new;
end;
$$ language plpgsql security definer;
