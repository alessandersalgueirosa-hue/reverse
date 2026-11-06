const db = require('./db');

async function consertar() {
    try {
        console.log("⏳ Recriando as tabelas que faltaram...\n");

        // 1. Tabela de Mapeamentos (A que deu erro)
        await db.query(`
            CREATE TABLE IF NOT EXISTS mapeamentos_clientes (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER,
                nome_empresa VARCHAR(255),
                cnpj VARCHAR(20),
                segmento VARCHAR(100),
                publico_alvo TEXT,
                concorrentes TEXT,
                diferenciais TEXT,
                site VARCHAR(255),
                email VARCHAR(255),
                telefone VARCHAR(50),
                endereco TEXT,
                observacoes TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                nome_contato VARCHAR(255),
                cargo_contato VARCHAR(100),
                email_contato VARCHAR(255),
                telefone_contato VARCHAR(50),
                objetivo_principal TEXT,
                faturamento_mensal VARCHAR(50),
                tempo_mercado VARCHAR(50),
                canais_venda TEXT,
                pontos_fortes TEXT,
                pontos_fracos TEXT,
                redes_sociais TEXT,
                link_redes TEXT,
                acesso_meta TEXT,
                acesso_google TEXT,
                acesso_site TEXT,
                acesso_instagram TEXT,
                acesso_linkedin TEXT,
                acesso_tiktok TEXT,
                outras_ferramentas TEXT,
                historico_marketing TEXT,
                expectativas TEXT,
                acesso_google_ads TEXT,
                acesso_google_analytics TEXT,
                acesso_facebook_ads TEXT,
                acesso_instagram_ads TEXT,
                acesso_linkedin_ads TEXT,
                acesso_tiktok_ads TEXT,
                acesso_youtube_ads TEXT,
                acesso_whatsapp TEXT,
                meta_business BOOLEAN DEFAULT false,
                google_ads BOOLEAN DEFAULT false,
                google_analytics BOOLEAN DEFAULT false,
                site_hospedagem BOOLEAN DEFAULT false,
                manual_marca BOOLEAN DEFAULT false,
                observacoes_acessos TEXT,
                observacoes_gerais TEXT
            );
        `);
        console.log("✅ Tabela 'mapeamentos_clientes' recriada.");

        // 2. Tabela de Briefings
        await db.query(`
            CREATE TABLE IF NOT EXISTS briefings (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                empresa VARCHAR(255),
                segmento VARCHAR(100),
                publico_alvo TEXT,
                concorrentes TEXT,
                diferenciais TEXT,
                identidade_visual TEXT,
                redes_sociais TEXT,
                site VARCHAR(255),
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'briefings' recriada.");

        // 3. Tabela de Conhecimento (Base de Conhecimento)
        await db.query(`
            CREATE TABLE IF NOT EXISTS conhecimento (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(255),
                categoria VARCHAR(100),
                conteudo TEXT,
                autor VARCHAR(100),
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'conhecimento' recriada.");

        // 4. Tabela de Propostas
        await db.query(`
            CREATE TABLE IF NOT EXISTS propostas (
                id SERIAL PRIMARY KEY,
                cliente_nome VARCHAR(255) NOT NULL,
                cliente_email VARCHAR(255),
                cliente_telefone VARCHAR(50),
                valor_total NUMERIC(12,2) NOT NULL,
                validade INTEGER,
                condicoes_pagamento VARCHAR(255),
                observacoes TEXT,
                servicos JSONB,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'propostas' recriada.");

        console.log("\n🎉 TODAS AS TABELAS FALTANTES FORAM RECRIADAS!");
        console.log("Agora reinicie o servidor (Ctrl+C e node server.js) e tente salvar o mapeamento novamente.");

    } catch (error) {
        console.error("\n❌ ERRO AO RECRIAR:", error.message);
    }
    process.exit();
}

consertar();