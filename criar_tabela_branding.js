const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function criar() {
    try {
        console.log("⏳ Criando tabela branding...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS branding (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                missao TEXT,
                visao TEXT,
                valores TEXT,
                publico_alvo TEXT,
                personalidade TEXT,
                tom_de_voz TEXT,
                cores_primarias VARCHAR(255),
                cores_secundarias VARCHAR(255),
                tipografia_principal VARCHAR(255),
                tipografia_secundaria VARCHAR(255),
                logo_url VARCHAR(255),
                referencias_visuais TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'branding' criada com sucesso!");
    } catch (erro) { 
        console.error("❌ Erro detalhado:", erro.message); 
    } finally { 
        process.exit(); 
    }
}
criar();