-- Seed technical descriptions into skills table
DO $BODY$
BEGIN
    -- Update existing skills with descriptions from the technical list
    UPDATE public.skills SET description = 'Aumenta a força em 25%' WHERE name IN ('Bola de fogo', 'Cortar', 'Esmagar');
    UPDATE public.skills SET description = 'Aumenta a força em 30%' WHERE name = 'Pele de pedra';
    UPDATE public.skills SET description = 'Aumenta a força em 35%' WHERE name = 'Berserker';
    UPDATE public.skills SET description = 'Aumenta a força em 40%' WHERE name = 'Cone-gélido';
    UPDATE public.skills SET description = 'Aumenta a força em 50%' WHERE name = 'Raio elétrico';
    UPDATE public.skills SET description = 'Aumenta a força 25% das vezes' WHERE name = 'Emboscada';
    UPDATE public.skills SET description = 'Aumenta a defesa do equipamento em 10%' WHERE name = 'Defesa';
    UPDATE public.skills SET description = 'Evita ferimentos 15% das vezes' WHERE name = 'Passo das Sombras';
    UPDATE public.skills SET description = 'Aumenta o número máximo de artefatos e itens de raid encontrados por cada membro do grupo em +1' WHERE name = 'Detectar segredo';
    UPDATE public.skills SET description = 'Aumenta o número máximo de artefatos e itens de raid encontrados por cada membro do grupo em +2' WHERE name = 'Encontrar mágica';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência do grupo em 8%' WHERE name = 'Aura de proteção';
    UPDATE public.skills SET description = 'Aumenta a força do equipamento em 20%' WHERE name = 'Revide';
    UPDATE public.skills SET description = 'Aumenta a força do equipamento em 75%' WHERE name = 'Mestre das armas';
    UPDATE public.skills SET description = 'Aumenta a força dos feiticeiros do grupo em 10%' WHERE name = 'Arquimago 1';
    UPDATE public.skills SET description = 'Aumenta a força dos feiticeiros do grupo em 20%' WHERE name = 'Arquimago 2';
    UPDATE public.skills SET description = 'Aumenta a força dos feiticeiros do grupo em 30%' WHERE name = 'Arquimago 3';
    UPDATE public.skills SET description = 'Reduz o tempo de espera depois da missão em 50%' WHERE name = 'Energético 1';
    UPDATE public.skills SET description = 'Reduz o tempo de espera depois da missão em 75%' WHERE name = 'Energético 2';
    UPDATE public.skills SET description = 'Reduz o tempo de espera depois da missão em 100%' WHERE name = 'Energético 3';
    UPDATE public.skills SET description = 'Diminui a chance de quebra de equipamento em 15% das vezes' WHERE name = 'Cuidadoso 1';
    UPDATE public.skills SET description = 'Diminui a chance de quebra de equipamento em 30% das vezes' WHERE name = 'Cuidadoso 2';
    UPDATE public.skills SET description = 'Diminui a chance de quebra de equipamento em 50% das vezes' WHERE name = 'Cuidadoso 3';
    UPDATE public.skills SET description = 'Encontra mais 50% de ouro durante as missões' WHERE name = 'Ganancioso 1';
    UPDATE public.skills SET description = 'Encontra mais 100% de ouro durante as missões' WHERE name = 'Ganancioso 2';
    UPDATE public.skills SET description = 'Encontra mais 200% de ouro durante as missões' WHERE name = 'Ganancioso 3';
    UPDATE public.skills SET description = 'Reduz o tempo de cura de companheiros em 10%' WHERE name = 'Curandeiro 1';
    UPDATE public.skills SET description = 'Reduz o tempo de cura de companheiros em 25%' WHERE name = 'Curandeiro 2';
    UPDATE public.skills SET description = 'Reduz o tempo de cura de companheiros em 50%' WHERE name = 'Curandeiro 3';
    UPDATE public.skills SET description = 'Evita ferimentos 10% das vezes' WHERE name = 'Sortudo 1';
    UPDATE public.skills SET description = 'Evita ferimentos 20% das vezes' WHERE name = 'Sortudo 2';
    UPDATE public.skills SET description = 'Evita ferimentos 30% das vezes' WHERE name = 'Sortudo 3';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência do grupo em 2%' WHERE name = 'Protetor 1';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência do grupo em 5%' WHERE name = 'Protetor 2';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência do grupo em 10%' WHERE name = 'Protetor 3';
    UPDATE public.skills SET description = 'Obtém pelo menos 25% de experiência quando ferido e a missão é bem sucedida' WHERE name = 'Resistente 1';
    UPDATE public.skills SET description = 'Obtém pelo menos 50% de experiência quando ferido e a missão é bem sucedida' WHERE name = 'Resistente 2';
    UPDATE public.skills SET description = 'Obtém pelo menos 100% de experiência quando ferido e a missão é bem sucedida' WHERE name = 'Resistente 3';
    UPDATE public.skills SET description = 'Impede que 1 peça de equipamento se quebre durante a missão' WHERE name = 'Engenhoso 1';
    UPDATE public.skills SET description = 'Impede que 2 peças de equipamento se quebre durante a missão' WHERE name = 'Engenhoso 2';
    UPDATE public.skills SET description = 'Impede que 3 peças de equipamento se quebre durante a missão' WHERE name = 'Engenhoso 3';
    UPDATE public.skills SET description = 'Revive um companheiro derrotado 5% das vezes' WHERE name = 'Reviver 1';
    UPDATE public.skills SET description = 'Revive um companheiro derrotado 10% das vezes' WHERE name = 'Reviver 2';
    UPDATE public.skills SET description = 'Revive um companheiro derrotado 15% das vezes' WHERE name = 'Reviver 3';
    UPDATE public.skills SET description = 'Aumenta o número mínimo de itens e artefatos encontrados em +1' WHERE name = 'Catador 1';
    UPDATE public.skills SET description = 'Aumenta o número mínimo de itens e artefatos encontrados em +2' WHERE name = 'Catador 2';
    UPDATE public.skills SET description = 'Aumenta o número mínimo de itens e artefatos encontrados em +3' WHERE name = 'Catador 3';
    UPDATE public.skills SET description = 'Reduz a chance de companheiros quebrarem o equipamento em 5%' WHERE name = 'Fornecedor 1';
    UPDATE public.skills SET description = 'Reduz a chance de companheiros quebrarem o equipamento em 10%' WHERE name = 'Fornecedor 2';
    UPDATE public.skills SET description = 'Reduz a chance de companheiros quebrarem o equipamento em 15%' WHERE name = 'Fornecedor 3';
    UPDATE public.skills SET description = 'Impede que o equipamento de um companheiro se quebre 1 vez' WHERE name = 'Suporte 1';
    UPDATE public.skills SET description = 'Impede que o equipamento de um companheiro se quebre 2 vezes' WHERE name = 'Suporte 2';
    UPDATE public.skills SET description = 'Impede que o equipamento de um companheiro se quebre 3 vezes' WHERE name = 'Suporte 3';
    UPDATE public.skills SET description = 'Aumenta o número máximo de artefatos e itens de raid encontrados em +2' WHERE name = 'Caça-tesouros 1';
    UPDATE public.skills SET description = 'Aumenta o número máximo de artefatos e itens de raid encontrados em +4' WHERE name = 'Caça-tesouros 2';
    UPDATE public.skills SET description = 'Aumenta o número máximo de artefatos e itens de raid encontrados em +6' WHERE name = 'Caça-tesouros 3';
    UPDATE public.skills SET description = '25% de bônus de experiência' WHERE name = 'Sábio 1';
    UPDATE public.skills SET description = '50% de bônus de experiência' WHERE name = 'Sábio 2';
    UPDATE public.skills SET description = '100% de bônus de experiência' WHERE name = 'Sábio 3';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência de membros femininos do grupo em 5%' WHERE name = 'Amazona 1';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência de membros femininos do grupo em 10%' WHERE name = 'Amazona 2';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência de membros femininos do grupo em 25%' WHERE name = 'Amazona 3';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência de membros masculinos do grupo em 5%' WHERE name = 'Companheiro de Guerra 1';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência de membros masculinos do grupo em 10%' WHERE name = 'Companheiro de Guerra 2';
    UPDATE public.skills SET description = 'Aumenta a taxa de sobrevivência de membros masculinos do grupo em 25%' WHERE name = 'Companheiro de Guerra 3';
    UPDATE public.skills SET description = 'Aumenta a força dos guerreiros do grupo em 15%' WHERE name = 'Comandante 1';
    UPDATE public.skills SET description = 'Aumenta a força dos guerreiros do grupo em 25%' WHERE name = 'Comandante 2';
    UPDATE public.skills SET description = 'Aumenta a força dos guerreiros do grupo em 50%' WHERE name = 'Comandante 3';
    UPDATE public.skills SET description = 'Aumenta a força do equipamento em 10%' WHERE name = 'Gangster 1';
    UPDATE public.skills SET description = 'Aumenta a força do equipamento em 25%' WHERE name IN ('Gangster 2', 'Armadura do Mago');
    UPDATE public.skills SET description = 'Aumenta a força do equipamento em 50%' WHERE name = 'Gangster 3';
    UPDATE public.skills SET description = 'Aumenta o número de companheiros em +1' WHERE name = 'Líder 1';
    UPDATE public.skills SET description = 'Aumenta o número de companheiros em +2' WHERE name = 'Líder 2';
    UPDATE public.skills SET description = 'Aumenta o número de companheiros em +3' WHERE name = 'Líder 3';
    UPDATE public.skills SET description = 'Reduz a duração da missão em 10%' WHERE name = 'Velocista 1';
    UPDATE public.skills SET description = 'Reduz a duração da missão em 25%' WHERE name = 'Velocista 2';
    UPDATE public.skills SET description = 'Reduz a duração da missão em 50%' WHERE name = 'Velocista 3';
