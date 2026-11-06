const db = require('./db');

async function testar() {
    try {
        console.log("🔍 Leads cadastrados:");
        const leads = await db.query('SELECT status, origem FROM leads');
        console.log(`Total de leads: ${leads.rows.length}`);
        
        console.log("\n🔍 Clientes cadastrados:");
        const clientes = await db.query('SELECT COUNT(*) FROM clientes');
        console.log(`Total: ${clientes.rows[0].count}`);
        
        console.log("\n🔍 Prospects cadastrados:");
        const prospects = await db.query('SELECT COUNT(*) FROM prospects');
        console.log(`Total: ${prospects.rows[0].count}`);
        
        console.log("\n🔍 Campanhas cadastradas:");
        const campanhas = await db.query('SELECT nome FROM campanhas');
        console.log(`Total: ${campanhas.rows.length}`);
        
    } catch (error) {
        console.error("❌ Erro:", error.message);
    }
    process.exit();
}

testar();