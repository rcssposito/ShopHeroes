'use client';

import { useState, useMemo } from 'react';
import { Hero, Item, Build, Skill } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface BuildEditorClientProps {
  build: Build;
  heroes: Hero[];
  items: Item[];
  skills: Skill[];
  initialSlots: any[];
}

const SLOT_NAMES = ['Arma', 'Peito', 'Cabeça', 'Mãos', 'Pés', 'Acessório 1', 'Acessório 2'];

// --- SVG Radar Chart ---
interface RadarChartProps {
  data: { label: string; value: number; max: number }[];
}

function RadarChart({ data }: RadarChartProps) {
  if (!data || data.length < 3) {
    return (
      <div className="flex items-center justify-center h-48 text-[#525252] text-xs font-bold tracking-widest">
        DADOS INSUFICIENTES
      </div>
    );
  }

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 85;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (i: number, r: number) => ({
    x: Math.round((cx + r * Math.cos(i * angleStep - Math.PI / 2)) * 1000) / 1000,
    y: Math.round((cy + r * Math.sin(i * angleStep - Math.PI / 2)) * 1000) / 1000,
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const valuePoints = data.map((d, i) => {
    const ratio = d.max > 0 ? Math.min(d.value / d.max, 1) : 0;
    return getPoint(i, ratio * radius);
  });

  const valuePath = valuePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg width={size} height={size} className="mx-auto overflow-visible">
      {/* Grid lines */}
      {gridLevels.map((level) => {
        const pts = data.map((_, i) => getPoint(i, level * radius));
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
        return <path key={level} d={path} fill="none" stroke="#262626" strokeWidth="1" />;
      })}
      {/* Axis lines */}
      {data.map((_, i) => {
        const outer = getPoint(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#393939" strokeWidth="1" />;
      })}
      {/* Value area */}
      <path d={valuePath} fill="rgba(61,90,254,0.15)" stroke="#3d5afe" strokeWidth="2" />
      {/* Value dots */}
      {valuePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3d5afe" />
      ))}
      {/* Labels */}
      {data.map((d, i) => {
        const labelPt = getPoint(i, radius + 24);
        const anchor = labelPt.x < cx - 5 ? 'end' : labelPt.x > cx + 5 ? 'start' : 'middle';
        return (
          <text key={i} x={labelPt.x} y={labelPt.y} textAnchor={anchor} dominantBaseline="middle" fill="#a8a8a8" fontSize="9" fontWeight="700" letterSpacing="1">
            {d.label.toUpperCase()}
          </text>
        );
      })}
      {/* Value labels */}
      {valuePoints.map((p, i) => (
        data[i].value > 0 && (
          <text key={`v${i}`} x={p.x} y={p.y - 8} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="900">
            {data[i].value}
          </text>
        )
      ))}
    </svg>
  );
}

