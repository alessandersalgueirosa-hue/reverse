const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function excluir() {
    // ⚠️ COLOQUE AQUI O ID DO CLIENTE QUE VOCÊ QUER EXCLUIR
    const clienteId = 12; 

    try {
        console.log(`⏳ Iniciando exclusão do cliente ID ${clienteId}...`);

        // 1. Busca TODAS as tabelas do banco que possuem a coluna cliente_id
        const tabelasRes = await db.query(`
            SELECT table_name 
            FROM information_schema.columns 
            WHERE column_name = 'cliente_id' 
            AND table_schema = 'public'
        `);

        const tabelas = tabelasRes.rows.map(r => r.table_name);
        console.log(`📋 Tabelas encontradas com vínculo: ${tabelas.join(', ')}`);

        // 2. Apaga os dados de cada tabela
        for (const tabela of tabelas) {
            try {
                await db.query(`DELETE FROM ${tabela} WHERE cliente_id = $1`, [clienteId]);
                console.log(`✅ Dados da tabela '${tabela}' apagados.`);
            } catch (err) {
                console.log(`⚠️ Erro na tabela '${tabela}':`, err.message);
            }
        }

        // 3. Apaga o cliente
        const res = await db.query('DELETE FROM clientes WHERE id = $1', [clienteId]);
        
        if (res.rowCount > 0) {
            console.log("🎉 Cliente excluído com sucesso!");
        } else {
            console.log("❌ Cliente não encontrado no banco.");
        }

    } catch (erro) {
        console.error("❌ Erro detalhado:", erro.message);
    } finally {
        process.exit();
    }
}
excluir();