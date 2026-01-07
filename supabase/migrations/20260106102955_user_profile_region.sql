CREATE TABLE public.user_regions (
    user_id uuid NOT NULL, 
    region_id uuid NOT NULL, 
    created_at timestamp with time zone DEFAULT now(), 
    CONSTRAINT user_regions_pkey PRIMARY KEY (user_id, region_id), 
    CONSTRAINT user_regions_user_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE, 
    CONSTRAINT user_regions_region_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE
) 
TABLESPACE pg_default;