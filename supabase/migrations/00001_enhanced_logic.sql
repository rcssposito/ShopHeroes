-- Shop Heroes Planner - Relational V5 (Robust & Idempotent)
-- This script preserves existing 'builds' while updating everything else to the new Relational Schema.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Master Tables (IDEMPOTENT)
CREATE TABLE IF NOT EXISTS public.item_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.heroes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS public.builds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cleanup old versions of dependent tables to ensure schema sync
DROP TABLE IF EXISTS public.hero_skills CASCADE;
DROP TABLE IF EXISTS public.hero_item_types CASCADE;
DROP TABLE IF EXISTS public.build_slots CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;

-- 4. Create Entity Tables
CREATE TABLE public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    item_type_id UUID REFERENCES public.item_types(id) ON DELETE SET NULL,
    slot_type TEXT NOT NULL, -- Arma, Peito, Cabeça, Mãos, Pés, Acessório
    level INTEGER DEFAULT 1,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    power INTEGER DEFAULT 0,
    rarity TEXT,
    quality TEXT DEFAULT 'Normal'
);

CREATE TABLE public.hero_item_types (
    hero_id UUID REFERENCES public.heroes(id) ON DELETE CASCADE,
    item_type_id UUID REFERENCES public.item_types(id) ON DELETE CASCADE,
    PRIMARY KEY (hero_id, item_type_id)
);

CREATE TABLE public.hero_skills (
    hero_id UUID REFERENCES public.heroes(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY (hero_id, skill_id)
);

CREATE TABLE public.build_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    build_id UUID REFERENCES public.builds(id) ON DELETE CASCADE,
    hero_index INTEGER NOT NULL,
    slot_type TEXT NOT NULL,
    item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
    hero_id UUID REFERENCES public.heroes(id) ON DELETE SET NULL
);

-- 5. Population: Item Types
INSERT INTO public.item_types (name) VALUES
('Arco'), ('Cajado'), ('Faca'), ('Espada'), ('Lança'), ('Machado'), ('Martelo'), ('Pistola'),
('Túnica'), ('Veste'), ('Armadura'), ('Chapéu'), ('Elmo'), ('Luvas'), ('Manopla'), ('Sapatos'), ('Botas'),
('Instrumento'), ('Pingente'), ('Pergaminho'), ('Poção'), ('Anel'), ('Erva'), ('Projétil'), ('Escudo')
ON CONFLICT (name) DO NOTHING;

-- 6. Population: Skills
INSERT INTO public.skills (name, value) VALUES
('Bola de fogo', 25), ('Cortar', 25), ('Esmagar', 25), ('Pele de pedra', 30), ('Berserker', 35),
('Cone-gélido', 40), ('Raio elétrico', 50), ('Emboscada', 25), ('Defesa', 10), ('Passo das Sombras', 15),
('Detectar segredo', 6), ('Encontrar mágica', 12), ('Aura de proteção', 8), ('Revide', 20), ('Mestre das armas', 50),
('Arquimago 1', 10), ('Arquimago 2', 20), ('Arquimago 3', 30), ('Energético 1', 50), ('Energético 2', 75),
('Energético 3', 100), ('Cuidadoso 1', 15), ('Cuidadoso 2', 30), ('Cuidadoso 3', 50), ('Ganancioso 1', 50),
('Ganancioso 2', 100), ('Ganancioso 3', 200), ('Curandeiro 1', 10), ('Curandeiro 2', 25), ('Curandeiro 3', 50),
('Sortudo 1', 10), ('Sortudo 2', 20), ('Sortudo 3', 30), ('Protetor 1', 2), ('Protetor 2', 5), ('Protetor 3', 10),
('Resistente 1', 25), ('Resistente 2', 50), ('Resistente 3', 100), ('Engenhoso 1', 1), ('Engenhoso 2', 2),
('Engenhoso 3', 3), ('Reviver 1', 5), ('Reviver 2', 10), ('Reviver 3', 15), ('Catador 1', 1), ('Catador 2', 2),
('Catador 3', 3), ('Fornecedor 1', 5), ('Fornecedor 2', 10), ('Fornecedor 3', 15), ('Suporte 1', 1),
('Suporte 2', 2), ('Suporte 3', 3), ('Caça-tesouros 1', 2), ('Caça-tesouros 2', 4), ('Caça-tesouros 3', 6),
('Sábio 1', 25), ('Sábio 2', 50), ('Sábio 3', 100), ('Amazona 1', 5), ('Amazona 2', 10), ('Amazona 3', 25),
('Companheiro de Guerra 1', 5), ('Companheiro de Guerra 2', 10), ('Companheiro de Guerra 3', 25),
('Comandante 1', 15), ('Comandante 2', 25), ('Comandante 3', 50), ('Gangster 1', 10), ('Gangster 2', 25),
('Armadura do Mago', 25), ('Gangster 3', 50), ('Líder 1', 1), ('Líder 2', 2), ('Líder 3', 3), ('Velocista 1', 10),
('Velocista 2', 25), ('Velocista 3', 50)
ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;

