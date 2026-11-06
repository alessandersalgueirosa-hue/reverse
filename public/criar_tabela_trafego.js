const db = require('./db');

async function criar() {
    try {
        console.log("⏳ Criando a tabela de Tráfego Pago...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS trafego_pago (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                plataforma VARCHAR(100),
                nome_campanha VARCHAR(255),
                objetivo VARCHAR(100),
                orcamento_diario NUMERIC(12,2) DEFAULT 0,
                data_inicio DATE,
                status VARCHAR(50) DEFAULT 'Ativa',
                investimento_total NUMERIC(12,2) DEFAULT 0,
                impressoes INTEGER DEFAULT 0,
                cliques INTEGER DEFAULT 0,
                conversoes INTEGER DEFAULT 0,
                observacoes TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log("✅ Tabela 'trafego_pago' criada com sucesso!");
    } catch (error) {
        console.error("❌ ERRO AO CRIAR TABELA:", error.message);
    }
    process.exit();
}

criar();