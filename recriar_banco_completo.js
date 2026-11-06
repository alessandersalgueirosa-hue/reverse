const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function criar() {
    try {
        console.log("⏳ Criando tabelas base...");

        // 1. Tabela de Clientes
        await db.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                tipo VARCHAR(10) NOT NULL,
                nome VARCHAR(255) NOT NULL,
                razao_social VARCHAR(255),
                cpf VARCHAR(20),
                cnpj VARCHAR(20),
                email VARCHAR(255) UNIQUE NOT NULL,
                telefone VARCHAR(20),
                celular VARCHAR(20),
                endereco TEXT,
                cidade VARCHAR(100),
                estado VARCHAR(2),
                cep VARCHAR(10),
                data_nascimento DATE,
                observacoes TEXT,
                senha VARCHAR(255),
                status VARCHAR(20) DEFAULT 'ativo',
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Tabela de Tarefas
        await db.query(`
            CREATE TABLE IF NOT EXISTS tarefas (
                id SERIAL PRIMARY KEY,
                lead_id INTEGER,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                titulo VARCHAR(255) NOT NULL,
                descricao TEXT,
                data_vencimento DATE,
                concluida BOOLEAN DEFAULT false,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Tabela de Criativos
        await db.query(`
            CREATE TABLE IF NOT EXISTS criativos (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                titulo VARCHAR(255) NOT NULL,
                url_arquivo TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'pendente',
                feedback_cliente TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Tabela de Permissões
        await db.query(`
            CREATE TABLE IF NOT EXISTS permissoes_clientes (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE UNIQUE,
                pode_ver_metricas BOOLEAN DEFAULT true,
                pode_ver_financeiro BOOLEAN DEFAULT true,
                pode_ver_calendario BOOLEAN DEFAULT true,
                pode_ver_branding BOOLEAN DEFAULT true,
                pode_ver_propostas BOOLEAN DEFAULT false,
                pode_ver_campanhas BOOLEAN DEFAULT false,
                pode_ver_tarefas BOOLEAN DEFAULT true,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ Tabelas base (clientes, tarefas, criativos, permissoes) criadas com sucesso!");
    } catch (erro) {
        console.error("❌ Erro detalhado:", erro.message);
    } finally {
        process.exit();
    }
}
criar();