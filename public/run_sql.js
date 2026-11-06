const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

// Aqui ele usa as mesmas variáveis de ambiente que o seu sistema usa.
const client = new Client({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'marketing_db',
    password: process.env.DB_PASSWORD, // Puxa a senha do seu .env
    port: process.env.DB_PORT || 5432,
});

async function criarTabela() {
    try {
        await client.connect();
        console.log("Conectado ao banco! Lendo o arquivo SQL...");
        
        const sql = fs.readFileSync('init_mapeamentos.sql', 'utf8');
        await client.query(sql);
        
        console.log("✅ Tabela 'mapeamentos_clientes' criada com sucesso!");
    } catch (err) {
        console.error("❌ Erro ao criar tabela:", err.message);
        if (err.message.includes('password authentication failed')) {
            console.log("👉 Dica: Verifique se a senha no seu arquivo .env está correta.");
        }
    } finally {
        await client.end();
    }
}

criarTabela();