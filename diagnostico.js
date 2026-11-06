const db = require('./db');

async function diagnosticar() {
    try {
        console.log("🔍 Verificando a tabela de clientes...");
        const res = await db.query("SELECT id, nome, email FROM clientes");
        
        if (res.rows.length === 0) {
            console.log("❌ O BANCO ESTÁ VAZIO! O Docker apagou os clientes.");
            console.log("Vamos precisar recriar o Alessander.");
        } else {
            console.log("✅ Clientes encontrados no banco:", res.rows);
        }
    } catch (error) {
        console.error("❌ ERRO NO BANCO:", error.message);
        console.log("Isso significa que a tabela 'clientes' nem existe mais. O Docker zerou tudo.");
    }
    process.exit();
}

diagnosticar();