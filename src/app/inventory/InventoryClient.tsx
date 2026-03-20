'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Item } from '@/types/database';

export default function InventoryClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [filter, setFilter] = useState('');
  const [onlyOwned, setOnlyOwned] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(filter.toLowerCase()) || 
                          (item.item_types?.name?.toLowerCase() || "").includes(filter.toLowerCase());
    const matchesOwned = onlyOwned ? item.is_owned : true;
    return matchesSearch && matchesOwned;
  });

  const toggleOwned = async (item: Item) => {
    const newValue = !item.is_owned;
    
    // Update local state optimistically
    setItems(items.map(i => i.id === item.id ? { ...i, is_owned: newValue } : i));

    const { error } = await supabase
      .from('items')
      .update({ is_owned: newValue })
      .eq('id', item.id);

    if (error) {
      console.error('Error updating item:', error);
      // Rollback
      setItems(items.map(i => i.id === item.id ? { ...i, is_owned: !newValue } : i));
      alert('Erro ao atualizar item no banco de dados.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Carbon Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-[#393939] pb-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white uppercase">
            MEU <span className="font-light text-[#a8a8a8]">INVENTÁRIO</span>
          </h1>
          <p className="text-[#a8a8a8] text-lg max-w-xl font-medium mt-4">
            Gestão de posse de equipamentos para filtros precisos no planner.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative group min-w-[320px]">
            <input
              type="text"
              placeholder="PESQUISAR NO INVENTÁRIO..."
              className="w-full bg-[#161616] border-b border-[#393939] px-4 py-4 text-xs font-black tracking-widest text-white focus:outline-none focus:border-white transition-all placeholder-[#525252]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          <label className="flex items-center gap-4 px-6 py-4 bg-[#161616] border border-[#393939] cursor-pointer hover:border-[#525252] transition-all select-none">
            <input
              type="checkbox"
              checked={onlyOwned}
              onChange={(e) => setOnlyOwned(e.target.checked)}
              className="w-5 h-5 border-[#393939] bg-black text-[#3d5afe] focus:ring-0 rounded-none cursor-pointer"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a8a8a8]">Apenas o que eu tenho</span>
          </label>
        </div>
      </div>

      <div className="bg-[#161616] border border-[#393939] overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#262626] text-[11px] font-black uppercase tracking-[0.2em] text-[#a8a8a8] border-b border-[#393939]">
              <th className="px-8 py-5 w-32 text-center">Status</th>
              <th className="px-8 py-5">Equipamento</th>
              <th className="px-8 py-5">Categoria</th>
              <th className="px-8 py-5">Vantagem Extra</th>
              <th className="px-8 py-5 text-right">Raridade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#393939]">
            {filteredItems.map((item) => (
              <tr 
                key={item.id} 
                className={`group transition-all hover:bg-[#1f1f1f] ${item.is_owned ? 'bg-[#3d5afe]/5' : ''}`}
              >
                <td className="px-8 py-6 text-center">
                  <button
                    onClick={() => toggleOwned(item)}
                    className={`w-12 h-12 flex items-center justify-center transition-all border-2 ${
                      item.is_owned 
                      ? 'bg-[#3d5afe] border-[#3d5afe] text-white' 
                      : 'bg-black border-[#393939] text-[#525252] hover:border-white hover:text-white'
                    }`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 border-2 flex items-center justify-center text-xs font-black transition-all ${item.is_owned ? 'bg-white text-black border-white' : 'bg-[#262626] text-[#525252] border-[#393939]'}`}>
                         {item.level}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold text-lg leading-tight transition-colors ${item.is_owned ? 'text-white' : 'text-[#a8a8a8] group-hover:text-white'}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#525252] font-black uppercase tracking-widest mt-1">
                          NÍVEL {item.level}
                        </span>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[#a8a8a8] text-xs font-bold uppercase tracking-widest bg-[#262626] px-3 py-1 border border-[#393939]">
                    {item.item_types?.name || item.slot_type || '-'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  {item.skills?.name ? (
                    <div className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-widest">
                      <div className="w-2 h-2 bg-[#3d5afe]"></div>
                      {item.skills.name}
                    </div>
                  ) : (
                    <span className="text-[#393939] font-medium uppercase text-[10px] tracking-widest italic">Nenhuma</span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                    <span className={`inline-block px-4 py-2 text-[10px] font-black tracking-widest border-r-4 ${
                      item.rarity === 'Mítico' ? 'bg-[#ff4d00]/10 text-[#ff4d00] border-[#ff4d00]' :
                      item.rarity === 'Lendário' ? 'bg-[#ffc107]/10 text-[#ffc107] border-[#ffc107]' :
                      item.rarity === 'Épico' ? 'bg-[#9c27b0]/10 text-[#9c27b0] border-[#9c27b0]' :
                      item.rarity === 'Impecável' ? 'bg-[#2196f3]/10 text-[#2196f3] border-[#2196f3]' :
                      'bg-[#262626] text-[#888888] border-[#888888]'
                    }`}>
                      {(item.rarity || 'Comum').toUpperCase()}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems.length === 0 && (
          <div className="py-40 text-center border-t border-[#393939]">
             <p className="text-[#525252] text-xl font-bold uppercase tracking-[0.2em]">Nanhum item correspondente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
