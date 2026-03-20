import { supabase } from '@/lib/supabase';
import InventoryClient from './InventoryClient';
import { Item } from '@/types/database';

export const revalidate = 0; // Disable cache for items list

export default async function InventoryPage() {
  const { data: items, error } = await supabase
    .from('items')
    .select(`
      *,
      item_types (name),
      skills (name, value)
    `)
    .order('level', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    return <div>Erro ao carregar itens: {error.message}</div>;
  }

  return (
    <main className="min-h-screen pt-20">
      <InventoryClient initialItems={items as any} />
    </main>
  );
}
