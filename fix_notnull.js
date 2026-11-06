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
        
        // Remove NOT NULL constraint from nome_empresa
        await client.query('ALTER TABLE mapeamentos_clientes ALTER COLUMN nome_empresa DROP NOT NULL');
        console.log('✅ SUCCESS: NOT NULL constraint removed from nome_empresa');
        
        // Verify the change
        const result = await client.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'mapeamentos_clientes' ORDER BY ordinal_position;");
        console.log('\\nUpdated table structure:');
        console.log(JSON.stringify(result.rows, null, 2));
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();