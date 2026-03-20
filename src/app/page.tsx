import { supabase } from "@/lib/supabase";
import { Build } from "@/types/database";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function Home() {
  const { data: builds, error } = await supabase
    .from("builds")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching builds:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Carbon Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-[#393939] pb-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white uppercase">
            MEUS <span className="font-light text-[#a8a8a8]">TIMES</span>
          </h1>
          <p className="text-[#a8a8a8] text-lg max-w-xl font-medium">
            Gerenciamento tático de composições e equipamentos para Shop Heroes.
          </p>
        </div>
        
        <form action={async () => {
          "use server";
          const { data } = await supabase
            .from('builds')
            .insert({ name: 'Novo Time' })
            .select()
            .single();

          if (data) {
            revalidatePath('/');
          }
        }}>
          <button className="bg-[#3d5afe] hover:bg-[#304ffe] text-white px-10 py-5 text-sm font-black tracking-widest uppercase transition-all shadow-none">
            CRIAR NOVO TIME
          </button>
        </form>
      </div>

      {/* Builds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {builds?.map((build: Build) => (
          <Link href={`/builds/${build.id}`} key={build.id} className="group">
            <div className="bg-[#161616] border border-[#393939] p-10 h-full flex flex-col hover:border-white transition-all duration-300 relative overflow-hidden">
               <div className="mb-10">
                 <div className="w-16 h-16 bg-black border border-[#393939] flex items-center justify-center text-[#3d5afe] group-hover:text-white group-hover:bg-[#3d5afe] group-hover:border-[#3d5afe] transition-all">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 00 2 2h12a2 2 0 00 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                 </div>
               </div>
               
               <h2 className="text-2xl font-bold text-white mb-2 line-clamp-1 uppercase tracking-tight">{build.name}</h2>
               <p className="text-[#525252] text-sm mb-10 font-medium">Equipe de 6 heróis configurada.</p>
               
               <div className="mt-auto pt-8 border-t border-[#393939] flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-[#a8a8a8]">
                 <div className="flex items-center gap-2">
                   {new Date(build.created_at).toLocaleDateString('pt-BR')}
                 </div>
                 <div className="text-[#3d5afe] group-hover:text-white transition-colors">
                   ABRIR →
                 </div>
               </div>
            </div>
          </Link>
        ))}

        {(!builds || builds.length === 0) && (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#262626]">
            <h3 className="text-2xl font-bold text-[#525252] uppercase tracking-[0.2em] mb-4">Sem projetos ativos</h3>
            <p className="text-[#393939] max-w-sm font-medium">Utilize o botão superior para iniciar seu primeiro planejamento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
