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
  
  const getArtifactScore = (entity: { hero_skills?: any[] } | { skills?: any }) => {
    let score = 0;
    const artifactKeywords = ['Encontrar mágica', 'Detectar segredo'];
    
    if ('hero_skills' in entity) {
      entity.hero_skills?.forEach((hs: any) => {
        if (artifactKeywords.includes(hs.skills?.name)) {
          score += getSkillValue(hs.skills.name);
        }
      });
    } else if ('skills' in entity && entity.skills) {
      if (artifactKeywords.includes(entity.skills.name)) {
        score += getSkillValue(entity.skills.name);
      }
    }
    return score;
  };

  // 1. Pick Best Leader for Slot 0
  const sortedLeaders = [...heroes].sort((a, b) => {
    const getLeaderLevel = (h: Hero) => {
      const names = h.hero_skills?.map((hs: any) => hs.skills?.name) || [];
      if (names.includes('Líder 2')) return 2;
      if (names.includes('Líder 1')) return 1;
      return 0;
    };
    return getLeaderLevel(b) - getLeaderLevel(a);
  });

  const leader = sortedLeaders[0];
  const leaderSkills = leader.hero_skills?.map((hs: any) => hs.skills?.name) || [];
  const maxSlots = leaderSkills.includes('Líder 2') ? 6 : leaderSkills.includes('Líder 1') ? 5 : 4;

  // 2. Pick Best Heroes for remaining slots (Greedy by Artifact Score)
  const remainingHeroes = [...heroes].filter(h => h.id !== leader.id)
    .sort((a, b) => getArtifactScore(b) - getArtifactScore(a));

  const team = [leader, ...remainingHeroes.slice(0, maxSlots - 1)];
  const resultSlots: GeneratedSlot[] = [];

  const SLOT_NAMES = ['Arma', 'Peito', 'Cabeça', 'Mãos', 'Pés', 'Acessório 1', 'Acessório 2'];

  // 3. Equip each hero with best owned items
  const ownedItems = items.filter(i => ownedItemIds.has(i.id));

  team.forEach((hero, heroIdx) => {
    // Add the hero slot itself (Baseline)
    resultSlots.push({
      hero_index: heroIdx,
      hero_id: hero.id,
      slot_type: 'Baseline'
    });

    SLOT_NAMES.forEach(slotName => {
      const compatibleItems = ownedItems.filter(item => {
        const isCorrectSlot = slotName.startsWith('Acessório')
          ? item.slot_type === 'Acessório'
          : item.slot_type === slotName;
        
        const isAllowedByType = hero.hero_item_types?.some(
          (hit: any) => hit.item_type_id === item.item_type_id
        );
        
        return isCorrectSlot && isAllowedByType;
      });

      if (compatibleItems.length > 0) {
        // Sort by artifact score, then level
        const bestItem = compatibleItems.sort((a, b) => {
          const scoreB = getArtifactScore(a); // wait, scoreB should be b
          const scoreA = getArtifactScore(a);
          const scoreB_real = getArtifactScore(b);
          return scoreB_real - scoreA || (b.level || 0) - (a.level || 0);
        })[0];

        resultSlots.push({
          hero_index: heroIdx,
          hero_id: hero.id,
          slot_type: slotName,
          item_id: bestItem.id
        });
      }
    });
  });

  return resultSlots;
}
