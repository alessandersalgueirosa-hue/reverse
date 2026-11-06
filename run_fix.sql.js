const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'marketing_db',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database!');
        
        // Drop old table
        await client.query('DROP TABLE IF EXISTS mapeamentos_clientes');
        console.log('✅ Old table mapeamentos_clientes dropped');
        
        // Create new table with only form fields, all optional
        const sql = `
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
        `;
        
        await client.query(sql);
        console.log('✅ New table mapeamentos_clientes created successfully!');
        
        // Verify
        const result = await client.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'mapeamentos_clientes' ORDER BY ordinal_position;");
        console.log('\\nTable structure:');
        console.log(JSON.stringify(result.rows, null, 2));
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();