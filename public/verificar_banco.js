const db = require('./db');

async function verificar() {
    try {
        console.log("🔍 Verificando colunas da tabela 'criativos'...");
        const result = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'criativos'
        `);
        
        console.log("\n📋 Colunas encontradas na tabela:");
        console.table(result.rows);
        
        console.log("\nTestando um update de teste...");
        await db.query("UPDATE criativos SET status = 'pendente', feedback = 'teste' WHERE id = 1");
        console.log("✅ O banco aceitou a atualização de teste!");
        
    } catch (error) {
        console.error("\n❌ ERRO NO BANCO DE DADOS:");
        console.error("Mensagem:", error.message);
        console.error("Código:", error.code);
    }
    process.exit();
}

verificar();