const db = require('./db');

async function criar() {
    try {
        console.log("⏳ Criando a tabela de Storytelling...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS storytelling (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                titulo VARCHAR(255),
                publico_alvo TEXT,
                dor_principal TEXT,
                solucao TEXT,
                transformacao TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log("✅ Tabela 'storytelling' criada com sucesso!");
    } catch (error) {
        console.error("❌ ERRO AO CRIAR TABELA:", error.message);
    }
    process.exit();
}

criar();