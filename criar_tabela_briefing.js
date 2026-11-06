const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function criar() {
    try {
        console.log("⏳ Criando tabela de briefings...");
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
                status VARCHAR(50) DEFAULT 'pendente',
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'briefings' criada com sucesso!");
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}
criar();