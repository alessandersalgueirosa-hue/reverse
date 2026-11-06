const db = require('./db');

async function testar() {
    try {
        console.log("🔍 1. Verificando se a tabela 'propostas' existe...");
        const tabelaExiste = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'propostas'
            );
        `);
        
        if (!tabelaExiste.rows[0].exists) {
            console.log("❌ A tabela 'propostas' NÃO existe no banco de dados.");
            console.log("👉 Solução: Precisamos criar a tabela.");
            process.exit(0);
        }
        console.log("✅ Tabela 'propostas' existe.");

        console.log("\n🔍 2. Verificando as colunas da tabela...");
        const colunas = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'propostas'
            ORDER BY ordinal_position;
        `);
        
        console.log("📋 Colunas encontradas:");
        colunas.rows.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

        console.log("\n🔍 3. Tentando buscar as propostas...");
        const result = await db.query('SELECT * FROM propostas ORDER BY data_criacao DESC');
        console.log(`✅ Busca funcionou! Total de propostas: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            console.log("📄 Primeira proposta encontrada:", result.rows[0].cliente_nome);
        }

    } catch (error) {
        console.error("\n❌ ERRO DETALHADO:");
        console.error("Mensagem:", error.message);
        console.error("Código:", error.code);
        console.error("Detalhe:", error.detail);
    }
    process.exit();
}

testar();