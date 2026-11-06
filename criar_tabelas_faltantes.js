const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function criar() {
    try {
        console.log("⏳ Garantindo que as tabelas existem...");

        // Tabela de Tarefas
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

        // Tabela de Criativos
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

        console.log("✅ Tabelas 'tarefas' e 'criativos' criadas/verificadas com sucesso!");
    } catch (erro) {
        console.error("❌ Erro detalhado:", erro.message);
    } finally {
        process.exit();
    }
}
criar();