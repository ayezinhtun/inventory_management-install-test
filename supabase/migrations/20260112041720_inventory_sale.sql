CREATE TABLE public.customer_sales (
    id uuid NOT NULL DEFAULT gen_random_uuid(), 
    inventory_id uuid NOT NULL, 
    customer_id uuid NOT NULL, 
    quantity integer NOT NULL DEFAULT 1, 
    sold_at timestamptz NOT NULL DEFAULT now(), 
    notes text NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE, 
    CONSTRAINT fk_inventory FOREIGN KEY (inventory_id) REFERENCES inventorys(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customer_sales_inventory ON public.customer_sales(inventory_id);
CREATE INDEX IF NOT EXISTS idx_customer_sales_custoer ON public.customer_sales(customer_id);