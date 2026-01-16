CREATE TABLE installations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id uuid NOT NULL REFERENCES inventorys(id),
    server_id uuid NOT NULL REFERENCES inventorys(id),
    quantity integer NOT NULL CHECK (quantity > 0),
    installed_by uuid NOT NULL REFERENCES auth.users(id),
    installed_at timestamp with time zone DEFAULT now(),
    attributes jsonb DEFAULT '{}'::jsonb
);


DROP TABLE IF EXISTS component_requests;

CREATE TABLE component_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id uuid NOT NULL REFERENCES inventorys(id),
    server_id uuid NOT NULL REFERENCES inventorys(id),
    quantity integer NOT NULL CHECK (quantity > 0),
    status text NOT NULL DEFAULT 'pending',
    requested_by uuid NOT NULL,
    requested_at timestamptz DEFAULT now(),
    approved_by_pm uuid NULL,
    approved_at_pm timestamptz NULL,
    approved_by_admin uuid NULL,
    approved_at_admin timestamptz NULL,
    completed_at timestamptz NULL,
    notes text NULL
);



ALTER TABLE component_requests
ADD COLUMN attributes jsonb DEFAULT '{}'::jsonb;


