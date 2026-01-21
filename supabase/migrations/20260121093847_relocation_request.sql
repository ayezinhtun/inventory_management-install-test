CREATE TABLE relocation_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id uuid REFERENCES inventorys(id) NOT NULL,
    type text NOT NULL, 
    from_server_id uuid REFERENCES inventorys(id), 
    to_server_id uuid REFERENCES inventorys(id),   
    to_warehouse_id uuid REFERENCES warehouse(id), 
    requested_by uuid REFERENCES profiles(id),
    status text DEFAULT 'pending',
    notes text,
    pm_approved_by uuid REFERENCES profiles(id),
    pm_approved_at timestamptz,
    admin_approved_by uuid REFERENCES profiles(id),
    admin_approved_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now()
);
