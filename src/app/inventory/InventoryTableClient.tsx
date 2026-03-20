'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Item } from '@/types/database';

export default function InventoryTableClient({ initialItems, userId }: { initialItems: any[], userId: string | undefined }) {
  const [items, setItems] = useState<any[]>(initialItems);
  const supabase = createClient();
  const [onlyOwned, setOnlyOwned] = useState(false);

  const filteredItems = items.filter(item => {
    return onlyOwned ? item.is_owned : true;
  });

  const toggleOwned = async (item: any) => {
    if (!userId) {
      alert("Faça login para salvar seus equipamentos.");
      return window.location.href = '/login';
    }

    const newValue = !item.is_owned;
    
    // Optimistic update
    setItems(items.map(i => i.id === item.id ? { ...i, is_owned: newValue } : i));

    let resError = null;

    if (newValue) {
      const { error } = await supabase.from('user_items').insert({ user_id: userId, item_id: item.id });
      resError = error;
    } else {
      const { error } = await supabase.from('user_items').delete().eq('user_id', userId).eq('item_id', item.id);
      resError = error;
    }

    if (resError) {
      console.error('Error updating item:', resError);
      // Rollback
      setItems(items.map(i => i.id === item.id ? { ...i, is_owned: !newValue } : i));
      alert('Erro ao atualizar posse do item.');
    }
  };

  const rarityStyle = (rarity: string) => {
    switch(rarity) {
      case 'Mítico':    return 'border-[#ff4d00] text-[#ff4d00] bg-[#ff4d00]/5';
      case 'Lendário':  return 'border-[#ffc107] text-[#ffc107] bg-[#ffc107]/5';
      case 'Épico':     return 'border-[#9c27b0] text-[#9c27b0] bg-[#9c27b0]/5';
      case 'Impecável': return 'border-[#2196f3] text-[#2196f3] bg-[#2196f3]/5';
      default:          return 'border-[#525252] text-[#888888] bg-[#262626]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar: Count + Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[#525252] text-xs font-bold tracking-widest uppercase">
          {filteredItems.length} ITENS ENCONTRADOS
        </p>
        <label className="flex items-center gap-4 px-6 py-3 bg-[#161616] border border-[#393939] cursor-pointer hover:border-[#525252] transition-all select-none">
          <input
            type="checkbox"
            checked={onlyOwned}
            onChange={(e) => setOnlyOwned(e.target.checked)}
            className="w-5 h-5 border-[#393939] bg-black text-[#3d5afe] focus:ring-0 rounded-none cursor-pointer"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a8a8a8]">Apenas o que eu tenho</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-[#393939] overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#262626] text-[11px] font-black uppercase tracking-[0.2em] text-[#a8a8a8] border-b border-[#393939]">
              <th className="px-8 py-5 w-24 text-center">Posse</th>
              <th className="px-8 py-5">Equipamento</th>
              <th className="px-8 py-5">Efeito / Skill</th>
              <th className="px-8 py-5">Origem</th>
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
                    className={`w-10 h-10 flex items-center justify-center transition-all border-2 mx-auto ${
                      item.is_owned 
                      ? 'bg-[#3d5afe] border-[#3d5afe] text-white' 
                      : 'bg-black border-[#393939] text-[#525252] hover:border-white hover:text-white'
                    }`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 flex items-center justify-center text-sm font-black transition-all border shrink-0 ${
                        item.is_owned ? 'bg-white text-black border-white' : 'bg-black border-[#393939] text-white group-hover:border-[#525252]'
                      }`}>
                         {item.level}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold text-lg leading-tight transition-colors ${
                          item.is_owned ? 'text-white' : 'text-white group-hover:text-[#3d5afe]'
                        }`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#525252] font-black uppercase tracking-[0.1em] mt-1">
                          {item.item_types?.name || item.slot_type}
                        </span>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-6">
                  {item.skills?.name ? (
                    <div className="flex flex-col gap-2">
                      <div className={`flex items-center gap-3 font-bold transition-colors ${
                        item.is_owned ? 'text-white' : 'text-white group-hover:text-[#3d5afe]'
                      }`}>
                        <div className="w-1.5 h-1.5 bg-[#3d5afe] shadow-[0_0_8px_#3d5afe]"></div>
                        {item.skills.name}
                      </div>
                      {item.skills.description && (
                        <p className="text-[10px] text-[#525252] leading-tight italic max-w-[240px] group-hover:text-[#a8a8a8] transition-colors line-clamp-2">
                          {item.skills.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#393939] italic font-medium">Sem Skill Especial</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <span className="text-[#a8a8a8] text-xs font-medium">
                    {item.where_to_get || '-'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                    <span className={`inline-block px-4 py-2 text-[10px] font-black tracking-[0.1em] border-l-2 ${rarityStyle(item.rarity || '')}`}>
                      {(item.rarity || 'Comum').toUpperCase()}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems.length === 0 && (
          <div className="py-32 text-center border-t border-[#393939] bg-black/20">
             <p className="text-[#525252] text-xl font-bold uppercase tracking-widest">Nenhum item encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
