-- ============================================
-- ALTERAR FOREIGN KEYS PARA ON DELETE CASCADE
-- ============================================

-- 1. Tabela leads: alterar cliente_id de ON DELETE SET NULL para ON DELETE CASCADE
DO $$
BEGIN
    -- Verifica se a constraint existe antes de dropar e recriar
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'leads_cliente_id_fkey'
        AND table_name = 'leads'
    ) THEN
        -- Dropar a constraint existente
        ALTER TABLE leads DROP CONSTRAINT leads_cliente_id_fkey;
    END IF;
    
    -- Recriar com ON DELETE CASCADE
    ALTER TABLE leads ADD CONSTRAINT leads_cliente_id_fkey
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
    RAISE NOTICE 'Tabela leads alterada com sucesso: ON DELETE CASCADE';
END $$;

-- 2. Tabela campanhas: alterar cliente_id de ON DELETE SET NULL para ON DELETE CASCADE
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'campanhas_cliente_id_fkey'
        AND table_name = 'campanhas'
    ) THEN
        ALTER TABLE campanhas DROP CONSTRAINT campanhas_cliente_id_fkey;
    END IF;
    
    ALTER TABLE campanhas ADD CONSTRAINT campanhas_cliente_id_fkey
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
    RAISE NOTICE 'Tabela campanhas alterada com sucesso: ON DELETE CASCADE';
END $$;

-- 3. Tabela criativos: alterar cliente_id para ON DELETE CASCADE
DO $$
BEGIN
    -- Tabela criativos pode não ter constraint com nome padrão, tenta dropar se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'criativos_cliente_id_fkey'
        AND table_name = 'criativos'
    ) THEN
        ALTER TABLE criativos DROP CONSTRAINT criativos_cliente_id_fkey;
    END IF;
    
    ALTER TABLE criativos ADD CONSTRAINT criativos_cliente_id_fkey
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
    RAISE NOTICE 'Tabela criativos alterada com sucesso: ON DELETE CASCADE';
END $$;

-- Observações:
-- - Tabelas briefings, posts e branding já possuem ON DELETE CASCADE - mantidas como estão
-- - Tabela tarefas referencia leads(id) com ON DELETE CASCADE, não clientes diretamente
-- - Tabela mapeamentos_clientes não possui cliente_id column (tem nome_empresa)
-- - Tabela financeiro não existe no esquema atual