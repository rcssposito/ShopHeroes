import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hageycspeylunxbreoto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2V5Y3NwZXlsdW54YnJlb3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjkyNzMsImV4cCI6MjA4OTI0NTI3M30.jHEWJtUI_fUM-7GFuaNjlnoRheYLXcPrhbEe5-d-WdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlicia() {
  const { data: hero } = await supabase.from('heroes').select('id, name').eq('name', 'Alicia').single();
  if (!hero) return console.log('Alicia not found');

  const { data: perms } = await supabase.from('hero_item_types')
    .select('item_type_id, item_types(name)')
    .eq('hero_id', hero.id);
  
  console.log('Alicia Perms in DB:', perms?.map(p => (p.item_types as any).name).join(', '));

  // Check which of these are actually "Arma" slot in items table
  const { data: items } = await supabase.from('items')
    .select('name, slot_type, item_types(name)')
    .eq('slot_type', 'Arma');
  
  const aliciaArmas = items?.filter(i => perms?.some(p => (p.item_types as any).name === (i.item_types as any).name));
  console.log('Alicia Weapons found in Items table:', [...new Set(aliciaArmas?.map(i => (i.item_types as any).name))]);
}

checkAlicia().catch(console.error);
