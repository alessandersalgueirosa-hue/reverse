const db = require('./db');

async function consertar() {
    try {
        console.log("⏳ Verificando tabela de permissões...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS permissoes_clientes (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER UNIQUE REFERENCES clientes(id) ON DELETE CASCADE,
                pode_ver_metricas BOOLEAN DEFAULT false,
                pode_ver_financeiro BOOLEAN DEFAULT false,
                pode_ver_calendario BOOLEAN DEFAULT false,
                pode_ver_branding BOOLEAN DEFAULT false,
                pode_ver_propostas BOOLEAN DEFAULT false,
                pode_ver_campanhas BOOLEAN DEFAULT false,
                pode_ver_tarefas BOOLEAN DEFAULT true,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela permissoes_clientes pronta!");

        // Insere as permissões para o cliente Alessander (ID 1)
        await db.query(`
            INSERT INTO permissoes_clientes (cliente_id, pode_ver_tarefas) 
            VALUES (1, true) 
            ON CONFLICT (cliente_id) DO NOTHING
        `);
        console.log("✅ Permissões do Alessander verificadas.");
        
    } catch (error) {
        console.error("❌ ERRO:", error.message);
    }
    process.exit();
}
consertar();