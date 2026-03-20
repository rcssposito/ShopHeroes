import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hageycspeylunxbreoto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2V5Y3NwZXlsdW54YnJlb3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjkyNzMsImV4cCI6MjA4OTI0NTI3M30.jHEWJtUI_fUM-7GFuaNjlnoRheYLXcPrhbEe5-d-WdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCount() {
  const { count, error } = await supabase.from('items').select('*', { count: 'exact', head: true });
  console.log('Items Count:', count);
  if (error) console.error('Error:', error);
  
  const { data: first } = await supabase.from('items').select('name, slot_type, type_id').limit(1);
  console.log('First Item:', first);
}

checkCount().catch(console.error);