-- 7. Population: ALL 28 Heroes and their Mappings
DO $$
DECLARE
    h_id UUID;
    t_id UUID;
    h_name TEXT;
    types TEXT[];
    hero_data JSONB := '[
        {"n": "Albert", "t": ["Arco", "Cajado", "Faca", "Túnica", "Veste", "Chapéu", "Luvas", "Sapatos", "Instrumento", "Pingente", "Pergaminho", "Poção"]},
        {"n": "Alicia", "t": ["Espada", "Lança", "Machado", "Martelo", "Armadura", "Elmo", "Manopla", "Botas", "Escudo", "Instrumento", "Erva", "Projétil"]},
        {"n": "Azula", "t": ["Cajado", "Faca", "Lança", "Túnica", "Chapéu", "Luvas", "Sapatos", "Anel", "Instrumento", "Pingente", "Erva", "Pergaminho"]},
        {"n": "Charles", "t": ["Cajado", "Arco", "Túnica", "Veste", "Chapéu", "Luvas", "Sapatos", "Instrumento", "Pergaminho"]},
        {"n": "Clovis", "t": ["Espada", "Lança", "Machado", "Martelo", "Armadura", "Elmo", "Manopla", "Botas", "Escudo", "Erva", "Projétil"]},
        {"n": "Darthos", "t": ["Espada", "Faca", "Pistola", "Veste", "Chapéu", "Elmo", "Luvas", "Botas", "Anel", "Escudo", "Erva", "Projétil"]},
        {"n": "Edward", "t": ["Cajado", "Lança", "Machado", "Martelo", "Armadura", "Túnica", "Elmo", "Manopla", "Botas", "Escudo", "Pergaminho", "Poção"]},
        {"n": "Fiora", "t": ["Espada", "Lança", "Pistola", "Armadura", "Túnica", "Elmo", "Manopla", "Botas", "Anel", "Escudo", "Poção"]},
        {"n": "Francesca", "t": ["Cajado", "Espada", "Lança", "Pistola", "Veste", "Elmo", "Manopla", "Botas", "Instrumento", "Pergaminho", "Poção"]},
        {"n": "Garreth", "t": ["Arco", "Faca", "Machado", "Martelo", "Veste", "Chapéu", "Luvas", "Sapatos", "Anel", "Pingente", "Erva", "Projétil"]},
        {"n": "Gauvin", "t": ["Espada", "Lança", "Machado", "Martelo", "Armadura", "Elmo", "Manopla", "Botas", "Anel", "Pingente", "Erva", "Poção"]},
        {"n": "Irene", "t": ["Espada", "Faca", "Pistola", "Veste", "Chapéu", "Luvas", "Botas", "Anel", "Escudo", "Poção", "Projétil"]},
        {"n": "Karal", "t": ["Lança", "Machado", "Martelo", "Armadura", "Veste", "Elmo", "Manopla", "Botas", "Escudo", "Pingente", "Poção", "Projétil"]},
        {"n": "Kuro Shobi", "t": ["Arco", "Machado", "Faca", "Pistola", "Túnica", "Veste", "Chapéu", "Luvas", "Sapatos", "Anel", "Instrumento", "Projétil"]},
        {"n": "Kurul", "t": ["Espada", "Machado", "Martelo", "Armadura", "Veste", "Elmo", "Manopla", "Botas", "Escudo", "Pingente", "Erva", "Poção"]},
        {"n": "Lancaster", "t": ["Espada", "Lança", "Machado", "Martelo", "Armadura", "Veste", "Elmo", "Manopla", "Botas", "Escudo", "Erva", "Poção"]},
        {"n": "Lorelei", "t": ["Faca", "Pistola", "Túnica", "Veste", "Chapéu", "Luvas", "Sapatos", "Anel", "Projétil"]},
        {"n": "Louca", "t": ["Martelo", "Pistola", "Veste", "Chapéu", "Manopla", "Botas", "Sapatos", "Anel", "Escudo", "Pingente", "Erva", "Projétil"]},
        {"n": "Melina", "t": ["Arco", "Cajado", "Faca", "Túnica", "Chapéu", "Luvas", "Sapatos", "Anel", "Pingente", "Erva", "Pergaminho"]},
        {"n": "Mila", "t": ["Arco", "Faca", "Martelo", "Veste", "Chapéu", "Luvas", "Sapatos", "Anel", "Pingente", "Erva", "Poção"]},
        {"n": "Minh", "t": ["Arco", "Cajado", "Martelo", "Túnica", "Chapéu", "Luvas", "Sapatos", "Instrumento", "Pingente", "Pergaminho", "Poção"]},
        {"n": "Mojian", "t": ["Arco", "Cajado", "Pistola", "Armadura", "Túnica", "Veste", "Elmo", "Manopla", "Botas", "Pingente", "Pergaminho", "Poção"]},
        {"n": "Nya", "t": ["Cajado", "Faca", "Lança", "Túnica", "Veste", "Chapéu", "Luvas", "Sapatos", "Anel", "Instrumento", "Erva", "Pergaminho"]},
        {"n": "Odette", "t": ["Arco", "Espada", "Faca", "Pistola", "Túnica", "Chapéu", "Luvas", "Sapatos", "Anel", "Pingente", "Instrumento", "Projétil", "Poção"]},
        {"n": "Oneira", "t": ["Arco", "Cajado", "Faca", "Túnica", "Chapéu", "Luvas", "Sapatos", "Anel", "Pingente", "Pergaminho", "Poção"]},
        {"n": "Palash", "t": ["Arco", "Machado", "Faca", "Pistola", "Veste", "Chapéu", "Luvas", "Sapatos", "Anel", "Instrumento", "Erva", "Projétil"]},
        {"n": "Theor", "t": ["Arco", "Espada", "Lança", "Machado", "Martelo", "Armadura", "Veste", "Elmo", "Manopla", "Botas", "Escudo", "Erva"]},
        {"n": "Yue", "t": ["Arco", "Espada", "Lança", "Machado", "Armadura", "Veste", "Chapéu", "Elmo", "Manopla", "Luvas", "Botas", "Sapatos", "Pingente", "Erva", "Pergaminho"]}
    ]';
    item JSONB;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(hero_data)
    LOOP
        INSERT INTO heroes (name) VALUES (item->>'n') 
        ON CONFLICT (name) DO NOTHING RETURNING id INTO h_id;
        
        IF h_id IS NULL THEN
            SELECT id INTO h_id FROM heroes WHERE name = item->>'n';
        END IF;

        -- Mapping junction
        FOR t_id IN SELECT id FROM item_types WHERE name = ANY(SELECT jsonb_array_elements_text(item->'t'))
        LOOP
            INSERT INTO hero_item_types (hero_id, item_type_id) VALUES (h_id, t_id) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
