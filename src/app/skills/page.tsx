import { supabase } from "@/lib/supabase";
import { Skill } from "@/types/database";

export default async function SkillsPage() {
  const { data: skills, error } = await supabase
    .from("skills")
    .select("*")
    .order("name");

  if (error) console.error("Error fetching skills:", error);

  return (
    <div className="max-w-4xl mx-auto border border-white/5 rounded-2xl bg-secondary/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col mb-10 border-b border-white/5 pb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-2">Habilidades (Skills)</h1>
          <p className="text-slate-400">Valores de bônus e coeficientes para cada habilidade do jogo.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-secondary/30 shadow-inner">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-secondary/80 text-primary border-b border-white/10">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Habilidade</th>
              <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Valor de Bônus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {skills?.map((skill: Skill) => (
              <tr key={skill.name} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-medium text-foreground">{skill.name}</td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                    +{skill.value}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
