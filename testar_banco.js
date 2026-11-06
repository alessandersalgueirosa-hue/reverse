const db = require('./db');

async function testar() {
    try {
        console.log("⏳ Tentando aprovar o criativo ID 1 diretamente no banco...");
        
        // 1. Tenta buscar o criativo
        const select = await db.query('SELECT * FROM criativos WHERE id = 1');
        if (select.rows.length === 0) {
            console.log("❌ O criativo com ID 1 não existe no banco de dados!");
            process.exit();
        }
        console.log("✅ Criativo encontrado. Título:", select.rows[0].titulo);

        // 2. Tenta atualizar o status
        const update = await db.query("UPDATE criativos SET status = 'aprovado', feedback = 'Teste via script' WHERE id = 1 RETURNING *");
        console.log("✅ SUCESSO! O banco de dados aceitou a atualização.");
        console.log("Novo status salvo:", update.rows[0].status);
        
    } catch (error) {
        console.error("\n❌ ERRO FATAL NO BANCO DE DADOS:");
        console.error("Mensagem:", error.message);
        console.error("Código:", error.code);
        console.error("Detalhe:", error.detail);
    }
    process.exit();
}

testar();