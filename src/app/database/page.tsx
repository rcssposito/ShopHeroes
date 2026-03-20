import { supabase } from "@/lib/supabase";
import { Item } from "@/types/database";

export default async function DatabasePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const filterType = typeof resolvedParams.type === 'string' ? resolvedParams.type : null;
  const searchQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : null;

  let query = supabase.from("items").select("*, skills(name)").order("name");

  if (filterType) {
    query = query.eq("slot_type", filterType);
  }
  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const { data: items, error } = await query;

  if (error) {
    console.error("Error fetching items:", error);
  }

  const slotTypes = ['Arma', 'Peito', 'Cabeça', 'Mãos', 'Pés', 'Acessório'];

  return (
    <div className="max-w-6xl mx-auto border border-white/5 rounded-2xl bg-secondary/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col mb-10 border-b border-white/5 pb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-2">Banco de Dados</h1>
          <p className="text-slate-400">Consulte todos os equipamentos, níveis e efeitos disponíveis no jogo.</p>
        </div>

        {/* Simple Filter UI Note: In a real app we'd use client-side router navigation, keeping this simple server-side for now */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-slate-400 mr-2 border border-white/10 rounded-lg px-4 py-2 bg-secondary/30">
            Filtros básicos por URL: <code className="text-primary ml-1">?type=Arma</code> ou <code className="text-primary ml-1">?q=Espada</code>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-secondary/30 shadow-inner">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-secondary/80 text-primary border-b border-white/10">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Nome do Item</th>
              <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Tipo</th>
              <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Poder</th>
              <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Habilidade</th>
              <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Raridade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items?.map((item: Item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-medium text-foreground">
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Nível {item.level}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-medium text-slate-300 group-hover:text-primary transition-colors">
                    {item.slot_type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-primary">
                    {item.power > 0 ? `+${item.power}` : '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.skills?.name ? (
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                      {item.skills?.name}
                    </span>
                  ) : (
                    <span className="text-slate-600 italic">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-slate-400 font-medium">{item.rarity || '-'}</span>
                </td>
              </tr>
            ))}

            {(!items || items.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-secondary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-4 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  Nenhum equipamento cadastrado ainda ou nenhum resultado para o filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
