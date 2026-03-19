-- Create custom ENUM types
CREATE TYPE item_slot_type AS ENUM ('Arma', 'Peito', 'Cabeça', 'Mãos', 'Pés', 'Acessório');
CREATE TYPE quality_type AS ENUM ('Normal', 'Bom', 'Ótimo', 'Excelente', 'Épico', 'Lendário', 'Mítico', 'Exclusivo');

-- items Table
CREATE TABLE public.items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type item_slot_type NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  effect_name TEXT,
  quality quality_type,
  description TEXT
);

-- heroes Table
CREATE TABLE public.heroes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT
);

-- builds Table
CREATE TABLE public.builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- build_slots Table
CREATE TABLE public.build_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  hero_index INTEGER NOT NULL CHECK (hero_index >= 1 AND hero_index <= 6),
  slot_type item_slot_type NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  UNIQUE(build_id, hero_index, slot_type)
);

-- RLS (Row Level Security) - currently open for simplicity in alpha
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read heroes" ON public.heroes FOR SELECT USING (true);

-- Allow all actions for builds/slots for now (replace with authenticated user logic later)
CREATE POLICY "Allow all actions builds" ON public.builds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions build_slots" ON public.build_slots FOR ALL USING (true) WITH CHECK (true);
