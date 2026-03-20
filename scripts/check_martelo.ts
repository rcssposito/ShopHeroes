import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hageycspeylunxbreoto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2V5Y3NwZXlsdW54YnJlb3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjkyNzMsImV4cCI6MjA4OTI0NTI3M30.jHEWJtUI_fUM-7GFuaNjlnoRheYLXcPrhbEe5-d-WdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMartelo() {
  const { data: types } = await supabase.from('item_types').select('id, name').eq('name', 'Martelo');
  if (!types || types.length === 0) return console.log('Type Martelo not found');
  
  const typeId = types[0].id;
  const { data: items } = await supabase.from('items')
    .select('name, slot_type')
    .eq('item_type_id', typeId);
  
  console.log('Martelo Items:', items);
}

checkMartelo().catch(console.error);
