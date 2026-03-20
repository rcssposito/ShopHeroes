import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const supabaseUrl = 'https://hageycspeylunxbreoto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZ2V5Y3NwZXlsdW54YnJlb3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjkyNzMsImV4cCI6MjA4OTI0NTI3M30.jHEWJtUI_fUM-7GFuaNjlnoRheYLXcPrhbEe5-d-WdY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Load authoritative mapping directly from the user's JSON
const jsonPath = resolve('D:/rcssp/Downloads/scripts/ShopHeroes/shop_heroes_personagens.json');
const heroData: Record<string, Record<string, string[]>> = JSON.parse(readFileSync(jsonPath, 'utf-8'));

async function seed() {
  const { data: heroes } = await supabase.from('heroes').select('id, name');
  const { data: types }  = await supabase.from('item_types').select('id, name');
  if (!heroes || !types) return console.error('Could not fetch heroes/types');

  const typeMap = Object.fromEntries(types.map(t => [t.name.trim(), t.id]));
  const heroMap = Object.fromEntries(heroes.map(h => [h.name.trim(), h.id]));

  console.log('Available heroes in DB:', Object.keys(heroMap).sort());
  console.log('Heroes in JSON:', Object.keys(heroData).sort());

  console.log('\nCleaning hero_item_types...');
  await supabase.from('hero_item_types').delete().neq('item_type_id', '00000000-0000-0000-0000-000000000000');

  const inserts: { hero_id: string; item_type_id: string }[] = [];

  for (const [heroName, slots] of Object.entries(heroData)) {
    const heroId = heroMap[heroName];
    if (!heroId) {
      console.warn(`Hero NOT FOUND in DB: [${heroName}]`);
      continue;
    }

    // Combine all slot types into one unique permission set
    const allTypes = new Set<string>();
    for (const typeList of Object.values(slots)) {
      for (const t of typeList) allTypes.add(t.trim());
    }

    for (const typeName of allTypes) {
      const typeId = typeMap[typeName];
      if (!typeId) {
        console.warn(`  Type NOT FOUND: [${typeName}] for hero [${heroName}]`);
        continue;
      }
      inserts.push({ hero_id: heroId, item_type_id: typeId });
    }
  }

  console.log(`\nInserting ${inserts.length} permissions...`);
  const { error } = await supabase.from('hero_item_types').insert(inserts);
  if (error) console.error('Insert error:', error);
  else console.log('Done! Permissions seeded from official JSON.');

  // Verify Kurul specifically
  const { data: kurul } = await supabase.from('heroes').select('id').eq('name','Kurul').single();
  if (kurul) {
    const { data: perms } = await supabase.from('hero_item_types')
      .select('item_types(name)').eq('hero_id', kurul.id);
    const names = perms?.map((p: any) => p.item_types?.name).sort();
    console.log('\n✅ Kurul permissions after seed:', names);
  }
}

seed().catch(console.error);
