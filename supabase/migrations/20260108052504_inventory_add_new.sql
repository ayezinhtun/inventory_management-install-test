ALTER TABLE public.inventorys
ADD COLUMN region_id uuid NULL;

ALTER TABLE public.inventorys
ADD CONSTRAINT inventorys_region_id_fkey
FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE RESTRICT;

ALTER TABLE public.inventorys
ADD COLUMN quantity integer NOT NULL DEFAULT 1;
