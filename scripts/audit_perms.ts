import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hageycspeylunxbreoto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2V5Y3NwZXlsdW54YnJlb3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjkyNzMsImV4cCI6MjA4OTI0NTI3M30.jHEWJtUI_fUM-7GFuaNjlnoRheYLXcPrhbEe5-d-WdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
  // Check some items
  const { data: items } = await supabase.from('items').select('name, slot_type, type_id, item_types(name)').limit(10);
  console.log('Sample Items:', JSON.stringify(items, null, 2));

  // Check Albert's perms again
  const { data: albert } = await supabase.from('heroes').select('id, name').eq('name', 'Albert').single();
  if (albert) {
    const { data: perms } = await supabase.from('hero_item_types').select('item_type_id, item_types(name)').eq('hero_id', albert.id);
    console.log('Albert Perms:', JSON.stringify(perms, null, 2));
  }
}

audit().catch(console.error);
