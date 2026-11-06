const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function criar() {
    try {
        console.log("⏳ Criando todas as tabelas do sistema...");

        // 1. Clientes
        await db.query(`CREATE TABLE IF NOT EXISTS clientes (id SERIAL PRIMARY KEY, tipo VARCHAR(10) NOT NULL, nome VARCHAR(255) NOT NULL, razao_social VARCHAR(255), cpf VARCHAR(20), cnpj VARCHAR(20), email VARCHAR(255) UNIQUE NOT NULL, telefone VARCHAR(20), celular VARCHAR(20), endereco TEXT, cidade VARCHAR(100), estado VARCHAR(2), cep VARCHAR(10), data_nascimento DATE, observacoes TEXT, senha VARCHAR(255), status VARCHAR(20) DEFAULT 'ativo', data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 2. Leads
        await db.query(`CREATE TABLE IF NOT EXISTS leads (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, email VARCHAR(255), mensagem TEXT, telefone VARCHAR(20), empresa VARCHAR(255), origem VARCHAR(100), status VARCHAR(50) DEFAULT 'novo', cliente_id INTEGER, campanha_id INTEGER, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 3. Tarefas
        await db.query(`CREATE TABLE IF NOT EXISTS tarefas (id SERIAL PRIMARY KEY, lead_id INTEGER, cliente_id INTEGER, titulo VARCHAR(255) NOT NULL, descricao TEXT, data_vencimento DATE, concluida BOOLEAN DEFAULT false, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 4. Criativos
        await db.query(`CREATE TABLE IF NOT EXISTS criativos (id SERIAL PRIMARY KEY, cliente_id INTEGER, titulo VARCHAR(255) NOT NULL, url_arquivo TEXT NOT NULL, status VARCHAR(50) DEFAULT 'pendente', feedback_cliente TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 5. Mapeamentos
        await db.query(`CREATE TABLE IF NOT EXISTS mapeamentos_clientes (id SERIAL PRIMARY KEY, nome_empresa VARCHAR(255), cnpj VARCHAR(20), segmento VARCHAR(100), site VARCHAR(255), telefone VARCHAR(20), nome_contato VARCHAR(100), objetivo_principal TEXT, meta_business BOOLEAN DEFAULT false, google_ads BOOLEAN DEFAULT false, google_analytics BOOLEAN DEFAULT false, site_hospedagem BOOLEAN DEFAULT false, manual_marca BOOLEAN DEFAULT false, observacoes_acessos TEXT, observacoes_gerais TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 6. Branding
        await db.query(`CREATE TABLE IF NOT EXISTS branding (id SERIAL PRIMARY KEY, cliente_id INTEGER, missao TEXT, visao TEXT, valores TEXT, publico_alvo TEXT, personalidade TEXT, tom_de_voz TEXT, cores_primarias VARCHAR(255), cores_secundarias VARCHAR(255), tipografia_principal VARCHAR(255), tipografia_secundaria VARCHAR(255), logo_url VARCHAR(255), referencias_visuais TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 7. Briefings
        await db.query(`CREATE TABLE IF NOT EXISTS briefings (id SERIAL PRIMARY KEY, cliente_id INTEGER, empresa VARCHAR(255), segmento VARCHAR(100), publico_alvo TEXT, concorrentes TEXT, diferenciais TEXT, identidade_visual TEXT, redes_sociais TEXT, site VARCHAR(255), status VARCHAR(50) DEFAULT 'pendente', data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 8. Posts (Calendário)
        await db.query(`CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, cliente_id INTEGER, data_publicacao DATE, plataforma VARCHAR(50), titulo VARCHAR(255), conteudo TEXT, url_midia TEXT, status VARCHAR(50) DEFAULT 'pendente', feedback_cliente TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 9. Campanhas
        await db.query(`CREATE TABLE IF NOT EXISTS campanhas (id SERIAL PRIMARY KEY, nome VARCHAR(255), descricao TEXT, data_inicio DATE, data_fim DATE, orcamento NUMERIC, status VARCHAR(50) DEFAULT 'ativa', cliente_id INTEGER, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 10. Inbound
        await db.query(`CREATE TABLE IF NOT EXISTS inbound_marketing (id SERIAL PRIMARY KEY, cliente_id INTEGER, persona VARCHAR(255), etapa_funil VARCHAR(100), tipo_conteudo VARCHAR(100), titulo VARCHAR(255), descricao TEXT, palavras_chave TEXT, status VARCHAR(50), link VARCHAR(255), data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 11. Outbound
        await db.query(`CREATE TABLE IF NOT EXISTS outbound_marketing (id SERIAL PRIMARY KEY, cliente_id INTEGER, prospect_id INTEGER, canal VARCHAR(100), mensagem TEXT, status VARCHAR(50), data_acao DATE, observacoes TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 12. Prospects
        await db.query(`CREATE TABLE IF NOT EXISTS prospects (id SERIAL PRIMARY KEY, nome VARCHAR(255), email VARCHAR(255), telefone VARCHAR(20), empresa VARCHAR(255), cargo VARCHAR(100), origem VARCHAR(100), status VARCHAR(50) DEFAULT 'novo', observacoes TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 13. Financeiro (Receitas, Despesas)
        await db.query(`CREATE TABLE IF NOT EXISTS receitas (id SERIAL PRIMARY KEY, cliente_id INTEGER, descricao VARCHAR(255), valor NUMERIC, data DATE, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await db.query(`CREATE TABLE IF NOT EXISTS despesas (id SERIAL PRIMARY KEY, cliente_id INTEGER, descricao VARCHAR(255), valor NUMERIC, data DATE, categoria VARCHAR(100), data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 14. Ações Sociais
        await db.query(`CREATE TABLE IF NOT EXISTS acoes_sociais (id SERIAL PRIMARY KEY, cliente_id INTEGER, campanha_id INTEGER, tipo VARCHAR(100), titulo VARCHAR(255), descricao TEXT, data_publicacao DATE, status VARCHAR(50), link VARCHAR(255), data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 15. Tráfego Pago
        await db.query(`CREATE TABLE IF NOT EXISTS trafego_pago (id SERIAL PRIMARY KEY, cliente_id INTEGER, plataforma VARCHAR(100), nome_campanha VARCHAR(255), objetivo VARCHAR(255), orcamento_diario NUMERIC, status VARCHAR(50), data_inicio DATE, data_fim DATE, investimento_total NUMERIC, impressoes INTEGER, cliques INTEGER, conversoes INTEGER, observacoes TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 16. Storytelling
        await db.query(`CREATE TABLE IF NOT EXISTS storytelling (id SERIAL PRIMARY KEY, cliente_id INTEGER, titulo VARCHAR(255), publico_alvo TEXT, dor_principal TEXT, solucao TEXT, transformacao TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 17. Base de Conhecimento
        await db.query(`CREATE TABLE IF NOT EXISTS base_conhecimento (id SERIAL PRIMARY KEY, titulo VARCHAR(255), categoria VARCHAR(100), conteudo TEXT, autor VARCHAR(255), arquivo_url VARCHAR(255), data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 18. Planejamento BSC
        await db.query(`CREATE TABLE IF NOT EXISTS planejamentos_bsc (id SERIAL PRIMARY KEY, cliente_id INTEGER, nome_campanha VARCHAR(255), data_inicio DATE, data_fim DATE, orcamento_total NUMERIC, meta_faturamento NUMERIC, meta_roas NUMERIC, meta_cac NUMERIC, persona_principal TEXT, proposta_valor TEXT, canais_aquisicao TEXT, meta_nps INTEGER, entregaveis TEXT, ferramentas TEXT, responsavel VARCHAR(255), cronograma TEXT, treinamento TEXT, inovacao TEXT, posicionamento_marca TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 19. Permissões
        await db.query(`CREATE TABLE IF NOT EXISTS permissoes_clientes (id SERIAL PRIMARY KEY, cliente_id INTEGER UNIQUE, pode_ver_metricas BOOLEAN DEFAULT true, pode_ver_financeiro BOOLEAN DEFAULT true, pode_ver_calendario BOOLEAN DEFAULT true, pode_ver_branding BOOLEAN DEFAULT true, pode_ver_propostas BOOLEAN DEFAULT false, pode_ver_campanhas BOOLEAN DEFAULT false, pode_ver_tarefas BOOLEAN DEFAULT true, data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // 20. Usuários (Admin)
        await db.query(`CREATE TABLE IF NOT EXISTS usuarios (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, senha VARCHAR(255) NOT NULL);`);

        // 21. Email Configuracoes
        await db.query(`CREATE TABLE IF NOT EXISTS email_configuracoes (id SERIAL PRIMARY KEY, host VARCHAR(255), port INTEGER, user_email VARCHAR(255), pass VARCHAR(255), remetente_nome VARCHAR(255), brevo_api_key VARCHAR(255));`);

        // 22. Tags e Lead Tags
        await db.query(`CREATE TABLE IF NOT EXISTS tags (id SERIAL PRIMARY KEY, nome VARCHAR(100) UNIQUE NOT NULL);`);
        await db.query(`CREATE TABLE IF NOT EXISTS lead_tags (lead_id INTEGER, tag_id INTEGER, PRIMARY KEY (lead_id, tag_id));`);

        console.log("✅ TODAS as tabelas foram criadas/verificadas com sucesso!");
    } catch (erro) {
        console.error("❌ Erro detalhado:", erro.message);
    } finally {
        process.exit();
    }
}
criar();