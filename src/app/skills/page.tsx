import { supabase } from "@/lib/supabase";
import { Skill } from "@/types/database";

export default async function SkillsPage() {
  const { data: skills, error } = await supabase
    .from("skills")
    .select("*")
    .order("name");

  if (error) console.error("Error fetching skills:", error);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Carbon Header */}
      <div className="border-b border-[#393939] pb-12 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4 uppercase">
          HABILIDADES E <span className="font-light text-[#a8a8a8]">EFEITOS</span>
        </h1>
        <p className="text-[#a8a8a8] text-lg max-w-2xl font-medium">
          Dicionário técnico de bônus base para cálculos de força de equipe e utilidades.
        </p>
      </div>

      <div className="bg-[#161616] border border-[#393939] overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-[#393939] bg-black/40 flex justify-between items-center">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#525252]">Catálogo Serializado</h3>
           <span className="text-[10px] text-[#3d5afe] font-bold uppercase tracking-widest bg-[#3d5afe]/10 px-3 py-1 border border-[#3d5afe]/30">v1.2 Stable</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#262626] text-[11px] font-black uppercase tracking-[0.2em] text-[#a8a8a8] border-b border-[#393939]">
                <th className="px-10 py-6 w-1/3">Identificação</th>
                <th className="px-10 py-6">Descrição do Efeito Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#393939]">
              {skills?.map((skill: Skill) => (
                <tr key={skill.id} className="hover:bg-[#1f1f1f] transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                       <div className="flex-shrink-0 w-12 h-12 bg-black border border-[#393939] flex items-center justify-center text-[#3d5afe] group-hover:bg-[#3d5afe] group-hover:text-white transition-all shadow-inner">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                       </div>
                       <span className="font-bold text-xl text-white group-hover:text-[#3d5afe] transition-colors uppercase tracking-tight">
                         {skill.name}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-[#a8a8a8] text-base leading-relaxed max-w-2xl group-hover:text-white transition-colors">
                      {skill.description || "Efeito técnico não mapeado."}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!skills || skills.length === 0) && (
            <div className="py-40 text-center border-t border-[#393939]">
               <p className="text-[#525252] text-xl font-bold uppercase tracking-[0.2em]">Sem registros disponíveis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
