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




ALTER TABLE installation_requests
ALTER COLUMN server_id DROP NOT NULL;

ALTER TABLE installation_requests
ADD COLUMN destination_region_id uuid,
ADD COLUMN destination_warehouse_id uuid,
ADD COLUMN destination_rack_id uuid,
ADD COLUMN destination_start_unit integer,
ADD COLUMN destination_height integer;


ALTER TABLE installation_requests
ADD CONSTRAINT installation_requests_region_id_fkey
FOREIGN KEY (destination_region_id) REFERENCES regions(id);

ALTER TABLE installation_requests
ADD CONSTRAINT installation_requests_warehouse_id_fkey
FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses(id);

ALTER TABLE installation_requests
ADD CONSTRAINT installation_requests_rack_id_fkey
FOREIGN KEY (destination_rack_id) REFERENCES racks(id);


ALTER TABLE public.installation_requests
ADD COLUMN rejected_at timestamp with time zone null;


ALTER TABLE public.installation_requests
ADD COLUMN rejected_by uuid NULL REFERENCES user_profile(id);
