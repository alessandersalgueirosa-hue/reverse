const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function criar() {
    try {
        console.log("⏳ Criando tabela 'posts'...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                data_publicacao DATE NOT NULL,
                plataforma VARCHAR(50),
                titulo VARCHAR(255) NOT NULL,
                conteudo TEXT,
                url_midia TEXT,
                status VARCHAR(50) DEFAULT 'pendente',
                feedback_cliente TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'posts' criada com sucesso!");
    } catch (erro) { console.error("❌ Erro:", erro.message); } finally { process.exit(); }
}
criar();