-- Fix function search_path for generate_reference_number function
CREATE OR REPLACE FUNCTION public.generate_reference_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ref_num TEXT;
  year_part TEXT;
  seq_part TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  seq_part := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  ref_num := 'MGB-' || year_part || '-' || seq_part;
  RETURN ref_num;
END;
$$;