const { Pool } = require('pg');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function corrigir() {
    console.log("⏳ Conectando...");
    try {
        await db.query(`DROP TABLE IF EXISTS mapeamentos_clientes CASCADE;`);
        await db.query(`
            CREATE TABLE mapeamentos_clientes (
                id SERIAL PRIMARY KEY,
                nome_empresa VARCHAR(255),
                cnpj VARCHAR(20),
                segmento VARCHAR(100),
                site VARCHAR(255),
                telefone VARCHAR(20),
                nome_contato VARCHAR(100),
                objetivo_principal TEXT,
                meta_business BOOLEAN DEFAULT false,
                google_ads BOOLEAN DEFAULT false,
                google_analytics BOOLEAN DEFAULT false,
                site_hospedagem BOOLEAN DEFAULT false,
                manual_marca BOOLEAN DEFAULT false,
                observacoes_acessos TEXT,
                observacoes_gerais TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela recriada com sucesso!");
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}
corrigir();