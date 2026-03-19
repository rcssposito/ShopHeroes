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
    <div className="max-w-5xl mx-auto border border-white/5 rounded-2xl bg-secondary/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-2">Meus Times</h1>
          <p className="text-slate-400">Gerencie e crie novos times para planejar as habilidades de Shop Heroes.</p>
        </div>
        <form action={async () => {
          "use server";
          const { data } = await supabase.from('builds').insert({ name: 'Novo Time' }).select().single();
          if (data) {
            revalidatePath('/');
          }
        }}>
          <button className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex gap-2 items-center hover:scale-105 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Criar Novo Time
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {builds?.map((build: Build) => (
          <Link href={`/builds/${build.id}`} key={build.id}>
            <div className="bg-secondary mix-blend-screen border border-white/10 rounded-2xl p-6 hover:bg-secondary/80 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-xl text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">{build.name}</h2>
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-sm text-slate-500">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {new Date(build.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </Link>
        ))}

        {(!builds || builds.length === 0) && (
          <div className="col-span-full py-24 px-6 text-center border-2 border-dashed border-white/10 rounded-3xl bg-secondary/20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">Nenhum time por aqui</h3>
            <p className="text-slate-400 max-w-sm">Crie seu primeiro time utilizando o botão acima para começar a planejar suas composições.</p>
          </div>
        )}
      </div>
    </div>
  );
}
