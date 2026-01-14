CREATE TABLE public.inventory_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
    requester_id uuid NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
    item_name text NOT NULL, 
    quantity int NOT NULL DEFAULT 1, 
    notes text, 
    image_url text, 
    status text NOT NULL DEFAULT 'Pending',
    created_at timestamptz NOT NULL DEFAULT now(), 
    updated_at timestamptz NOT NULL DEFAULT now()
);
