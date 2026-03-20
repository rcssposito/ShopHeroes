import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hageycspeylunxbreoto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2V5Y3NwZXlsdW54YnJlb3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjkyNzMsImV4cCI6MjA4OTI0NTI3M30.jHEWJtUI_fUM-7GFuaNjlnoRheYLXcPrhbEe5-d-WdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlicia() {
  const { data: hero } = await supabase.from('heroes').select('id, name').eq('name', 'Alicia').single();
  if (!hero) return console.log('Alicia not found');

  const { data: perms } = await supabase.from('hero_item_types')
    .select('item_type_id, item_types(id, name)')
    .eq('hero_id', hero.id);
  
  console.log('Alicia absolute perms in DB:', perms?.map(p => (p.item_types as any).name));

  const { data: marteloType } = await supabase.from('item_types').select('id, name').eq('name', 'Martelo').single();
  const hasMartelo = perms?.some(p => p.item_type_id === marteloType?.id);
  console.log(`Alicia has Martelo ID [${marteloType?.id}] in perms?`, hasMartelo);

  const { data: items } = await supabase.from('items').select('name, item_type_id').eq('item_type_id', marteloType?.id).limit(5);
  console.log('Sample Martelo items item_type_id:', items?.map(i => i.item_type_id));
}

checkAlicia().catch(console.error);
