CREATE TABLE public.user_warehouses (
    user_id uuid NOT NULL, 
    warehouse_id uuid NOT NULL, 
    created_at timestamp with time zone DEFAULT now(), 
    CONSTRAINT user_warehouses_pkey PRIMARY KEY (user_id, warehouse_id), 
    CONSTRAINT user_warehouses_user_fkey FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE, 
    CONSTRAINT user_warehouses_warehouse_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE
)
TABLESPACE pg_default;