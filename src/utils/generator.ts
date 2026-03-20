import { Hero, Item, Skill } from '@/types/database';

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
  ownedItemIds: Set<string>
): GeneratedSlot[] {
  const getSkillValue = (name: string) => skills.find(s => s.name === name)?.value || 0;

  // Keyword groups
  const artifactKeywords = ['Encontrar mágica', 'Detectar segredo'];
  const velocistaKeywords = ['Velocista 1', 'Velocista 2', 'Velocista 3'];
  const reviveKeywords = ['Reviver 1', 'Reviver 2', 'Reviver 3'];
  const suporteKeywords = ['Suporte 1', 'Suporte 2', 'Suporte 3', 'Engenhoso 1', 'Engenhoso 2', 'Engenhoso 3'];
  const liderKeywords = ['Líder 1', 'Líder 2'];

  const getStats = (entity: any) => {
    const stats = { artifact: 0, velocista: 0, revive: 0, suporte: 0, lider: 0 };
    const entitySkills = entity.hero_skills ? entity.hero_skills.map((hs: any) => hs.skills) : [entity.skills];
    
    entitySkills.forEach((sk: any) => {
      if (!sk) return;
      const val = getSkillValue(sk.name);
      if (artifactKeywords.includes(sk.name)) stats.artifact += val;
      if (velocistaKeywords.includes(sk.name)) stats.velocista += val;
      if (reviveKeywords.includes(sk.name)) stats.revive += val;
      if (suporteKeywords.includes(sk.name)) stats.suporte += val;
      if (liderKeywords.includes(sk.name)) {
         stats.lider += (sk.name === 'Líder 2' ? 2 : 1);
      }
    });
    return stats;
  };

  // 1. Pick Best Leader for Slot 0
  const sortedLeaders = [...heroes].sort((a, b) => {
    const getLeaderScore = (h: Hero) => {
      const innate = h.hero_skills?.map((hs: any) => hs.skills?.name) || [];
      let score = 0;
      if (innate.includes('Líder 2')) score = 200;
      else if (innate.includes('Líder 1')) score = 100;
      
      // Check if leader can equip a Lider item
      const canEquipLider = items.some(i => 
        ownedItemIds.has(i.id) && 
        (i.skills?.name === 'Líder 1' || i.skills?.name === 'Líder 2') &&
        h.hero_item_types?.some((hit: any) => hit.item_type_id === i.item_type_id)
      );
      if (canEquipLider) score += 50;

      return score + (getStats(h).artifact / 100);
    };
    return getLeaderScore(b) - getLeaderScore(a);
  });

  const leader = sortedLeaders[0];
  const innateLeaderSkills = leader.hero_skills?.map((hs: any) => hs.skills?.name) || [];
  const equipLiderSkills = items
    .filter(i => ownedItemIds.has(i.id) && (i.skills?.name === 'Líder 1' || i.skills?.name === 'Líder 2'))
    .filter(i => leader.hero_item_types?.some((hit: any) => hit.item_type_id === i.item_type_id))
    .map(i => i.skills?.name);

  const allPossibleLeaderSkills = [...innateLeaderSkills, ...equipLiderSkills];
  // Base 5 slots
  const maxSlots = allPossibleLeaderSkills.includes('Líder 2') ? 7 : allPossibleLeaderSkills.includes('Líder 1') ? 6 : 5;

  // 2. Pick Team (Greedy by Artifact Score)
  const remainingHeroes = [...heroes].filter(h => h.id !== leader.id)
    .sort((a, b) => getStats(b).artifact - getStats(a).artifact);
  const team = [leader, ...remainingHeroes.slice(0, maxSlots - 1)];

  // 3. Iterative Item Selection with Dynamic Weights
  const resultSlots: GeneratedSlot[] = team.map((h, i) => ({ hero_index: i, hero_id: h.id, slot_type: 'Baseline' }));
  const ownedItems = items.filter(i => ownedItemIds.has(i.id));
  const SLOT_NAMES = ['Arma', 'Peito', 'Cabeça', 'Mãos', 'Pés', 'Acessório 1', 'Acessório 2'];

  const currentStats = { artifact: 0, velocista: 0, revive: 0, suporte: 0, lider: 0 };
  team.forEach(h => {
    const s = getStats(h);
    currentStats.artifact += s.artifact;
    currentStats.velocista += s.velocista;
    currentStats.revive += s.revive;
    currentStats.suporte += s.suporte;
    currentStats.lider += s.lider;
  });

  const TARGETS = { velocista: 100, revive: 80, suporte: 5 };
  const occupied = new Set<string>(); // "heroIndex-slotName"

  // We have 7 * maxSlots equipment slots to fill
  const totalEquipSlots = 7 * maxSlots;
  for (let step = 0; step < totalEquipSlots; step++) {
    let bestOption: { heroIdx: number, slotName: string, item: Item, score: number } | null = null;

    team.forEach((hero, heroIdx) => {
      SLOT_NAMES.forEach(slotName => {
        if (occupied.has(`${heroIdx}-${slotName}`)) return;

        const compatibleItems = ownedItems.filter(item => {
          if (resultSlots.some(rs => rs.item_id === item.id)) return false;
          const isCorrectSlot = slotName.startsWith('Acessório') ? item.slot_type === 'Acessório' : item.slot_type === slotName;
          const isAllowed = hero.hero_item_types?.some((hit: any) => hit.item_type_id === item.item_type_id);
          return isCorrectSlot && isAllowed;
        });

        compatibleItems.forEach(item => {
          const itemStats = getStats(item);
          let score = 0;

          // Velocista weight
          if (currentStats.velocista < TARGETS.velocista) {
            score += itemStats.velocista * 50;
          } else if (itemStats.velocista > 0) {
            score -= 10;
          }

          // Revive weight
          if (currentStats.revive < TARGETS.revive) {
            score += itemStats.revive * 40;
          } else {
            score += itemStats.revive * 2;
          }

          // Support weight
          if (currentStats.suporte < TARGETS.suporte) {
            score += itemStats.suporte * 30;
          } else if (itemStats.suporte > 0) {
            score -= 5;
          }

          // Artifact weight (Always good)
          score += itemStats.artifact * 10;

          // Level as tie-breaker
          score += (item.level || 0) / 100;

          // SPECIAL WEIGHT: If this is the leader and item has Líder skill
          if (heroIdx === 0 && itemStats.lider > 0) {
            score += 10000; 
          }

          if (!bestOption || score > bestOption.score) {
            bestOption = { heroIdx, slotName, item, score };
          }
        });
      });
    });

    if (bestOption) {
      const { heroIdx, slotName, item } = (bestOption as any);
      const targetHero = team[heroIdx] as Hero;
      resultSlots.push({ hero_index: heroIdx, hero_id: targetHero.id, slot_type: slotName, item_id: item.id });
      occupied.add(`${heroIdx}-${slotName}`);
      
      const s = getStats(item);
      currentStats.artifact += s.artifact;
      currentStats.velocista += s.velocista;
      currentStats.revive += s.revive;
      currentStats.suporte += s.suporte;
      currentStats.lider += s.lider;
    } else {
      break; 
    }
  }

  return resultSlots;
}
