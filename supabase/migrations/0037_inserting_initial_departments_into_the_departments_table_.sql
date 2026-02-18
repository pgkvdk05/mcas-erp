INSERT INTO public.departments (name, code)
VALUES
  ('B.Sc Computer Science', 'CS'),
  ('B.Com General', 'BCOM'),
  ('B.A English', 'BAENG'),
  ('B.Com Computer Application', 'BCOMCA')
ON CONFLICT (name) DO NOTHING;