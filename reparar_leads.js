const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function reparar() {
    try {
        console.log("⏳ Recriando a tabela 'leads' com a estrutura correta...");

        // 1. Apaga a tabela antiga (se existir)
        await db.query(`DROP TABLE IF EXISTS lead_tags;`); // Tabela de relacionamento
        await db.query(`DROP TABLE IF EXISTS leads CASCADE;`);

        // 2. Cria a tabela com TODAS as colunas necessárias
        await db.query(`
            CREATE TABLE leads (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                telefone VARCHAR(20),
                empresa VARCHAR(255),
                mensagem TEXT,
                origem VARCHAR(100),
                status VARCHAR(50) DEFAULT 'novo',
                cliente_id INTEGER,
                campanha_id INTEGER,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Recria a tabela de tags e relacionamentos
        await db.query(`CREATE TABLE IF NOT EXISTS tags (id SERIAL PRIMARY KEY, nome VARCHAR(100) UNIQUE NOT NULL);`);
        await db.query(`CREATE TABLE IF NOT EXISTS lead_tags (lead_id INTEGER, tag_id INTEGER, PRIMARY KEY (lead_id, tag_id));`);

        console.log("✅ Tabela 'leads' recriada com sucesso!");

        // 4. Insere um lead de teste
        await db.query(`
            INSERT INTO leads (nome, email, telefone, empresa, origem, status) 
            VALUES ('João da Silva', 'joao@email.com', '11988887777', 'Empresa X', 'Instagram', 'novo')
        `);
        console.log("✅ Lead de teste inserido!");

        console.log("🎉 Tudo pronto! Recarregue a tela de Leads (F5).");
    } catch (erro) {
        console.error("❌ Erro detalhado:", erro.message);
    } finally {
        process.exit();
    }
}

reparar();