export default function BuildEditorClient({ 
  build: propBuild, 
  heroes, 
  items,
  skills,
  initialSlots
}: BuildEditorClientProps) {
  const [build, setBuild] = useState<Build>(propBuild);
  const [slots, setSlots] = useState<any[]>(initialSlots);
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [onlyOwned, setOnlyOwned] = useState(false);

  const getDescription = (name: string) => {
    const skill = skills.find(s => s.name === name);
    return skill?.description || null;
  };

  const getSkillValue = (name: string) => {
    const skill = skills.find(s => s.name === name);
    return skill?.value || 0;
  };

  const getHeroForIndex = (index: number) => {
     const slot = slots.find(s => s.hero_index === index && s.hero_id);
     return slot ? heroes.find(h => h.id === slot.hero_id) : null;
  };

  // Stats calculation — count per skill, total bonus = count * skill.value
  const projectStats = useMemo(() => {
    const counts: Record<string, number> = {};

    const indices = [0, 1, 2, 3, 4, 5];
    indices.forEach(idx => {
       const hero = getHeroForIndex(idx);
       if (!hero) return;

       // 1. Hero Innate Skills (Passives)
       hero.hero_skills?.forEach((hs: any) => {
         if (!hs.skills) return;
         const skillName = hs.skills.name;
         counts[skillName] = (counts[skillName] || 0) + 1;
       });

       // 2. Equipment Skills for this hero
       const heroSlots = slots.filter(s => s.hero_index === idx && s.item_id);
       heroSlots.forEach(slot => {
          const item = items.find(i => i.id === slot.item_id);
          if (item?.skills?.name) {
             counts[item.skills.name] = (counts[item.skills.name] || 0) + 1;
          }
       });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        value: getSkillValue(name),
        total: count * getSkillValue(name),
      }))
      .sort((a, b) => b.total - a.total || b.count - a.count);
  }, [slots, heroes, items, skills]);

  // Radar chart data — 5 axes exactly as in the spreadsheet
  const radarData = useMemo(() => {
    const artifactKeywords = ['Encontrar mágica', 'Detectar segredo'];
    const velocitaKeywords = ['Velocista 1', 'Velocista 2', 'Velocista 3'];
    const reviverKeywords  = ['Reviver 1', 'Reviver 2', 'Reviver 3'];
    const suporteKeywords  = ['Suporte 1', 'Suporte 2', 'Suporte 3', 'Engenhoso 1', 'Engenhoso 2', 'Engenhoso 3'];

    // Separate equipment-only counts from hero passive counts
    const equipCounts: Record<string, number> = {};
    const heroCounts:  Record<string, number> = {};

    [0, 1, 2, 3, 4, 5].forEach(idx => {
      const hero = getHeroForIndex(idx);
      if (!hero) return;

      hero.hero_skills?.forEach((hs: any) => {
        if (!hs.skills) return;
        const n = hs.skills.name;
        heroCounts[n] = (heroCounts[n] || 0) + 1;
      });

      slots.filter(s => s.hero_index === idx && s.item_id).forEach(slot => {
        const item = items.find(i => i.id === slot.item_id);
        if (item?.skills?.name) {
          const n = item.skills.name;
          equipCounts[n] = (equipCounts[n] || 0) + 1;
        }
      });
    });

    const sumBonus = (counts: Record<string, number>, keywords: string[]) =>
      keywords.reduce((acc, k) => acc + (counts[k] || 0) * getSkillValue(k), 0);

    const artefatoExtra = sumBonus(equipCounts, artifactKeywords);
    const velocista     = sumBonus({ ...equipCounts, ...Object.fromEntries(Object.entries(heroCounts).map(([k,v]) => [k, (equipCounts[k]||0)+v])) }, velocitaKeywords);
    const reviver       = sumBonus({ ...equipCounts, ...Object.fromEntries(Object.entries(heroCounts).map(([k,v]) => [k, (equipCounts[k]||0)+v])) }, reviverKeywords);
    const suporte       = sumBonus({ ...equipCounts, ...Object.fromEntries(Object.entries(heroCounts).map(([k,v]) => [k, (equipCounts[k]||0)+v])) }, suporteKeywords);
    const artefatoTotal = sumBonus(
      Object.fromEntries(
        [...new Set([...Object.keys(equipCounts), ...Object.keys(heroCounts)])].map(k => [k, (equipCounts[k]||0) + (heroCounts[k]||0)])
      ),
      artifactKeywords
    );

    return [
      { label: 'Artefato Total', value: artefatoTotal, max: 300 },
      { label: 'Velocista',      value: velocista,     max: 100 },
      { label: 'Reviver',        value: reviver,       max: 100 },
      { label: 'Suporte',        value: suporte,       max: 18  },
    ];
  }, [slots, heroes, items, skills]);

  const updateName = async (newName: string) => {
    setBuild({ ...build, name: newName });
    await supabase.from('builds').update({ name: newName }).eq('id', build.id);
  };

  const updateHero = async (index: number, heroId: string | null) => {
    if (heroId) {
       const existingHeroSlot = slots.find(s => s.hero_index === index);
       if (existingHeroSlot) {
          const updatedSlots = slots.map(s => s.hero_index === index ? { ...s, hero_id: heroId } : s);
          setSlots(updatedSlots);
          await supabase.from('build_slots').update({ hero_id: heroId }).eq('build_id', build.id).eq('hero_index', index);
       } else {
          const newSlot = { build_id: build.id, hero_index: index, hero_id: heroId, slot_type: 'Baseline' };
          setSlots([...slots, newSlot]);
          await supabase.from('build_slots').insert(newSlot);
       }
    } else {
       setSlots(slots.filter(s => s.hero_index !== index));
       await supabase.from('build_slots').delete().eq('build_id', build.id).eq('hero_index', index);
    }
  };

  const updateEquipment = async (heroIndex: number, slotName: string, itemId: string | null) => {
    const hero = getHeroForIndex(heroIndex);
    if (!hero) return;

    if (itemId) {
       const existingSlot = slots.find(s => s.hero_index === heroIndex && s.slot_type === slotName);
       if (existingSlot) {
          const updatedSlots = slots.map(s => (s.hero_index === heroIndex && s.slot_type === slotName) ? { ...s, item_id: itemId } : s);
          setSlots(updatedSlots);
          await supabase.from('build_slots').update({ item_id: itemId }).eq('id', existingSlot.id);
       } else {
          const newSlot = { build_id: build.id, hero_index: heroIndex, hero_id: hero.id, slot_type: slotName, item_id: itemId };
          const { data } = await supabase.from('build_slots').insert(newSlot).select().single();
          if (data) setSlots([...slots, data]);
       }
    } else {
       const existingSlot = slots.find(s => s.hero_index === heroIndex && s.slot_type === slotName);
       if (existingSlot) {
          setSlots(slots.filter(s => s.id !== existingSlot.id));
          await supabase.from('build_slots').delete().eq('id', existingSlot.id);
       }
    }
  };

  const currentHero = getHeroForIndex(selectedHeroIndex);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col xl:flex-row gap-12">
        <div className="flex-1 space-y-12">
          {/* Hero Selection Grid */}
          <div className="bg-[#161616] border border-[#393939] p-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a8a8a8] mb-8">Composição da Equipe (6 Slots)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const h = getHeroForIndex(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedHeroIndex(idx)}
                    className={`aspect-square border-2 flex flex-col items-center justify-center p-2 transition-all ${
                      selectedHeroIndex === idx 
                      ? 'border-[#3d5afe] bg-[#3d5afe]/10' 
                      : 'border-[#393939] bg-black hover:border-[#525252]'
                    }`}
                  >
                    {h ? (
                      <>
                        <div className="text-white font-bold text-sm uppercase text-center line-clamp-2">{h.name}</div>
                        <div className="text-[8px] font-black text-[#525252] mt-1">SLOT {idx + 1}</div>
                      </>
                    ) : (
                      <span className="text-[#393939] font-black text-[10px] tracking-widest">VAZIO</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#161616] border border-[#393939] p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="flex-1">
                  <input 
                    className="text-4xl font-bold text-white uppercase tracking-tight bg-transparent border-b border-transparent hover:border-[#393939] focus:border-[#3d5afe] outline-none w-full transition-all py-2"
                    value={build.name}
                    onChange={(e) => updateName(e.target.value)}
                    placeholder="NOME DO TIME"
                  />
                  <div className="flex gap-4 mt-2">
                     <span className="text-[10px] font-black tracking-widest text-[#525252] bg-black px-3 py-1 border border-[#393939]">
                       ESTÁGIO DE PLANEJAMENTO
                     </span>
                     {currentHero && (
                        <div className="flex gap-2 flex-wrap">
                           {currentHero.hero_skills?.map((hs: any) => (
                              <span 
                                key={hs.skills?.name} 
                                title={hs.skills?.description || "Efeito técnico"}
                                className="text-[8px] font-black tracking-widest text-[#3d5afe] bg-[#3d5afe]/10 border border-[#3d5afe]/30 px-2 py-1 uppercase cursor-help hover:bg-[#3d5afe]/20 transition-colors"
                              >
                                 {hs.skills?.name}
                              </span>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
               
               <select 
                 className="bg-black border border-[#393939] px-6 py-3 text-xs font-black tracking-widest text-white focus:border-[#3d5afe] outline-none cursor-pointer uppercase h-14 min-w-[240px]"
                 value={currentHero?.id || ""}
                 onChange={(e) => updateHero(selectedHeroIndex, e.target.value || null)}
               >
                 <option value="">-- SELECIONAR HERÓI --</option>
                 {heroes.map(h => (
                   <option key={h.id} value={h.id}>{h.name.toUpperCase()}</option>
                 ))}
               </select>
            </div>

            {/* 7 Equipment Slots (Arma, Peito, Cabeça, Mãos, Pés, Acessório 1, Acessório 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SLOT_NAMES.map((slotName) => {
                const slot = slots.find(s => s.hero_index === selectedHeroIndex && s.slot_type === slotName);
                const itemId = slot?.item_id;
                const item = items.find(i => i.id === itemId);
                
                return (
                  <div key={slotName} className="bg-[#161616] border border-[#393939] p-8 flex flex-col gap-6 group hover:border-[#525252] transition-all">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black tracking-[0.2em] text-[#525252] uppercase">{slotName}</span>
                    </div>

                    <select
                      className={`w-full bg-black border px-5 py-4 text-xs font-bold transition-all outline-none cursor-pointer uppercase h-14 ${
                        item ? 'border-[#393939] text-white' : 'border-dashed border-[#393939] text-[#393939] hover:border-white hover:text-white'
                      }`}
                      value={itemId || ""}
                      onChange={(e) => updateEquipment(selectedHeroIndex, slotName, e.target.value || null)}
                      disabled={!currentHero}
                    >
                      <option value="">{!currentHero ? 'SELECIONE UM HERÓI' : item ? '-- TROCAR --' : `EQUIPAR ${slotName.toUpperCase()}`}</option>
                      {currentHero && items
                        .filter(i => {
                          // Both Acessório 1 and 2 slots share slot_type='Acessório' in the DB
                          const isCorrectSlot = slotName.startsWith('Acessório')
                            ? i.slot_type === 'Acessório'
                            : i.slot_type === slotName;
                          const isOwnedFilter = !onlyOwned || i.is_owned;
                          const isAllowedByType = currentHero.hero_item_types?.some(
                            (hit: any) => hit.item_type_id === i.item_type_id
                          );
                          return isCorrectSlot && isOwnedFilter && isAllowedByType;
                        })
                        .map(i => (
                          <option key={i.id} value={i.id}>
                            Lvl {i.level} - {i.name.toUpperCase()}
                          </option>
                        ))}
                    </select>

                    {item && item.skills && (
                      <div className="pt-4 border-t border-[#393939] flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-[#a8a8a8] tracking-[0.1em] uppercase">Habilidade</span>
                           <span className="text-[10px] font-black text-white px-3 py-1 bg-[#3d5afe]/20 border border-[#3d5afe]/30">
                              {item.skills.name.toUpperCase()}
                           </span>
                        </div>
                        {item.skills.description && (
                          <p className="text-[9px] text-[#525252] italic leading-tight group-hover:text-[#a8a8a8] transition-colors line-clamp-1">
                            {item.skills.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel — Summary + Radar */}
        <div className="w-full xl:w-[420px] space-y-8">
           <div className="bg-[#161616] border border-[#393939] p-8 sticky top-32 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-[#393939] pb-6">Sumário da Equipe</h3>
              
              {/* Filter by inventory */}
              <div className="p-5 bg-black border border-[#393939]">
                 <label className="flex items-center gap-4 cursor-pointer">
                    <input type="checkbox" checked={onlyOwned} onChange={(e) => setOnlyOwned(e.target.checked)} className="w-5 h-5 border-[#393939] bg-[#161616] text-[#3d5afe] focus:ring-0 rounded-none"/>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a8a8a8]">Filtrar por Inventário</span>
                 </label>
              </div>

              {/* Radar Chart */}
              <div className="border border-[#393939] bg-black p-6">
                <h4 className="text-[10px] font-black tracking-[0.2em] text-[#525252] uppercase mb-4 text-center">Perfil da Equipe</h4>
                <RadarChart data={radarData} />
              </div>

              {/* Skills Table */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 px-3 mb-2">
                  <span className="col-span-6 text-[9px] font-black text-[#525252] uppercase tracking-widest">Habilidade</span>
                  <span className="col-span-2 text-[9px] font-black text-[#525252] uppercase tracking-widest text-center">Qtde</span>
                  <span className="col-span-4 text-[9px] font-black text-[#525252] uppercase tracking-widest text-right">Bônus Total</span>
                </div>
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {projectStats.length === 0 && (
                    <p className="text-[#525252] text-xs text-center py-8">Nenhum bônus ativo</p>
                  )}
                  {projectStats.map(({ name, count, value, total }) => {
                    // Velocista and Reviver are capped at 100 by the game engine
                    const cappedSkills = ['Velocista 1','Velocista 2','Velocista 3','Reviver 1','Reviver 2','Reviver 3'];
                    const isOverCap = cappedSkills.some(s => name.startsWith(s.split(' ')[0])) && total > 100;
                    return (
                      <div
                        key={name}
                        title={getDescription(name) || "Efeito técnico"}
                        className={`grid grid-cols-12 gap-2 items-center bg-black border px-4 py-3 group transition-all cursor-help ${
                          isOverCap
                            ? 'border-red-600 bg-red-950/20 hover:border-red-400'
                            : 'border-[#393939] hover:border-[#3d5afe]'
                        }`}
                      >
                        <span className="col-span-6 text-[10px] font-bold text-white uppercase truncate flex items-center gap-1">
                          {name}
                          {isOverCap && <span title="Limite de 100 excedido" className="text-red-500 text-[9px] font-black">⚠</span>}
                        </span>
                        <span className="col-span-2 text-[10px] font-black text-[#a8a8a8] text-center">{count}</span>
                        <span className={`col-span-4 text-[10px] font-black text-right ${
                          isOverCap ? 'text-red-500' : total > 0 ? 'text-[#3d5afe]' : 'text-[#525252]'
                        }`}>
                          {total > 0 ? total : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
