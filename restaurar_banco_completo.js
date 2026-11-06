const db = require('./db');
const bcrypt = require('bcryptjs');

async function restaurar() {
    try {
        console.log("⏳ Restaurando a estrutura completa do banco...\n");

        // 1. Tabela de Usuários (Admin)
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL
            );
        `);
        
        // Cria o admin se não existir (admin@reverse.com / admin123)
        const checkAdmin = await db.query("SELECT id FROM usuarios WHERE email = 'admin@reverse.com'");
        if (checkAdmin.rows.length === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await db.query("INSERT INTO usuarios (nome, email, senha) VALUES ('Admin', 'admin@reverse.com', $1)", [hash]);
            console.log("✅ Usuário Admin criado (admin@reverse.com / admin123)");
        }

        // 2. Tabela de Prospects
        await db.query(`
            CREATE TABLE IF NOT EXISTS prospects (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                telefone VARCHAR(50),
                empresa VARCHAR(255),
                cargo VARCHAR(100),
                origem VARCHAR(100),
                status VARCHAR(50) DEFAULT 'novo',
                observacoes TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'prospects' pronta.");

        // 3. Tabela de Campanhas
        await db.query(`
            CREATE TABLE IF NOT EXISTS campanhas (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                data_inicio DATE,
                data_fim DATE,
                orcamento NUMERIC(12,2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'ativa',
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'campanhas' pronta.");

        // 4. Tabela de Leads
        await db.query(`
            CREATE TABLE IF NOT EXISTS leads (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                telefone VARCHAR(20),
                empresa VARCHAR(100),
                origem VARCHAR(50),
                status VARCHAR(50) DEFAULT 'novo',
                cliente_id INTEGER REFERENCES clientes(id),
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'leads' pronta.");

        // 5. Tabela de Receitas
        await db.query(`
            CREATE TABLE IF NOT EXISTS receitas (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                descricao TEXT,
                valor NUMERIC(12,2) NOT NULL,
                data DATE NOT NULL,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'receitas' pronta.");

        // 6. Tabela de Despesas
        await db.query(`
            CREATE TABLE IF NOT EXISTS despesas (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                descricao TEXT,
                valor NUMERIC(12,2) NOT NULL,
                data DATE NOT NULL,
                categoria VARCHAR(50),
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'despesas' pronta.");

        // 7. Tabela de Inbound
        await db.query(`
            CREATE TABLE IF NOT EXISTS inbound_marketing (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                persona VARCHAR(255),
                etapa_funil VARCHAR(100),
                tipo_conteudo VARCHAR(100),
                titulo VARCHAR(255),
                descricao TEXT,
                palavras_chave VARCHAR(255),
                status VARCHAR(50) DEFAULT 'planejado',
                link TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'inbound_marketing' pronta.");

        // 8. Tabela de Outbound
        await db.query(`
            CREATE TABLE IF NOT EXISTS outbound_marketing (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                prospect_id INTEGER,
                canal VARCHAR(100),
                mensagem TEXT,
                status VARCHAR(50) DEFAULT 'pendente',
                data_acao DATE,
                observacoes TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'outbound_marketing' pronta.");

        // 9. Tabela de Branding
        await db.query(`
            CREATE TABLE IF NOT EXISTS branding (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER UNIQUE REFERENCES clientes(id) ON DELETE CASCADE,
                missao TEXT,
                visao TEXT,
                valores TEXT,
                publico_alvo TEXT,
                personalidade TEXT,
                tom_de_voz TEXT,
                cores_primarias VARCHAR(50),
                cores_secundarias VARCHAR(50),
                tipografia_principal VARCHAR(100),
                tipografia_secundaria VARCHAR(100),
                referencias_visuais TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'branding' pronta.");

        // 10. Tabela de Comentários
        await db.query(`
            CREATE TABLE IF NOT EXISTS comentarios (
                id SERIAL PRIMARY KEY,
                tarefa_id INTEGER REFERENCES tarefas(id) ON DELETE CASCADE,
                criativo_id INTEGER REFERENCES criativos(id) ON DELETE CASCADE,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                usuario_id INTEGER,
                usuario_tipo VARCHAR(50),
                mensagem TEXT NOT NULL,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'comentarios' pronta.");

        // 11. Tabela de Produtos
        await db.query(`
            CREATE TABLE IF NOT EXISTS produtos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                preco NUMERIC(12,2) NOT NULL,
                categoria VARCHAR(100),
                sku VARCHAR(100),
                estoque INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'ativo',
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'produtos' pronta.");
        
        // 11. Tabela de Planejamento
        await db.query(`
            CREATE TABLE IF NOT EXISTS planejamento (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                campanha_id INTEGER REFERENCES campanhas(id) ON DELETE SET NULL,
                orcamento NUMERIC(12,2) DEFAULT 0,
                meta_roas NUMERIC(10,2) DEFAULT 0,
                responsavel VARCHAR(255),
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'planejamento' pronta.");

        console.log("\n🎉 TUDO PRONTO! Todas as tabelas foram recriadas com sucesso.");
        console.log("Agora reinicie o servidor (Ctrl+C e node server.js) e recarregue a página de Prospects.");

    } catch (error) {
        console.error("\n❌ ERRO AO RESTAURAR:", error.message);
    }
    process.exit();
}

restaurar();