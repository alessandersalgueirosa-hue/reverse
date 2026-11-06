const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function criar() {
    try {
        console.log("⏳ Criando tabela 'permissoes_clientes'...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS permissoes_clientes (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE UNIQUE,
                pode_ver_metricas BOOLEAN DEFAULT true,
                pode_ver_financeiro BOOLEAN DEFAULT true,
                pode_ver_calendario BOOLEAN DEFAULT true,
                pode_ver_branding BOOLEAN DEFAULT true,
                pode_ver_propostas BOOLEAN DEFAULT false,
                pode_ver_campanhas BOOLEAN DEFAULT false,
                pode_ver_tarefas BOOLEAN DEFAULT true,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'permissoes_clientes' criada com sucesso!");
    } catch (erro) { 
        console.error("❌ Erro:", erro.message); 
    } finally { 
        process.exit(); 
    }
}
criar();