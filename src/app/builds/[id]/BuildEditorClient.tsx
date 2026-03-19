"use client";

import { useState } from "react";
import { Build, BuildSlot, Hero, Item, ItemSlotType, Skill } from "@/types/database";
import { supabase } from "@/lib/supabase";

interface BuildEditorClientProps {
  build: Build;
  heroes: Hero[];
  items: Item[];
  skills: Skill[];
  initialSlots: BuildSlot[];
}

const cols = [1, 2, 3, 4, 5, 6];
const slotMap: string[] = ['Arma', 'Peito', 'Cabeça', 'Mãos', 'Pés', 'Acessório 1', 'Acessório 2'];

export default function BuildEditorClient({ build, heroes, items, skills, initialSlots }: BuildEditorClientProps) {
  const [slots, setSlots] = useState<BuildSlot[]>(initialSlots);
  const [selectedHeroIds, setSelectedHeroIds] = useState<Record<number, string>>(() => {
    const initialHeroes: Record<number, string> = {};
    initialSlots.forEach(slot => {
      if (slot.hero_id) initialHeroes[slot.hero_index] = slot.hero_id;
    });
    return initialHeroes;
  });
  const [saving, setSaving] = useState(false);
  
  const teamBonuses = slots.reduce((acc: Record<string, number>, slot: BuildSlot) => {
    if (slot.item_id) {
      const item = items.find(i => i.id === slot.item_id);
      if (item && item.skills) {
        const s = item.skills;
        acc[s.name] = (acc[s.name] || 0) + s.value;
      }
    }

    const heroIdInCol = selectedHeroIds[slot.hero_index];
    if (heroIdInCol && slot.slot_type === 'Arma') { 
        const hero = heroes.find(h => h.id === heroIdInCol);
        if (hero && hero.hero_skills) {
            hero.hero_skills.forEach(hs => {
                if (hs.skills) {
                    acc[hs.skills.name] = (acc[hs.skills.name] || 0) + hs.skills.value;
                }
            });
        }
    }
    return acc;
  }, {} as Record<string, number>);

  const handleHeroChange = async (colIndex: number, heroId: string) => {
    setSaving(true);
    setSelectedHeroIds(prev => ({ ...prev, [colIndex]: heroId }));
    try {
        await supabase.from('build_slots').update({ hero_id: heroId || null }).eq('build_id', build.id).eq('hero_index', colIndex);
        setSlots(prev => prev.map(s => s.hero_index === colIndex ? { ...s, hero_id: heroId || null } : s));
    } catch (err) {
        console.error("Erro ao atualizar herói:", err);
    } finally {
        setSaving(false);
    }
  };

  const handleSlotChange = async (colIndex: number, slotType: string, valueId: string) => {
    setSaving(true);
    const existingSlot = slots.find(s => s.hero_index === colIndex && s.slot_type === slotType);
    const heroId = selectedHeroIds[colIndex] || null;
    
    try {
      if (existingSlot) {
        if (!valueId) {
          await supabase.from('build_slots').delete().eq('id', existingSlot.id);
          setSlots(prev => prev.filter(s => s.id !== existingSlot.id));
        } else {
          await supabase.from('build_slots').update({ item_id: valueId, hero_id: heroId }).eq('id', existingSlot.id);
          setSlots((prev: BuildSlot[]) => prev.map(s => s.id === existingSlot.id ? { ...s, item_id: valueId, hero_id: heroId } : s));
        }
      } else if (valueId) {
        const { data, error } = await supabase.from('build_slots').insert({
          build_id: build.id,
          hero_index: colIndex,
          slot_type: slotType,
          item_id: valueId,
          hero_id: heroId
        }).select().single();
        if (error) throw error;
        if (data) setSlots((prev: BuildSlot[]) => [...prev, data as BuildSlot]);
      }
    } catch (err) {
      console.error("Erro ao salvar slot:", err);
    } finally {
      setSaving(false);
    }
  };

  const getSlotValue = (colIndex: number, slotType: string) => {
    return slots.find(s => s.hero_index === colIndex && s.slot_type === slotType)?.item_id || "";
  };

  const getFilteredItems = (colIndex: number, slotType: string) => {
    const heroId = selectedHeroIds[colIndex];
    const hero = heroes.find(h => h.id === heroId);
    let filtered = items.filter(i => i.slot_type === (slotType.startsWith('Acessório') ? 'Acessório' : slotType));
    
    if (hero && hero.hero_item_types && hero.hero_item_types.length > 0) {
      const allowedTypeIds = hero.hero_item_types.map(hit => hit.item_type_id);
      filtered = filtered.filter(i => 
        (i.item_type_id && allowedTypeIds.includes(i.item_type_id))
      );
    }
    return filtered;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      <div className="flex-1 w-full bg-secondary/10 border border-white/5 rounded-3xl p-8 overflow-x-auto relative shadow-inner">
        {saving && (
           <div className="absolute top-6 right-8 text-primary/80 text-xs flex items-center gap-2 font-bold uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div> Sincronizando...
           </div>
        )}
        <div className="min-w-[900px] flex gap-4">
          {cols.map((col) => (
            <div key={col} className="flex-1 flex flex-col gap-2 min-w-[140px] bg-black/20 p-3 rounded-2xl border border-white/5">
              <div className="text-center font-black text-[10px] uppercase tracking-tighter text-slate-500 mb-1">
                Herói {col}
              </div>
              <select 
                className="w-full bg-secondary border border-white/10 rounded-lg p-2 text-xs focus:border-primary outline-none transition-all"
                onChange={(e) => handleHeroChange(col, e.target.value)}
                value={selectedHeroIds[col] || ""}
              >
                <option value="">Selecione...</option>
                {heroes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>

              <div className="mt-2 space-y-1.5">
                {slotMap.map((slotType) => {
                  const availableItems = getFilteredItems(col, slotType);
                  const hasHero = !!selectedHeroIds[col];
                  return (
                    <div key={`${col}-${slotType}`} className={`flex flex-col gap-0.5 group ${!hasHero ? 'opacity-30 pointer-events-none' : ''}`}>
                      <label className="text-[9px] uppercase font-bold text-slate-500 ml-1 tracking-widest">
                        {slotType}
                      </label>
                      <select 
                        value={getSlotValue(col, slotType)}
                        onChange={(e) => handleSlotChange(col, slotType, e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-[11px] text-slate-200 focus:border-primary/60 outline-none hover:bg-black/60"
                      >
                        <option value="">Vazio</option>
                        {availableItems.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full xl:w-80 bg-secondary/30 border border-white/10 rounded-2xl p-6 sticky top-24 shadow-2xl">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">Resumo da Equipe (V5)</h3>
        <div className="space-y-3">
          {Object.entries(teamBonuses).sort((a,b) => b[1] - a[1]).map(([effect, score]) => (
            <div key={effect} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <span className="font-medium text-slate-200">{effect}</span>
              <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">+{score as number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
