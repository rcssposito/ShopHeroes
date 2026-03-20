import { createClient } from "@/utils/supabase/server";
import BuildEditorClient from "./BuildEditorClient";

export default async function BuildPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch build info
  const { data: build, error } = await supabase
    .from("builds")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (error || !build) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-2xl font-bold mb-4">Time não encontrado</h1>
        <p className="text-slate-400 mb-8">O time que você tentou acessar não existe ou foi excluído.</p>
        <a href="/" className="px-6 py-2 bg-primary rounded-lg font-medium text-white hover:bg-blue-600 transition-colors">
          Voltar para Meus Times
        </a>
      </div>
    );
  }

  // Fetch all heroes with their junctions (item_types and native skills)
  const { data: heroes } = await supabase
    .from("heroes")
    .select(`
      *,
      hero_item_types(item_type_id),
      hero_skills(skill_id, skills(*))
    `)
    .order("name");
  
  // Fetch all items with their related skill info
  const { data: rawItems } = await supabase
    .from("items")
    .select(`
      *,
      item_types (name),
      skills (*)
    `)
    .order("item_type_id", { ascending: true })
    .order("level", { ascending: false });

  // Fetch user ownership
  const { data: userItems } = user ? await supabase.from("user_items").select("item_id").eq("user_id", user.id) : { data: [] };
  const ownedItemIds = new Set(userItems?.map((u: any) => u.item_id) || []);

  const items = rawItems?.map((item: any) => ({
    ...item,
    is_owned: ownedItemIds.has(item.id)
  }));

  // Fetch all skill coefficients
  const { data: skills } = await supabase.from("skills").select("*");

  // Fetch existing slots for this build
  const { data: slots } = await supabase
    .from("build_slots")
    .select("*")
    .eq("build_id", build.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-2">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {build.name}
          </h1>
          <p className="text-sm text-primary font-medium mt-1">Planejador de Equipe (Relacional V4)</p>
        </div>
      </div>
      
      <BuildEditorClient 
        build={build} 
        heroes={heroes || []} 
        items={(items as any) || []} 
        skills={skills || []}
        initialSlots={slots || []} 
        userId={user?.id}
      />
    </div>
  );
}
