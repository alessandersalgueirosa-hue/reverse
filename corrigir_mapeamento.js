const db = require('./db');

async function corrigir() {
    try {
        console.log("⏳ Verificando e adicionando colunas na tabela 'mapeamentos_clientes'...\n");

        // Lista de todas as colunas que a tabela precisa ter
        const colunas = [
            ['cliente_id', 'INTEGER'],
            ['nome_empresa', 'VARCHAR(255)'],
            ['cnpj', 'VARCHAR(20)'],
            ['segmento', 'VARCHAR(100)'],
            ['publico_alvo', 'TEXT'],
            ['concorrentes', 'TEXT'],
            ['diferenciais', 'TEXT'],
            ['site', 'VARCHAR(255)'],
            ['email', 'VARCHAR(255)'],
            ['telefone', 'VARCHAR(50)'],
            ['endereco', 'TEXT'],
            ['observacoes', 'TEXT'],
            ['data_criacao', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'],
            ['nome_contato', 'VARCHAR(255)'],
            ['cargo_contato', 'VARCHAR(100)'],
            ['email_contato', 'VARCHAR(255)'],
            ['telefone_contato', 'VARCHAR(50)'],
            ['objetivo_principal', 'TEXT'],
            ['faturamento_mensal', 'VARCHAR(50)'],
            ['tempo_mercado', 'VARCHAR(50)'],
            ['canais_venda', 'TEXT'],
            ['pontos_fortes', 'TEXT'],
            ['pontos_fracos', 'TEXT'],
            ['redes_sociais', 'TEXT'],
            ['link_redes', 'TEXT'],
            ['acesso_meta', 'TEXT'],
            ['acesso_google', 'TEXT'],
            ['acesso_site', 'TEXT'],
            ['acesso_instagram', 'TEXT'],
            ['acesso_linkedin', 'TEXT'],
            ['acesso_tiktok', 'TEXT'],
            ['outras_ferramentas', 'TEXT'],
            ['historico_marketing', 'TEXT'],
            ['expectativas', 'TEXT'],
            ['acesso_google_ads', 'TEXT'],
            ['acesso_google_analytics', 'TEXT'],
            ['acesso_facebook_ads', 'TEXT'],
            ['acesso_instagram_ads', 'TEXT'],
            ['acesso_linkedin_ads', 'TEXT'],
            ['acesso_tiktok_ads', 'TEXT'],
            ['acesso_youtube_ads', 'TEXT'],
            ['acesso_whatsapp', 'TEXT'],
            ['meta_business', 'BOOLEAN DEFAULT false'],
            ['google_ads', 'BOOLEAN DEFAULT false'],
            ['google_analytics', 'BOOLEAN DEFAULT false'],
            ['site_hospedagem', 'BOOLEAN DEFAULT false'],
            ['manual_marca', 'BOOLEAN DEFAULT false'],
            ['observacoes_acessos', 'TEXT'],
            ['observacoes_gerais', 'TEXT']
        ];

        for (const [coluna, tipo] of colunas) {
            try {
                await db.query(`ALTER TABLE mapeamentos_clientes ADD COLUMN IF NOT EXISTS ${coluna} ${tipo}`);
                console.log(`✅ Coluna '${coluna}' verificada/adicionada.`);
            } catch (err) {
                console.log(`⚠️ Aviso na coluna '${coluna}':`, err.message);
            }
        }

        console.log("\n🎉 Tabela pronta para uso!");

    } catch (error) {
        console.error("\n❌ ERRO GERAL:", error.message);
    }
    process.exit();
}

corrigir();