import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hageycspeylunxbreoto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2V5Y3NwZXlsdW54YnJlb3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjkyNzMsImV4cCI6MjA4OTI0NTI3M30.jHEWJtUI_fUM-7GFuaNjlnoRheYLXcPrhbEe5-d-WdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  const { data, error } = await supabase.from('items').select('name, type_id').limit(5);
  if (error) console.error('Items Error:', error);
  else console.log('Items:', JSON.stringify(data, null, 2));

  const { data: types, error: tError } = await supabase.from('item_types').select('id, name');
  if (tError) console.error('Types Error:', tError);
  else console.log('Types Count:', types?.length);
}

debug().catch(console.error);
