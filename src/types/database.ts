import { createClient } from '@supabase/supabase-js'

export type ItemSlotType = 'Arma' | 'Peito' | 'Cabeça' | 'Mãos' | 'Pés' | 'Acessório 1' | 'Acessório 2';
export type QualityType = 'Normal' | 'Bom' | 'Ótimo' | 'Excelente' | 'Épico' | 'Lendário' | 'Mítico' | 'Exclusivo';

export interface Skill {
  id: string;
  name: string;
  value: number;
  description: string | null;
}

export interface ItemType {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  item_type_id: string | null;
  slot_type: string; // Dynamic from DB
  level: number;
  skill_id: string | null;
  power: number;
  rarity: string | null;
  quality: string;
  // Join properties
  skills?: Skill;
  item_types?: ItemType;
}

export interface Hero {
  id: string;
  name: string;
  image_url: string | null;
  // Join properties
  hero_item_types?: { item_type_id: string }[];
  hero_skills?: { skill_id: string; skills: Skill }[];
}

export interface Build {
  id: string;
  name: string;
  created_at: string;
}

export interface BuildSlot {
  id: string;
  build_id: string;
  hero_index: number;
  slot_type: string;
  item_id: string | null;
  hero_id: string | null;
}