END $BODY$;

-- Seed Hero Innate Skills into hero_skills join table
DO $BODY$
DECLARE
    hero_id UUID;
    skill_id UUID;
    h_name TEXT;
    s_name TEXT;
    hero_map JSONB := '{
        "Albert": ["Cuidadoso 1", "Fornecedor 1", "Suporte 1"],
        "Alicia": ["Amazona 3", "Energético 3", "Sortudo 3"],
        "Azula": ["Arquimago 2", "Curandeiro 3", "Sábio 3"],
        "Charles": ["Armadura do Mago", "Detectar segredo", "Encontrar mágica"],
        "Clovis": ["Defesa", "Protetor 1", "Comandante 1"],
        "Darthos": ["Velocista 2", "Sábio 2", "Companheiro de Guerra 3"],
        "Edward": ["Líder 3", "Reviver 3", "Protetor 3"],
        "Fiora": ["Comandante 2", "Ganancioso 2", "Reviver 2"],
        "Francesca": ["Cuidadoso 3", "Fornecedor 3", "Resistente 1"],
        "Garreth": ["Sortudo 1", "Caça-tesouros 1", "Catador 1"],
        "Gauvin": ["Líder 1", "Companheiro de Guerra 1", "Resistente 2"],
        "Irene": ["Gangster 1", "Fornecedor 2", "Engenhoso 1"],
        "Karal": ["Amazona 1", "Resistente 1", "Esmagar"],
        "Kuro Shobi": ["Gangster 3", "Engenhoso 3", "Velocista 3"],
        "Kurul": ["Catador 2", "Energético 2", "Líder 2"],
        "Lancaster": ["Engenhoso 2", "Protetor 2", "Companheiro de Guerra 2"],
        "Lorelei": ["Sortudo 3", "Emboscada", "Catador 3"],
        "Louca": ["Caça-tesouros 3", "Catador 3", "Suporte 3"],
        "Melina": ["Bola de fogo", "Sábio 1", "Velocista 1"],
        "Mila": ["Caça-tesouros 2", "Sortudo 2", "Ganancioso 1"],
        "Minh": ["Sábio 1", "Curandeiro 1", "Reviver 1"],
        "Mojian": ["Comandante 3", "Arquimago 3", "Raio elétrico"],
        "Nya": ["Reviver 1", "Arquimago 1", "Cone-gélido"],
        "Odette": ["Cuidadoso 2", "Amazona 2", "Suporte 2"],
        "Oneira": ["Ganancioso 3", "Curandeiro 2", "Suporte 2"],
        "Palash": ["Catador 1", "Resistente 1", "Fornecedor 1"],
        "Theor": ["Companheiro de Guerra 1", "Energético 1", "Cortar"],
        "Yue": ["Resistente 3", "Mestre das armas", "Comandante 3"]
    }';
    rec RECORD;
BEGIN
    FOR h_name, s_name IN SELECT key, jsonb_array_elements_text(value) FROM jsonb_each(hero_map)
    LOOP
        SELECT id INTO hero_id FROM public.heroes WHERE name = h_name;
        SELECT id INTO skill_id FROM public.skills WHERE name = s_name;
        
        IF hero_id IS NOT NULL AND skill_id IS NOT NULL THEN
            INSERT INTO public.hero_skills (hero_id, skill_id) VALUES (hero_id, skill_id) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $BODY$;
