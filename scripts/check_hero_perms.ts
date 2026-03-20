import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hageycspeylunxbreoto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2V5Y3NwZXlsdW54YnJlb3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjkyNzMsImV4cCI6MjA4OTI0NTI3M30.jHEWJtUI_fUM-7GFuaNjlnoRheYLXcPrhbEe5-d-WdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: hero } = await supabase.from('heroes').select('id, name').eq('name', 'Albert').single();
  if (!hero) return console.log('Hero not found');

  const { data: allowed } = await supabase.from('hero_item_types').select('item_type_id, item_types(name)').eq('hero_id', hero.id);
  console.log(`Allowed types for ${hero.name}:`, allowed?.map(a => (a.item_types as any).name));
}

check().catch(console.error);
