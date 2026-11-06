const db = require('./db');

async function consertar() {
    try {
        console.log("⏳ Recriando a tabela 'briefings'...");
        
        // Apaga a tabela antiga (se existir) para evitar conflito de colunas
        await db.query('DROP TABLE IF EXISTS briefings');
        
        // Cria a tabela novamente com a estrutura correta
        await db.query(`
            CREATE TABLE briefings (
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
        
        console.log("✅ Tabela 'briefings' recriada com sucesso!");
    } catch (error) {
        console.error("❌ ERRO AO RECRIAR:", error.message);
    }
    process.exit();
}

consertar();