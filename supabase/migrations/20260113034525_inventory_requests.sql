CREATE TABLE public.inventory_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    item_name text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    notes text NULL,
    image text NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at_inventory_request()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_requests_updated_at
BEFORE UPDATE ON public.inventory_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_inventory_request();
