import { Hero, Item, Skill } from '@/types/database';
import { HERO_ACCESSORY_MAPPING } from './accessory_mapping';

export interface GeneratedSlot {
  hero_index: number;
  hero_id: string;
  slot_type: string;
  item_id?: string;
}

export function generateBestBuild(
  heroes: Hero[],
  items: Item[],
  skills: Skill[],
  ownedItemIds: Set<string>,
  usedHeroIds: string[] = [],
  initialHeroIds: (string | null)[] = []
): GeneratedSlot[] {
  const getSkillValue = (name: string) => skills.find(s => s.name === name)?.value || 0;

  // Keyword groups
  const magicaKeywords = ['Encontrar mágica'];
  const segredoKeywords = ['Detectar segredo'];
  const velocistaKeywords = ['Velocista 1', 'Velocista 2', 'Velocista 3'];
  const reviveKeywords = ['Reviver 1', 'Reviver 2', 'Reviver 3'];
  const suporteKeywords = ['Suporte 1', 'Suporte 2', 'Suporte 3', 'Engenhoso 1', 'Engenhoso 2', 'Engenhoso 3'];
  const liderKeywords = ['Líder 1', 'Líder 2'];
  const energeticoKeywords = ['Energético 1', 'Energético 2', 'Energético 3'];

  const getStats = (entity: any) => {
    const stats = { magica: 0, segredo: 0, artifact: 0, velocista: 0, revive: 0, suporte: 0, lider: 0, energetico: 0 };
    const entitySkills = entity.hero_skills ? entity.hero_skills.map((hs: any) => hs.skills) : [entity.skills];
    
    entitySkills.forEach((sk: any) => {
      if (!sk) return;
      const val = getSkillValue(sk.name);
      if (magicaKeywords.includes(sk.name)) { stats.magica += val; stats.artifact += val; }
      if (segredoKeywords.includes(sk.name)) { stats.segredo += val; stats.artifact += val; }
      if (velocistaKeywords.includes(sk.name)) stats.velocista += val;
      if (reviveKeywords.includes(sk.name)) stats.revive += val;
      if (suporteKeywords.includes(sk.name)) stats.suporte += val;
      if (energeticoKeywords.includes(sk.name)) stats.energetico += val;
      if (liderKeywords.includes(sk.name)) {
         stats.lider += (sk.name === 'Líder 2' ? 2 : 1);
      }
    });
    return stats;
  };

  // 0. Filter out heroes used in other builds
  const availableHeroes = heroes.filter(h => !usedHeroIds.includes(h.id));

  // 1. Determine Leader and Team
  let leader: Hero | null = null;
  const team: Hero[] = [];

  if (initialHeroIds[0]) leader = heroes.find(h => h.id === initialHeroIds[0]) || null;
  if (!leader) {
    const sortedLeaders = [...availableHeroes].sort((a, b) => {
      const getLeaderScore = (h: Hero) => {
        const innate = h.hero_skills?.map((hs: any) => hs.skills?.name) || [];
        let score = 0;
        if (innate.includes('Líder 2')) score = 200;
        else if (innate.includes('Líder 1')) score = 100;
        const canEquipLider = items.some(i => ownedItemIds.has(i.id) && (i.skills?.name === 'Líder 1' || i.skills?.name === 'Líder 2') && h.hero_item_types?.some((hit: any) => hit.item_type_id === i.item_type_id));
        if (canEquipLider) score += 50;
        const stats = getStats(h);
        return score + (stats.magica * 50 + stats.segredo * 30) / 100;
      };
      return getLeaderScore(b) - getLeaderScore(a);
    });
    leader = sortedLeaders[0] || null;
  }
  if (!leader) return [];

  const innateLeaderSkills = leader.hero_skills?.map((hs: any) => hs.skills?.name) || [];
  const equipLiderSkills = items
    .filter(i => ownedItemIds.has(i.id) && (i.skills?.name === 'Líder 1' || i.skills?.name === 'Líder 2'))
    .filter(i => leader!.hero_item_types?.some((hit: any) => hit.item_type_id === i.item_type_id))
    .map(i => i.skills?.name);
  const allPossibleLeaderSkills = [...innateLeaderSkills, ...equipLiderSkills];
  const maxSlots = (allPossibleLeaderSkills.includes('Líder 2') || allPossibleLeaderSkills.includes('Líder 1')) ? 6 : 5;

  team[0] = leader;
  const currentTeamIds = new Set([leader.id]);
  for (let i = 1; i < maxSlots; i++) {
    const manualHeroId = initialHeroIds[i];
    if (manualHeroId) {
      const h = heroes.find(hero => hero.id === manualHeroId);
      if (h) { team[i] = h; currentTeamIds.add(h.id); }
    }
  }
  for (let i = 1; i < maxSlots; i++) {
    if (!team[i]) {
      const bestRemaining = availableHeroes
        .filter(h => !currentTeamIds.has(h.id))
        .sort((a, b) => {
          const statsA = getStats(a);
          const statsB = getStats(b);
          return (statsB.magica * 50 + statsB.segredo * 30) - (statsA.magica * 50 + statsA.segredo * 30);
        })[0];
      if (bestRemaining) { team[i] = bestRemaining; currentTeamIds.add(bestRemaining.id); }
    }
  }
  const finalTeam = team.filter(Boolean);

  // 3. Iterative Item Selection
  const resultSlots: GeneratedSlot[] = finalTeam.map((h, i) => ({ hero_index: i, hero_id: h.id, slot_type: 'Baseline' }));
  const ownedItems = items.filter(i => ownedItemIds.has(i.id));
  const SLOT_NAMES = ['Arma', 'Peito', 'Cabeça', 'Mãos', 'Pés', 'Acessório 1', 'Acessório 2'];

  const currentStats = { artifact: 0, velocista: 0, revive: 0, suporte: 0, lider: 0 };
  const heroSpecificStats = finalTeam.map(h => getStats(h));

  finalTeam.forEach((h, idx) => {
    const s = heroSpecificStats[idx];
    currentStats.artifact += s.artifact;
    currentStats.velocista += s.velocista;
    currentStats.revive += s.revive;
    currentStats.suporte += s.suporte;
    currentStats.lider += s.lider;
  });

  const TARGETS = { velocista: 100, revive: 100, suporte: 6, energetico: 100 };
  const occupied = new Set<string>();

  const totalEquipSlots = 7 * finalTeam.length;
  for (let step = 0; step < totalEquipSlots; step++) {
    let bestOption: { heroIdx: number, slotName: string, item: Item, score: number } | null = null;
    
    // Check if leader already has a LIDER skill (innate or equipped in previous steps)
    const leaderHero = finalTeam[0];
    const leaderInnate = leaderHero.hero_skills?.some((hs: any) => hs.skills?.name === 'Líder 1' || hs.skills?.name === 'Líder 2') ?? false;
    const leaderEquipped = resultSlots.some(rs => rs.hero_index === 0 && rs.item_id && items.find(i => i.id === rs.item_id)?.skills?.name?.startsWith('Líder'));
    const isLiderActive = leaderInnate || leaderEquipped;

    finalTeam.forEach((hero, heroIdx) => {
      SLOT_NAMES.forEach(slotName => {
        if (occupied.has(`${heroIdx}-${slotName}`)) return;
        const compatibleItems = ownedItems.filter(item => {
          if (resultSlots.some(rs => rs.item_id === item.id)) return false;
          
          // New Accessory Type logic
          let isCorrectSlot = false;
          if (slotName.startsWith('Acessório')) {
            const allowedTypes = HERO_ACCESSORY_MAPPING[hero.name]?.[slotName as 'Acessório 1' | 'Acessório 2'] || [];
            isCorrectSlot = allowedTypes.includes(item.item_types?.name || '');
          } else {
            isCorrectSlot = item.slot_type === slotName;
          }

          const isAllowed = hero.hero_item_types?.some((hit: any) => hit.item_type_id === item.item_type_id);
          return isCorrectSlot && isAllowed;
        });

        compatibleItems.forEach(item => {
          const itemStats = getStats(item);
          let score = 0;
          
          // Per-Hero Energetico check (Priority & Cap)
          if (heroSpecificStats[heroIdx].energetico + itemStats.energetico > 100) {
            score -= 5000; // HEAVY PENALTY for overcapping per hero
          } else if (heroSpecificStats[heroIdx].energetico < TARGETS.energetico) {
            score += itemStats.energetico * 100; // Very high priority to reach 100
          }

          // Velocista/Revive logic
          if (currentStats.velocista + itemStats.velocista > 100) score -= 5000;
          else if (heroIdx === 0 && currentStats.velocista < TARGETS.velocista) score += itemStats.velocista * 50;
          
          // Reviver/Suporte logic
          if (currentStats.revive + itemStats.revive > 100) score -= 5000;
          else if (currentStats.revive < TARGETS.revive) score += itemStats.revive * 80; // High priority until 100
          else score += itemStats.revive * 2;

          if (currentStats.suporte < TARGETS.suporte) score += itemStats.suporte * 60;
          else if (itemStats.suporte > 0) score -= 5;
          
          score += itemStats.magica * 60; // PREFERENTIAL ARTIFACT
          score += itemStats.segredo * 30; // SECONDARY ARTIFACT

          // SPECIAL WEIGHT: If this is the leader AND they don't have Lider yet
          if (heroIdx === 0 && itemStats.lider > 0 && !isLiderActive) score += 10000;
          
          if (!bestOption || score > bestOption.score) bestOption = { heroIdx, slotName, item, score };
        });
      });
    });

    if (bestOption) {
      const { heroIdx, slotName, item } = (bestOption as any);
      resultSlots.push({ hero_index: heroIdx, hero_id: finalTeam[heroIdx].id, slot_type: slotName, item_id: item.id });
      occupied.add(`${heroIdx}-${slotName}`);
      const s = getStats(item);
      currentStats.artifact += s.artifact;
      currentStats.velocista += s.velocista;
      currentStats.revive += s.revive;
      currentStats.suporte += s.suporte;
      currentStats.lider += s.lider;
      heroSpecificStats[heroIdx].energetico += s.energetico;
    } else break;
  }
  return resultSlots;
}
