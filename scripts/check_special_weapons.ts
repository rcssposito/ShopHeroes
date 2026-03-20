import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hageycspeylunxbreoto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2V5Y3NwZXlsdW54YnJlb3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjkyNzMsImV4cCI6MjA4OTI0NTI3M30.jHEWJtUI_fUM-7GFuaNjlnoRheYLXcPrhbEe5-d-WdY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecialWeapons() {
  const { data: types } = await supabase.from('item_types').select('id, name');
  if (!types) return;

  const targetTypes = ['Instrumento', 'Escudo', 'Projétil'];
  const typeIds = types.filter(t => targetTypes.includes(t.name)).map(t => t.id);

  const { data: items } = await supabase.from('items')
    .select('name, slot_type, item_type_id')
    .in('item_type_id', typeIds);
  
  const weapons = items?.filter(i => i.slot_type === 'Arma');
  console.log('Special items found as ARMA:', weapons);
  
  const aliciaTypes = ['Espada', 'Lança', 'Machado', 'Martelo'];
  const aliciaTypeIdList = types.filter(t => aliciaTypes.includes(t.name)).map(t => t.id);
  const { data: checkAlicia } = await supabase.from('items')
    .select('name, slot_type, item_type_id')
    .in('item_type_id', aliciaTypeIdList);
  
  const aliciaArmas = checkAlicia?.filter(i => i.slot_type === 'Arma');
  console.log('Alicia standard ARMAS count:', aliciaArmas?.length);
  const aliciaArmaTypesInDB = [...new Set(aliciaArmas?.map(i => {
      const tid = i.item_type_id;
      return types.find(t => t.id === tid)?.name;
  }))];
  console.log('Alicia standard ARMA types in DB:', aliciaArmaTypesInDB);
}

checkSpecialWeapons().catch(console.error);
