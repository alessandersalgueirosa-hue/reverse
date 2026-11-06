const db = require('./db');

async function run() {
    try {
        console.log('🔍 Verificando tabela comentarios...');
        
        // Adiciona a coluna post_id se não existir
        await db.query(`
            ALTER TABLE comentarios 
            ADD COLUMN IF NOT EXISTS post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE;
        `);
        
        console.log('✅ Coluna "post_id" adicionada com sucesso à tabela "comentarios"!');
        process.exit(0);
    } catch (err) {
        console.error('❌ ERRO:', err.message);
        process.exit(1);
    }
}

run();