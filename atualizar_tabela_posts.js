const db = require('./db');

async function run() {
    try {
        const tbl = await db.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts')`);
        
        if (!tbl.rows[0].exists) {
            console.log('❌ Tabela posts NÃO existe. Criando estrutura padrão...');
            await db.query(`
                CREATE TABLE posts (
                    id SERIAL PRIMARY KEY,
                    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                    titulo VARCHAR(255) NOT NULL,
                    conteudo TEXT,
                    data_publicacao DATE,
                    plataforma VARCHAR(50),
                    imagem_url TEXT,
                    status VARCHAR(20) DEFAULT 'pendente',
                    feedback_cliente TEXT,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('✅ Tabela posts criada com sucesso!');
        } else {
            console.log('✅ Tabela posts existe. Verificando colunas...\n');
            
            const cols = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'posts' ORDER BY ordinal_position`);
            console.log('📋 Colunas atuais da tabela posts:');
            cols.rows.forEach(r => console.log(`   - ${r.column_name} (${r.data_type})`));
            console.log('');
            
            const existing = cols.rows.map(r => r.column_name);
            const toAdd = [
                ['status', `VARCHAR(20) DEFAULT 'pendente'`],
                ['feedback_cliente', 'TEXT']
            ];
            
            for (const [col, def] of toAdd) {
                if (!existing.includes(col)) {
                    await db.query(`ALTER TABLE posts ADD COLUMN ${col} ${def}`);
                    console.log(`✅ Coluna '${col}' adicionada!`);
                } else {
                    console.log(`⏭️  Coluna '${col}' já existe.`);
                }
            }
        }
        
        await db.query(`UPDATE posts SET status = 'pendente' WHERE status IS NULL`);
        
        const total = await db.query('SELECT COUNT(*) FROM posts');
        console.log(`\n📊 Total de posts no banco: ${total.rows[0].count}`);
        
        console.log('\n✅ Tudo pronto! Agora rode: node server.js');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ ERRO:', err.message);
        process.exit(1);
    }
}

run();