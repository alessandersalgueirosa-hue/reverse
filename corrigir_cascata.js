const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function corrigir() {
    const tabelas = [
        'leads', 'campanhas', 'tarefas', 'criativos', 'mapeamentos_clientes', 
        'briefings', 'posts', 'branding', 'receitas', 'despesas', 'permissoes_clientes'
    ];

    try {
        console.log("⏳ Configurando ON DELETE CASCADE nas tabelas...");
        
        for (const tabela of tabelas) {
            try {
                // Remove a constraint antiga e adiciona a nova com CASCADE
                await db.query(`
                    ALTER TABLE ${tabela} 
                    DROP CONSTRAINT IF EXISTS ${tabela}_cliente_id_fkey;
                    
                    ALTER TABLE ${tabela} 
                    ADD CONSTRAINT ${tabela}_cliente_id_fkey 
                    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
                `);
                console.log(`✅ Tabela ${tabela} configurada.`);
            } catch (err) {
                console.log(`⚠️ Aviso na tabela ${tabela}:`, err.message);
            }
        }
        console.log("🚀 Tudo pronto! Agora você pode excluir o cliente sem erros.");
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}
corrigir();