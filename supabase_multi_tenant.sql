-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- CRITICAL CONFIGURATION STEP (READ THIS FIRST):
-- Since you are using a simplified username (fake email @sh.com),
-- Supabase will block your login until you confirm the email (which is impossible).
-- 
-- GO TO YOUR SUPABASE DASHBOARD:
-- 1. Authentication -> Providers -> Email
-- 2. DISABLE the "Confirm Email" (Confirmar e-mail) toggle.
-- 3. Click SAVE.
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

-- ==============================================================================
-- 1. Create User Items Table (Inventory Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    item_id UUID REFERENCES public.items NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, item_id)
);

-- ==============================================================================
-- 2. Update Builds Table
-- ==============================================================================
ALTER TABLE public.builds ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users;

-- Optional: If you want to claim existing builds to yourself during this transition, 
-- you can run this AFTER logging in once (replace with your auth.uid):
-- UPDATE public.builds SET user_id = 'YOUR-UUID-HERE' WHERE user_id IS NULL;


-- ==============================================================================
-- 3. Enable Row Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_slots ENABLE ROW LEVEL SECURITY;

-- Disable any old public active policies if they exist (ignore errors if they don't)
-- DROP POLICY IF EXISTS "public" ON public.builds;
-- DROP POLICY IF EXISTS "public" ON public.build_slots;

-- ==============================================================================
-- 4. Create RLS Policies
-- ==============================================================================

-- USER ITEMS:
DROP POLICY IF EXISTS "Users can manage their own inventory items" ON public.user_items;
CREATE POLICY "Users can manage their own inventory items" 
ON public.user_items FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- BUILDS:
-- Users can only see, edit, and delete their own builds
DROP POLICY IF EXISTS "Users can manage their own builds" ON public.builds;
CREATE POLICY "Users can manage their own builds" 
ON public.builds FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- BUILD SLOTS:
-- Users can only manage slots for builds that belong to them
DROP POLICY IF EXISTS "Users can manage slots for their own builds" ON public.build_slots;
CREATE POLICY "Users can manage slots for their own builds" 
ON public.build_slots FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.builds b 
  WHERE b.id = build_slots.build_id 
  AND b.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.builds b 
  WHERE b.id = build_slots.build_id 
  AND b.user_id = auth.uid()
));
