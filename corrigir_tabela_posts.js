const db = require('./db');

async function run() {
    try {
        console.log('🔍 Verificando tabela posts...\n');

        // 1. Garante que a tabela existe
        await db.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER,
                titulo VARCHAR(255),
                conteudo TEXT,
                data_publicacao DATE,
                plataforma VARCHAR(50),
                imagem_url TEXT,
                status VARCHAR(20) DEFAULT 'pendente',
                feedback_cliente TEXT,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Busca as colunas existentes
        const cols = await db.query(`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'posts'
        `);
        const existing = cols.rows.map(r => r.column_name);

        // 3. Lista de colunas que DEVEM existir
        const colunasNecessarias = [
            ['cliente_id', 'INTEGER'],
            ['titulo', 'VARCHAR(255)'],
            ['conteudo', 'TEXT'],
            ['data_publicacao', 'DATE'],
            ['plataforma', 'VARCHAR(50)'],
            ['imagem_url', 'TEXT'],
            ['status', `VARCHAR(20) DEFAULT 'pendente'`],
            ['feedback_cliente', 'TEXT'],
            ['criado_em', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP']
        ];

        // 4. Adiciona as que estiverem faltando
        for (const [col, tipo] of colunasNecessarias) {
            if (!existing.includes(col)) {
                await db.query(`ALTER TABLE posts ADD COLUMN ${col} ${tipo}`);
                console.log(`✅ Coluna '${col}' ADICIONADA!`);
            } else {
                console.log(`⏭️  Coluna '${col}' já existia.`);
            }
        }

        console.log('\n✅ Tabela posts pronta para uso!');
        console.log('👉 Agora reinicie o servidor (Ctrl+C e node server.js)');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ ERRO:', err.message);
        process.exit(1);
    }
}

run();