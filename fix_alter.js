const { Client } = require('pg');

const client = new Client({
    user: 'admin',
    host: 'localhost',
    database: 'marketing_db',
    password: 'admin123',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database!');
        
        // List all columns and their nullability first
        const columns = [
            'nome_empresa', 'cnpj', 'segmento', 'telefone', 'nome_contato', 
            'objetivo_principal'
        ];
        
        console.log('Attempting to remove NOT NULL constraints...\n');
        
        for (const col of columns) {
            try {
                await client.query(`ALTER TABLE mapeamentos_clientes ALTER COLUMN "${col}" DROP NOT NULL`);
                console.log(`✅ Successfully removed NOT NULL from ${col}`);
            } catch (err) {
                // Check if error is because constraint doesn't exist
                if (err.message.includes('must be owner of') || err.message.includes('does not exist') || err.message.includes('constraint')) {
                    console.log(`⚠️  ${col}: Constraint may not exist or already removed`);
                } else {
                    console.log(`❌ ${col}: Error - ${err.message}`);
                }
            }
        }
        
        console.log('\n✅ Done! Checking final table structure...');
        
        // Verify the changes
        const result = await client.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'mapeamentos_clientes' ORDER BY ordinal_position;");
        console.log('Final table structure:');
        console.log(JSON.stringify(result.rows, null, 2));
        
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
    } finally {
        await client.end();
    }
}

run();