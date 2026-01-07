ALTER TABLE public.inventorys
ADD COLUMN customer_id uuid
REFERENCES public.customers(id)
ON DELETE SET NULL;