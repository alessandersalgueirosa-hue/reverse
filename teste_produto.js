const { Pool } = require('pg');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function testar() {
    try {
        console.log("1. Apagando e criando a tabela de produtos...");
        await db.query(`DROP TABLE IF EXISTS produtos CASCADE;`);
        await db.query(`
            CREATE TABLE produtos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                preco NUMERIC(10, 2) NOT NULL,
                categoria VARCHAR(100),
                sku VARCHAR(50),
                estoque INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'ativo',
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("2. Inserindo produto de teste direto no banco...");
        await db.query(`
            INSERT INTO produtos (nome, descricao, preco, categoria, sku, estoque) 
            VALUES ('Produto de Teste Automático', 'Criado via script', 99.90, 'Teste', 'SKU-001', 50)
        `);

        console.log("✅ TUDO PRONTO! O banco está configurado e tem 1 produto.");
        console.log("Agora vá no navegador, recarregue a página de produtos (F5) e o produto deve aparecer na tabela!");
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}
testar();