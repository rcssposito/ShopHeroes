import { supabase } from "@/lib/supabase";
import { Item } from "@/types/database";
import Link from "next/link";

export default async function DatabasePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const filterSlot   = typeof resolvedParams.slot   === 'string' ? resolvedParams.slot   : null;
  const filterType   = typeof resolvedParams.type   === 'string' ? resolvedParams.type   : null;
  const filterSkill  = typeof resolvedParams.skill  === 'string' ? resolvedParams.skill  : null;
  const searchQuery  = typeof resolvedParams.search === 'string' ? resolvedParams.search : null;

  // Fetch item types and skills for filter dropdowns
  const [{ data: itemTypes }, { data: allSkills }] = await Promise.all([
    supabase.from("item_types").select("id, name").order("name"),
    supabase.from("skills").select("id, name").order("name"),
  ]);

  let query = supabase.from("items").select(`
    *,
    item_types (name),
    skills (name, value, description)
  `).order("level", { ascending: false });

  if (filterSlot)  query = query.eq("slot_type", filterSlot);
  if (filterType)  query = query.eq("item_type_id", filterType);
  if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);

  const { data: items, error } = await query;

  // Client-side skill filter (join filter on nested field not directly supported)
  const filteredItems = filterSkill
    ? items?.filter((item: any) => item.skills?.name === filterSkill)
    : items;

  const rarityStyle = (rarity: string) => {
    switch(rarity) {
      case 'Mítico':    return 'border-[#ff4d00] text-[#ff4d00] bg-[#ff4d00]/5';
      case 'Lendário':  return 'border-[#ffc107] text-[#ffc107] bg-[#ffc107]/5';
      case 'Épico':     return 'border-[#9c27b0] text-[#9c27b0] bg-[#9c27b0]/5';
      case 'Impecável': return 'border-[#2196f3] text-[#2196f3] bg-[#2196f3]/5';
      default:          return 'border-[#525252] text-[#888888] bg-[#262626]';
    }
  };

  const buildUrl = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | null> = {
      slot: filterSlot, type: filterType, skill: filterSkill, search: searchQuery,
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const str = params.toString();
    return `/database${str ? '?' + str : ''}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="border-b border-[#393939] pb-12 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4 uppercase">
          CATÁLOGO DE <span className="font-light text-[#a8a8a8]">ITENS</span>
        </h1>
        <p className="text-[#a8a8a8] text-lg max-w-2xl font-medium">
          Base de dados completa de equipamentos e habilidades do Shop Heroes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-5 mb-8 p-6 bg-[#161616] border border-[#393939]">

        {/* Row 1 — Search + Clear */}
        <div className="flex gap-4 items-center">
          <form className="relative flex-1">
            {/* Preserve other filters when submitting search */}
            {filterSlot  && <input type="hidden" name="slot"  value={filterSlot} />}
            {filterType  && <input type="hidden" name="type"  value={filterType} />}
            {filterSkill && <input type="hidden" name="skill" value={filterSkill} />}
            <input
              name="search"
              type="text"
              placeholder="Buscar por nome do item..."
              className="w-full bg-[#262626] border-b border-[#393939] px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder-[#525252]"
              defaultValue={searchQuery || ""}
            />
            <button type="submit" className="absolute right-4 top-3 text-[#a8a8a8] hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>
          {(filterSlot || filterType || filterSkill || searchQuery) && (
            <Link href="/database" className="px-5 py-3 border border-red-900/50 text-red-500 text-[10px] font-black tracking-widest hover:bg-red-900/10 transition-colors whitespace-nowrap h-12 flex items-center">
              LIMPAR
            </Link>
          )}
        </div>

        {/* Row 2 — Slot + Type filters */}
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[9px] font-black text-[#525252] tracking-widest uppercase">Slot</span>
            {['Arma', 'Peito', 'Cabeça', 'Mãos', 'Pés', 'Acessório 1', 'Acessório 2'].map(s => (
              <Link
                key={s}
                href={buildUrl({ slot: filterSlot === s ? null : s })}
                className={`px-4 py-2 border text-[10px] font-black tracking-widest transition-colors h-10 flex items-center ${
                  filterSlot === s
                  ? 'bg-white text-black border-white'
                  : 'bg-[#262626] text-[#a8a8a8] border-[#393939] hover:border-[#525252]'
                }`}
              >
                {s.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* Row 3 — Type + Skill selects */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-[#525252] tracking-widest uppercase whitespace-nowrap">Tipo</span>
            <form>
              {filterSlot  && <input type="hidden" name="slot"  value={filterSlot} />}
              {filterSkill && <input type="hidden" name="skill" value={filterSkill} />}
              {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
              <select
                name="type"
                className="bg-[#262626] border border-[#393939] text-[#a8a8a8] text-[11px] font-bold tracking-widest uppercase h-10 px-3 focus:border-[#3d5afe] focus:outline-none cursor-pointer"
                defaultValue={filterType || ""}
              >
                <option value="">TODOS OS TIPOS</option>
                {itemTypes?.map(t => (
                  <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                ))}
              </select>
              <button type="submit" className="h-10 px-4 bg-[#262626] border border-[#393939] text-[#a8a8a8] text-[10px] font-black tracking-widest hover:border-white hover:text-white transition-colors">OK</button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-[#525252] tracking-widest uppercase whitespace-nowrap">Efeito</span>
            <form>
              {filterSlot && <input type="hidden" name="slot"  value={filterSlot} />}
              {filterType && <input type="hidden" name="type"  value={filterType} />}
              {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
              <select
                name="skill"
                className="bg-[#262626] border border-[#393939] text-[#a8a8a8] text-[11px] font-bold tracking-widest uppercase h-10 px-3 focus:border-[#3d5afe] focus:outline-none cursor-pointer min-w-[220px]"
                defaultValue={filterSkill || ""}
              >
                <option value="">TODOS OS EFEITOS</option>
                {allSkills?.map(sk => (
                  <option key={sk.id} value={sk.name}>{sk.name.toUpperCase()}</option>
                ))}
              </select>
              <button type="submit" className="h-10 px-4 bg-[#262626] border border-[#393939] text-[#a8a8a8] text-[10px] font-black tracking-widest hover:border-white hover:text-white transition-colors">OK</button>
            </form>
          </div>

          {(filterType || filterSkill) && (
            <Link href={buildUrl({ type: null, skill: null })} className="text-[10px] font-black text-red-500 hover:text-red-400 tracking-widest uppercase">
              LIMPAR TIPO/EFEITO
            </Link>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-[#525252] text-xs font-bold tracking-widest uppercase mb-6">
        {filteredItems?.length ?? 0} ITENS ENCONTRADOS
      </p>

      {/* Table */}
      <div className="bg-[#161616] border border-[#393939] overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#262626] text-[11px] font-black uppercase tracking-[0.2em] text-[#a8a8a8] border-b border-[#393939]">
              <th className="px-8 py-5">Equipamento</th>
              <th className="px-8 py-5">Efeito / Skill</th>
              <th className="px-8 py-5">Origem</th>
              <th className="px-8 py-5 text-right">Raridade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#393939]">
            {filteredItems?.map((item: any) => (
              <tr key={item.id} className="hover:bg-[#1f1f1f] transition-colors group">
                <td className="px-8 py-6">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-black border border-[#393939] flex items-center justify-center text-sm font-black text-white shrink-0">
                         {item.level}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-lg group-hover:text-[#3d5afe] transition-colors leading-tight">
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
                      <div className="flex items-center gap-3 text-white font-bold group-hover:text-[#3d5afe] transition-colors">
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
        
        {(!filteredItems || filteredItems.length === 0) && (
          <div className="py-32 text-center border-t border-[#393939] bg-black/20">
             <p className="text-[#525252] text-xl font-bold uppercase tracking-widest">Nenhum item encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
